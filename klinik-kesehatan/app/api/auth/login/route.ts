import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// Kembalikan ke client yang terbukti ada di folder proyekmu
import { createClient } from '@/lib/supabase/client'; 

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body: unknown = await request.json();

    if (!body || typeof body !== 'object') {
      console.warn('[auth/login] Invalid request body');
      return NextResponse.json({ error: 'Email dan password wajib diisi!' }, { status: 400 });
    }

    const { email, password } = body as { email?: unknown; password?: unknown };
    console.log('[auth/login] Request received', {
      emailProvided: typeof email === 'string' && email.length > 0,
      passwordProvided: typeof password === 'string' && password.length > 0
    });

    if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
      console.warn('[auth/login] Email or password is missing or invalid');
      return NextResponse.json({ error: 'Email dan password wajib diisi!' }, { status: 400 });
    }

       // --- BYPASS LOGIC UNTUK DEMO ---
    if (email === 'admin@klinik.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        message: 'Login berhasil!',
        user: {
          id: 'admin-bypass-id',
          nama: 'Admin Kelompok 7',
          peran: 'admin'
        }
      });
    }

    // Jika bukan email admin di atas, jalankan query biasa
    const { data: pengguna, error } = await supabase
      .from('pengguna')
      .select('id, nama, peran, password_hash')
      .eq('email', email)
      .single();


    // Jika email tidak ditemukan atau error
    if (error || !pengguna) {
      console.warn('[auth/login] Supabase user lookup failed', {
        found: Boolean(pengguna),
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null
      });
      return NextResponse.json({ error: 'Email atau password salah!' }, { status: 401 });
    }

    const passwordHash = pengguna.password_hash;
    const isBcryptHash = typeof passwordHash === 'string' && /^\$2[aby]\$\d{2}\$/.test(passwordHash);
    
    console.log('[auth/login] Supabase user retrieved', {
      found: true,
      passwordHashPresent: typeof passwordHash === 'string' && passwordHash.length > 0,
      bcryptHashFormat: isBcryptHash,
      passwordHashLength: typeof passwordHash === 'string' ? passwordHash.length : null
    });

    if (typeof passwordHash !== 'string' || !isBcryptHash) {
      console.error('[auth/login] Stored password_hash is missing or is not a bcrypt hash');
      return NextResponse.json({ error: 'Email atau password salah!' }, { status: 401 });
    }

    // ✅ PERBAIKAN: console.log yang merusak sintaks kini sudah digabung rapi
    console.log('[auth/login] Comparing passwords', {
      passwordLength: password.length,
      matchesExpectedTestPassword: password === 'admin123'
    });

    // 2. Bandingkan password inputan dengan password_hash di database
    const isMatch = await bcrypt.compare(password, passwordHash);
    console.log('[auth/login] Password comparison completed', { isMatch });

    if (!isMatch) {
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

  } catch (err: unknown) {
    console.error('[auth/login] Login handler failed', {
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
