-- ========================================================
-- SKEMA TAMBAHAN: SURAT MASUK DAN SURAT KELUAR
-- Jalankan skrip ini di menu Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Tabel surat_masuk
CREATE TABLE IF NOT EXISTS surat_masuk (
    id BIGSERIAL PRIMARY KEY,
    tgl_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    asal_surat VARCHAR(255) NOT NULL,
    tgl_surat DATE NOT NULL,
    nomor_surat VARCHAR(150) NOT NULL,
    perihal TEXT NOT NULL,
    disposisi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel surat_keluar
CREATE TABLE IF NOT EXISTS surat_keluar (
    id BIGSERIAL PRIMARY KEY,
    nomor_surat VARCHAR(150) NOT NULL,
    tgl_surat DATE NOT NULL DEFAULT CURRENT_DATE,
    kepada VARCHAR(255) NOT NULL,
    lampiran VARCHAR(150),
    perihal TEXT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat query pencarian
CREATE INDEX IF NOT EXISTS idx_surat_masuk_nomor ON surat_masuk(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_tgl_masuk ON surat_masuk(tgl_masuk);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_nomor ON surat_keluar(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_tgl_surat ON surat_keluar(tgl_surat);

-- RLS Policies
ALTER TABLE surat_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_keluar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public CRUD Surat Masuk" ON surat_masuk FOR ALL USING (true);
CREATE POLICY "Public CRUD Surat Keluar" ON surat_keluar FOR ALL USING (true);
