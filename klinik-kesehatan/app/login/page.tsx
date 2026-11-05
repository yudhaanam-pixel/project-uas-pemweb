'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('Email dan password wajib diisi!');

    setLoading(true);

    try {
      // 1. Menembak ke API backend (Route Handler) yang memproses pencocokan Bcrypt
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const hasil = await response.json();

      if (response.ok && hasil.success) {
        alert('🎉 ' + hasil.message);

        // 2. Simpan session user ke LocalStorage agar loginnya awet saat halaman di-refresh
        localStorage.setItem('user_session', JSON.stringify(hasil.user));

        // 3. BYPASS ALUR REDIRECT SEPERTI KODINGAN LAMA KAMU (Berdasarkan peran/role user)
        if (email === 'admin@klinik.com' || hasil.user.peran === 'admin') {
          router.push('/admin/layanan');
        } else if (hasil.user.peran === 'dokter') {
          router.push('/dokter');
        } else {
          router.push('/'); // Jika pasien (Bigel), kembali ke Beranda Utama
        }

      } else {
        alert('❌ Login Gagal: ' + (hasil.error || 'Periksa kembali email dan password Anda.'));
      }
    } catch (error: any) {
      alert('❌ Server Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-zinc-800 p-8 rounded-lg border border-zinc-700 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Masuk Aplikasi</h2>
        <div className="space-y-4 text-black">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2.5 rounded bg-white font-medium outline-none" 
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2.5 rounded bg-white font-medium outline-none" 
            required 
            disabled={loading}
          />
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-2.5 rounded transition-all disabled:bg-green-800 disabled:text-zinc-400"
            disabled={loading}
          >
            {loading ? 'Memverifikasi...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
