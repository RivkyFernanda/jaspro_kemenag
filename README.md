# Sistem Pencatatan Laporan Jasa Profesi (Jaspro) Kemenag

Aplikasi web modern berbasis **Next.js (App Router)** dan **Supabase (PostgreSQL)** untuk mencatat dan merekapitulasi laporan Jasa Profesi (Jaspro) Kementerian Agama secara realtime, terstruktur, dan siap di-deploy ke **Vercel**.

---

## 🚀 Fitur Utama

1. **Autentikasi Pegawai/Admin (`/login`)**:
 

2. **Kelola Master Data (`/admin`)**:


3. **Form Input Laporan Jaspro (`/input`)**:

4. **Rekapitulasi & Realtime Search Engine (`/rekap`)**:

5. **Export Excel (.xlsx)**:


## 📋 Langkah Instalasi & Penggunaan

### 1. Setup Supabase
1. Buka [Supabase Dashboard](https://supabase.com).
2. Buat proyek baru.
3. Buka menu **SQL Editor**, buka file `supabase_schema.sql` di proyek ini, salin seluruh kodenya, dan klik **Run**.
4. Ambil **Project URL** dan **anon public API Key** dari menu `Project Settings` -> `API`.

### 2. Konfigurasi Environment Variable
Buat file `.env.local` di root proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh......
```

### 3. Instalasi Dependency
Jalankan perintah berikut:
```bash
npm install
```
*(Dependencies yang digunakan: `@supabase/supabase-js`, `xlsx`, `lucide-react`, `bcryptjs`, `tailwindcss`)*

### 4. Menjalankan di Mode Development
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

---

## 🌐 Panduan Deploy ke Vercel

1. Push repository ini ke GitHub / GitLab / Bitbucket.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New... -> Project**.
3. Import repository proyek ini.
4. Pada bagian **Environment Variables**, masukkan:
   - `NEXT_PUBLIC_SUPABASE_URL` : URL proyek Supabase Anda
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Anon Public Key Supabase Anda
5. Klik **Deploy**. Selesai!

