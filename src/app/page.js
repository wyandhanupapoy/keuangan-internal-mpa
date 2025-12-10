import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu, X, LogOut, Lock, LayoutDashboard,
  Wallet, Receipt, FileText, Plus, Trash2,
  ChevronRight, Save, User, ShieldAlert, Printer
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  where,
  serverTimestamp
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyARLEs6O3fEzHRVGQn771RHJJ90olkvIvE",
  authDomain: "mpa-finance.firebaseapp.com",
  projectId: "mpa-finance",
  storageBucket: "mpa-finance.firebasestorage.app",
  messagingSenderId: "313397179750",
  appId: "1:313397179750:web:d52968e4188b0dfc6c44a7",
  measurementId: "G-Y91J3X3ZQX"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'FinanceMPA';

// --- STYLES FOR PRINTING (PDF GENERATION) ---
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { size: A4; margin: 2cm; }
      body { background-color: white; -webkit-print-color-adjust: exact; }
      nav, header, .no-print, button, .sidebar-toggle { display: none !important; }
      .print-only { display: block !important; }
      .main-content { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
      .card-stats { border: 1px solid #000; break-inside: avoid; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid black !important; padding: 8px !important; color: black !important; }
      th { background-color: #f0f0f0 !important; font-weight: bold; text-transform: uppercase; }
      .text-green-600, .text-red-600 { color: black !important; } /* Force black text for printers */
      .signature-section { break-inside: avoid; margin-top: 50px; display: flex; justify-content: space-between; }
    }
    .print-only { display: none; }
  `}</style>
);

// --- COMPONENTS ---

// 1. HEADER COMPONENT
const Header = ({ currentView, setView, isAdmin, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO GROUP */}
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => !isAdmin && setView('landing')}>
            <div className="flex -space-x-3 transition-all duration-500 group-hover:space-x-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 border-slate-50 shadow-md flex items-center justify-center relative z-20 overflow-hidden">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-800">MPA</div>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-700 border-2 border-white shadow-md flex items-center justify-center relative z-10 overflow-hidden">
                <div className="w-full h-full bg-blue-800 flex items-center justify-center text-[8px] font-bold text-white">HIM</div>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                MPA HIMAKOM
              </h1>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-widest uppercase hidden md:block">
                Politeknik Negeri Bandung
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-800">POL</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <div className="flex items-center gap-4 animate-fade-in">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-blue-900">Admin Mode</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setView('landing')} className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}>Beranda</button>
                <button onClick={() => setView('login')} className="text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 flex items-center gap-1 px-4 py-2 rounded-full shadow-sm transition-all">
                  <Lock size={14} /> Login Pengurus
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors sidebar-toggle">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-xl absolute w-full animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {isAdmin ? (
              <>
                <div className="p-3 bg-blue-50 rounded-lg mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-bold text-blue-900">Dashboard Admin</span>
                </div>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                  <LogOut size={18} /> Keluar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setView('landing'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-700 hover:bg-blue-50 rounded-lg flex items-center gap-3">
                  <LayoutDashboard size={18} className="opacity-50" /> Beranda
                </button>
                <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-500 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                  <Lock size={18} className="opacity-50" /> Login Admin
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// 2. PUBLIC LANDING
const PublicLanding = ({ setView }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-slate-50">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Area Terbatas</h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8">
            "Keuangan Internal MPA tidak ada unsur transparansi pada orang lain karena bersifat <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Rahasia & Internal</span>."
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500 mb-8">
            Hanya Komisi Bendahara dan Pengurus Inti yang memiliki akses.
          </div>
          <button onClick={() => setView('login')} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-lg">
            <Lock size={18} /> Login Pengurus
          </button>
        </div>
        <p className="text-slate-400 text-sm">&copy; 2025 MPA HIMAKOM POLBAN</p>
      </div>
    </div>
  );
};

// 3. LOGIN
const Login = ({ setView, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError('Email atau Password salah.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Login Bendahara</h2>
          <p className="text-slate-500">Masuk untuk mengelola keuangan</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><ShieldAlert size={16} /> {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500" placeholder="admin@mpa.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
        </form>
        <button onClick={() => setView('landing')} className="w-full mt-4 text-slate-400 text-sm hover:text-slate-600">Kembali</button>
      </div>
    </div>
  );
};

// 4. ADMIN DASHBOARD
const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [trxForm, setTrxForm] = useState({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [memberForm, setMemberForm] = useState({ name: '', nim: '' });
  const [kasForm, setKasForm] = useState({ memberId: '', amount: 5000, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (!user) return;
    const qTrx = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), orderBy('date', 'desc'));
    const unsubTrx = onSnapshot(qTrx, (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const qMembers = query(collection(db, 'artifacts', appId, 'public', 'data', 'members'), orderBy('name', 'asc'));
    const unsubMembers = onSnapshot(qMembers, (s) => setMembers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubTrx(); unsubMembers(); }
  }, [user]);

  const stats = useMemo(() => {
    let income = 0; let expense = 0;
    transactions.forEach(t => t.type === 'income' ? income += Number(t.amount) : expense += Number(t.amount));
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { ...trxForm, amount: Number(trxForm.amount), createdAt: serverTimestamp() });
      setTrxForm({ type: 'income', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      alert("Berhasil disimpan");
    } catch (err) { alert("Gagal menyimpan"); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'members'), { ...memberForm, totalPaid: 0, createdAt: serverTimestamp() });
      setMemberForm({ name: '', nim: '' });
      alert("Anggota ditambahkan");
    } catch (err) { alert("Error"); }
  };

  const handlePayKas = async (e) => {
    e.preventDefault();
    const member = members.find(m => m.id === kasForm.memberId);
    if (!member) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        type: 'income', amount: Number(kasForm.amount), description: `Uang Kas - ${member.name}`,
        date: kasForm.date, category: 'Uang Kas', relatedMemberId: member.id, createdAt: serverTimestamp()
      });
      alert("Pembayaran Kas dicatat");
    } catch (err) { alert("Gagal"); }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus data ini?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
  };

  const formatRupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  // Filter transaksi untuk laporan bulanan/tahunan (Sederhana: ambil semua untuk demo)
  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 main-content">
      <PrintStyles />
      <div className="max-w-7xl mx-auto">

        {/* Header for Dashboard (Hidden in Print) */}
        <div className="mb-8 no-print">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Keuangan Internal</h1>
          <p className="text-slate-500">Selamat datang, Administrator.</p>
        </div>

        {/* Header for Print (Hidden in Web) */}
        <div className="print-only mb-6 border-b-2 border-black pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-left w-20">
              {/* Logo Placeholder */}
              <div className="w-16 h-16 border border-gray-300 flex items-center justify-center rounded-full text-[10px] font-bold">MPA</div>
            </div>
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold uppercase tracking-wider">Majelis Perwakilan Anggota</h2>
              <h3 className="text-lg font-bold uppercase">Himpunan Mahasiswa Komputer</h3>
              <p className="text-sm font-medium">Politeknik Negeri Bandung</p>
              <p className="text-xs italic mt-1">Laporan Keuangan Internal & Transparansi Terbatas</p>
            </div>
            <div className="text-right w-20">
              <div className="w-16 h-16 border border-gray-300 flex items-center justify-center rounded-full text-[10px] font-bold">POLBAN</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Wallet size={24} /></div>
            <div><p className="text-sm text-slate-500 font-medium">Saldo</p><h3 className="text-2xl font-bold text-slate-900">{formatRupiah(stats.balance)}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-xl text-green-600"><ChevronRight size={24} className="rotate-45" /></div>
            <div><p className="text-sm text-slate-500 font-medium">Pemasukan</p><h3 className="text-2xl font-bold text-green-600">{formatRupiah(stats.income)}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-xl text-red-600"><ChevronRight size={24} className="rotate-[-45deg]" /></div>
            <div><p className="text-sm text-slate-500 font-medium">Pengeluaran</p><h3 className="text-2xl font-bold text-red-600">{formatRupiah(stats.expense)}</h3></div>
          </div>
        </div>

        {/* Print Stats Summary */}
        <div className="print-only mb-6">
          <table className="w-full mb-4">
            <tbody>
              <tr>
                <td className="font-bold bg-gray-100 w-1/3">Total Pemasukan</td>
                <td className="text-right">{formatRupiah(stats.income)}</td>
              </tr>
              <tr>
                <td className="font-bold bg-gray-100">Total Pengeluaran</td>
                <td className="text-right">{formatRupiah(stats.expense)}</td>
              </tr>
              <tr>
                <td className="font-bold bg-gray-200 text-lg">Saldo Akhir</td>
                <td className="text-right font-bold text-lg">{formatRupiah(stats.balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabs (Hidden in Print) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-8 inline-flex flex-wrap no-print">
          {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
            { id: 'kas', label: 'Uang Kas', icon: User },
            { id: 'transaksi', label: 'Input Transaksi', icon: Plus },
            { id: 'laporan', label: 'Laporan', icon: FileText },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px] main-content">

          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Riwayat Transaksi Terakhir</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase"><th className="p-4">Tanggal</th><th className="p-4">Uraian</th><th className="p-4 text-right">Jumlah</th><th className="p-4 text-center no-print">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.slice(0, 10).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 text-sm font-mono">{t.date}</td>
                        <td className="p-4 font-medium">{t.description}</td>
                        <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}</td>
                        <td className="p-4 text-center no-print">
                          <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. KAS */}
          {activeTab === 'kas' && (
            <div className="p-6 grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6 no-print">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Wallet size={18} /> Input Bayar Kas</h3>
                  <form onSubmit={handlePayKas} className="space-y-4">
                    <select className="w-full p-2 rounded border" value={kasForm.memberId} onChange={(e) => setKasForm({ ...kasForm, memberId: e.target.value })} required>
                      <option value="">Pilih Anggota</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input type="number" className="w-full p-2 rounded border" value={kasForm.amount} onChange={(e) => setKasForm({ ...kasForm, amount: e.target.value })} required />
                    <input type="date" className="w-full p-2 rounded border" value={kasForm.date} onChange={(e) => setKasForm({ ...kasForm, date: e.target.value })} required />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Simpan</button>
                  </form>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} /> Tambah Anggota</h3>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <input placeholder="Nama" className="w-full p-2 rounded border" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} required />
                    <input placeholder="NIM" className="w-full p-2 rounded border" value={memberForm.nim} onChange={(e) => setMemberForm({ ...memberForm, nim: e.target.value })} required />
                    <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2 rounded">Tambah</button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2">
                <h3 className="font-bold text-slate-900 mb-4">Rekap Kas Anggota</h3>
                <table className="w-full text-left text-sm border">
                  <thead className="bg-slate-100"><tr><th className="p-3">Nama</th><th className="p-3">NIM</th><th className="p-3 text-right">Total Masuk</th></tr></thead>
                  <tbody>
                    {members.map(m => {
                      const total = transactions.filter(t => t.relatedMemberId === m.id && t.type === 'income').reduce((a, c) => a + Number(c.amount), 0);
                      return (<tr key={m.id} className="border-t"><td className="p-3">{m.name}</td><td className="p-3">{m.nim}</td><td className="p-3 text-right font-bold text-green-600">{formatRupiah(total)}</td></tr>)
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. TRANSAKSI */}
          {activeTab === 'transaksi' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Receipt size={24} /> Catat Transaksi Umum</h3>
                <form onSubmit={handleAddTransaction} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setTrxForm({ ...trxForm, type: 'income' })} className={`p-4 rounded-xl border-2 font-bold ${trxForm.type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200'}`}>Pemasukan</button>
                    <button type="button" onClick={() => setTrxForm({ ...trxForm, type: 'expense' })} className={`p-4 rounded-xl border-2 font-bold ${trxForm.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200'}`}>Pengeluaran</button>
                  </div>
                  <input type="number" required value={trxForm.amount} onChange={(e) => setTrxForm({ ...trxForm, amount: e.target.value })} className="w-full p-3 rounded-lg border" placeholder="Jumlah (Rp)" />
                  <input type="text" required value={trxForm.description} onChange={(e) => setTrxForm({ ...trxForm, description: e.target.value })} className="w-full p-3 rounded-lg border" placeholder="Keterangan (misal: Beli ATK)" />
                  <input type="date" required value={trxForm.date} onChange={(e) => setTrxForm({ ...trxForm, date: e.target.value })} className="w-full p-3 rounded-lg border" />
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">Simpan Transaksi</button>
                </form>
              </div>
            </div>
          )}

          {/* 4. LAPORAN (PDF/PRINT MODE) */}
          {activeTab === 'laporan' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 no-print">
                <h3 className="text-xl font-bold text-slate-900">Laporan Keuangan</h3>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Printer size={20} /> Cetak Laporan PDF
                </button>
              </div>

              {/* TABLE CONTENT */}
              <div className="border border-slate-200 rounded-xl overflow-hidden print:border-none">
                <div className="bg-slate-50 p-4 border-b border-slate-200 no-print">
                  <h2 className="text-lg font-bold text-slate-900">Preview Data</h2>
                </div>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Uraian Transaksi</th>
                      <th className="p-3 text-right">Pemasukan</th>
                      <th className="p-3 text-right">Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td className="p-3 font-mono text-xs">{t.date}</td>
                        <td className="p-3">{t.description}</td>
                        <td className="p-3 text-right font-medium">{t.type === 'income' ? formatRupiah(t.amount) : '-'}</td>
                        <td className="p-3 text-right font-medium">{t.type === 'expense' ? formatRupiah(t.amount) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td colSpan="2" className="p-3 text-right">Total</td>
                      <td className="p-3 text-right text-green-600">{formatRupiah(stats.income)}</td>
                      <td className="p-3 text-right text-red-600">{formatRupiah(stats.expense)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* SIGNATURE SECTION (Print Only) */}
              <div className="signature-section print-only">
                <div className="text-center w-1/3">
                  <p>Mengetahui,</p>
                  <p className="font-bold mb-16">Ketua MPA HIMAKOM</p>
                  <p className="border-t border-black inline-block px-4 pt-1">Nama Ketua</p>
                  <p className="text-xs">NIM. .....................</p>
                </div>
                <div className="text-center w-1/3">
                  <p>Bandung, {printDate}</p>
                  <p className="font-bold mb-16">Bendahara Umum</p>
                  <p className="border-t border-black inline-block px-4 pt-1">Nama Bendahara</p>
                  <p className="text-xs">NIM. .....................</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) { console.error(e); }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        if (currentView === 'login' || currentView === 'landing') setCurrentView('dashboard');
      } else {
        if (currentView === 'dashboard') setCurrentView('landing');
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  const handleLogout = async () => { await signOut(auth); setCurrentView('landing'); };
  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      <Header currentView={currentView} setView={setCurrentView} isAdmin={!!user} handleLogout={handleLogout} />
      <main>
        {currentView === 'landing' && <PublicLanding setView={setCurrentView} />}
        {currentView === 'login' && <Login setView={setCurrentView} onLogin={() => setCurrentView('dashboard')} />}
        {currentView === 'dashboard' && user && <AdminDashboard user={user} />}
      </main>
    </div>
  );
}