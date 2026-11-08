import PushNotificationButton from "@/components/PushNotificationButton";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ambilSesi } from "@/lib/session";

export async function GET() {
  try {
    const sesi = await ambilSesi();

    if (!sesi || sesi.peran !== "pasien") {
      return NextResponse.json(
        { error: "Silakan login sebagai pasien." },
        { status: 401 }
      );
    }

    const supabase = createClient();

    const [dokterResult, layananResult] = await Promise.all([
      supabase
        .from("dokter")
        .select("id, nama, spesialis")
        .eq("aktif", true),

      supabase
        .from("layanan")
        .select("id, nama, deskripsi")
        .eq("aktif", true),
    ]);

    if (dokterResult.error || layananResult.error) {
      throw new Error("Gagal mengambil data dokter atau layanan.");
    }

    return NextResponse.json({
      dokter: dokterResult.data,
      layanan: layananResult.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sesi = await ambilSesi();

    if (!sesi || sesi.peran !== "pasien" || !sesi.uid) {
      return NextResponse.json(
        { error: "Akses hanya untuk pasien yang sudah login." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const dokter_id = Number(body.dokter_id);
    const layanan_id = Number(body.layanan_id);
    const tanggal = body.tanggal;
    const keluhan = String(body.keluhan ?? "").trim();

    if (
      !Number.isInteger(dokter_id) ||
      dokter_id <= 0 ||
      !Number.isInteger(layanan_id) ||
      layanan_id <= 0 ||
      !tanggal
    ) {
      return NextResponse.json(
        { error: "Data pendaftaran belum lengkap." },
        { status: 400 }
      );
    }

    const tanggalValid = new Date(`${tanggal}T00:00:00`);

    if (
      Number.isNaN(tanggalValid.getTime()) ||
      tanggalValid.toISOString().slice(0, 10) !== tanggal
    ) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid." },
        { status: 400 }
      );
    }

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    if (tanggalValid < hariIni) {
      return NextResponse.json(
        { error: "Tanggal kunjungan tidak boleh di masa lalu." },
        { status: 400 }
      );
    }

    if (keluhan.length > 1000) {
      return NextResponse.json(
        { error: "Keluhan maksimal 1000 karakter." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: pasien, error: pasienError } = await supabase
      .from("pasien")
      .select("id")
      .eq("pengguna_id", sesi.uid)
      .single();

    if (pasienError || !pasien) {
      return NextResponse.json(
        { error: "Data pasien tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: dokter } = await supabase
      .from("dokter")
      .select("id")
      .eq("id", dokter_id)
      .eq("aktif", true)
      .maybeSingle();

    const { data: layanan } = await supabase
      .from("layanan")
      .select("id")
      .eq("id", layanan_id)
      .eq("aktif", true)
      .maybeSingle();

    if (!dokter || !layanan) {
      return NextResponse.json(
        { error: "Dokter atau layanan tidak tersedia." },
        { status: 400 }
      );
    }

    // Hari dalam database: Senin = 1 sampai Minggu = 7.
    const hari = tanggalValid.getDay() === 0
      ? 7
      : tanggalValid.getDay();

    const { data: jadwal, error: jadwalError } = await supabase
      .from("jadwal_praktik")
      .select("id, kuota")
      .eq("dokter_id", dokter_id)
      .eq("hari", hari)
      .eq("aktif", true)
      .limit(1)
      .maybeSingle();

    if (jadwalError || !jadwal) {
      return NextResponse.json(
        { error: "Dokter tidak memiliki jadwal pada tanggal tersebut." },
        { status: 400 }
      );
    }

    const { count, error: countError } = await supabase
      .from("kunjungan")
      .select("*", { count: "exact", head: true })
      .eq("dokter_id", dokter_id)
      .eq("tanggal", tanggal)
      .neq("status", "batal");

    if (countError) throw countError;

    if ((count ?? 0) >= jadwal.kuota) {
      return NextResponse.json(
        { error: "Kuota kunjungan dokter sudah penuh." },
        { status: 400 }
      );
    }

    const { data: kunjungan, error: insertError } = await supabase
      .from("kunjungan")
      .insert({
        pasien_id: pasien.id,
        dokter_id,
        layanan_id,
        jadwal_id: jadwal.id,
        tanggal,
        nomor_antrean: null,
        keluhan,
        status: "menunggu",
      })
      .select("id, nomor_antrean, tanggal, status")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran kunjungan berhasil.",
        nomor_antrean: kunjungan.nomor_antrean,
        data: kunjungan,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Pendaftaran gagal.",
      },
      { status: 500 }
    );
  }
}