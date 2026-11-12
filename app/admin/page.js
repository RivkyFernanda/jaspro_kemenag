'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Building, 
  UserCheck, 
  PlusCircle, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function AdminMasterPage() {
  const router = useRouter();

  // State Kecamatan
  const [kecamatanList, setKecamatanList] = useState([]);
  const [namaKecamatan, setNamaKecamatan] = useState('');
  const [editKecamatanId, setEditKecamatanId] = useState(null);

  // State Penghulu
  const [penghuluList, setPenghuluList] = useState([]);
  const [namaPenghulu, setNamaPenghulu] = useState('');
  const [selectedKecId, setSelectedKecId] = useState('');
  const [statusPenghulu, setStatusPenghulu] = useState('aktif');
  const [editPenghuluId, setEditPenghuluId] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Proteksi rute
  useEffect(() => {
    const user = localStorage.getItem('jaspro_user');
    if (!user) {
      router.push('/login');
    } else {
      fetchKecamatan();
      fetchPenghulu();
    }
  }, [router]);

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // 1. Fetch Kecamatan dari database Supabase
  const fetchKecamatan = async () => {
    try {
      const { data, error } = await supabase
        .from('kecamatan')
        .select('*')
        .order('nama_kecamatan', { ascending: true });

      if (error) throw error;
      setKecamatanList(data || []);
    } catch (err) {
      console.error('Fetch kecamatan error:', err);
      showNotice('error', 'Gagal memuat data kecamatan: ' + err.message);
    }
  };

  // 2. Fetch Penghulu dari database Supabase
  const fetchPenghulu = async () => {
    try {
      const { data, error } = await supabase
        .from('penghulu')
        .select(`
          id,
          nama_penghulu,
          status,
          kecamatan_id,
          kecamatan (
            id,
            nama_kecamatan
          )
        `)
        .order('nama_penghulu', { ascending: true });

      if (error) throw error;
      setPenghuluList(data || []);
    } catch (err) {
      console.error('Fetch penghulu error:', err);
      showNotice('error', 'Gagal memuat data penghulu: ' + err.message);
    }
  };

  // --- CRUD KECAMATAN ---
  const handleSaveKecamatan = async (e) => {
    e.preventDefault();
    if (!namaKecamatan.trim()) return;

    setLoading(true);
    try {
      if (editKecamatanId) {
        // Edit
        const { error } = await supabase
          .from('kecamatan')
          .update({ nama_kecamatan: namaKecamatan.trim() })
          .eq('id', editKecamatanId);

        if (error) throw error;
        showNotice('success', 'Kecamatan berhasil diperbarui');
      } else {
        // Tambah baru
        const { error } = await supabase
          .from('kecamatan')
          .insert([{ nama_kecamatan: namaKecamatan.trim() }]);

        if (error) throw error;
        showNotice('success', 'Kecamatan baru berhasil ditambahkan');
      }

      setNamaKecamatan('');
      setEditKecamatanId(null);
      fetchKecamatan();
    } catch (err) {
      showNotice('error', 'Gagal menyimpan kecamatan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKecamatan = async (item) => {
    try {
      const { error } = await supabase
        .from('kecamatan')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      showNotice('success', `Status kecamatan berhasil diubah`);
      fetchKecamatan();
    } catch (err) {
      showNotice('error', 'Gagal mengubah status: ' + err.message);
    }
  };

  // --- CRUD PENGHULU ---
  const handleSavePenghulu = async (e) => {
    e.preventDefault();
    if (!namaPenghulu.trim() || !selectedKecId) {
      showNotice('error', 'Nama penghulu dan kecamatan wajib dipilih');
      return;
    }

    setLoading(true);
    try {
      if (editPenghuluId) {
        // Edit
        const { error } = await supabase
          .from('penghulu')
          .update({
            nama_penghulu: namaPenghulu.trim(),
            kecamatan_id: selectedKecId,
            status: statusPenghulu,
          })
          .eq('id', editPenghuluId);

        if (error) throw error;
        showNotice('success', 'Data penghulu berhasil diperbarui');
      } else {
        // Tambah baru
        const { error } = await supabase
          .from('penghulu')
          .insert([{
            nama_penghulu: namaPenghulu.trim(),
            kecamatan_id: selectedKecId,
            status: statusPenghulu,
          }]);

        if (error) throw error;
        showNotice('success', 'Penghulu baru berhasil ditambahkan');
      }

      setNamaPenghulu('');
      setSelectedKecId('');
      setStatusPenghulu('aktif');
      setEditPenghuluId(null);
      fetchPenghulu();
    } catch (err) {
      showNotice('error', 'Gagal menyimpan penghulu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle status aktif/pensiun penghulu secara aman tanpa menghapus histori laporan
  const handleToggleStatusPenghulu = async (penghulu) => {
    const nextStatus = penghulu.status === 'aktif' ? 'pensiun' : 'aktif';
    try {
      const { error } = await supabase
        .from('penghulu')
        .update({ status: nextStatus })
        .eq('id', penghulu.id);

      if (error) throw error;
      showNotice(
        'success', 
        `Status ${penghulu.nama_penghulu} diubah menjadi: ${nextStatus.toUpperCase()}`
      );
      fetchPenghulu();
    } catch (err) {
      showNotice('error', 'Gagal mengubah status penghulu: ' + err.message);
    }
  };

  // Hapus penghulu: Jika sudah pernah memiliki data laporan, sistem otomatis menjaga histori
  // dengan mengalihkan status menjadi 'pensiun' (agar data laporan masa lalu tetap aman).
  // Jika belum pernah ada laporan, data dapat dihapus permanen dari daftar master.
  const handleDeletePenghulu = async (penghulu) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus penghulu "${penghulu.nama_penghulu}"?\n\nCatatan Penting:\nData laporan yang pernah diinputkan atas nama penghulu ini akan TETAP AMAN dan tidak akan terhapus dari riwayat.`
    );
    if (!confirmDelete) return;

    try {
      // Cek apakah penghulu sudah memiliki riwayat laporan
      const { count, error: countError } = await supabase
        .from('laporan_jaspro')
        .select('id', { count: 'exact', head: true })
        .eq('penghulu_id', penghulu.id);

      if (countError) throw countError;

      if (count && count > 0) {
        // Jika sudah ada riwayat laporan (misal 5 laporan), jangan hapus fisik baris datanya!
        // Ubah status menjadi 'pensiun' agar tidak muncul lagi di pilihan form baru namun riwayat laporan tetap utuh.
        const { error: updateError } = await supabase
          .from('penghulu')
          .update({ status: 'pensiun' })
          .eq('id', penghulu.id);

        if (updateError) throw updateError;
        showNotice(
          'success',
          `Penghulu memiliki ${count} riwayat laporan. Penghulu dinonaktifkan (Pensiun) agar laporan historis tetap utuh dan aman!`
        );
      } else {
        // Jika belum pernah ada laporan sama sekali, hapus permanen dari database
        const { error: delError } = await supabase
          .from('penghulu')
          .delete()
          .eq('id', penghulu.id);

        if (delError) throw delError;
        showNotice('success', `Penghulu "${penghulu.nama_penghulu}" berhasil dihapus.`);
      }

      fetchPenghulu();
    } catch (err) {
      console.error('Delete error:', err);
      showNotice('error', 'Gagal menghapus penghulu: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Kelola Master Data
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manajemen data referensi Kecamatan dan Penghulu langsung ke database Supabase
        </p>
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

      {/* Grid 2 Kolom: Master Kecamatan & Master Penghulu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ================= SECTION KECAMATAN ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Building className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-800">Master Kecamatan</h2>
            </div>

            {/* Form Tambah/Edit Kecamatan */}
            <form onSubmit={handleSaveKecamatan} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Nama kecamatan baru..."
                value={namaKecamatan}
                onChange={(e) => setNamaKecamatan(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{editKecamatanId ? 'Update' : 'Tambah'}</span>
              </button>
              {editKecamatanId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditKecamatanId(null);
                    setNamaKecamatan('');
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm"
                >
                  Batal
                </button>
              )}
            </form>

            {/* List Tabel Kecamatan */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Nama Kecamatan</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kecamatanList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        Belum ada data kecamatan di database
                      </td>
                    </tr>
                  ) : (
                    kecamatanList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.nama_kecamatan}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleKecamatan(item)}
                            className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                          >
                            {item.is_active ? (
                              <span className="bg-emerald-100 text-emerald-800 flex items-center space-x-1 px-2 py-0.5 rounded-full">
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="bg-slate-200 text-slate-600 flex items-center space-x-1 px-2 py-0.5 rounded-full">
                                <ToggleLeft className="w-4 h-4 text-slate-400" />
                                <span>Nonaktif</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setEditKecamatanId(item.id);
                              setNamaKecamatan(item.nama_kecamatan);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
                            title="Edit nama kecamatan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Kecamatan: {kecamatanList.length}</span>
            <button
              onClick={fetchKecamatan}
              className="flex items-center space-x-1 text-emerald-700 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ================= SECTION PENGHULU ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-800">Master Penghulu</h2>
            </div>

            {/* Form Tambah/Edit Penghulu */}
            <form onSubmit={handleSavePenghulu} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Penghulu
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: H. Ahmad Fauzi, S.Ag"
                    value={namaPenghulu}
                    onChange={(e) => setNamaPenghulu(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kecamatan Tugas
                  </label>
                  <select
                    value={selectedKecId}
                    onChange={(e) => setSelectedKecId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {kecamatanList.map((kec) => (
                      <option key={kec.id} value={kec.id}>
                        {kec.nama_kecamatan} {!kec.is_active && '(Nonaktif)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-semibold text-slate-600">Status Awal:</label>
                  <div className="flex items-center space-x-4 text-xs font-medium">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="aktif"
                        checked={statusPenghulu === 'aktif'}
                        onChange={(e) => setStatusPenghulu(e.target.value)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Aktif</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="pensiun"
                        checked={statusPenghulu === 'pensiun'}
                        onChange={(e) => setStatusPenghulu(e.target.value)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Pensiun</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {editPenghuluId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditPenghuluId(null);
                        setNamaPenghulu('');
                        setSelectedKecId('');
                        setStatusPenghulu('aktif');
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{editPenghuluId ? 'Update Penghulu' : 'Simpan Penghulu'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List Tabel Penghulu */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Nama Penghulu</th>
                    <th className="py-2.5 px-3 font-semibold">Kecamatan</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penghuluList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Belum ada data penghulu di database
                      </td>
                    </tr>
                  ) : (
                    penghuluList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.nama_penghulu}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.kecamatan?.nama_kecamatan || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleStatusPenghulu(item)}
                            title="Klik untuk ubah status Aktif / Pensiun"
                            className="inline-flex cursor-pointer"
                          >
                            {item.status === 'aktif' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">
                                Aktif
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-300">
                                Pensiun
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditPenghuluId(item.id);
                                setNamaPenghulu(item.nama_penghulu);
                                setSelectedKecId(item.kecamatan_id || '');
                                setStatusPenghulu(item.status);
                              }}
                              className="text-teal-700 hover:text-teal-900 p-1 rounded"
                              title="Edit data penghulu"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePenghulu(item)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition"
                              title="Hapus penghulu (laporan historis tetap aman)"
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
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Penghulu: {penghuluList.length}</span>
            <button
              onClick={fetchPenghulu}
              className="flex items-center space-x-1 text-teal-700 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

