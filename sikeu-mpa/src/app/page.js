"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Lock, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  DollarSign,
  PieChart,
  Instagram,
  FileDown, 
  Printer   
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  where
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

const appId = 'mpa-himakom-finance';

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// --- UTILITY FUNCTIONS ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// --- ANIMATED BACKGROUND ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }
      draw() {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    initParticles();

    const connect = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    let opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(148, 163, 184,' + opacityValue * 0.3 + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-60" />;
};

// --- HEADER COMPONENT ---
const Header = ({ currentView, setView, isAdmin, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => setView('landing')}>
            <div className="flex -space-x-3 transition-all duration-500 group-hover:space-x-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 border-slate-50 shadow-md flex items-center justify-center relative z-20">
                <img src="/Logo_MPA.png" alt="MPA" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-blue-700 font-extrabold text-[10px] tracking-tighter absolute" style={{ zIndex: -1 }}>MPA</span>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-700 border-2 border-white shadow-md flex items-center justify-center relative z-10">
                <img src="/Logo_HIMAKOM.png" alt="HIM" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-white font-extrabold text-[10px] tracking-tighter absolute" style={{ zIndex: -1 }}>HIM</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                KEUANGAN MPA
              </h1>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-widest uppercase hidden md:block">
                Sistem Informasi Keuangan Internal
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img src="/logo-polban.png" alt="POLBAN" className="w-full h-full object-contain p-1" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
                <div className="flex items-center gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-blue-900">Admin Keuangan</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                        <LogOut size={18} /> Keluar
                    </button>
                </div>
            ) : (
                <button onClick={() => setView('login')} className="text-sm font-medium text-slate-400 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                    <Lock size={14} /> Login Pengurus
                </button>
            )}
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-xl absolute w-full animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            {isAdmin ? (
                 <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <LogOut size={18}/> Keluar Dashboard
                 </button>
            ) : (
                <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="p-3 text-left font-medium text-slate-500 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                    <Lock size={18} className="opacity-50"/> Login Pengurus
                </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// --- ADMIN FEATURES ---

// 1. DASHBOARD OVERVIEW
const DashboardOverview = ({ transactions, members }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = income - expense;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Saldo</p>
            <h3 className="text-2xl font-bold text-blue-700">{formatRupiah(balance)}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Wallet size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pemasukan Total</p>
            <h3 className="text-2xl font-bold text-emerald-600">{formatRupiah(income)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><TrendingUp size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pengeluaran Total</p>
            <h3 className="text-2xl font-bold text-rose-600">{formatRupiah(expense)}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full"><TrendingDown size={24}/></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart size={20}/> Analisis Keuangan Cepat</h3>
        {income > 0 ? (
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">Rasio Pemasukan vs Pengeluaran</span>
                        <span className="font-bold text-slate-800">{Math.round((expense/income)*100)}% Terpakai</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                        <div className="bg-rose-500 h-3 rounded-full -mt-3 relative opacity-80" style={{ width: `${Math.min((expense/income)*100, 100)}%` }}></div>
                    </div>
                </div>
                <div className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    * Data di atas adalah akumulasi total dari awal pencatatan.
                </div>
            </div>
        ) : (
            <p className="text-slate-400 text-sm">Belum ada data pemasukan yang cukup untuk analisis.</p>
        )}
      </div>
    </div>
  );
};

// 2. KAS ANGGOTA MANAGER
const KasManager = ({ db, appId, user }) => {
  const [members, setMembers] = useState([]);
  const [cashRecords, setCashRecords] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!db || !user) return; 
    
    const qMembers = query(collection(db, 'artifacts', appId, 'public', 'data', 'members'), orderBy('name'));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
        setMembers(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (err) => console.log("Waiting..."));

    const qCash = query(collection(db, 'artifacts', appId, 'public', 'data', 'cash_records'), where('year', '==', currentYear));
    const unsubCash = onSnapshot(qCash, (snap) => {
        const records = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setCashRecords(records);
    }, (err) => console.log("Waiting..."));

    return () => { unsubMembers(); unsubCash(); };
  }, [db, user]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setLoading(true);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'members'), {
        name: newMemberName,
        created_at: serverTimestamp()
    });
    setNewMemberName('');
    setLoading(false);
  };

  const deleteMember = async (id) => {
      if(window.confirm('Hapus anggota ini?')) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'members', id));
      }
  }

  const togglePayment = async (memberId, monthIndex) => {
    const existing = cashRecords.find(r => r.memberId === memberId && r.monthIndex === monthIndex && r.year === currentYear);
    
    if (existing) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cash_records', existing.id));
    } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cash_records'), {
            memberId, monthIndex, year: currentYear, paidAt: serverTimestamp()
        });
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
            type: 'income',
            amount: 10000, 
            description: `Uang Kas Bulan ${months[monthIndex]} - ${members.find(m=>m.id===memberId)?.name}`,
            date: new Date().toISOString().split('T')[0],
            category: 'Uang Kas'
        });
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={20}/> Kelola Anggota & Kas ({currentYear})</h3>
            
            <form onSubmit={addMember} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="Nama Anggota Baru..." 
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                />
                <button disabled={loading} className="bg-blue-700 text-white px-6 rounded-xl font-bold hover:bg-blue-800 transition-colors">
                    <Plus size={20}/>
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold">
                        <tr>
                            <th className="p-3 rounded-tl-xl">Nama</th>
                            {months.map(m => <th key={m} className="p-3 text-center">{m}</th>)}
                            <th className="p-3 rounded-tr-xl">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {members.map(member => (
                            <tr key={member.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-medium text-slate-800">{member.name}</td>
                                {months.map((_, idx) => {
                                    const isPaid = cashRecords.some(r => r.memberId === member.id && r.monthIndex === idx);
                                    return (
                                        <td key={idx} className="p-3 text-center">
                                            <button 
                                                onClick={() => togglePayment(member.id, idx)}
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isPaid ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
                                            >
                                                <div className="w-2 h-2 bg-current rounded-full" />
                                            </button>
                                        </td>
                                    );
                                })}
                                <td className="p-3">
                                    <button onClick={() => deleteMember(member.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-4 text-xs text-slate-400">* Klik lingkaran untuk menandai lunas. Pemasukan otomatis tercatat di transaksi.</p>
        </div>
    </div>
  );
};

// 3. TRANSAKSI MANAGER (Pemasukan & Pengeluaran)
const TransactionManager = ({ db, appId, user }) => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db || !user) return; 
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        setTransactions(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (err) => console.log("Waiting..."));
    return () => unsub();
  }, [db, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        ...form,
        amount: Number(form.amount),
        created_at: serverTimestamp()
    });
    setForm({ ...form, amount: '', description: '' });
    setLoading(false);
  };

  const deleteTrans = async (id) => {
      // Fitur Koreksi: Hapus transaksi jika salah input
      if(window.confirm('Hapus transaksi ini? Saldo akan dikembalikan sesuai jenis transaksi.')) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={20}/> Input Transaksi</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${form.type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Pemasukan</button>
                            <button type="button" onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${form.type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Pengeluaran</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                        <input type="date" required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                        <input type="number" required placeholder="0" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
                        <textarea required rows="3" placeholder="Contoh: Beli kertas A4" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                    <button disabled={loading} type="submit" className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                        <Save size={18} /> Simpan Data
                    </button>
                </form>
            </div>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Riwayat Transaksi</h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{transactions.length} Data</span>
                </div>
                <div className="overflow-y-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 font-bold sticky top-0 shadow-sm">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Keterangan</th>
                                <th className="p-4 text-right">Nominal</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 whitespace-nowrap">{t.date}</td>
                                    <td className="p-4 font-medium text-slate-800">{t.description}</td>
                                    <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => deleteTrans(t.id)} 
                                            className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full"
                                            title="Hapus Transaksi (Koreksi Saldo)"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 italic">Belum ada transaksi tercatat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

// 4. REPORT MANAGER (UPDATED: Native Browser Print)
const ReportManager = ({ transactions, members, cashRecords }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();

    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8">
            {/* PRINT BUTTON & INFO (Hidden when printing) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center print:hidden">
                <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-4">
                    <Printer size={32}/>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Cetak Laporan Resmi</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Klik tombol di bawah untuk mencetak laporan. Anda dapat menyimpannya sebagai PDF melalui dialog cetak browser (Pilih "Save as PDF").
                </p>
                <button 
                    onClick={handlePrint}
                    className="bg-blue-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center gap-2 mx-auto shadow-lg shadow-blue-900/20"
                >
                    <FileDown size={20}/> Cetak / Simpan PDF
                </button>
            </div>

            {/* REPORT CONTENT (Visible on screen and print) */}
            <div className="bg-white p-10 rounded-none shadow-none print:p-0 print:shadow-none" id="print-area">
                
                {/* STYLES FOR PRINT ONLY */}
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        nav, header, footer, .print\\:hidden {
                            display: none !important;
                        }
                    }
                `}</style>

                {/* HEADER LAPORAN */}
                <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-2xl font-bold text-slate-900 uppercase">Laporan Keuangan MPA HIMAKOM POLBAN</h1>
                    <p className="text-slate-600">Periode Tahun {currentYear}</p>
                </div>

                {/* A. RINGKASAN */}
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-800 pl-3">A. RINGKASAN KEUANGAN</h2>
                    <table className="w-full text-sm border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 p-3 text-left">Keterangan</th>
                                <th className="border border-slate-300 p-3 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 p-3">Total Pemasukan</td>
                                <td className="border border-slate-300 p-3 text-right text-emerald-700 font-bold">{formatRupiah(income)}</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 p-3">Total Pengeluaran</td>
                                <td className="border border-slate-300 p-3 text-right text-rose-700 font-bold">{formatRupiah(expense)}</td>
                            </tr>
                            <tr className="bg-slate-50 font-bold">
                                <td className="border border-slate-300 p-3">Saldo Akhir</td>
                                <td className="border border-slate-300 p-3 text-right text-blue-800">{formatRupiah(income - expense)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* B. REKAP KAS */}
                <div className="mb-10 break-inside-avoid">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-800 pl-3">B. REKAPITULASI UANG KAS</h2>
                    <table className="w-full text-[10px] border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 p-2 text-left">Nama Anggota</th>
                                {months.map(m => <th key={m} className="border border-slate-300 p-2 text-center">{m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.id}>
                                    <td className="border border-slate-300 p-2 font-medium">{m.name}</td>
                                    {months.map((_, idx) => {
                                        const isPaid = cashRecords.some(r => r.memberId === m.id && r.monthIndex === idx);
                                        return (
                                            <td key={idx} className="border border-slate-300 p-1 text-center">
                                                {isPaid ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* C. JURNAL */}
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-blue-800 pl-3">C. JURNAL TRANSAKSI LENGKAP</h2>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 p-2 text-left">Tanggal</th>
                                <th className="border border-slate-300 p-2 text-left">Keterangan</th>
                                <th className="border border-slate-300 p-2 text-center">Jenis</th>
                                <th className="border border-slate-300 p-2 text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td className="border border-slate-300 p-2 whitespace-nowrap">{t.date}</td>
                                    <td className="border border-slate-300 p-2">{t.description}</td>
                                    <td className={`border border-slate-300 p-2 text-center font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? 'Masuk' : 'Keluar'}
                                    </td>
                                    <td className="border border-slate-300 p-2 text-right font-medium">{formatRupiah(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* SIGNATURE */}
                <div className="mt-20 flex justify-end break-inside-avoid">
                    <div className="text-center w-64">
                        <p className="mb-20">Bandung, ........................................ <br/> Bendahara MPA,</p>
                        <p className="font-bold border-b border-slate-900 inline-block pb-1 min-w-[200px]">( ........................................ )</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

// 5. MAIN DASHBOARD CONTAINER
const AdminDashboard = ({ db, appId, user }) => {
  const [tab, setTab] = useState('overview'); 
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [cashRecords, setCashRecords] = useState([]);

  useEffect(() => {
    if (!db || !user) return; 
    
    const qT = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), orderBy('date', 'desc'));
    const unsubT = onSnapshot(qT, (snap) => setTransactions(snap.docs.map(d => d.data())), (err) => console.log("Waiting..."));
    
    const qM = query(collection(db, 'artifacts', appId, 'public', 'data', 'members'), orderBy('name'));
    const unsubM = onSnapshot(qM, (snap) => setMembers(snap.docs.map(d => ({id:d.id, ...d.data()}))), (err) => console.log("Waiting..."));

    // Need cash records for the report too
    const currentYear = new Date().getFullYear();
    const qC = query(collection(db, 'artifacts', appId, 'public', 'data', 'cash_records'), where('year', '==', currentYear));
    const unsubC = onSnapshot(qC, (snap) => setCashRecords(snap.docs.map(d => d.data())), (err) => console.log("Waiting..."));

    return () => { unsubT(); unsubM(); unsubC(); };
  }, [db, user]);

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit print:hidden">
                {[
                    {id: 'overview', label: 'Ringkasan', icon: LayoutDashboard},
                    {id: 'kas', label: 'Uang Kas', icon: Users},
                    {id: 'transactions', label: 'Jurnal', icon: FileText},
                    {id: 'report', label: 'Laporan', icon: Printer}, // NEW TAB
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${tab === item.id ? 'bg-blue-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <item.icon size={16}/> {item.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-in">
                {tab === 'overview' && <DashboardOverview transactions={transactions} members={members} />}
                {tab === 'kas' && <KasManager db={db} appId={appId} user={user} />}
                {tab === 'transactions' && <TransactionManager db={db} appId={appId} user={user} />}
                {tab === 'report' && <ReportManager transactions={transactions} members={members} cashRecords={cashRecords} />}
            </div>
        </div>
    </div>
  );
};

// --- LOGIN PAGE ---
const AdminLogin = ({ auth, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError('Login gagal. Periksa email dan password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3 hover:rotate-0 transition-all duration-500">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Login Bendahara</h2>
          <p className="text-slate-500 text-sm mt-2">Akses Sistem Keuangan MPA.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Email</label>
            <input type="email" required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" placeholder="bendahara@himakom..." value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <input type="password" required className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 shadow-lg transition-all active:scale-[0.98]">Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
};

// --- HERO / LANDING PAGE (Public View) ---
const Hero = ({ setView, db, appId, user }) => {
  const [totalBalance, setTotalBalance] = useState(null);

  useEffect(() => {
    if(!db || !user) return; // Guard
    
    // ADDED ERROR HANDLING TO SNAPSHOTS
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'));
    const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => d.data());
        const inc = data.filter(t => t.type === 'income').reduce((a,b) => a + Number(b.amount), 0);
        const exp = data.filter(t => t.type === 'expense').reduce((a,b) => a + Number(b.amount), 0);
        setTotalBalance(inc - exp);
    }, (err) => console.log("Waiting for permission (hero)..."));
    
    return () => unsub();
  }, [db, user]);

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center min-h-[80vh]">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-sky-400/5 -skew-x-12 blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-blue-100 text-blue-800 text-sm font-semibold mb-8 animate-fade-in-up shadow-sm">
          <FileText size={16} />
          <span>Transparan & Akuntabel</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 drop-shadow-sm">
          Sistem Informasi <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">Keuangan MPA HIMAKOM.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          Platform terintegrasi untuk pengelolaan uang kas, pencatatan transaksi, dan pelaporan keuangan internal organisasi secara real-time.
        </p>

        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-xl animate-scale-in">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Kas Saat Ini</p>
            <div className="text-4xl font-black text-blue-800 mb-4">
                {totalBalance !== null ? formatRupiah(totalBalance) : 'Memuat...'}
            </div>
            <div className="h-1 w-20 bg-blue-200 mx-auto rounded-full mb-4"></div>
            <p className="text-xs text-slate-500">Data diperbarui secara real-time dari sistem bendahara.</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             await signInWithCustomToken(auth, __initial_auth_token);
        } else {
             await signInAnonymously(auth);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const adminStatus = currentUser && currentUser.email ? true : false;
      setIsAdmin(adminStatus);
      if (adminStatus) setView('dashboard');
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
      {/* FORCE LIGHT THEME */}
      <div className="fixed inset-0 bg-slate-50 -z-50" />
      
      <ParticleBackground />

      <Header currentView={view} setView={setView} isAdmin={isAdmin} handleLogout={handleLogout} />
      
      <main className="relative z-10 flex-grow">
        {view === 'landing' && <Hero setView={setView} db={db} appId={appId} user={user} />}
        {view === 'login' && <AdminLogin auth={auth} onLoginSuccess={() => setView('dashboard')} />}
        {view === 'dashboard' && (
           isAdmin ? <AdminDashboard db={db} appId={appId} user={user} /> : <div className="pt-32 text-center text-red-500 font-bold">Akses Ditolak. Silakan Login.</div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 relative z-10 mt-auto print:hidden">
            <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-8">
                <div className="flex items-center gap-2 text-white font-bold text-xl">
                    <Wallet size={24} className="text-blue-500" /> SIKEU MPA
                </div>
                <div className="flex items-center gap-6">
                    <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <Instagram size={20} /> @mpahimakom
                    </a>
                </div>
            </div>
            <p className="mb-6 text-sm max-w-md mx-auto leading-relaxed opacity-80">
                Sistem Informasi Keuangan Internal MPA HIMAKOM POLBAN.
                Dikelola oleh Bendahara MPA.
            </p>
            <div className="text-xs text-slate-600 font-mono">
                &copy; {new Date().getFullYear()} MPA HIMAKOM POLBAN. All rights reserved.
            </div>
            </div>
        </footer>
    </div>
  );
}