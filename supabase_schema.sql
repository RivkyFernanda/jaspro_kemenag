-- ========================================================
-- SKEMA DATABASE SUPABASE: SISTEM JASPRO KEMENAG
-- Jalankan skrip ini di menu Supabase Dashboard -> SQL Editor
-- ========================================================

-- Aktifkan ekstensi pgcrypto untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nama_lengkap VARCHAR(150),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'operator', dll.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    id BIGSERIAL PRIMARY KEY,
    nama_kecamatan VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel penghulu
CREATE TABLE IF NOT EXISTS penghulu (
    id BIGSERIAL PRIMARY KEY,
    nama_penghulu VARCHAR(150) NOT NULL,
    kecamatan_id BIGINT REFERENCES kecamatan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'pensiun')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel laporan_jaspro
CREATE TABLE IF NOT EXISTS laporan_jaspro (
    id BIGSERIAL PRIMARY KEY,
    kecamatan_id BIGINT REFERENCES kecamatan(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    penghulu_id BIGINT REFERENCES penghulu(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    bulan VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    nomor_surat VARCHAR(100) NOT NULL,
    jam_pelaksanaan TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat query pencarian dan join
CREATE INDEX IF NOT EXISTS idx_penghulu_kecamatan ON penghulu(kecamatan_id);
CREATE INDEX IF NOT EXISTS idx_penghulu_status ON penghulu(status);
CREATE INDEX IF NOT EXISTS idx_laporan_kecamatan ON laporan_jaspro(kecamatan_id);
CREATE INDEX IF NOT EXISTS idx_laporan_penghulu ON laporan_jaspro(penghulu_id);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal ON laporan_jaspro(tanggal);
CREATE INDEX IF NOT EXISTS idx_laporan_nomor_surat ON laporan_jaspro(nomor_surat);

-- Nonaktifkan RLS atau aktifkan kebijakan publik jika menggunakan anon key untuk CRUD sederhana
-- Untuk kemudahan API Client Supabase:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kecamatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE penghulu ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_jaspro ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses anonim (atau sesuaikan dengan kebutuhan autentikasi kustom Anda)
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Public CRUD Kecamatan" ON kecamatan FOR ALL USING (true);
CREATE POLICY "Public CRUD Penghulu" ON penghulu FOR ALL USING (true);
CREATE POLICY "Public CRUD Laporan" ON laporan_jaspro FOR ALL USING (true);

-- Buat user awal untuk admin pertama kali (Password: admin123)
INSERT INTO users (username, password_hash, nama_lengkap, role)
VALUES (
    'admin', 
    crypt('admin123', gen_salt('bf')), 
    'Administrator Kemenag', 
    'admin'
) ON CONFLICT (username) DO NOTHING;

