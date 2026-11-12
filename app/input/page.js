'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Clock, 
  FileText, 
  Building2, 
  User 
} from 'lucide-react';

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function InputLaporanPage() {
  const router = useRouter();

  // Master data dari database
  const [kecamatanList, setKecamatanList] = useState([]);
  const [penghuluAktifList, setPenghuluAktifList] = useState([]);

  // Form states
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [selectedPenghulu, setSelectedPenghulu] = useState('');
  const [bulan, setBulan] = useState(BULAN_OPTIONS[new Date().getMonth()]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nomorSurat, setNomorSurat] = useState('');
  const [jamPelaksanaan, setJamPelaksanaan] = useState('09:00');

  // UI status
  const [loading, setLoading] = useState(false);
  const [loadingPenghulu, setLoadingPenghulu] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  // Proteksi rute login
  useEffect(() => {
    const user = localStorage.getItem('jaspro_user');
    if (!user) {
      router.push('/login');
    } else {
      loadKecamatan();
    }
  }, [router]);

  // Muat data kecamatan aktif langsung dari database Supabase
  const loadKecamatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kecamatan')
        .select('id, nama_kecamatan')
        .eq('is_active', true)
        .order('nama_kecamatan', { ascending: true });

      if (error) throw error;
      setKecamatanList(data || []);
    } catch (err) {
      console.error('Load kecamatan error:', err);
      setNotice({ type: 'error', message: 'Gagal mengambil data kecamatan dari server' });
    }
  };

  // Otomatis filter Penghulu dari Supabase berdasarkan Kecamatan terpilih & HANYA STATUS 'aktif'
  useEffect(() => {
    if (!selectedKecamatan) {
      setPenghuluAktifList([]);
      setSelectedPenghulu('');
      return;
    }

    const loadPenghuluByKecamatan = async () => {
      setLoadingPenghulu(true);
      try {
        const { data, error } = await supabase
          .from('penghulu')
          .select('id, nama_penghulu, status')
          .eq('kecamatan_id', selectedKecamatan)
          .eq('status', 'aktif') // KETENTUAN KETAT: Hanya status 'aktif'
          .order('nama_penghulu', { ascending: true });

        if (error) throw error;
        setPenghuluAktifList(data || []);
        setSelectedPenghulu(''); // Reset pilihan penghulu saat kecamatan berubah
      } catch (err) {
        console.error('Load penghulu error:', err);
      } finally {
        setLoadingPenghulu(false);
      }
    };

    loadPenghuluByKecamatan();
  }, [selectedKecamatan]);

  // Submit Laporan Jaspro ke Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: '', message: '' });

    if (!selectedKecamatan || !selectedPenghulu || !nomorSurat.trim()) {
      setNotice({ type: 'error', message: 'Lengkapi semua field form yang wajib diisi' });
      return;
    }

    setLoading(true);
    try {
      // VALIDASI JADWAL BENTROK:
      // Cek apakah ada laporan dengan Penghulu yang sama, Tanggal yang sama, dan Jam yang sama
      const { data: existingSchedules, error: checkError } = await supabase
        .from('laporan_jaspro')
        .select('id, nomor_surat, tanggal, jam_pelaksanaan, penghulu:penghulu(nama_penghulu)')
        .eq('penghulu_id', selectedPenghulu)
        .eq('tanggal', tanggal)
        .eq('jam_pelaksanaan', jamPelaksanaan);

      if (checkError) {
        throw new Error('Gagal memeriksa jadwal bentrok: ' + checkError.message);
      }

      if (existingSchedules && existingSchedules.length > 0) {
        const bentrok = existingSchedules[0];
        const namaP = bentrok.penghulu?.nama_penghulu || 'penghulu terkait';
        setNotice({
          type: 'error',
          message: `⚠️ Jadwal bentrok! ${namaP} sudah memiliki agenda pada tanggal ${tanggal} jam ${jamPelaksanaan} (Nomor Surat: ${bentrok.nomor_surat}). Silakan ganti jam atau tanggal.`,
        });
        setLoading(false);
        return;
      }

      const payload = {
        kecamatan_id: selectedKecamatan,
        penghulu_id: selectedPenghulu,
        bulan: bulan,
        tanggal: tanggal,
        nomor_surat: nomorSurat.trim(),
        jam_pelaksanaan: jamPelaksanaan,
      };

      const { data, error } = await supabase
        .from('laporan_jaspro')
        .insert([payload])
        .select();

      if (error) throw error;

      setNotice({
        type: 'success',
        message: 'Laporan Jaspro berhasil disimpan ke database!',
      });

      // Reset form input
      setNomorSurat('');
      // Tetapkan jam atau tanggal jika ingin diisi ulang
    } catch (err) {
      console.error('Insert laporan error:', err);
      setNotice({
        type: 'error',
        message: 'Gagal menyimpan laporan: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Form Input Laporan Jaspro</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Formulir pencatatan kegiatan Jasa Profesi (Jaspro) resmi Kementerian Agama
        </p>

        {notice.message && (
          <div
            className={`mt-4 p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Dropdown Kecamatan */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Kecamatan *</span>
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            >
              <option value="">-- Pilih Kecamatan --</option>
              {kecamatanList.map((kec) => (
                <option key={kec.id} value={kec.id}>
                  Kecamatan {kec.nama_kecamatan}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Penghulu (Otomatis difilter hanya yang 'aktif' dan sesuai kecamatan) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Nama Penghulu (Status Aktif) *</span>
            </label>
            <select
              value={selectedPenghulu}
              onChange={(e) => setSelectedPenghulu(e.target.value)}
              disabled={!selectedKecamatan || loadingPenghulu}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition disabled:opacity-50"
            >
              <option value="">
                {!selectedKecamatan
                  ? '-- Pilih Kecamatan Terlebih Dahulu --'
                  : loadingPenghulu
                  ? 'Memuat data penghulu...'
                  : penghuluAktifList.length === 0
                  ? 'Tidak ada penghulu berstatus aktif di kecamatan ini'
                  : '-- Pilih Penghulu --'}
              </option>
              {penghuluAktifList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_penghulu}
                </option>
              ))}
            </select>
            {selectedKecamatan && penghuluAktifList.length === 0 && !loadingPenghulu && (
              <p className="text-xs text-amber-600 mt-1">
                Catatan: Penghulu yang sudah berstatus <em>pensiun</em> tidak akan ditampilkan di formulir ini.
              </p>
            )}
          </div>

          {/* Grid Periode: Bulan, Tanggal, Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bulan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Bulan Pelaporan *
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              >
                {BULAN_OPTIONS.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Pelaksanaan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Tanggal Pelaksanaan *</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            {/* Jam Pelaksanaan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Jam Pelaksanaan *</span>
              </label>
              <input
                type="time"
                value={jamPelaksanaan}
                onChange={(e) => setJamPelaksanaan(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Nomor Surat Tugas / Pencatatan */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Nomor Surat Tugas / Nikah *</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: B-124/Kua.01/PW.01/10/2026"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Menyimpan ke Database...' : 'Simpan Laporan Jaspro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

