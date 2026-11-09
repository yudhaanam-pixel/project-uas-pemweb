import { redirect } from "next/navigation";
import { ambilSesi } from "@/lib/session";
import FormKunjungan from "@/components/FormKunjungan";

export default async function HalamanDaftarKunjungan() {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/login");
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Form Pendaftaran Kunjungan</h1>
      <FormKunjungan />
    </main>
  );
}