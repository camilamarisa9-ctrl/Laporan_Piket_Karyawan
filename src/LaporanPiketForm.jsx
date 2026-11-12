import React, { useState } from 'react';
import { 
  Calendar, User, Truck, Activity, FileText, 
  Upload, Send, HardHat, CheckCircle2 
} from 'lucide-react';

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

// ⚠️ Ganti dengan URL Web App Google Apps Script Anda setelah di-deploy
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwiMhD7-JaUYizplOANXIT6Hu9ctCr0aBeqSYazX3Fsz60HRFu2uOe6mscThbUQ_5Qh/exec";

export default function LaporanPiketForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      acc[k] = {
        status: 'Bekerja', 
        apd: 'APD Lengkap', 
        sop: 'Bekerja Sesuai SOP', 
        catatan: ''
      };
      return acc;
    }, {})
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKontraktorChange = (namaKontraktor, field, value) => {
    setKontraktorState(prev => ({
      ...prev,
      [namaKontraktor]: { ...prev[namaKontraktor], [field]: value }
    }));
  };

  // Fungsi kompresi gambar otomatis agar ukuran payload tidak membengkak
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Kompres ke format JPEG dengan kualitas 0.7
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        setFormData(prev => ({
          ...prev,
          dokumentasiBase64: compressedBase64,
          dokumentasiFileName: file.name
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      laporanKontraktor: Object.entries(kontraktorState).map(([nama, val]) => ({
        nama,
        ...val
      }))
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch (err) {
      alert('Gagal mengirim laporan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-slate-100">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan Berhasil Terkirim!</h2>
          <p className="text-slate-600 mb-6">Data laporan piket operasional telah tercatat ke Google Spreadsheet PT. Usaha Inti Padang.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition duration-200"
          >
            Buat Laporan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 text-white rounded-t-2xl p-6 shadow-md border-b-4 border-amber-500">
          <div className="flex items-center space-x-3 mb-1">
            <span className="bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded text-xs tracking-wider uppercase">Operasional</span>
            <span className="text-slate-400 text-sm">PT. USAHA INTI PADANG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Laporan Piket Karyawan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Formulir Log Presensi & Monitoring Operasional Pabrik</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-4 sm:p-8 space-y-8">
          
          {/* Header & Petugas */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-200">
              <User className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-800">Informasi Header & Petugas</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Laporan</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="date"
                    required
                    name="tanggalLaporan"
                    value={formData.tanggalLaporan}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Petugas Piket</label>
                <select
                  required
                  name="namaPetugas"
                  value={formData.namaPetugas}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Pilih Nama Petugas --</option>
                  {LIST_PETUGAS.map((nama, idx) => (
                    <option key={idx} value={nama}>{nama}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Truk PK & Lansir CPKO */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-200">
              <Truck className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-800">Laporan Jumlah Truk PK & Lansir CPKO</h2>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Penerimaan Truk PK</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Truk</label>
                  <input type="number" min="0" placeholder="0" name="trukPkJumlah" value={formData.trukPkJumlah} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total (MT)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" name="trukPkTotalMt" value={formData.trukPkTotalMt} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gantung</label>
                  <input type="text" placeholder="Status Gantung" name="trukPkGantung" value={formData.trukPkGantung} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Alasan Kendala/Gantung</label>
                <textarea rows="2" placeholder="Tuliskan kendala..." name="trukPkAlasan" value={formData.trukPkAlasan} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"></textarea>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">2. Lansir CPKO</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jumlah Truk</label>
                  <input type="number" min="0" placeholder="0" name="lansirCpkoJumlah" value={formData.lansirCpkoJumlah} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total (MT)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" name="lansirCpkoTotalMt" value={formData.lansirCpkoTotalMt} onChange={handleInputChange} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          </section>

          {/* Plant Run */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-200">
              <Activity className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-800">Status Plant Run</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mesin Running</label>
                <input type="text" placeholder="Detail Mesin Running" name="plantRunRunning" value={formData.plantRunRunning} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mesin Stop</label>
                <input type="text" placeholder="Detail Mesin Stop" name="plantRunStop" value={formData.plantRunStop} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Aktivitas Lansir HMPKE</label>
                <input type="text" placeholder="Catatan Lansir HMPKE" name="plantRunAktivitasHmpke" value={formData.plantRunAktivitasHmpke} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
          </section>

          {/* Laporan Kontraktor */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-200">
              <HardHat className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-800">Laporan Kerja & K3 Kontraktor</h2>
            </div>
            <div className="space-y-4">
              {LIST_KONTRAKTOR.map((kontraktor, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 block border-b pb-1">{kontraktor}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Status Kehadiran</label>
                      <select value={kontraktorState[kontraktor].status} onChange={(e) => handleKontraktorChange(kontraktor, 'status', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs">
                        <option value="Bekerja">Bekerja</option>
                        <option value="Tidak Bekerja">Tidak Bekerja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Kelengkapan APD</label>
                      <select value={kontraktorState[kontraktor].apd} onChange={(e) => handleKontraktorChange(kontraktor, 'apd', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs">
                        <option value="APD Lengkap">APD Lengkap</option>
                        <option value="APD Tidak Lengkap">APD Tidak Lengkap</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Kepatuhan SOP</label>
                      <select value={kontraktorState[kontraktor].sop} onChange={(e) => handleKontraktorChange(kontraktor, 'sop', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs">
                        <option value="Bekerja Sesuai SOP">Bekerja Sesuai SOP</option>
                        <option value="Bekerja Tidak Sesuai SOP">Bekerja Tidak Sesuai SOP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <input type="text" placeholder="Catatan temuan khusus kontraktor..." value={kontraktorState[kontraktor].catatan} onChange={(e) => handleKontraktorChange(kontraktor, 'catatan', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Catatan & Dokumentasi Umum */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-200">
              <FileText className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-800">Catatan & Dokumentasi Umum</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Temuan Operasional</label>
              <textarea rows="3" name="catatanTemuan" value={formData.catatanTemuan} onChange={handleInputChange} placeholder="Tuliskan temuan general..." className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm"></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unggah Dokumentasi Foto</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-slate-600">
                    {formData.dokumentasiFileName ? formData.dokumentasiFileName : "Klik / Ambil Foto dari Kamera"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ditujukan Kepada</label>
                <input type="text" name="ditujukanKepada" value={formData.ditujukanKepada} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? (
                <span>Mengirim Laporan...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Laporan Piket</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}