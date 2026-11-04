import Link from "next/link";
import { ambilSesi } from "@/lib/session";

export async function Navbar() {
  const s = await ambilSesi();
  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-bold">
        Klinik
      </Link>
      <div className="flex items-center gap-4">
        {!s ? (
          <>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
          </>
        ) : (
          <>
            <span className="text-sm">Halo, {s.nama}</span>
            <Link href={`/${s.peran}`}>Dashboard</Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="underline">
                Keluar
              </button>
            </form>
          </>
        )}
      </div>
    </nav>
  );
}