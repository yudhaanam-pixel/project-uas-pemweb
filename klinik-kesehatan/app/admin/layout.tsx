'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menus = [
    { name: 'Master Layanan', path: '/admin/layanan', icon: '🏥' },
    { name: 'Master Dokter', path: '/admin/dokter', icon: '👨‍⚕️' },
    { name: 'Jadwal Praktik', path: '/admin/jadwal', icon: '📅' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <span>🩺</span> Klinik Sehat
            </h2>
            <p className="text-xs text-gray-400 mt-1">Panel Operasional Admin</p>
          </div>
          
          <nav className="space-y-2">
            {menus.map((menu) => {
              const isActive = pathname === menu.path;
              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-green-600 text-white font-bold shadow-lg shadow-green-900/30' 
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <span>{menu.icon}</span>
                  {menu.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <Link href="/" className="text-sm text-red-400 hover:underline flex items-center gap-2">
            <span>🚪</span> Keluar ke Beranda
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
