import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/products/ProductGrid';

export default function Grid({ heading, subheading, products, search, accent, emptyMessage, banner_bg }) {
    
    // 1. State untuk memicu animasi transisi halus
    const [isMounted, setIsMounted] = useState(false);

    // 2. Memicu ulang animasi setiap kali parameter 'heading' berubah (pindah menu)
    useEffect(() => {
        setIsMounted(false); // Reset status animasi terlebih dahulu

        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 50); // Delay minimal agar browser sempat menangkap perubahan state

        return () => clearTimeout(timer);
    }, [heading]); // 👈 Dependensi ke heading memastikan transisi aktif saat navigasi antar katalog

    // Cek apakah ada data link gambar background yang dikirim dari controller
    const hasBackgroundImage = !!banner_bg;

    // Buat style dinamis untuk gambar latar banner
    const dynamicBannerStyle = hasBackgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${banner_bg}')`,
        backgroundSize: 'cover',         // 🛠️ Kembalikan ke 'cover' agar gambar tidak ditarik gepeng
        backgroundPosition: 'center',    // 🛠️ Mengunci gambar tepat di tengah-tengah
        backgroundRepeat: 'no-repeat',
        paddingTop: '70px',              // 🛠️ Ditambah agar ruang atas longgar dan teks chat terlihat
        paddingBottom: '70px',           // 🛠️ Ditambah agar ruang bawah longgar dan teks chat tidak amblas
        color: '#ffffff', 
    } : {};

    return (
        <div 
            className="transition-all duration-1000 ease-out"
            style={{
                opacity: isMounted ? 1 : 0,
                transform: isMounted ? 'translateY(0)' : 'translateY(20px)'
            }}
        >
            {/* Masukkan style dinamis ke tag section banner */}
            <section 
                className={`banner ${accent === 'red' ? 'banner--red' : 'banner--gold'}`}
                style={dynamicBannerStyle}
            >
                {/* Memaksa warna teks menjadi putih hanya jika background gambar terdeteksi */}
                <p className="eyebrow" style={{ color: hasBackgroundImage ? '#ffffff' : 'inherit' }}>
                    {search !== '' ? 'Filtered Catalog' : 'Curated Catalog'}
                </p>
                <h1 style={{ color: hasBackgroundImage ? '#ffffff' : 'inherit' }}>
                    {heading}
                </h1>
                <p style={{ color: hasBackgroundImage ? '#ffffff' : 'inherit', opacity: hasBackgroundImage ? 0.9 : 1 }}>
                    {subheading}
                </p>
            </section>
            
            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">{products.length} items</p>
                        <h2>{heading}</h2>
                    </div>
                </div>
                <div className="product-grid">
                    <ProductGrid products={products} emptyTitle={emptyMessage} emptyText="Coba ubah filter atau kembali ke semua produk." />
                </div>
            </section>
        </div>
    );
}