import Link from "next/link";
import { redirect } from "next/navigation";
import { ambilSesi } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import AktifkanNotifikasi from "@/components/AktifkanNotifikasi";

const WARNA: Record<string, string> = {
  menunggu: "bg-yellow-200 text-yellow-900",
  dikonfirmasi: "bg-blue-200 text-blue-900",
  selesai: "bg-green-200 text-green-900",
  dibatalkan: "bg-gray-300 text-gray-700",
};

export default async function RiwayatPasien({
  searchParams,
}: { searchParams: Promise<{ baru?: string }> }) {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/login");
  const { baru } = await searchParams;

  const supabase = await createClient();
  const { data: daftar, error } = await supabase
    .from("kunjungan")
    .select("id, poli, tanggal, jam, keluhan, status")
    .eq("pengguna_id", sesi.uid)
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Halo, {sesi.nama}</h1>
        <Link href="/kunjungan/baru" className="rounded bg-teal-600 px-4 py-2 text-white">
          + Daftar Kunjungan
        </Link>
      </div>

      {baru && <p className="rounded bg-green-100 p-3 text-green-800">Kunjungan berhasil didaftarkan.</p>}
      <AktifkanNotifikasi />

      <h2 className="text-xl font-semibold">Riwayat Kunjungan</h2>
      {error && <p role="alert" className="text-red-500">Gagal memuat riwayat.</p>}
      {!error && !daftar?.length && <p className="opacity-70">Belum ada kunjungan.</p>}

      <ul className="space-y-3">
        {daftar?.map((k) => (
          <li key={k.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <strong>Poli {k.poli}</strong>
              <span className={`rounded px-2 py-0.5 text-sm ${WARNA[k.status] ?? ""}`}>{k.status}</span>
            </div>
            <p className="text-sm opacity-80">{k.tanggal} · {k.jam} WIB</p>
            <p className="mt-1">{k.keluhan}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}