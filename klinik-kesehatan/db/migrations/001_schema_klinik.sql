-- =====================================================================
-- 001_schema_klinik.sql  (DRAFT)
-- Sistem Informasi Klinik Kesehatan - Kelompok 7
-- Database: PostgreSQL (Supabase)
-- Jalankan sekali di Supabase > SQL Editor > New query > Run
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TIPE DATA PILIHAN (ENUM)
-- ---------------------------------------------------------------------
create type peran_pengguna as enum ('pasien', 'petugas', 'dokter', 'admin');
create type status_kunjungan as enum ('menunggu', 'dipanggil', 'selesai', 'batal');


-- ---------------------------------------------------------------------
-- 2. TABEL
-- ---------------------------------------------------------------------

-- Akun pengguna. id sama dengan id di Supabase Auth (auth.users).
create table pengguna (
  id           uuid primary key references auth.users (id) on delete cascade,
  nama         text not null,
  email        text,
  peran        peran_pengguna not null default 'pasien',
  aktif        boolean not null default true,
  dibuat_pada  timestamptz not null default now()
);

-- Data pasien. pengguna_id boleh kosong untuk pasien yang didaftarkan petugas (tanpa akun).
create table pasien (
  id             bigint generated always as identity primary key,
  pengguna_id    uuid unique references pengguna (id) on delete set null,
  nama           text not null,
  tanggal_lahir  date,
  jenis_kelamin  text check (jenis_kelamin in ('L', 'P')),
  no_hp          text,
  alamat         text,
  dibuat_pada    timestamptz not null default now()
);

-- Data dokter. Setiap dokter punya satu akun login.
create table dokter (
  id           bigint generated always as identity primary key,
  pengguna_id  uuid not null unique references pengguna (id),
  nama         text not null,
  spesialis    text,
  no_str       text,
  aktif        boolean not null default true,
  dibuat_pada  timestamptz not null default now()
);

-- Layanan klinik (Pemeriksaan Umum, Gigi, dst).
create table layanan (
  id           bigint generated always as identity primary key,
  nama         text not null unique,
  deskripsi    text,
  aktif        boolean not null default true,
  dibuat_pada  timestamptz not null default now()
);

-- Jadwal praktik dokter. hari: 1 = Senin ... 7 = Minggu.
create table jadwal_praktik (
  id           bigint generated always as identity primary key,
  dokter_id    bigint not null references dokter (id),
  hari         smallint not null check (hari between 1 and 7),
  jam_mulai    time not null,
  jam_selesai  time not null,
  kuota        integer not null check (kuota > 0),
  aktif        boolean not null default true,
  check (jam_selesai > jam_mulai)
);

-- Kunjungan / antrean pasien.
create table kunjungan (
  id               bigint generated always as identity primary key,
  pasien_id        bigint not null references pasien (id),
  dokter_id        bigint not null references dokter (id),
  layanan_id       bigint not null references layanan (id),
  jadwal_id        bigint references jadwal_praktik (id),
  tanggal          date not null,
  nomor_antrean    integer not null,
  keluhan          text,
  status           status_kunjungan not null default 'menunggu',
  dibuat_pada      timestamptz not null default now(),
  diperbarui_pada  timestamptz not null default now(),
  -- satu dokter tidak boleh punya dua nomor antrean yang sama di hari yang sama
  unique (dokter_id, tanggal, nomor_antrean)
);

-- Catatan pemeriksaan. Satu kunjungan = satu rekam medis.
create table rekam_medis (
  id            bigint generated always as identity primary key,
  kunjungan_id  bigint not null unique references kunjungan (id),
  keluhan       text,
  diagnosis     text not null,
  tindakan      text,
  catatan       text,
  dibuat_pada   timestamptz not null default now()
);

-- Index untuk mempercepat pencarian yang sering dipakai
create index idx_kunjungan_dokter_tanggal on kunjungan (dokter_id, tanggal);
create index idx_kunjungan_pasien on kunjungan (pasien_id);
create index idx_jadwal_dokter on jadwal_praktik (dokter_id);


-- ---------------------------------------------------------------------
-- 3. FUNGSI BANTU
-- ---------------------------------------------------------------------

-- Peran pengguna yang sedang login
create or replace function peran_saya()
returns peran_pengguna
language sql stable security definer set search_path = public
as $$
  select peran from pengguna where id = auth.uid() and aktif
$$;

-- id dokter milik pengguna yang sedang login (null kalau bukan dokter)
create or replace function dokter_id_saya()
returns bigint
language sql stable security definer set search_path = public
as $$
  select id from dokter where pengguna_id = auth.uid()
$$;

-- id pasien milik pengguna yang sedang login (null kalau bukan pasien)
create or replace function pasien_id_saya()
returns bigint
language sql stable security definer set search_path = public
as $$
  select id from pasien where pengguna_id = auth.uid()
$$;


-- ---------------------------------------------------------------------
-- 4. TRIGGER (ATURAN OTOMATIS)
-- ---------------------------------------------------------------------

-- 4a. Akun baru di Supabase Auth otomatis dibuatkan baris di tabel pengguna (peran: pasien)
create or replace function buat_pengguna_baru()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into pengguna (id, nama, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger trg_buat_pengguna_baru
after insert on auth.users
for each row execute function buat_pengguna_baru();


-- 4b. Nomor antrean otomatis: urutan berikutnya per dokter per tanggal
create or replace function isi_nomor_antrean()
returns trigger
language plpgsql
as $$
begin
  if new.nomor_antrean is null then
    select coalesce(max(nomor_antrean), 0) + 1
      into new.nomor_antrean
      from kunjungan
     where dokter_id = new.dokter_id
       and tanggal = new.tanggal;
  end if;
  return new;
end;
$$;

create trigger trg_isi_nomor_antrean
before insert on kunjungan
for each row execute function isi_nomor_antrean();


-- 4c. Kunjungan yang sudah selesai tidak boleh diubah,
--     dan kunjungan hanya boleh diselesaikan kalau rekam medisnya sudah ada.
create or replace function jaga_kunjungan_selesai()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'selesai' then
    raise exception 'Kunjungan yang sudah selesai tidak bisa diubah';
  end if;

  if new.status = 'selesai'
     and not exists (select 1 from rekam_medis where kunjungan_id = new.id) then
    raise exception 'Isi rekam medis dulu sebelum menyelesaikan kunjungan';
  end if;

  new.diperbarui_pada = now();
  return new;
end;
$$;

create trigger trg_jaga_kunjungan_selesai
before update on kunjungan
for each row execute function jaga_kunjungan_selesai();


-- 4d. Rekam medis tidak boleh ditambah/diubah/dihapus kalau kunjungannya sudah selesai
create or replace function jaga_rekam_medis()
returns trigger
language plpgsql
as $$
declare
  id_kunjungan bigint;
begin
  id_kunjungan := coalesce(new.kunjungan_id, old.kunjungan_id);

  if exists (select 1 from kunjungan where id = id_kunjungan and status = 'selesai') then
    raise exception 'Rekam medis dari kunjungan yang sudah selesai tidak bisa diubah';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_jaga_rekam_medis
before insert or update or delete on rekam_medis
for each row execute function jaga_rekam_medis();


-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
--    Aturan siapa boleh melihat/mengubah baris apa, dijaga di database.
-- ---------------------------------------------------------------------
alter table pengguna       enable row level security;
alter table pasien         enable row level security;
alter table dokter         enable row level security;
alter table layanan        enable row level security;
alter table jadwal_praktik enable row level security;
alter table kunjungan      enable row level security;
alter table rekam_medis    enable row level security;

-- pengguna: lihat akun sendiri; admin kelola semua
create policy pengguna_lihat_sendiri on pengguna
  for select to authenticated using (id = auth.uid());
create policy pengguna_admin on pengguna
  for all to authenticated
  using (peran_saya() = 'admin') with check (peran_saya() = 'admin');

-- layanan, dokter, jadwal: data aktif boleh dilihat publik (untuk halaman profil klinik); admin kelola
create policy layanan_publik on layanan
  for select to anon, authenticated using (aktif);
create policy layanan_admin on layanan
  for all to authenticated
  using (peran_saya() = 'admin') with check (peran_saya() = 'admin');

create policy dokter_publik on dokter
  for select to anon, authenticated using (aktif);
create policy dokter_admin on dokter
  for all to authenticated
  using (peran_saya() = 'admin') with check (peran_saya() = 'admin');

create policy jadwal_publik on jadwal_praktik
  for select to anon, authenticated using (aktif);
create policy jadwal_admin on jadwal_praktik
  for all to authenticated
  using (peran_saya() = 'admin') with check (peran_saya() = 'admin');

-- pasien: data sendiri; petugas boleh kelola; dokter hanya pasien yang dijadwalkan ke dirinya
create policy pasien_sendiri on pasien
  for select to authenticated using (pengguna_id = auth.uid());
create policy pasien_petugas on pasien
  for all to authenticated
  using (peran_saya() in ('petugas', 'admin'))
  with check (peran_saya() in ('petugas', 'admin'));
create policy pasien_milik_dokter on pasien
  for select to authenticated
  using (exists (
    select 1 from kunjungan k
    where k.pasien_id = pasien.id and k.dokter_id = dokter_id_saya()
  ));

-- kunjungan
create policy kunjungan_pasien_lihat on kunjungan
  for select to authenticated using (pasien_id = pasien_id_saya());
create policy kunjungan_pasien_daftar on kunjungan
  for insert to authenticated with check (pasien_id = pasien_id_saya());
create policy kunjungan_dokter on kunjungan
  for select to authenticated using (dokter_id = dokter_id_saya());
create policy kunjungan_dokter_ubah on kunjungan
  for update to authenticated
  using (dokter_id = dokter_id_saya()) with check (dokter_id = dokter_id_saya());
create policy kunjungan_petugas on kunjungan
  for all to authenticated
  using (peran_saya() in ('petugas', 'admin'))
  with check (peran_saya() in ('petugas', 'admin'));

-- rekam medis: hanya dokter pemilik kunjungan (tulis + baca) dan pasien yang bersangkutan (baca).
-- Admin dan petugas sengaja TIDAK diberi akses (data medis bersifat rahasia).
create policy rekam_dokter on rekam_medis
  for all to authenticated
  using (exists (
    select 1 from kunjungan k
    where k.id = rekam_medis.kunjungan_id and k.dokter_id = dokter_id_saya()
  ))
  with check (exists (
    select 1 from kunjungan k
    where k.id = rekam_medis.kunjungan_id and k.dokter_id = dokter_id_saya()
  ));
create policy rekam_pasien on rekam_medis
  for select to authenticated
  using (exists (
    select 1 from kunjungan k
    where k.id = rekam_medis.kunjungan_id and k.pasien_id = pasien_id_saya()
  ));


-- ---------------------------------------------------------------------
-- 6. DATA AWAL (CONTOH)
-- ---------------------------------------------------------------------
insert into layanan (nama, deskripsi) values
  ('Pemeriksaan Umum', 'Konsultasi dan pemeriksaan kesehatan umum'),
  ('Pemeriksaan Gigi', 'Konsultasi dan perawatan gigi'),
  ('Kesehatan Ibu dan Anak', 'Pemeriksaan ibu hamil dan balita');
