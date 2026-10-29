'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert('Login Gagal: ' + error.message);
    } else {
      // Ambil data peran (role) dari tabel 'pengguna' berdasarkan ID yang login
      const { data: pengguna } = await supabase
        .from('pengguna')
        .select('peran')
        .eq('id', data.user?.id)
        .single();

      if (pengguna?.peran === 'admin') {
        router.push('/admin/layanan');
      } else if (pengguna?.peran === 'dokter') {
        router.push('/dokter');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-zinc-800 p-8 rounded-lg border border-zinc-700 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Masuk Aplikasi</h2>
        <div className="space-y-4 text-black">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 rounded bg-white" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 rounded bg-white" required />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-2.5 rounded transition-all">Login</button>
        </div>
      </form>
    </div>
  );
}
