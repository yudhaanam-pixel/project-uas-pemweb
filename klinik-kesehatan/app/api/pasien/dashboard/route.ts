import PushNotificationButton from "@/components/PushNotificationButton";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ambilSesi } from "@/lib/session";



export async function GET() {
  try {
    const sesi = await ambilSesi();

    if (!sesi || sesi.peran !== "pasien" || !sesi.uid) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const supabase = createClient();

    const { data: pasien, error: pasienError } = await supabase
      .from("pasien")
      .select("id, nama, no_hp, alamat")
      .eq("pengguna_id", sesi.uid)
      .single();

    if (pasienError || !pasien) {
      return NextResponse.json(
        { error: "Data pasien tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: kunjungan, error } = await supabase
      .from("kunjungan")
      .select(`
        id,
        tanggal,
        nomor_antrean,
        status,
        keluhan,
        dokter (
          nama,
          spesialis
        ),
        layanan (
          nama
        )
      `)
      .eq("pasien_id", pasien.id)
      .order("tanggal", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      pasien,
      kunjungan: kunjungan ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil dashboard pasien.",
      },
      { status: 500 }
    );
  }
}