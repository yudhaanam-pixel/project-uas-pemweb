import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@/lib/supabase/server'; 

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    // Tambahkan parameter 'peran' dan 'tambahan_info' (spesialis/no_str) untuk dokter
    const { email, password, nama, peran, spesialis, no_str } = await request.json();

    if (!email || !password || !nama) {
      return NextResponse.json({ error: 'Kolom utama wajib diisi!' }, { status: 400 });
    }

    // 1. Hash password manual dengan bcrypt
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);

    // 2. Insert ke tabel pengguna dengan peran yang dinamis
    const { data: userBaru, error: userError } = await supabase
      .from('pengguna')
      .insert([{ 
        nama, 
        email, 
        password_hash: passwordHash, 
        peran: peran || 'pasien' // Jika tidak diisi otomatis jadi pasien
      }])
      .select()
      .single();

    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

    // 3. Cabang logic: jika pendaftarnya Dokter, masukkan ke tabel dokter
    if (peran === 'dokter') {
      const { error: dokterError } = await supabase
        .from('dokter')
        .insert([{
          pengguna_id: userBaru.id,
          nama,
          spesialis,
          no_str
        }]);
      if (dokterError) return NextResponse.json({ error: dokterError.message }, { status: 400 });
    } else {
      // Jika pasien (pendaftaran Bigel)
      const { error: pasienError } = await supabase
        .from('pasien')
        .insert([{ pengguna_id: userBaru.id, nama }]);
      if (pasienError) return NextResponse.json({ error: pasienError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil terdaftar!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
