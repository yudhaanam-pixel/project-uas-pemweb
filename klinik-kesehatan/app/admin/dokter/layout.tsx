'use client';

import Link from 'next/link';

export default function DokterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* SIDEBAR DOKTER */}
      <aside className="w-64 bg-zinc-800 border-r border-zinc-700 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2"><span>👨‍⚕️</span> Portal Dokter</h2>
            <p className="text-xs text-gray-400 mt-1">Klinik Sehat</p>
          </div>
          <nav className="space-y-2">
            <Link href="/dokter" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white font-bold">
              <span>📋</span> Antrean Pasien
            </Link>
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-700">
          <Link href="/" className="text-sm text-red-400 hover:underline">🚪 Keluar</Link>
        </div>
      </aside>
      {/* CONTENT */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
