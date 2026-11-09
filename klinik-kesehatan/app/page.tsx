import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const HARI = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type Jadwal = { hari: number; jam_mulai: string; jam_selesai: string; kuota: number; aktif: boolean };
type Dokter = { id: number; nama: string; spesialis: string | null; jadwal_praktik: Jadwal[] };
type Layanan = { id: number; nama: string; deskripsi: string | null };

export default async function BerandaPage() {
  const supabase = createClient();

  const [layananRes, dokterRes] = await Promise.all([
    supabase.from("layanan").select("id, nama, deskripsi").eq("aktif", true).order("nama"),
    supabase
      .from("dokter")
      .select("id, nama, spesialis, jadwal_praktik(hari, jam_mulai, jam_selesai, kuota, aktif)")
      .eq("aktif", true)
      .order("nama"),
  ]);

  const layanan = (layananRes.data ?? []) as Layanan[];
  const dokter = (dokterRes.data ?? []) as unknown as Dokter[];

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-6">
      <section>
        <h1 className="text-3xl font-bold">Klinik Kesehatan</h1>
        <p className="mt-2 text-gray-400">
          Daftar kunjungan secara online, pantau nomor antrean, dan lihat riwayat
          pemeriksaanmu dengan mudah.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Layanan</h2>
        {layananRes.error ? (
          <Pesan tipe="error">Gagal memuat layanan: {layananRes.error.message}</Pesan>
        ) : layanan.length === 0 ? (
          <Pesan>Belum ada layanan.</Pesan>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {layanan.map((l) => (
              <div key={l.id} className="rounded border border-gray-700 p-4">
                <h3 className="font-medium">{l.nama}</h3>
                {l.deskripsi && <p className="mt-1 text-sm text-gray-400">{l.deskripsi}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Dokter & Jadwal Praktik</h2>
        {dokterRes.error ? (
          <Pesan tipe="error">Gagal memuat dokter: {dokterRes.error.message}</Pesan>
        ) : dokter.length === 0 ? (
          <Pesan>Belum ada dokter.</Pesan>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {dokter.map((d) => {
              const jadwal = d.jadwal_praktik
                .filter((j) => j.aktif)
                .sort((a, b) => a.hari - b.hari);
              return (
                <div key={d.id} className="rounded border border-gray-700 p-4">
                  <h3 className="font-medium">{d.nama}</h3>
                  <p className="text-sm text-gray-400">{d.spesialis ?? "Dokter umum"}</p>
                  {jadwal.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">Jadwal belum tersedia.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {jadwal.map((j, i) => (
                        <li key={i}>
                          {HARI[j.hari]}: {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}
                          <span className="text-gray-500"> (kuota {j.kuota})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Pesan({ children, tipe }: { children: React.ReactNode; tipe?: "error" }) {
  return (
    <p className={tipe === "error" ? "text-sm text-red-500" : "text-sm text-gray-500"}>
      {children}
    </p>
  );
}