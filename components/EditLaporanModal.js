'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';

const BULAN_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function EditLaporanModal({ isOpen, onClose, laporan, onSaved }) {
  const [kecamatanList, setKecamatanList] = useState([]);
  const [penghuluList, setPenghuluList] = useState([]);

  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [selectedPenghulu, setSelectedPenghulu] = useState('');
  const [bulan, setBulan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [jamPelaksanaan, setJamPelaksanaan] = useState('00:00');

  const [loading, setLoading] = useState(false);
  const [loadingPenghulu, setLoadingPenghulu] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Muat kecamatan saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      loadKecamatan();
    }
  }, [isOpen]);

  // Set initial form state saat data laporan masuk
  useEffect(() => {
    if (laporan && isOpen) {
      setSelectedKecamatan(laporan.kecamatan_id || laporan.kecamatan?.id || '');
      setSelectedPenghulu(laporan.penghulu_id || laporan.penghulu?.id || '');
      setBulan(laporan.bulan || BULAN_OPTIONS[0]);
      setTanggal(laporan.tanggal || '');
      setNomorSurat(laporan.nomor_surat || '');
      setJamPelaksanaan(laporan.jam_pelaksanaan || '00:00');
      setErrorMsg('');
    }
  }, [laporan, isOpen]);

  // Load Kecamatan
  const loadKecamatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kecamatan')
        .select('id, nama_kecamatan')
        .order('nama_kecamatan', { ascending: true });

      if (error) throw error;
      setKecamatanList(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Load Penghulu berdasarkan kecamatan terpilih
  useEffect(() => {
    if (!selectedKecamatan) {
      setPenghuluList([]);
      return;
    }

    const loadPenghulu = async () => {
      setLoadingPenghulu(true);
      try {
        const { data, error } = await supabase
          .from('penghulu')
          .select('id, nama_penghulu, nip, status')
          .eq('kecamatan_id', selectedKecamatan)
          .order('nama_penghulu', { ascending: true });

        if (error) throw error;
        setPenghuluList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPenghulu(false);
      }
    };

    loadPenghulu();
  }, [selectedKecamatan]);

  if (!isOpen || !laporan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedKecamatan || !selectedPenghulu || !nomorSurat.trim()) {
      setErrorMsg('Semua kolom wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      // Cek jadwal bentrok dengan laporan lain (kecuali dirinya sendiri)
      const { data: existingSchedules, error: checkError } = await supabase
        .from('laporan_jaspro')
        .select('id, nomor_surat, tanggal, jam_pelaksanaan, penghulu:penghulu(nama_penghulu)')
        .eq('penghulu_id', selectedPenghulu)
        .eq('tanggal', tanggal)
        .eq('jam_pelaksanaan', jamPelaksanaan)
        .neq('id', laporan.id);

      if (checkError) throw checkError;

      if (existingSchedules && existingSchedules.length > 0) {
        const bentrok = existingSchedules[0];
        const namaP = bentrok.penghulu?.nama_penghulu || 'penghulu';
        setErrorMsg(
          `⚠️ Jadwal bentrok! ${namaP} sudah memiliki agenda pada tanggal ${tanggal} jam ${jamPelaksanaan} (Nomor Surat: ${bentrok.nomor_surat}).`
        );
        setLoading(false);
        return;
      }

      // Update data
      const { error } = await supabase
        .from('laporan_jaspro')
        .update({
          kecamatan_id: selectedKecamatan,
          penghulu_id: selectedPenghulu,
          bulan: bulan,
          tanggal: tanggal,
          nomor_surat: nomorSurat.trim(),
          jam_pelaksanaan: jamPelaksanaan,
        })
        .eq('id', laporan.id);

      if (error) throw error;

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memperbarui laporan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base">Edit Data Laporan Jaspro</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Kecamatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kecamatan *
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              <option value="">-- Pilih Kecamatan --</option>
              {kecamatanList.map((kec) => (
                <option key={kec.id} value={kec.id}>
                  {kec.nama_kecamatan}
                </option>
              ))}
            </select>
          </div>

          {/* Penghulu */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Penghulu *
            </label>
            <select
              value={selectedPenghulu}
              onChange={(e) => setSelectedPenghulu(e.target.value)}
              disabled={!selectedKecamatan || loadingPenghulu}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white disabled:opacity-50"
            >
              <option value="">
                {loadingPenghulu ? 'Memuat penghulu...' : '-- Pilih Penghulu --'}
              </option>
              {penghuluList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_penghulu} {p.nip ? `(NIP. ${p.nip})` : ''} {p.status !== 'aktif' ? `[${p.status}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Grid Periode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bulan *
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
              >
                {BULAN_OPTIONS.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pelaksanaan *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Pelaksanaan *
              </label>
              <input
                type="time"
                required
                value={jamPelaksanaan}
                onChange={(e) => setJamPelaksanaan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Nomor Surat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Surat Tugas / Nikah *
            </label>
            <input
              type="text"
              required
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
