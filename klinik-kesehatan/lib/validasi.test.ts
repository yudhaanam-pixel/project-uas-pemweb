import { describe, it, expect } from "vitest";
import { validasiKunjungan } from "./validasi";

// Senin, 9 Nov 2026, 10:00 WIB
const SEKARANG = new Date("2026-11-09T03:00:00Z");
const ok = { poli: "Umum", tanggal: "2026-11-10", jam: "09:00", keluhan: "Demam dan batuk" };

describe("validasiKunjungan", () => {
  it("menerima input valid", () => expect(validasiKunjungan(ok, SEKARANG)).toEqual({}));
  it("menolak poli tidak dikenal", () =>
    expect(validasiKunjungan({ ...ok, poli: "Mata" }, SEKARANG).poli).toBeDefined());
  it("menolak tanggal lampau", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-11-08" }, SEKARANG).tanggal).toMatch(/masa lalu/));
  it("menolak hari Minggu", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-11-15" }, SEKARANG).tanggal).toMatch(/Minggu/));
  it("menolak lebih dari 30 hari", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-12-30" }, SEKARANG).tanggal).toMatch(/Maksimal/));
  it("menolak tanggal tidak nyata", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-02-30" }, SEKARANG).tanggal).toMatch(/tidak valid/));
  it("menolak jam yang sudah lewat hari ini", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-11-09", jam: "08:00" }, SEKARANG).jam).toMatch(/lewat/));
  it("menerima jam yang belum lewat hari ini", () =>
    expect(validasiKunjungan({ ...ok, tanggal: "2026-11-09", jam: "11:00" }, SEKARANG)).toEqual({}));
  it("menolak jam di luar slot", () =>
    expect(validasiKunjungan({ ...ok, jam: "12:00" }, SEKARANG).jam).toBeDefined());
  it("menolak keluhan terlalu pendek / panjang", () => {
    expect(validasiKunjungan({ ...ok, keluhan: "  a " }, SEKARANG).keluhan).toMatch(/minimal/);
    expect(validasiKunjungan({ ...ok, keluhan: "x".repeat(501) }, SEKARANG).keluhan).toMatch(/maksimal/);
  });
});