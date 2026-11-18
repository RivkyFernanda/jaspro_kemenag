'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import { 
  SendHorizontal, 
  PlusCircle, 
  Search, 
  Download, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  User,
  Paperclip
} from 'lucide-react';

export default function SuratKeluarPage() {
  const router = useRouter();

  // State Data
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // State Form Input / Edit
  const [editId, setEditId] = useState(null);
  const [nomorSurat, setNomorSurat] = useState('');
  const [tglSurat, setTglSurat] = useState(new Date().toISOString().split('T')[0]);
  const [kepada, setKepada] = useState('');
  const [lampiran, setLampiran] = useState('');
  const [perihal, setPerihal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Search Engine
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBulan, setFilterBulan] = useState('');

  // Proteksi rute login
  useEffect(() => {
    const user = localStorage.getItem('jaspro_user');
    if (!user) {
      router.push('/login');
    } else {
      fetchSuratKeluar();
    }
  }, [router]);

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // 1. Fetch data dari Supabase
  const fetchSuratKeluar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('surat_keluar')
        .select('*')
        .order('tgl_surat', { ascending: false });

      if (error) throw error;
      setSuratList(data || []);
    } catch (err) {
      console.error('Fetch surat keluar error:', err);
      showNotice('error', 'Gagal mengambil data surat keluar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditId(null);
    setNomorSurat('');
    setTglSurat(new Date().toISOString().split('T')[0]);
    setKepada('');
    setLampiran('');
    setPerihal('');
    setKeterangan('');
  };

  // 2. Submit Simpan / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !kepada.trim() || !perihal.trim()) {
      showNotice('error', 'Mohon lengkapi nomor surat, tujuan (kepada), dan perihal!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nomor_surat: nomorSurat.trim(),
        tgl_surat: tglSurat,
        kepada: kepada.trim(),
        lampiran: lampiran.trim() || null,
        perihal: perihal.trim(),
        keterangan: keterangan.trim() || null,
      };

      if (editId) {
        // Update
        const { error } = await supabase
          .from('surat_keluar')
          .update(payload)
          .eq('id', editId);

        if (error) throw error;
        showNotice('success', 'Data surat keluar berhasil diperbarui!');
      } else {
        // Insert Baru
        const { error } = await supabase
          .from('surat_keluar')
          .insert([payload]);

        if (error) throw error;
        showNotice('success', 'Surat keluar baru berhasil dicatat!');
      }

      resetForm();
      fetchSuratKeluar();
    } catch (err) {
      console.error('Save surat keluar error:', err);
      showNotice('error', 'Gagal menyimpan surat keluar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Edit Data
  const handleEdit = (item) => {
    setEditId(item.id);
    setNomorSurat(item.nomor_surat || '');
    setTglSurat(item.tgl_surat || new Date().toISOString().split('T')[0]);
    setKepada(item.kepada || '');
    setLampiran(item.lampiran || '');
    setPerihal(item.perihal || '');
    setKeterangan(item.keterangan || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Hapus Data
  const handleDelete = async (id, noSurat) => {
    if (!window.confirm(`Yakin ingin menghapus surat keluar dengan No: "${noSurat}"?`)) return;

    try {
      const { error } = await supabase
        .from('surat_keluar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotice('success', 'Data surat keluar berhasil dihapus!');
      fetchSuratKeluar();
    } catch (err) {
      showNotice('error', 'Gagal menghapus: ' + err.message);
    }
  };

  // 5. Search Engine & Realtime Filter
  const filteredData = useMemo(() => {
    return suratList.filter((item) => {
      const search = searchTerm.toLowerCase().trim();
      const noSurat = item.nomor_surat?.toLowerCase() || '';
      const target = item.kepada?.toLowerCase() || '';
      const peri = item.perihal?.toLowerCase() || '';
      const ket = item.keterangan?.toLowerCase() || '';

      const matchSearch =
        !search ||
        noSurat.includes(search) ||
        target.includes(search) ||
        peri.includes(search) ||
        ket.includes(search);

      // Filter Bulan berdasarkan tgl_surat (YYYY-MM-DD)
      const matchBulan =
        !filterBulan ||
        (item.tgl_surat && item.tgl_surat.slice(5, 7) === filterBulan);

      return matchSearch && matchBulan;
    });
  }, [suratList, searchTerm, filterBulan]);

  // 6. Export ke Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data surat keluar untuk diunduh.');
      return;
    }

    const excelRows = filteredData.map((item, index) => ({
      No: index + 1,
      'Nomor Surat': item.nomor_surat,
      'Tanggal Surat': item.tgl_surat,
      Kepada: item.kepada,
      Lampiran: item.lampiran || '-',
      Perihal: item.perihal,
      Keterangan: item.keterangan || '-',
      'Waktu Pencatatan': new Date(item.created_at).toLocaleString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 28 }, // Nomor Surat
      { wch: 16 }, // Tanggal Surat
      { wch: 28 }, // Kepada
      { wch: 18 }, // Lampiran
      { wch: 35 }, // Perihal
      { wch: 30 }, // Keterangan
      { wch: 24 }, // Waktu Pencatatan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Surat Keluar');
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Laporan_Surat_Keluar_Kemenag_${timestamp}.xlsx`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <SendHorizontal className="w-7 h-7 text-teal-700" />
            <span>Agenda Surat Keluar Kemenag</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan nomor surat keluar, tujuan distribusi, dan rekapitulasi data arsip
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSuratKeluar}
            className="p-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm transition flex items-center justify-center cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center space-x-2 shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Notifikasi feedback */}
      {notification.message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium transition ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* FORM INPUT / EDIT SURAT KELUAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-teal-700" />
            <span>{editId ? 'Edit Data Surat Keluar' : 'Form Input Surat Keluar'}</span>
          </h2>
          {editId && (
            <button
              onClick={resetForm}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nomor Surat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>Nomor Surat Keluar *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: B-102/Kua.01/PW.01/11/2026"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Tanggal Surat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Tanggal Surat *</span>
              </label>
              <input
                type="date"
                required
                value={tglSurat}
                onChange={(e) => setTglSurat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Kepada / Tujuan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Kepada (Tujuan Surat) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kepala Kankemenag Kota"
                value={kepada}
                onChange={(e) => setKepada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Lampiran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Paperclip className="w-3.5 h-3.5 text-teal-700" />
                <span>Lampiran</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 1 Berkas / -"
                value={lampiran}
                onChange={(e) => setLampiran(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Perihal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perihal Surat *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Isi pokok / hal surat keluar..."
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Tambahan
              </label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan / nomor arsip..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 px-6 rounded-lg text-sm flex items-center space-x-2 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : editId ? 'Perbarui Surat Keluar' : 'Simpan Surat Keluar'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FILTER & PENCARIAN REALTIME */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. Surat, Kepada, Perihal, atau Ket..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">Semua Bulan Surat</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          {(searchTerm || filterBulan) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBulan('');
              }}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TABEL DATA SURAT KELUAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nomor & Tgl Surat</th>
                <th className="py-3 px-4">Kepada (Tujuan)</th>
                <th className="py-3 px-4">Perihal</th>
                <th className="py-3 px-4">Lampiran</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      <span>Mengambil data surat keluar dari Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data surat keluar yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-800 text-xs">{row.nomor_surat}</div>
                      <div className="text-slate-400 text-xs">Tgl: {row.tgl_surat}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {row.kepada}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs">
                      {row.perihal}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {row.lampiran || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs">
                      {row.keterangan || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-teal-700 hover:text-teal-900 p-1.5 rounded transition cursor-pointer"
                          title="Edit surat keluar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id, row.nomor_surat)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded transition cursor-pointer"
                          title="Hapus surat keluar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
