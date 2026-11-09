import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { buatSesi } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: pengguna, error } = await supabase
      .from("pengguna")
      .select("id, nama, peran, password_hash")
      .eq("email", email)
      .single();

    if (error || !pengguna) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const cocok = await bcrypt.compare(password, pengguna.password_hash);
    if (!cocok) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await buatSesi({ uid: pengguna.id, peran: pengguna.peran, nama: pengguna.nama });

    return NextResponse.json({
      success: true,
      user: { id: pengguna.id, nama: pengguna.nama, peran: pengguna.peran },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}