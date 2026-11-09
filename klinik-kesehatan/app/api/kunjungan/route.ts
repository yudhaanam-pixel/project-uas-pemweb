import { NextResponse } from "next/server";
import { ambilSesi } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { validasiKunjungan } from "@/lib/validasi";

export async function GET() {
  const sesi = await ambilSesi();
  if (!sesi) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kunjungan")
    .select("id, poli, tanggal, jam, keluhan, status, dibuat_pada")
    .eq("pengguna_id", sesi.uid)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: false });

  if (error) return NextResponse.json({ error: "Gagal memuat riwayat" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const sesi = await ambilSesi();
  if (!sesi || typeof sesi.uid !== "string") {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }
  if (sesi.peran !== "pasien") {
    return NextResponse.json({ error: "Hanya pasien yang dapat mendaftar" }, { status: 403 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body tidak valid" }, { status: 400 }); }

  const input = {
    poli: String(body.poli ?? ""),
    tanggal: String(body.tanggal ?? ""),
    jam: String(body.jam ?? ""),
    keluhan: String(body.keluhan ?? "").trim(),
  };

  const errors = validasiKunjungan(input);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Data tidak valid", errors }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kunjungan")
    .insert({ ...input, pengguna_id: sesi.uid, status: "menunggu" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Slot sudah terisi, pilih jam lain", errors: { jam: "Slot sudah terisi" } },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Gagal menyimpan kunjungan" }, { status: 500 });
  }
  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}