import React, { useState, useEffect } from 'react';
import { page } from '../../config/page';
import Csrf from '../forms/Csrf';

export default function Header() {
    const isActive = (route) => page.currentRoute === route;

    // DETEKSI LOGGED IN & ROLE ADMIN
    const isLoggedIn = !!(page.auth && page.auth.user);
    const isAdmin = isLoggedIn && page.auth.user.role === 'admin';

    // DETEKSI OTOMATIS RUTE HALAMAN (HANYA BERLAKU UNTUK USER)
    const isLookbookPage = page.currentRoute === 'store.lookbook' || page.currentRoute === 'lookbook';
    const searchActionRoute = isLookbookPage ? page.routes.lookbook : page.routes.home;
    const searchPlaceholder = isLookbookPage ? "Cari judul lookbook..." : "Cari produk...";

    // STATE UNTUK MENGONTROL KATA KUNCI SECARA REAL-TIME
    const [localQuery, setLocalQuery] = useState(page.query.q || '');

    // Sinkronisasi state lokal jika parameter query global dari server berubah
    useEffect(() => {
        setLocalQuery(page.query.q || '');
    }, [page.query.q]);

    // FUNGSI UTAMA UNTUK UPDATE URL & REAL-TIME SEARCH (Sensitif Per Karakter)
    const executeSearch = (value) => {
        if (isLookbookPage) {
            const searchParams = new URLSearchParams(window.location.search);
            let newUrl = '';
            
            if (value) {
                searchParams.set('q', value);
                newUrl = `${window.location.pathname}?${searchParams.toString()}`;
            } else {
                searchParams.delete('q'); 
                newUrl = window.location.pathname; 
            }
            
            window.history.replaceState({ path: newUrl }, '', newUrl);
            window.dispatchEvent(new Event('urlSearchUpdate'));
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalQuery(value);
        executeSearch(value); 
    };

    const handleFormSubmit = (e) => {
        if (isLookbookPage) {
            e.preventDefault(); 
            executeSearch(localQuery); 
        }
    };

    // =========================================================================
    // 🟢 RENDER 1: NAVBAR KHUSUS ADMIN (TAMPILAN MINIMALIS BRUTALIST)
    // =========================================================================
    if (isAdmin) {
        return (
            <header className="site-header site-header--admin" style={{ backgroundColor: '#ffcc00', borderBottom: '4px solid #000' }}>
                {/* BRAND DENGAN EMBEL-EMBEL ADMIN PANEL */}
                <a href={page.routes.admin} className="site-brand" style={{ fontWeight: '900', letterSpacing: '1px' }}>
                    VOKSVIBE <span style={{ fontSize: '14px', backgroundColor: '#000', color: '#ffcc00', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>ADMIN PANEL</span>
                </a>

                {/* MENU ADMIn: BERSIH, TANPA SEARCBH BAR DAN LINK KATEGORI MUTILASI */}
                <nav className="site-nav">
                    <span className="nav-link is-active" style={{ cursor: 'default' }}>Dashboard Controlling</span>
                </nav>

                <div className="header-tools">
                    {/* TOMBOL CEPAT BALIK KE STOREFRONT PEMBELI */}
                    <a href={page.routes.home} className="chip-button" style={{ backgroundColor: '#fff', border: '3px solid #000', color: '#000', fontWeight: '800' }}>
                        Lihat Toko 🌐
                    </a>

                    {/* FORM LOGOUT ADMIN */}
                    <form method="POST" action={page.routes.logout} className="inline-form">
                        <Csrf />
                        <button type="submit" className="chip-button chip-button--dark">Keluar 🚪</button>
                    </form>
                </div>
            </header>
        );
    }

    // =========================================================================
    // 🔵 RENDER 2: NAVBAR LAMA / ASLI (HANYA UNTUK USER BIASA & GUEST)
    // =========================================================================
    return (
        <header className="site-header">
            <a href={page.routes.home} className="site-brand">VOKSVIBE</a>

            <nav className="site-nav">
                <details className="nav-dropdown">
                    <summary className="nav-link">Category</summary>
                    <div className="nav-dropdown__menu">
                        {page.categoryNavigation && page.categoryNavigation.map((item) => (
                            <a key={item.slug} href={`${page.routes.categoryBase}/${item.slug}`} className="nav-dropdown__item">{item.label}</a>
                        ))}
                        <a href={page.routes.home} className="nav-dropdown__item nav-dropdown__item--accent">All Products</a>
                    </div>
                </details>
                <a href={page.routes.trending} className={`nav-link ${isActive('store.trending') ? 'is-active' : ''}`}>Trending Now</a>
                <a href={page.routes.lookbook} className={`nav-link ${isActive('store.lookbook') ? 'is-active' : ''}`}>Lookbook</a>
                <a href={page.routes.about} className={`nav-link ${isActive('store.about') || page.currentRoute === 'about' ? 'is-active' : ''}`}>About</a>
                <a href={page.routes.sale} className={`nav-link nav-link--sale ${isActive('store.sale') ? 'is-active' : ''}`}>Sale</a>
                
                {/* 🔒 KEAMANAN KUNCI: Link 'Admin' manual di navbar biasa dihilangkan agar user biasa tidak bisa melihat atau mengkliknya */}
            </nav>

            <div className="header-tools">
                {/* FORM PENCARIAN DINAMIS */}
                <form 
                    method="GET" 
                    action={searchActionRoute} 
                    className="search-form"
                    onSubmit={handleFormSubmit}
                >
                    <input 
                        type="text" 
                        name="q" 
                        value={localQuery} 
                        onChange={handleSearchChange}
                        placeholder={searchPlaceholder} 
                        className="search-form__input" 
                        autoComplete="off" 
                    />
                    <button type="submit" className="search-form__button">
                        <img src="/searchicons.svg" alt="Cari" />
                    </button>
                </form>

                <a href={page.routes.cart} className="icon-link">
                    <img src="/carticons.svg" alt="Keranjang" />
                    <span className="icon-link__badge">{page.sharedCartCount}</span>
                </a>

                {page.auth.user ? (
                    <>
                        <a href={page.routes.profile} className="icon-link">
                            <img src="/profileicons.svg" alt="Profil" />
                        </a>
                        <form method="POST" action={page.routes.logout} className="inline-form">
                            <Csrf />
                            <button type="submit" className="chip-button chip-button--dark">Keluar</button>
                        </form>
                    </>
                ) : (
                    <>
                        <a href={page.routes.login} className="chip-button">Masuk</a>
                        <a href={page.routes.register} className="chip-button chip-button--dark">Daftar</a>
                    </>
                )}
            </div>
        </header>
    );
}