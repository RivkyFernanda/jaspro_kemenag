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
  User,
  Sparkles,
  Info
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
  const [jamPelaksanaan, setJamPelaksanaan] = useState('00:00');

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
          .select('id, nama_penghulu, nip, status')
          .eq('kecamatan_id', selectedKecamatan)
          .eq('status', 'aktif')
          .order('nama_penghulu', { ascending: true });

        if (error) throw error;
        setPenghuluAktifList(data || []);
        setSelectedPenghulu('');
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
      setNotice({ type: 'error', message: 'Lengkapi semua kolom formulir yang bertanda bintang (*)' });
      return;
    }

    setLoading(true);
    try {
      // VALIDASI JADWAL BENTROK
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
          message: `⚠️ Jadwal bentrok! ${namaP} sudah memiliki agenda tugas pada tanggal ${tanggal} jam ${jamPelaksanaan} (Nomor Surat: ${bentrok.nomor_surat}). Silakan pilih jam atau tanggal lain.`,
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

      const { error } = await supabase
        .from('laporan_jaspro')
        .insert([payload]);

      if (error) throw error;

      setNotice({
        type: 'success',
        message: 'Laporan Jaspro berhasil disimpan ke database!',
      });

      // Reset form input
      setSelectedKecamatan('');
      setSelectedPenghulu('');
      setPenghuluAktifList([]);
      setNomorSurat('');
      setJamPelaksanaan('00:00');
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase bg-emerald-700/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-2">
            MODUL JASA PROFESI
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Formulir Pencatatan Jaspro</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Input tugas pelayanan nikah resmi KUA Kecamatan se-Kabupaten/Kota
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-emerald-100">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Validasi Jadwal Otomatis</span>
        </div>
      </div>

      {/* Notice Card */}
      {notice.message && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm font-medium shadow-xs transition ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Wilayah & Petugas */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              1. Data Wilayah & Petugas Penghulu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dropdown Kecamatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Kecamatan Tugas *</span>
                </label>
                <select
                  value={selectedKecamatan}
                  onChange={(e) => setSelectedKecamatan(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec.id} value={kec.id}>
                      Kecamatan {kec.nama_kecamatan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Penghulu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Nama Penghulu (Status Aktif) *</span>
                </label>
                <select
                  value={selectedPenghulu}
                  onChange={(e) => setSelectedPenghulu(e.target.value)}
                  disabled={!selectedKecamatan || loadingPenghulu}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition disabled:opacity-50 cursor-pointer"
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
                      {p.nama_penghulu} {p.nip ? `(NIP. ${p.nip})` : ''}
                    </option>
                  ))}
                </select>
                {selectedKecamatan && penghuluAktifList.length === 0 && !loadingPenghulu && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 inline shrink-0" />
                    <span>Penghulu berstatus <em>non aktif</em> tidak ditampilkan.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Waktu Pelaksanaan */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              2. Waktu Pelaksanaan Tugas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Bulan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bulan Pelaporan *
                </label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tanggal Pelaksanaan *</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Jam Pelaksanaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Jam Pelaksanaan (WIB) *</span>
                </label>
                <input
                  type="time"
                  value={jamPelaksanaan}
                  onChange={(e) => setJamPelaksanaan(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Legalitas / Nomor Surat */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              3. Legalitas Administrasi
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Nomor Surat Tugas / Pencatatan Nikah *</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: B-124/Kua.01/PW.01/10/2026"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              * Pastikan seluruh data sudah sesuai sebelum menekan tombol simpan
            </span>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Menyimpan ke Database...' : 'Simpan Laporan Jaspro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
