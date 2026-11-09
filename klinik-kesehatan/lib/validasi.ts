export const POLI = ["Umum", "Gigi", "Anak", "Kandungan"] as const;
export const JAM = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"] as const;
export const MAKS_HARI_KE_DEPAN = 30;

export type InputKunjungan = { poli: string; tanggal: string; jam: string; keluhan: string };
export type ErrorKunjungan = Partial<Record<keyof InputKunjungan, string>>;

export function hariIniWIB(sekarang = new Date()): string {
  return sekarang.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function jamSekarangWIB(sekarang: Date): string {
  return sekarang.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function tambahHari(tgl: string, n: number): string {
  const d = new Date(tgl + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function tanggalValid(tgl: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return false;
  const d = new Date(tgl + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === tgl;
}

export function validasiKunjungan(input: InputKunjungan, sekarang = new Date()): ErrorKunjungan {
  const e: ErrorKunjungan = {};
  const hariIni = hariIniWIB(sekarang);

  if (!(POLI as readonly string[]).includes(input.poli)) e.poli = "Pilih poli yang tersedia";

  if (!tanggalValid(input.tanggal)) {
    e.tanggal = "Tanggal tidak valid";
  } else if (input.tanggal < hariIni) {
    e.tanggal = "Tanggal tidak boleh di masa lalu";
  } else if (input.tanggal > tambahHari(hariIni, MAKS_HARI_KE_DEPAN)) {
    e.tanggal = `Maksimal ${MAKS_HARI_KE_DEPAN} hari ke depan`;
  } else if (new Date(input.tanggal + "T00:00:00Z").getUTCDay() === 0) {
    e.tanggal = "Klinik tutup hari Minggu";
  }

  if (!(JAM as readonly string[]).includes(input.jam)) {
    e.jam = "Pilih jam yang tersedia";
  } else if (!e.tanggal && input.tanggal === hariIni && input.jam <= jamSekarangWIB(sekarang)) {
    e.jam = "Jam tersebut sudah lewat";
  }

  const k = (input.keluhan ?? "").trim();
  if (k.length < 5) e.keluhan = "Keluhan minimal 5 karakter";
  else if (k.length > 500) e.keluhan = "Keluhan maksimal 500 karakter";

  return e;
}