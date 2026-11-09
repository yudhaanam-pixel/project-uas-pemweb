import Link from "next/link";
import FormJanjiCepat from "@/components/FormJanjiCepat";

const DOKTER = [
  { nama: "Dr. James Wilson", spesialis: "Dokter Umum", pengalaman: "10+ tahun pengalaman", inisial: "JW" },
  { nama: "Dr. Emily Carter", spesialis: "Dokter Gigi", pengalaman: "8+ tahun pengalaman", inisial: "EC" },
  { nama: "Dr. Michael Brown", spesialis: "Dokter Anak", pengalaman: "12+ tahun pengalaman", inisial: "MB" },
  { nama: "Dr. Sarah Davis", spesialis: "Dokter Kandungan", pengalaman: "7+ tahun pengalaman", inisial: "SD" },
];

const LAYANAN = [
  { nama: "Poli Umum", ket: "Pemeriksaan & pencegahan", ikon: "🩺" },
  { nama: "Poli Gigi", ket: "Kesehatan gigi & mulut", ikon: "🦷" },
  { nama: "Poli Anak", ket: "Kesehatan anak", ikon: "🧸" },
  { nama: "Poli Kandungan", ket: "Kesehatan ibu & wanita", ikon: "🌸" },
];

const KARTU = [
  { ikon: "🩺", judul: "Klinik Kami", sub: "Modern & Nyaman",
    isi: "Lingkungan yang hangat dengan fasilitas mutakhir dan tenaga medis yang ramah.",
    tombol: "Selengkapnya", href: "#layanan" },
  { ikon: "👥", judul: "Layanan Kami", sub: "Perawatan Menyeluruh",
    isi: "Dari pencegahan hingga penanganan spesialis, kami melayani berbagai kebutuhan kesehatan.",
    tombol: "Lihat Layanan", href: "#layanan" },
  { ikon: "📅", judul: "Janji Temu Mudah", sub: "Daftar dalam Hitungan Menit",
    isi: "Pilih poli, tanggal, dan jam secara online, lalu datang tanpa antre panjang.",
    tombol: "Daftar Sekarang", href: "/kunjungan/baru" },
];

const btnUtama =
  "inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700";
const btnTepi =
  "inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50";

export default function Beranda() {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg text-white">♥</span>
            <span className="leading-tight">
              <span className="block text-lg font-bold text-blue-900">WellCare</span>
              <span className="block text-[10px] text-slate-400">Medical Clinic</span>
            </span>
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#beranda" className="text-blue-600">Beranda</a>
            <a href="#layanan" className="hover:text-blue-600">Layanan</a>
            <a href="#dokter" className="hover:text-blue-600">Dokter</a>
            <a href="#janji" className="hover:text-blue-600">Kontak</a>
          </nav>
          <Link href="/kunjungan/baru" className={btnUtama + " px-5 py-2.5"}>Buat Janji →</Link>
        </div>
      </header>

      {/* HERO */}
      <section id="beranda" className="bg-gradient-to-blue from-sky-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-600">KESEHATAN ANDA, PRIORITAS KAMI</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-blue-950 md:text-5xl">
              Layanan Kesehatan Berkualitas untuk <span className="text-blue-600">Hidup Lebih Sehat</span>
            </h1>
            <p className="mt-4 max-w-md text-slate-500">
              Layanan medis menyeluruh dengan empati, keahlian, dan teknologi modern untuk menjaga
              kesehatan Anda dan keluarga.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/kunjungan/baru" className={btnUtama}>📅 Buat Janji →</Link>
              <a href="#layanan" className={btnTepi}>▶ Lihat Layanan</a>
            </div>
            <ul className="mt-9 flex flex-wrap gap-6 text-xs text-slate-500">
              <li className="flex items-center gap-2"><span className="text-xl">🛡️</span><span><b className="block text-slate-700">Terpercaya</b>Sejak 2010</span></li>
              <li className="flex items-center gap-2"><span className="text-xl">👥</span><span><b className="block text-slate-700">Dokter Ahli</b>& Spesialis</span></li>
              <li className="flex items-center gap-2"><span className="text-xl">💙</span><span><b className="block text-slate-700">Fasilitas Modern</b>& Teknologi Maju</span></li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -right-4 top-6 h-72 w-72 rounded-full bg-sky-200/70 blur-sm md:h-80 md:w-80" />
            <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-sky-300/60" />
            {/* GANTI placeholder ini dengan foto: <Image src="/images/hero-dokter.png" ... /> */}
            <div className="relative grid h-96 place-items-center rounded-[2.5rem] bg-gradient-to-blue from-sky-100 to-blue-200 text-[9rem]">
              👩‍⚕️
            </div>
            <div className="absolute -left-2 top-8 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 shadow-xl">
              <span className="text-blue-500">💙</span> Kesehatan Anda<br />Penting
            </div>
          </div>
        </div>
      </section>

      {/* KARTU INFO */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
          {/* GANTI dengan foto resepsionis klinik */}
          <div className="grid min-h-48 place-items-center rounded-2xl bg-gradient-to-blue from-sky-100 to-sky-200 text-6xl">🏥</div>
          {KARTU.map((k) => (
            <div key={k.judul} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-xl">{k.ikon}</span>
              <h3 className="mt-4 font-bold text-blue-950">{k.judul}</h3>
              <p className="text-sm font-medium text-blue-600">{k.sub}</p>
              <p className="mt-2 text-sm text-slate-500">{k.isi}</p>
              <Link href={k.href} className="mt-4 inline-block rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-sky-100">
                {k.tombol} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* DOKTER */}
      <section id="dokter" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-blue-950">Kenali Dokter<br />Kami</h2>
            <p className="mt-3 text-sm text-slate-500">
              Tim dokter berpengalaman dan penuh empati siap memberikan perawatan terbaik di setiap langkah.
            </p>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {DOKTER.map((d) => (
              <article key={d.nama} className="min-w-48 snap-start rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                {/* GANTI dengan foto dokter */}
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-blue from-sky-100 to-blue-200 text-2xl font-bold text-blue-700">
                  {d.inisial}
                </div>
                <h3 className="mt-4 text-sm font-bold text-blue-950">{d.nama}</h3>
                <p className="text-xs font-medium text-blue-600">{d.spesialis}</p>
                <p className="mt-2 text-xs text-slate-400">🎓 {d.pengalaman}</p>
                <Link href="/kunjungan/baru" className="mt-4 inline-block rounded-full border border-blue-200 px-4 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                  Buat Janji →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section id="layanan" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* GANTI dengan foto perawat */}
          <div className="relative grid min-h-64 place-items-center rounded-2xl bg-gradient-to-blue from-sky-100 to-blue-100 text-8xl">
            🧑‍⚕️
            <div className="absolute right-4 top-1/2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-900 shadow-lg">
              💙 Perawatan Lebih Baik,<br />Hari Esok Lebih Cerah
            </div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-6">
            <h2 className="text-2xl font-extrabold text-blue-950">
              Layanan <span className="text-blue-600">Medis Lengkap</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kami menyediakan berbagai layanan kesehatan sesuai kebutuhan Anda, dari pemeriksaan rutin hingga penanganan lanjutan.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {LAYANAN.map((l) => (
                <Link key={l.nama} href={`/kunjungan/baru?poli=${encodeURIComponent(l.nama.replace("Poli ", ""))}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-xl">{l.ikon}</span>
                  <span>
                    <b className="block text-sm text-blue-950">{l.nama}</b>
                    <span className="text-xs text-slate-400">{l.ket}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JANJI TEMU */}
      <section id="janji" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-10">
        <div className="grid items-center gap-8 rounded-3xl bg-gradient-to-red from-blue-600 to-sky-400 p-8 md:grid-cols-[1fr_1.4fr]">
          <div className="flex items-start gap-4 text-white">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 text-2xl">📅</span>
            <div>
              <h2 className="text-2xl font-bold">Buat Janji Temu</h2>
              <p className="mt-1 text-sm text-white/90">
                Langkah pertama menuju kesehatan yang lebih baik. Jadwalkan kunjungan Anda hari ini.
              </p>
            </div>
          </div>
          <FormJanjiCepat />
        </div>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} WellCare Medical Clinic. Semua hak dilindungi.
      </footer>
    </div>
  );
}