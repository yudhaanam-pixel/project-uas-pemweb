import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { email, password } = await request.json();

    // 1. Ambil data akun berdasarkan email dari tabel 'pengguna'
    const { data: pengguna, error } = await supabase
      .from('pengguna')
      .select('*')
      .eq('email', email)
      .single();

    // Jika email tidak ditemukan atau error
    if (error || !pengguna) {
      return NextResponse.json({ error: 'Email atau password salah!' }, { status: 401 });
    }

    // 2. Bandingkan password inputan form dengan password_hash di database
    const passwordCocok = await bcrypt.compare(password, pengguna.password_hash);

    if (!passwordCocok) {
      return NextResponse.json({ error: 'Email atau password salah!' }, { status: 401 });
    }

    // 3. Jika cocok, buat data session respon balik ke frontend
    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: pengguna.id,
        nama: pengguna.nama,
        peran: pengguna.peran
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Server Error: ' + err.message }, { status: 500 });
  }
}
