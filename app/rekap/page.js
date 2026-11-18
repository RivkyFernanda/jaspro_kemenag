'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Filter, 
  Calendar, 
  Building2, 
  UserCheck, 
  FileSpreadsheet,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import EditLaporanModal from '@/components/EditLaporanModal';

export default function RekapitulasiPage() {
  const router = useRouter();

  // State data asli dari Supabase
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Modal edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLaporanEdit, setSelectedLaporanEdit] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [kecamatanList, setKecamatanList] = useState([]);

  // Proteksi rute
  useEffect(() => {
    const user = localStorage.getItem('jaspro_user');
    if (!user) {
      router.push('/login');
    } else {
      fetchMasterKecamatan();
      fetchLaporanData();
    }
  }, [router]);

  // Ambil daftar kecamatan untuk filter
  const fetchMasterKecamatan = async () => {
    try {
      const { data } = await supabase
        .from('kecamatan')
        .select('id, nama_kecamatan')
        .order('nama_kecamatan', { ascending: true });
      setKecamatanList(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Ambil semua data laporan dengan join tabel kecamatan & penghulu langsung dari Supabase
  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('laporan_jaspro')
        .select(`
          id,
          bulan,
          tanggal,
          nomor_surat,
          jam_pelaksanaan,
          created_at,
          kecamatan (
            id,
            nama_kecamatan
          ),
          penghulu (
            id,
            nama_penghulu,
            nip,
            status
          )
        `)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      setLaporanList(data || []);
    } catch (err) {
      console.error('Fetch laporan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // Hapus Data Laporan
  const handleDeleteLaporan = async (id, nomorSurat) => {
    if (!window.confirm(`Yakin ingin menghapus laporan dengan Nomor Surat: "${nomorSurat}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('laporan_jaspro')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotice('success', `Laporan "${nomorSurat}" berhasil dihapus.`);
      fetchLaporanData();
    } catch (err) {
      showNotice('error', 'Gagal menghapus laporan: ' + err.message);
    }
  };

  // Buka Modal Edit Laporan
  const handleOpenEdit = (item) => {
    setSelectedLaporanEdit(item);
    setEditModalOpen(true);
  };

  // SEARCH ENGINE & REALTIME FILTER
  const filteredData = useMemo(() => {
    return laporanList.filter((item) => {
      const namaPenghulu = item.penghulu?.nama_penghulu?.toLowerCase() || '';
      const nipPenghulu = item.penghulu?.nip?.toLowerCase() || '';
      const namaKecamatan = item.kecamatan?.nama_kecamatan?.toLowerCase() || '';
      const noSurat = item.nomor_surat?.toLowerCase() || '';
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        namaPenghulu.includes(search) ||
        nipPenghulu.includes(search) ||
        namaKecamatan.includes(search) ||
        noSurat.includes(search);

      const matchesBulan = !filterBulan || item.bulan === filterBulan;
      const matchesKecamatan =
        !filterKecamatan ||
        item.kecamatan?.id?.toString() === filterKecamatan ||
        item.kecamatan?.nama_kecamatan === filterKecamatan;

      return matchesSearch && matchesBulan && matchesKecamatan;
    });
  }, [laporanList, searchTerm, filterBulan, filterKecamatan]);

  // FITUR DOWNLOAD KE EXCEL (.XLSX)
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data laporan untuk diunduh.');
      return;
    }

    const excelRows = filteredData.map((item, index) => ({
      No: index + 1,
      'Nomor Surat': item.nomor_surat,
      Kecamatan: item.kecamatan?.nama_kecamatan || '-',
      'Nama Penghulu': item.penghulu?.nama_penghulu || '-',
      'NIP Penghulu': item.penghulu?.nip || '-',
      'Status Penghulu Saat Ini': item.penghulu?.status === 'aktif' ? 'Aktif' : 'Non Aktif',
      Bulan: item.bulan,
      'Tanggal Pelaksanaan': item.tanggal,
      'Jam Pelaksanaan': item.jam_pelaksanaan,
      'Waktu Input Sistem': new Date(item.created_at).toLocaleString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 22 },
      { wch: 28 },
      { wch: 24 },
      { wch: 24 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi Jaspro');
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Rekap_Jaspro_Kemenag_${timestamp}.xlsx`);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Rekapitulasi Administrasi</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Jasa Profesi</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Rekapitulasi Laporan Jaspro</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data riwayat pelayanan nikah, pencarian realtime, filter kecamatan, dan unduh format Excel
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchLaporanData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer shadow-xs"
            title="Muat ulang data dari database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-xs transition duration-150 cursor-pointer text-sm"
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

      {/* FILTER & REALTIME SEARCH ENGINE */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/90">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Penghulu, NIP, Nomor Surat, atau Kecamatan..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Filter Bulan */}
          <div>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="">Semua Bulan Pelaporan</option>
              {[
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kecamatan */}
          <div>
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((kec) => (
                <option key={kec.id} value={kec.id}>
                  Kecamatan {kec.nama_kecamatan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status ringkasan hasil filter */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredData.length}</span> dari total{' '}
            <span className="font-bold text-slate-800">{laporanList.length}</span> laporan
          </div>
          {(searchTerm || filterBulan || filterKecamatan) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBulan('');
                setFilterKecamatan('');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* TABEL REKAPITULASI LAPORAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nomor Surat</th>
                <th className="py-3.5 px-4">Kecamatan</th>
                <th className="py-3.5 px-4">Nama & NIP Penghulu</th>
                <th className="py-3.5 px-4 text-center">Bulan</th>
                <th className="py-3.5 px-4">Tanggal & Jam</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      <span className="text-xs font-medium">Mengambil data dari Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <p className="text-sm font-medium">Tidak ditemukan data laporan yang sesuai kriteria pencarian</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 text-center text-slate-400 text-xs font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                      {row.nomor_surat}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.kecamatan?.nama_kecamatan || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.penghulu?.nama_penghulu || '-'}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {row.penghulu?.nip ? `NIP. ${row.penghulu?.nip}` : 'NIP: -'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {row.bulan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      <div className="font-medium text-slate-800">{row.tanggal}</div>
                      <div className="text-slate-400 font-mono">{row.jam_pelaksanaan} WIB</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.penghulu?.status === 'aktif' ? (
                        <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-100 text-slate-600 border border-slate-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Non Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 p-1.5 rounded-lg transition cursor-pointer"
                          title="Edit data laporan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLaporan(row.id, row.nomor_surat)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                          title="Hapus data laporan"
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

      {/* Modal Edit Laporan */}
      <EditLaporanModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLaporanEdit(null);
        }}
        laporan={selectedLaporanEdit}
        onSaved={() => {
          showNotice('success', 'Laporan Jaspro berhasil diperbarui!');
          fetchLaporanData();
        }}
      />
    </div>
  );
}
