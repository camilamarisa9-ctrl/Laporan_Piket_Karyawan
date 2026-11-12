import React, { useState, useEffect } from 'react';

// Ganti URL di bawah ini dengan URL Web App Google Apps Script Anda setelah di-deploy
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXUP0wkuKp1QEzVa30t68d4ZlCJuJIk64J6ZU_QD6daA3RXeq7rtMg56c013GhZylf/exec";

const LIST_PETUGAS = [
  "Anggi Dwi Saputra", "Dhiyaul Husni", "Hilham Haqki", 
  "Jafriadi", "Fitria Dewi Sartika", "Yanti Sevmon Eleveni", 
  "Jhonnedi", "Elmeindriani Wyaharnal", "Wilson Herman"
];

const LIST_KONTRAKTOR = [
  "Bima Sakti Engineering",
  "Aliva Mandiri",
  "Empat Saudara",
  "Jack Elektro"
];

export default function App() {
  const [role, setRole] = useState(null); // 'landing', 'petugas', 'admin', 'head'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRoleTarget, setLoginRoleTarget] = useState('petugas'); // 'petugas', 'admin', 'head'
  // Fungsi untuk langsung membuka Google Spreadsheet online
  const handleOpenSpreadsheet = () => {
    window.open("https://docs.google.com/spreadsheets/d/1tl7KN7JJo7XoMJ1i5a3UcQkCf2pVEnzKzV6s7J6DU8E/edit?usp=sharing", "_blank");
  };
  const [usernameInput, setUsernameInput] = useState("Anggi Dwi Saputra");
  const [passwordInput, setPasswordInput] = useState("password123");
  const [currentUser, setCurrentUser] = useState("Anggi Dwi Saputra");
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "" });
  const [loading, setLoading] = useState(false);

  // Simulasi Database Laporan untuk Admin & Head Unit
  const [laporanList, setLaporanList] = useState([
    {
      id: 1,
      tanggalLaporan: "2026-11-12",
      namaPetugas: "Anggi Dwi Saputra",
      trukPkJumlah: 12,
      trukPkTotalMt: 145.50,
      trukPkGantung: "Nihil",
      trukPkAlasan: "Aman lancar",
      lansirCpkoJumlah: 4,
      lansirCpkoTotalMt: 80.20,
      plantRunRunning: "18 Jam",
      plantRunStop: "6 Jam",
      plantRunAktivitasHmpke: "Lansir kontinyu",
      catatanTemuan: "Operasional shift pagi terkendali dengan baik.",
      ditujukanKepada: "Irwansyah Putra",
      statusValidasi: "Menunggu Validasi"
    }
  ]);

  // Form State Utama
  const [formData, setFormData] = useState({
    tanggalLaporan: new Date().toISOString().split('T')[0],
    namaPetugas: '',
    trukPkJumlah: '',
    trukPkTotalMt: '',
    trukPkGantung: '',
    trukPkAlasan: '',
    lansirCpkoJumlah: '',
    lansirCpkoTotalMt: '',
    plantRunRunning: '',
    plantRunStop: '',
    plantRunAktivitasHmpke: '',
    catatanTemuan: '',
    ditujukanKepada: 'Irwansyah Putra',
    dokumentasiBase64: '',
    dokumentasiFileName: ''
  });

  const [kontraktorState, setKontraktorState] = useState(
    LIST_KONTRAKTOR.reduce((acc, k) => {
      acc[k] = { bekerja: false, tidakBekerja: false, apdLengkap: false, apdTidakLengkap: false, sesuaiSop: false, tidakSesuaiSop: false };
      return acc;
    }, {})
  );

  const showToastMsg = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginRoleTarget === 'admin') {
      setCurrentUser("Admin HRGA");
      setRole('admin');
      showToastMsg("Login Berhasil sebagai Admin/HRGA.");
    } else if (loginRoleTarget === 'head') {
      setCurrentUser("Irwansyah Putra (Head Unit)");
      setRole('head');
      showToastMsg("Login Berhasil sebagai Head Unit.");
    } else {
      if (usernameInput) setCurrentUser(usernameInput);
      setRole('petugas');
      showToastMsg("Login Berhasil! Selamat bekerja.");
    }
    setShowLoginModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setRole(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToastMsg("Anda telah berhasil logout.");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKontraktorCheckbox = (namaKontraktor, field) => {
    setKontraktorState(prev => ({
      ...prev,
      [namaKontraktor]: { ...prev[namaKontraktor], [field]: !prev[namaKontraktor][field] }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, dokumentasiBase64: reader.result, dokumentasiFileName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newReport = {
      id: Date.now(),
      ...formData,
      namaPetugas: currentUser,
      statusValidasi: "Menunggu Validasi"
    };

    const payload = {
      ...newReport,
      laporanKontraktor: Object.entries(kontraktorState).map(([nama, val]) => ({ nama, ...val }))
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
      
      setLaporanList(prev => [newReport, ...prev]);
      showToastMsg("Laporan Berhasil Terkirim ke Spreadsheet & Sistem!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset form
      setFormData({
        tanggalLaporan: new Date().toISOString().split('T')[0],
        namaPetugas: '',
        trukPkJumlah: '',
        trukPkTotalMt: '',
        trukPkGantung: '',
        trukPkAlasan: '',
        lansirCpkoJumlah: '',
        lansirCpkoTotalMt: '',
        plantRunRunning: '',
        plantRunStop: '',
        plantRunAktivitasHmpke: '',
        catatanTemuan: '',
        ditujukanKepada: 'Irwansyah Putra',
        dokumentasiBase64: '',
        dokumentasiFileName: ''
      });
    } catch (err) {
      alert("Gagal mengirim laporan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Validasi Admin
  const handleValidasiLaporan = (id, statusBaru) => {
    setLaporanList(prev => prev.map(item => item.id === id ? { ...item, statusValidasi: statusBaru } : item));
    showToastMsg(`Status laporan berhasil diubah menjadi: ${statusBaru}`);
  };

  // Fungsi Unduh Rekapitulasi berformat Spreadsheet (.xls)
  const handleDownloadRekap = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #1e40af; color: white; font-weight: bold;">
              <th>ID Laporan</th>
              <th>Tanggal</th>
              <th>Nama Petugas</th>
              <th>Jumlah Truk PK</th>
              <th>Total MT PK</th>
              <th>Jumlah Truk CPKO</th>
              <th>Total MT CPKO</th>
              <th>Plant Running</th>
              <th>Plant Stop</th>
              <th>Ditujukan Kepada</th>
              <th>Status Validasi</th>
            </tr>
          </thead>
          <tbody>
    `;

    laporanList.forEach(item => {
      tableHtml += `
        <tr>
          <td>${item.id}</td>
          <td>${item.tanggalLaporan}</td>
          <td>${item.namaPetugas}</td>
          <td>${item.trukPkJumlah}</td>
          <td>${item.trukPkTotalMt}</td>
          <td>${item.lansirCpkoJumlah}</td>
          <td>${item.lansirCpkoTotalMt}</td>
          <td>${item.plantRunRunning}</td>
          <td>${item.plantRunStop}</td>
          <td>${item.ditujukanKepada}</td>
          <td>${item.statusValidasi}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Laporan_Piket_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToastMsg("File rekapitulasi spreadsheet berhasil diunduh.");
  };

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">

      {/* Toast Notification */}
      <div className={`fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:top-5 z-50 transform transition-all duration-300 ease-in-out bg-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 ${toast.show ? 'translate-x-0' : 'translate-x-full'}`}>
        <i className="fa-solid fa-circle-check text-xl"></i>
        <div>
          <h4 className="font-bold text-sm">Informasi Sistem</h4>
          <p className="text-xs text-emerald-100">{toast.message}</p>
        </div>
      </div>

      {/* ================= LANDING PAGE VIEW ================= */}
      {role === null && (
        <div className="flex flex-col min-h-screen">
          <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:h-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-inner font-bold text-lg flex items-center justify-center">
                  <i className="fa-solid fa-industry"></i>
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-base sm:text-lg tracking-wide">PT. USAHA INTI PADANG</h1>
                  <p className="text-xs text-slate-400">Sistem Informasi Operasional & Piket</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:flex items-center gap-2 sm:gap-3">
                <button onClick={() => { setLoginRoleTarget('petugas'); setShowLoginModal(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow transition whitespace-nowrap">
                  <i className="fa-solid fa-user-pen mr-1"></i> Login Petugas
                </button>
                <button onClick={() => { setLoginRoleTarget('admin'); setShowLoginModal(true); }} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl font-semibold text-xs shadow transition whitespace-nowrap">
                  <i className="fa-solid fa-user-shield mr-1"></i> Login Admin/HRGA
                </button>
                <button onClick={() => { setLoginRoleTarget('head'); setShowLoginModal(true); }} className="bg-amber-600 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-xl font-bold text-xs shadow transition whitespace-nowrap">
                  <i className="fa-solid fa-user-tie mr-1"></i> Login Head Unit
                </button>
              </div>
            </div>
          </header>

          <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex-grow flex items-center">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                Portal Terintegrasi PT. Usaha Inti Padang
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Sistem Manajemen Laporan Piket Karyawan & Pengawasan Operasional
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Akses cepat untuk pelaporan tugas piket harian, pemantauan status pabrik, validasi dokumen oleh HRGA, hingga rekapitulasi laporan langsung untuk Head Unit (Irwansyah Putra).
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => { setLoginRoleTarget('petugas'); setShowLoginModal(true); }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-xl transition">
                  Mulai Masuk Aplikasi
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ================= LOGIN MODAL ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-6 relative">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              <h3 className="text-lg font-bold capitalize">Login Akun: {loginRoleTarget}</h3>
              <p className="text-xs text-slate-400">PT. Usaha Inti Padang</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {loginRoleTarget === 'petugas' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Pilih Nama Petugas</label>
                  <select value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                    {LIST_PETUGAS.map((n, i) => <option key={i} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
              {loginRoleTarget === 'admin' && (
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-xl font-medium">
                  Anda akan masuk sebagai <strong>Admin / HRGA</strong> untuk mengelola laporan dan rekapitulasi.
                </div>
              )}
              {loginRoleTarget === 'head' && (
                <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl font-medium">
                  Anda akan masuk sebagai <strong>Head Unit (Irwansyah Putra)</strong> sebagai tujuan peninjauan seluruh laporan.
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Password Keamanan</label>
                <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow transition">
                Masuk ke Halaman {loginRoleTarget.toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: PETUGAS PIKET FORM ================= */}
      {role === 'petugas' && (
        <div className="flex flex-col min-h-screen">
          <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-blue-600 text-white p-2 rounded-lg font-bold"><i className="fa-solid fa-industry"></i></div>
                <div className="min-w-0"><h1 className="font-bold text-xs sm:text-base">PT. USAHA INTI PADANG</h1><span className="text-xs text-blue-400">Form Laporan Piket Karyawan</span></div>
              </div>
              <button onClick={handleLogout} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0">
                <i className="fa-solid fa-right-from-bracket mr-1"></i> Logout
              </button>
            </div>
          </header>

          <main className="flex-grow py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <div className="bg-slate-900 text-white p-5 sm:p-8 text-center">
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide">FORMULIR PIKET HARIAN</h2>
                <p className="text-blue-400 text-sm">Ditujukan Kepada: <strong>Irwansyah Putra (Head Unit)</strong></p>
              </div>

              <form onSubmit={handleSubmitReport} className="p-4 sm:p-10 space-y-8">
                {/* Informasi Umum */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-base uppercase border-b pb-2 flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Informasi Umum</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Tanggal Laporan *</label>
                      <input type="date" required name="tanggalLaporan" value={formData.tanggalLaporan} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Nama Petugas *</label>
                      <select required name="namaPetugas" value={formData.namaPetugas || currentUser} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                        {LIST_PETUGAS.map((n, i) => <option key={i} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Truk PK & Lansir */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-slate-900 text-base uppercase border-b pb-2 flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Truk PK & Lansir CPKO</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Jumlah Truk PK *</label><input type="number" min="0" required name="trukPkJumlah" value={formData.trukPkJumlah} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="0" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Total MT PK *</label><input type="number" step="0.01" min="0" required name="trukPkTotalMt" value={formData.trukPkTotalMt} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="0.00" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Gantung *</label><input type="text" required name="trukPkGantung" value={formData.trukPkGantung} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Keterangan..." /></div>
                    <div className="sm:col-span-2"><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Alasan *</label><textarea rows="2" required name="trukPkAlasan" value={formData.trukPkAlasan} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Alasan..."></textarea></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Jumlah Truk Lansir CPKO *</label><input type="number" min="0" required name="lansirCpkoJumlah" value={formData.lansirCpkoJumlah} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="0" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Total MT CPKO *</label><input type="number" step="0.01" min="0" required name="lansirCpkoTotalMt" value={formData.lansirCpkoTotalMt} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="0.00" /></div>
                  </div>
                </div>

                {/* Plant Run */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-slate-900 text-base uppercase border-b pb-2 flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Plant Run</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Mesin Running *</label><input type="text" required name="plantRunRunning" value={formData.plantRunRunning} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Contoh: 18 Jam" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Mesin Stop *</label><input type="text" required name="plantRunStop" value={formData.plantRunStop} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Contoh: 6 Jam" /></div>
                    <div className="sm:col-span-2"><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Aktivitas Lansir HMPKE *</label><textarea rows="2" required name="plantRunAktivitasHmpke" value={formData.plantRunAktivitasHmpke} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Aktivitas..."></textarea></div>
                  </div>
                </div>

                {/* Kontraktor */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-slate-900 text-base uppercase border-b pb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Kinerja Kontraktor & K3
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full min-w-[620px] text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-bold uppercase border-b text-slate-700">
                          <th className="p-3">Kontraktor</th>
                          <th className="p-3 text-center">Bekerja</th>
                          <th className="p-3 text-center">Tidak Bekerja</th>
                          <th className="p-3 text-center">APD Lengkap</th>
                          <th className="p-3 text-center">APD Tidak Lengkap</th>
                          <th className="p-3 text-center">Sesuai SOP</th>
                          <th className="p-3 text-center">Tidak Sesuai SOP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {LIST_KONTRAKTOR.map((k, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-900">{k}</td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].bekerja} onChange={() => handleKontraktorCheckbox(k, 'bekerja')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].tidakBekerja} onChange={() => handleKontraktorCheckbox(k, 'tidakBekerja')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].apdLengkap} onChange={() => handleKontraktorCheckbox(k, 'apdLengkap')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].apdTidakLengkap} onChange={() => handleKontraktorCheckbox(k, 'apdTidakLengkap')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].sesuaiSop} onChange={() => handleKontraktorCheckbox(k, 'sesuaiSop')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                            <td className="p-3 text-center"><input type="checkbox" checked={kontraktorState[k].tidakSesuaiSop} onChange={() => handleKontraktorCheckbox(k, 'tidakSesuaiSop')} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Catatan & Foto */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-slate-900 text-base uppercase border-b pb-2 flex items-center"><span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Catatan & Tujuan Laporan</h3>
                  <div><label className="block text-xs font-bold uppercase text-slate-700 mb-2">Catatan Temuan</label><textarea rows="3" name="catatanTemuan" value={formData.catatanTemuan} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm" placeholder="Catatan..."></textarea></div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Unggah Dokumentasi Foto</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Ditujukan Kepada (Head Unit) *</label>
                      <input type="text" readOnly name="ditujukanKepada" value={formData.ditujukanKepada} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm font-bold text-blue-900" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow transition flex items-center justify-center space-x-2">
                  {loading ? <span>Mengirim Laporan...</span> : <span>Kirim Laporan Piket ke Head Unit & HRGA</span>}
                </button>
              </form>
            </div>
          </main>
        </div>
      )}

      {/* ================= VIEW 2: ADMIN / HRGA DASHBOARD ================= */}
      {role === 'admin' && (
        <div className="flex flex-col min-h-screen">
          <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-blue-600 text-white p-2 rounded-lg font-bold"><i className="fa-solid fa-user-shield"></i></div>
                <div className="min-w-0"><h1 className="font-bold text-xs sm:text-sm">PT. USAHA INTI PADANG</h1><span className="text-xs text-blue-400">Dashboard Admin & HRGA</span></div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <button onClick={handleOpenSpreadsheet} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center shadow whitespace-nowrap">
                    <i className="fa-solid fa-file-excel mr-1.5"></i> Buka Google Spreadsheet
                </button>
                <button onClick={handleLogout} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Logout</button>
              </div>
            </div>
          </header>

          <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pemantauan & Validasi Laporan Piket</h2>
                <p className="text-xs text-slate-500">Kelola validasi laporan operasional harian yang masuk dari petugas piket.</p>
              </div>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl text-xs font-bold">
                Total Laporan Masuk: {laporanList.length}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-slate-700 border-b">
                    <tr>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Petugas</th>
                      <th className="p-4">Truk PK (MT)</th>
                      <th className="p-4">Lansir CPKO (MT)</th>
                      <th className="p-4">Plant Run</th>
                      <th className="p-4">Tujuan</th>
                      <th className="p-4">Status Validasi</th>
                      <th className="p-4 text-center">Aksi Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {laporanList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium">{item.tanggalLaporan}</td>
                        <td className="p-4 font-bold text-slate-900">{item.namaPetugas}</td>
                        <td className="p-4">{item.trukPkJumlah} Truk ({item.trukPkTotalMt} MT)</td>
                        <td className="p-4">{item.lansirCpkoJumlah} Truk ({item.lansirCpkoTotalMt} MT)</td>
                        <td className="p-4">Running: {item.plantRunRunning}</td>
                        <td className="p-4 text-blue-600 font-semibold">{item.ditujukanKepada}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.statusValidasi === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {item.statusValidasi}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => handleValidasiLaporan(item.id, 'Valid')} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-500">Validasi</button>
                          <button onClick={() => handleValidasiLaporan(item.id, 'Perlu Revisi')} className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-red-500">Revisi</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ================= VIEW 3: HEAD UNIT DASHBOARD ================= */}
      {role === 'head' && (
        <div className="flex flex-col min-h-screen">
          <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-bold"><i className="fa-solid fa-user-tie"></i></div>
                <div className="min-w-0"><h1 className="font-bold text-xs sm:text-sm">PT. USAHA INTI PADANG</h1><span className="text-xs text-amber-400">Dashboard Head Unit (Irwansyah Putra)</span></div>
              </div>
              <button onClick={handleLogout} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0">Logout</button>
            </div>
          </header>

          <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-black">Selamat Datang, Irwansyah Putra</h2>
              <p className="text-xs font-medium mt-1 text-slate-900/80">Semua laporan operasional dan piket harian dari petugas diarahkan ke halaman peninjauan Anda.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Daftar Laporan Masuk untuk Ditinjau</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {laporanList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow p-6 border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <span className="text-xs font-bold text-blue-600">{item.tanggalLaporan}</span>
                        <h4 className="font-bold text-slate-900 text-sm">Petugas: {item.namaPetugas}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.statusValidasi === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {item.statusValidasi}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div><strong>Truk PK:</strong> {item.trukPkJumlah} Unit ({item.trukPkTotalMt} MT)</div>
                      <div><strong>Lansir CPKO:</strong> {item.lansirCpkoJumlah} Unit ({item.lansirCpkoTotalMt} MT)</div>
                      <div><strong>Mesin Running:</strong> {item.plantRunRunning}</div>
                      <div><strong>Mesin Stop:</strong> {item.plantRunStop}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-slate-700">Catatan Temuan:</p>
                      <p className="text-slate-600 italic">"{item.catatanTemuan || 'Tidak ada catatan khusus.'}"</p>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Ditujukan ke: Head Unit</span>
                      <span className="font-bold text-emerald-600"><i className="fa-solid fa-circle-check mr-1"></i> Terkirim & Tercatat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}