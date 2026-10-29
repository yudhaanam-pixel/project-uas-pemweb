'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

interface Layanan {
  id: number;
  nama: string;
  deskripsi: string;
  aktif: boolean;
}

export default function CRUDLayanan() {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const fetchLayanan = async () => {
    const { data, error } = await supabase
      .from('layanan')
      .select('*')
      .order('id', { ascending: true });
    if (data) setLayananList(data);
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return alert('Nama layanan harus diisi!');

    const { error } = await supabase
      .from('layanan')
      .insert([{ nama, deskripsi, aktif: true }]);

    if (error) {
      alert('Gagal menambah data: ' + error.message);
    } else {
      setNama('');
      setDeskripsi('');
      fetchLayanan();
    }
  };

  const handleToggleAktif = async (id: number, statusSekarang: boolean) => {
    const { error } = await supabase
      .from('layanan')
      .update({ aktif: !statusSekarang })
      .eq('id', id);

    if (error) {
      alert('Gagal mengubah status: ' + error.message);
    } else {
      fetchLayanan();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">CRUD Master Layanan (Admin)</h1>

      {/* FORM INPUT - WARNA TEKS SUDAH DIPERBAIKI (text-black) */}
      <form onSubmit={handleTambah} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-green-400">Tambah Layanan Baru</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Nama Layanan / Poli</label>
            <input 
              type="text" 
              value={nama} 
              onChange={(e) => setNama(e.target.value)}
              className="w-full border p-2 rounded bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Contoh: Pemeriksaan Anak"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Deskripsi</label>
            <textarea 
              value={deskripsi} 
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border p-2 rounded bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Penjelasan singkat layanan..."
              rows={3}
            />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded font-bold transition-all">
            Simpan Layanan
          </button>
        </div>
      </form>

      {/* TABEL DATA - WARNA HEADER DAN TEKS SUDAH DIPERBAIKI */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700 text-gray-300 font-semibold">
              <th className="p-3 text-center">Nama</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {layananList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800/50 transition-all">
                <td className="p-3 font-semibold text-center text-gray-200">{item.nama}</td>
                <td className="p-3 text-gray-400">{item.deskripsi || '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.aktif ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                    {item.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => handleToggleAktif(item.id, item.aktif)}
                    className={`text-sm font-bold hover:underline ${item.aktif ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}
                  >
                    {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
