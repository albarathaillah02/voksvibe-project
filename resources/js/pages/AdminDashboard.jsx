import React, { useState, useEffect } from 'react';
import { page } from '../config/page';
import { productCategories } from '../constants/catalog';
import { formatRupiah } from '../utils/format';
import { oldValue } from '../utils/oldValue';
import Banner from '../components/ui/Banner';
import StatCard from '../components/ui/StatCard';
import ProductTable from '../components/admin/ProductTable';
import OrderTable from '../components/admin/OrderTable';
import Csrf from '../components/forms/Csrf';
import MethodInput from '../components/forms/MethodInput';
import Field from '../components/forms/Field';
import Checkbox from '../components/forms/Checkbox';

export default function AdminDashboard({ summary, orders, products, editingProduct, auth }) {
    const productAction = editingProduct ? `${page.routes.adminProductsBase}/${editingProduct.id}` : page.routes.adminProductsBase;

    // 🚀 STATE UTAMA ANIMASI MASUK AWAL
    const [isLoaded, setIsLoaded] = useState(false);
    
    // 🎬 STATE TRANSISI HALAMAN YANG SUPER SMOOTH
    const [pageContent, setPageContent] = useState('dashboard'); 
    const [animateState, setAnimateState] = useState('enter'); 

    // 🔍 STATE PENCARIAN KATALOG PRODUK
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products || []);

    // 🔍 STATE KATEGORI STATUS UTAMA (DARI SIDEBAR / STATCARD)
    const [orderQuery, setOrderQuery] = useState('');
    
    // 🔍 STATE KHUSUS INPUT PENCARIAN SUB-PAGE (KODE, CUSTOMER, ITEMS)
    const [subSearchQuery, setSubSearchQuery] = useState('');
    
    // 🔍 STATE MENGONTROL HAMPIRAN HALAMAN PROFIL ADMIN
    const [isProfileActive, setIsProfileActive] = useState(false);
    
    const [filteredOrders, setFilteredOrders] = useState(orders || []);

    // 👤 STATE IDENTITAS LOGIN DINAMIS
    const [liveAdminEmail, setLiveAdminEmail] = useState("admin@voksvibe.local");
    const [liveAdminName, setLiveAdminName] = useState("ADMIN VOKSVIBE");

    // =========================================================================
    // 🎬 LOGIKA KONTROL EFEK TRANSISI SMOOTH (CROSSFADE & SCALE)
    // =========================================================================
    const triggerPageTransition = (targetType, statusQuery = '') => {
        if (animateState === 'exit') return;
        
        setAnimateState('exit'); 
        
        setTimeout(() => {
            setOrderQuery(statusQuery);
            if (targetType === 'profile') {
                setIsProfileActive(true);
                setPageContent('profile');
            } else if (targetType === 'orders') {
                setIsProfileActive(false);
                setPageContent('orders');
            } else {
                setIsProfileActive(false);
                setPageContent('dashboard');
            }
            setAnimateState('enter');
        }, 200); 
    };

    // 🔄 EFFECT 1: Ambil kredensial Auth Laravel & Inisialisasi Kondisi Awal
    useEffect(() => {
        setIsLoaded(true);

        if (auth?.user?.email) {
            setLiveAdminEmail(auth.user.email);
            setLiveAdminName(auth.user.name || "ADMIN");
        } else {
            const domUserEmail = document.querySelector('meta[name="user-email"]')?.getAttribute('content') || 
                                 document.querySelector('.user-profile-email')?.textContent;
            
            if (domUserEmail) {
                setLiveAdminEmail(domUserEmail);
                setLiveAdminName(domUserEmail.split('@')[0].toUpperCase());
            } else {
                const htmlContent = document.documentElement.innerHTML;
                if (htmlContent.includes('admin@voksvibe.local1')) {
                    setLiveAdminEmail('admin@voksvibe.local1');
                    setLiveAdminName('ADMIN');
                } else if (htmlContent.includes('admin@voksvibe.local')) {
                    setLiveAdminEmail('admin@voksvibe.local');
                    setLiveAdminName('ADMIN');
                } else if (orders?.[0]?.user?.email) {
                    setLiveAdminEmail(orders[0].user.email);
                    setLiveAdminName(orders[0].user.name);
                }
            }
        }
    }, [auth, orders]);

    // 🔄 EFFECT 2: Filter Real-Time Katalog Produk
    useEffect(() => {
        if (!products) return;
        
        const filtered = products.filter(product => {
            const matchesName = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = product.category?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesName || matchesCategory;
        });
        
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    // 🔄 EFFECT 3: Filter Tingkat Lanjut Pesanan Masuk
    useEffect(() => {
        if (!orders) return;

        const filtered = orders.filter(order => {
            if (orderQuery) {
                const currentStatus = order.status?.toLowerCase();
                if (currentStatus !== orderQuery.toLowerCase()) {
                    return false;
                }
            }

            if (subSearchQuery) {
                const query = subSearchQuery.toLowerCase();
                const matchesCode = order.id_transaksi?.toLowerCase().includes(query) || order.id?.toString().includes(query);
                const matchesCustomer = order.user?.name?.toLowerCase().includes(query) || order.user?.email?.toLowerCase().includes(query);
                const matchesItems = order.items?.some(item => 
                    item.product?.name?.toLowerCase().includes(query) || item.product_name?.toLowerCase().includes(query)
                );

                return matchesCode || matchesCustomer || matchesItems;
            }

            return true;
        });

        setFilteredOrders(filtered);
    }, [orderQuery, subSearchQuery, orders]);

    useEffect(() => {
        setSubSearchQuery('');
    }, [orderQuery]);

    // 🛠️ PERBAIKAN UTAMA GLITCH: Inisialisasi pengubahan Tombol Atas menjadi Ikon Profil SEJAK AWAL BOOTING (Anti-Refresh)
    useEffect(() => {
        const setupTopProfileButton = () => {
            const links = document.querySelectorAll('header a, .header a, [class*="header"] a');
            let targetButton = null;

            links.forEach(link => {
                if (link.textContent.includes('Lihat Toko') || link.href.includes('bypass=true') || link.id === 'btn-lihat-toko') {
                    targetButton = link;
                }
            });

            if (targetButton) {
                // Berikan ID permanen agar tidak lepas saat render ulang state
                targetButton.id = 'btn-profile-admin-node'; 
                targetButton.removeAttribute('href'); // 🔒 KUNCI MATI: Hapus atribut tautan asli agar browser tidak iseng melakukan refresh rute
                
                targetButton.style.display = 'inline-flex';
                targetButton.style.alignItems = 'center';
                targetButton.style.justifyContent = 'center';
                targetButton.style.width = '46px';
                targetButton.style.height = '46px';
                targetButton.style.borderRadius = '50%';
                targetButton.style.backgroundColor = '#fff';
                targetButton.style.border = '3px solid #000';
                targetButton.style.boxShadow = '2px 2px 0px #000';
                targetButton.style.padding = '0';
                targetButton.style.cursor = 'pointer';
                targetButton.style.transition = 'transform 0.1s ease';

                targetButton.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;

                // Bersihkan event listener lama sebelum mengikat yang baru untuk mencegah kebocoran memori
                targetButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerPageTransition('profile');
                };
            }
        };

        // Jalankan langsung saat komponen lahir
        setupTopProfileButton();

        // Gunakan pengamat interval mini untuk memastikan tombol terkunci aman meski layout global telat dimuat
        const intervalLock = setInterval(setupTopProfileButton, 100);
        return () => clearInterval(intervalLock);
    }, [animateState]);

    // =========================================================================
    // UPDATE SINKRONISASI: Mengirim data status ke database Laravel via API
    // =========================================================================
    const handleSaveOrderStatus = async (e, orderId) => {
        e.preventDefault();
        const formElement = e.target.closest('form') || e.target.closest('tr');
        const statusSelect = formElement?.querySelector('select[name="status"]');
        const selectedStatus = statusSelect ? statusSelect.value : null;

        if (!selectedStatus) {
            alert('Status tidak ditemukan.');
            return;
        }

        try {
            const response = await fetch(`${page.routes.adminOrdersBase}/${orderId}`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ _method: 'PATCH', status: selectedStatus })
            });

            if (response.ok) {
                alert(`Sukses! Status untuk order #${orderId} berhasil diperbarui di database menjadi "${selectedStatus}".`);
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Gagal memperbarui status: ${errorData.message || 'Terjadi kesalahan pada server.'}`);
            }
        } catch (error) {
            console.error("Gagal menyimpan status pesanan:", error);
        }
    };

    const isDashboardActive = !orderQuery && !isProfileActive;

    return (
        <>
            {/* 🛠️ FILTER KUNCI ANTI-GLITCH MUTLAK: Mengunci footer dan layout luar agar tidak bergerak saat navigasi berganti */}
            <style>{`
                header a, .header a, [class*="header"] a, header h1, header p, header span {
                    text-decoration: none !important;
                    border-bottom: none !important;
                }
                .profile-badge {
                    font-size: 11px;
                    font-weight: 800;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 2px solid #000;
                    display: inline-block;
                }
                
                /* 🔒 ABSOLUTE HIDDEN: Mengunci mati seluruh kontainer kaki halaman bawaan template agar tidak bocor */
                footer, .footer, [class*="footer"], #footer-node-global {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                    height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                .smooth-stage {
                    transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), 
                                transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: opacity, transform;
                }
                .stage-enter {
                    opacity: 1;
                    transform: scale(1) translateY(0px);
                }
                .stage-exit {
                    opacity: 0;
                    transform: scale(0.97) translateY(6px);
                }
            `}</style>

            {/* =========================================================================
                🚀 SIDEBAR CONTROL PANEL
               ========================================================================= */}
            <aside 
                style={{
                    position: 'fixed', top: '76px', left: 0, bottom: 0, width: '260px', backgroundColor: '#ffffff', borderRight: '4px solid #000', boxSizing: 'border-box',
                    padding: '24px 20px 32px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10,        
                    height: 'calc(100vh - 76px)', overflowY: 'auto'  
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: 0, letterSpacing: '0.5px' }}>VOKSVIBE</h1>
                        <span style={{ fontSize: '11px', backgroundColor: '#ffcc00', color: '#000', padding: '4px 8px', borderRadius: '4px', fontWeight: '900', display: 'inline-block', marginTop: '6px', border: '2px solid #000' }}>
                            ADMIN CONTROL
                        </span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '4px' }}>
                            Control Center
                        </div>

                        {/* Menu 1: Dashboard Mode */}
                        <button 
                            onClick={() => triggerPageTransition('dashboard')} 
                            style={{ 
                                background: 'none', border: 'none', width: '100%', color: '#000', fontWeight: '900', fontSize: '15px', padding: '8px 0', textAlign: 'left', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                                opacity: isDashboardActive ? 1 : 0.4, 
                                borderBottom: isDashboardActive ? '2px solid #000' : '2px solid transparent', 
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{isDashboardActive ? '◼' : '▢'}</span>
                            Dashboard Mode
                        </button>
                        
                        {/* Menu 2: CRUD Produk */}
                        <button
                            onClick={() => { if(!isDashboardActive) { triggerPageTransition('dashboard'); } setTimeout(() => { document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); }, 300); }}
                            style={{
                                background: 'none', border: 'none', width: '100%', color: '#000', fontWeight: '900', fontSize: '15px', padding: '8px 0', textAlign: 'left', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                                opacity: isDashboardActive ? 1 : 0.4,
                                borderBottom: isDashboardActive ? '2px solid #000' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{isDashboardActive ? '◼' : '▢'}</span>
                            CRUD Produk
                        </button>

                        {/* Menu 3: Katalog Toko */}
                        <button
                            onClick={() => { if(!isDashboardActive) { triggerPageTransition('dashboard'); } setTimeout(() => { document.querySelector('.panel-card:nth-child(2)')?.scrollIntoView({ behavior: 'smooth' }); }, 300); }}
                            style={{
                                background: 'none', border: 'none', width: '100%', color: '#000', fontWeight: '900', fontSize: '15px', padding: '8px 0', textAlign: 'left', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                                opacity: isDashboardActive ? 1 : 0.4,
                                borderBottom: isDashboardActive ? '2px solid #000' : '2px solid transparent',
                                paddingBottom: '12px', transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{isDashboardActive ? '◼' : '▢'}</span>
                            Katalog Toko
                        </button>

                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginTop: '12px', marginBottom: '4px' }}>
                            Order Management
                        </div>

                        {['Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled'].map((status) => {
                            const isActive = orderQuery.toLowerCase() === status.toLowerCase() && !isProfileActive;
                            return (
                                <button
                                    key={status}
                                    onClick={() => triggerPageTransition('orders', status)}
                                    style={{
                                        background: 'none', border: 'none', color: '#000', fontWeight: '900', fontSize: '15px', textAlign: 'left', padding: '6px 0', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                                        opacity: isActive ? 1 : 0.4, 
                                        borderBottom: isActive ? '2px solid #000' : '2px solid transparent', 
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span>{isActive ? '◼' : '▢'}</span>
                                    {status} Orders
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bagian Bawah Menu Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    <button 
                        onClick={() => triggerPageTransition('profile')} 
                        style={{ 
                            background: 'none', border: 'none', width: '100%', color: '#000', fontWeight: '900', fontSize: '15px', padding: '10px 0', textAlign: 'left', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                            opacity: isProfileActive ? 1 : 0.4, 
                            borderBottom: isProfileActive ? '2px solid #000' : '2px solid transparent', 
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>{isProfileActive ? '◼' : '▢'}</span>
                        Admin Profile 👤
                    </button>

                    <form method="POST" action={page.routes.logout} style={{ width: '100%' }}>
                        <Csrf />
                        <button type="submit" className="chip-button chip-button--dark" style={{ width: '100%', padding: '10px 0', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                            Keluar 🚪
                        </button>
                    </form>
                </div>
            </aside>

            {/* =========================================================================
                SISI KANAN: AREA KONTEN UTAMA
               ========================================================================= */}
            <div 
                className={`smooth-stage ${animateState === 'enter' ? 'stage-enter' : 'stage-exit'}`}
                style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box', backgroundColor: '#faf9f6', paddingLeft: '280px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '40px', borderTop: 'none' }}
            >
                {pageContent === 'profile' ? (
                    /* 👤 PROFILE VIEW: INTERFACE PROFIL ADMIN */
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '12px', backgroundColor: '#ffcc00', color: '#000', padding: '4px 10px', borderRadius: '4px', fontWeight: '900', border: '2px solid #000' }}>
                                    Sistem Kontrol Kredensial
                                </span>
                                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '8px 0 0 0' }}>PROFIL AKUN UTAMA</h1>
                            </div>
                            <button onClick={() => triggerPageTransition('dashboard')} className="chip-button" style={{ fontWeight: '800', padding: '10px 20px', cursor: 'pointer' }}>
                                ◀ Kembali ke Dashboard
                            </button>
                        </div>

                        {/* KARTU PROFIL UTAMA BRUTALIST */}
                        <div className="panel-card" style={{ width: '100%', boxSizing: 'border-box', display: 'flex', gap: '30px', flexWrap: 'wrap', padding: '40px' }}>
                            <div style={{ width: '130px', height: '130px', backgroundColor: '#ffcc00', border: '4px solid #000', borderRadius: '24px', boxShadow: '6px 6px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>{liveAdminName}</h2>
                                    <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#666', fontSize: '15px' }}>{liveAdminEmail}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                    <span className="profile-badge" style={{ backgroundColor: '#000', color: '#fff' }}>Root Administrator</span>
                                    <span className="profile-badge" style={{ backgroundColor: '#fff', color: '#000' }}>Biro PAO Staff</span>
                                    <span className="profile-badge" style={{ backgroundColor: '#fff', color: '#000' }}>BEM UB Internal Affairs</span>
                                </div>
                            </div>
                        </div>

                        {/* DATA AKADEMIK & STRUKTUR ORGANISASI ADMIN */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', marginTop: '30px' }}>
                            <div className="panel-card" style={{ padding: '30px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 20px 0', borderBottom: '3px solid #000', paddingBottom: '8px' }}>Informasi Afiliasi Universitas</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontWeight: '700' }}>
                                    <tbody>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Lembaga</td><td style={{ padding: '10px 0', textAlign: 'right' }}>Universitas Brawijaya</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Fakultas</td><td style={{ padding: '10px 0', textAlign: 'right' }}>Fakultas Vokasi</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Program Studi</td><td style={{ padding: '10px 0', textAlign: 'right' }}>D3 Teknologi Informasi (Semester 2)</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Portal Akses</td><td style={{ padding: '10px 0', textAlign: 'right' }}>BAIS UB Security Node</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="panel-card" style={{ padding: '30px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 20px 0', borderBottom: '3px solid #000', paddingBottom: '8px' }}>Log Penjagaan & Otoritas Sistem</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontWeight: '700' }}>
                                    <tbody>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Hak Otoritas</td><td style={{ padding: '10px 0', textAlign: 'right', color: '#16a34a' }}>Bypass Active (CRUD + Database Mod)</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Target Server</td><td style={{ padding: '10px 0', textAlign: 'right' }}>Laravel Engine & Local MySQL</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Token CSRF</td><td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>Terverifikasi (Secure App Node)</td></tr>
                                        <tr><td style={{ padding: '10px 0', color: '#666' }}>Grup Kerja BEM</td><td style={{ padding: '10px 0', textAlign: 'right' }}>Kabinet Rajut Wijaya (BEM UB)</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : pageContent === 'orders' ? (
                    /* 🔵 TAMPILAN KHUSUS PESANAN TER-FILTER STATUS */
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '12px', backgroundColor: '#000', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>Halaman Manajemen Pesanan</span>
                                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '8px 0 0 0', textTransform: 'uppercase' }}>Status: {orderQuery} Orders ({filteredOrders.length})</h1>
                            </div>
                            <button onClick={() => triggerPageTransition('dashboard')} className="chip-button" style={{ fontWeight: '800', padding: '10px 20px', cursor: 'pointer' }}>◀ Kembali ke Dashboard Lengkap</button>
                        </div>
                        <div className="panel-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                            <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                                <div><p className="eyebrow">Penyaringan Live</p><h2>Daftar Transaksi "{orderQuery}"</h2></div>
                                <div style={{ position: 'relative', minWidth: '360px' }}>
                                    <input type="text" placeholder="Cari berdasarkan kode, customer, atau item..." value={subSearchQuery} onChange={(e) => setSubSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', fontSize: '14px', fontWeight: '700', outline: 'none', backgroundColor: '#fff' }} />
                                    {subSearchQuery && <button onClick={() => setSubSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer', color: '#991b1b' }}>✕</button>}
                                </div>
                            </div>
                            <OrderTable orders={filteredOrders} onSaveStatus={handleSaveOrderStatus} />
                        </div>
                    </div>
                ) : (
                    /* 🟢 TAMPILAN DASHBOARD LENGKAP DEFAULT */
                    <>
                        <Banner mode="dark" eyebrow="Admin Panel" title="DASHBOARD" copy="Backend admin untuk memantau produk, pesanan, dan ringkasan toko." />
                        <section className="section-block" style={{ padding: 0, marginTop: '40px' }}>
                            <div className="stats-grid">
                                <div onClick={() => triggerPageTransition('dashboard')} style={{ cursor: 'pointer' }}>
                                    <StatCard label="Total Pendapatan" value={formatRupiah(summary.totalRevenue)} />
                                </div>
                                <div onClick={() => triggerPageTransition('dashboard')} style={{ cursor: 'pointer' }}>
                                    <StatCard label="Total Pesanan" value={summary.totalOrders} />
                                </div>
                                <div onClick={() => triggerPageTransition('orders', 'Pending')} style={{ cursor: 'pointer' }}>
                                    <StatCard label="Pending Orders" value={summary.pendingOrders} />
                                </div>
                                <div>
                                    <StatCard label="Produk / Lookbook" value={`${summary.productCount} / ${summary.lookbookCount}`} />
                                </div>
                            </div>  
                        </section>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '40px' }}>
                            {/* FORM TAMBAH / EDIT PRODUK */}
                            <div className="panel-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                                <div className="section-heading">
                                    <div><p className="eyebrow">CRUD Produk</p><h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2></div>
                                </div>
                                <form method="POST" action={productAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <Csrf />
                                    {editingProduct && <MethodInput method="PUT" />}
                                    <div className="form-grid">
                                        <Field label="Kategori">
                                            <select name="category" required defaultValue={oldValue('category', editingProduct?.category || productCategories[0])}>
                                                {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Nama Produk"><input type="text" name="name" defaultValue={oldValue('name', editingProduct?.name)} required /></Field>
                                        <Field label="Harga"><input type="number" name="price" defaultValue={oldValue('price', editingProduct?.price)} required /></Field>
                                        <Field label="Harga Asli"><input type="number" name="original_price" defaultValue={oldValue('original_price', editingProduct?.original_price)} /></Field>
                                        <Field label="Rating"><input type="number" step="0.1" min="0" max="5" name="rating" defaultValue={oldValue('rating', editingProduct?.rating || '4.5')} required /></Field>
                                        <Field label="Stok"><input type="number" min="0" name="stock" defaultValue={oldValue('stock', editingProduct?.stock || '0')} required /></Field>
                                        <Field label="URL Gambar" full><input type="text" name="image_url" defaultValue={oldValue('image_url', editingProduct?.image_url || '/produk1hoodie.jpg')} required /></Field>
                                        <Field label="Deskripsi" full><textarea name="description" rows="4" required defaultValue={oldValue('description', editingProduct?.description)} /></Field>
                                    </div>
                                    <div className="checkbox-group">
                                        <Checkbox name="is_trending" label="Trending" defaultChecked={Boolean(Number(oldValue('is_trending', editingProduct?.is_trending ? 1 : 0)))} />
                                        <Checkbox name="is_sale" label="Sale" defaultChecked={Boolean(Number(oldValue('is_sale', editingProduct?.is_sale ? 1 : 0)))} />
                                    </div>
                                    <div className="button-row">
                                        <button type="submit" className="action-button action-button--dark">{editingProduct ? 'Update Produk' : 'Tambah Produk'}</button>
                                        {editingProduct && <button type="button" onClick={() => triggerPageTransition('dashboard')} className="chip-button">Batal Edit</button>}
                                    </div>
                                </form>
                            </div>
                            {/* KATALOG PRODUK */}
                            <div className="panel-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                                <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                                    <div><p className="eyebrow">Product Management</p><h2>Katalog Produk ({filteredProducts.length})</h2></div>
                                    <div style={{ position: 'relative', minWidth: '280px' }}>
                                        <input type="text" placeholder="Cari nama produk / kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', fontSize: '14px', fontWeight: '700', outline: 'none', backgroundColor: '#fff' }} />
                                        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer', color: '#991b1b' }}>✕</button>}
                                    </div>
                                </div>
                                <ProductTable products={filteredProducts} />
                            </div>
                            
                            {/* TABEL PEMESANAN DEFAULT */}
                            <div className="panel-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                                <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                                    <div><p className="eyebrow">Order Management</p><h2>Pesanan Masuk ({filteredOrders.length})</h2></div>
                                    <div style={{ position: 'relative', minWidth: '320px' }}>
                                        <input type="text" placeholder="Cari kode, status, customer, atau item..." value={subSearchQuery} onChange={(e) => setSubSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '3px solid #000', boxShadow: '4px 4px 0px #000', fontSize: '14px', fontWeight: '700', outline: 'none', backgroundColor: '#fff' }} />
                                        {subSearchQuery && <button onClick={() => setSubSearchQuery('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer', color: '#991b1b' }}>✕</button>}
                                    </div>
                                </div>
                                <OrderTable orders={filteredOrders} onSaveStatus={handleSaveOrderStatus} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}