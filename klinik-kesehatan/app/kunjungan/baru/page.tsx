import { redirect } from "next/navigation";
import { ambilSesi } from "@/lib/session";
import FormKunjungan from "@/components/FormKunjungan";

export default async function HalamanDaftarKunjungan({
  searchParams,
}: { searchParams: Promise<{ poli?: string; tanggal?: string; jam?: string }> }) {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/login");
  const awal = await searchParams;
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Form Pendaftaran Kunjungan</h1>
      <FormKunjungan awal={awal} />
    </main>
  );
}