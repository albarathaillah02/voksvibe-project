import { page } from '../config/page';
import ProductGrid from '../components/products/ProductGrid';
import ProductSection from '../components/products/ProductSection';

// 1. IMPORT SWIPER CORE DAN KOMPONEN REACT
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// 2. IMPORT CSS WAJIB SWIPER
import 'swiper/css';
import 'swiper/css/navigation';

export default function Home({ search, products, bestSellers, newArrivals, lookbooks }) {
    
    const isLoggedIn = !!(page.auth && page.auth.user);
    const isAdmin = isLoggedIn && page.auth.user.role === 'admin';

    // 🚀 LANGKAH AWAL KUNCI UTAMA:
    // Jika akun yang login terdeteksi sebagai admin, langsung tendang masuk ke Dashboard Admin.
    // Admin tidak boleh mengakses halaman belanja depan (Storefront).
    if (isAdmin) {
        window.location.href = '/admin/dashboard';
        return null;
    }

    const targetRoute = isLoggedIn ? '/products' : '/login';

    const modelImages = [
        "https://i0.wp.com/zaloraadmin.wpcomstaging.com/wp-content/uploads/2023/11/brand-baju-lokal.png?fit=1200%2C620&ssl=1",
        "https://images.unsplash.com/photo-1717766430321-d8390f663932?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZhc2hpb24lMjBsYW5kc2NhcGV8ZW58MHx8MHx8fDA%3D",
        "https://i.pinimg.com/1200x/8c/01/6d/8c016d11d94874e6228a2cc7de7ed7d0.jpg"
    ];

    const handleScrollToProducts = (e) => {
        if (!isLoggedIn) {
            return;
        }

        e.preventDefault();
        const target = document.getElementById('produk-section');
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000;
            let start = null;

            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                
                const ease = progress / duration < 0.5 
                    ? 4 * (progress / duration) * (progress / duration) * (progress / duration)
                    : 1 - Math.pow(-2 * (progress / duration) + 2, 3) / 2;

                window.scrollTo(0, startPosition + distance * Math.min(ease, 1));

                if (progress < duration) {
                    window.requestAnimationFrame(step);
                }
            };

            window.requestAnimationFrame(step);
        }
    };

    if (search !== '') {
        return (
            <>
                <section className="banner banner--gold">
                    <p className="eyebrow">Search Results</p>
                    <h1>Hasil pencarian untuk "{search}"</h1>
                    <p>Menampilkan produk yang paling relevan dari katalog VOKSVIBE.</p>
                </section>
                <section className="section-block">
                    <div className="product-grid">
                        <ProductGrid 
                            products={products} 
                            isLoggedIn={isLoggedIn}
                            emptyTitle="Produk tidak ditemukan." 
                            emptyText="Coba kata kunci lain atau kembali ke katalog utama." 
                        />
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            {/* AREA BANNER HERO CONTAINER */}
            <section className="hero" style={{ 
                position: 'relative', 
                overflow: 'hidden',
                width: '100%',
                height: '650px', 
                borderRadius: '24px', 
                border: '4px solid #000', 
                boxSizing: 'border-box',
                boxShadow: '10px 10px 0px #000', 
                backgroundColor: '#f4f4f5',

                // KUNCI UNTUK MENGHILANGKAN CELAH WARNA PUTIH DI LUAR BANNER:
                // Menarik kontainer ke atas agar menempel pas di bawah navbar kuning.
                // Jika masih ada renggang atau terlalu naik, sesuaikan nilai -20px ini (misal: -16px atau -24px)
                marginTop: '-20px', 
            }}>
                
                {/* PANEL UTAMA JALUR SISI KIRI */}
                <div className="hero__panel" style={{ 
                    position: 'absolute', 
                    top: '0px',       
                    bottom: '0px',    
                    left: '0px',      
                    zIndex: 3, 
                    pointerEvents: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingTop: '50px',    
                    paddingBottom: '50px', 
                    paddingLeft: '50px', 
                    paddingRight: '40px',
                    width: '100%',
                    maxWidth: '530px',   
                    
                    // Membuat lengkungan bagian dalam panel mengikuti border hitam secara presisi
                    borderTopLeftRadius: '20px', 
                    borderBottomLeftRadius: '20px', 
                    boxSizing: 'border-box'
                }}>
                    
                    {/* WARNA TEKS TETAP PUTIH BERSIH */}
                    <p className="eyebrow" style={{ color: '#ffffff' }}>VOLUME 01 / 2026</p>
                    
                    <h1 className="hero__title" style={{ color: '#ffffff' }}>
                        STREETWEAR BUILT FOR CAMPUS REBELS AND CITY MOVEMENT.
                    </h1>
                    
                    <p className="hero__copy" style={{ color: '#ffffff', marginBottom: '24px' }}>
                        Voksvibe adalah platform fashion dan brand streetwear lokal yang menghadirkan pilihan artikel pakaian terbaik—mulai dari jacket, hoodie, hingga kaos essentials—yang dirancang khusus untuk mengikuti perkembangan tren kultur urban yang adaptif dan ekspresif.
                    </p>
                    
                    <div className="hero__actions">
                        {/* TOMBOL WARNA KUNING */}
                        <a 
                            href={isLoggedIn ? "#produk-section" : "/login"}
                            onClick={handleScrollToProducts}
                            className="button button--primary"
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#ffcc00', 
                                color: '#000000',           
                                border: '3px solid #000000',
                                boxShadow: '4px 4px 0px #000000',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                fontWeight: '900',
                                textDecoration: 'none',
                                textTransform: 'uppercase'
                            }}
                        >
                            Belanja Sekarang ⚡
                        </a>
                    </div>
                </div>

                {/* SLIDER CAROUSEL BACKGROUND */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%',
                    zIndex: 1
                }}>
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={true}
                        speed={900} 
                        autoplay={{
                            delay: 3500, 
                            disableOnInteraction: false,
                        }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {modelImages.map((src, index) => (
                            <SwiperSlide 
                                key={index} 
                                style={{ 
                                    width: '100%', 
                                    height: '100%'
                                }}
                            >
                                <img 
                                    src={src} 
                                    alt={`Slide ${index + 1}`} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover', 
                                        objectPosition: 'center center', 
                                        display: 'block'
                                    }} 
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
            
            {/* SISA KODE DI BAWAH INI 100% AMAN DAN TIDAK BERUBAH */}
            {isLoggedIn && (
                <>
                    <div id="produk-section" style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '48px' }}>
                        <ProductSection eyebrow="Storefront" title="BEST SELLERS" link={page.routes.home} products={bestSellers} isLoggedIn={isLoggedIn} />
                        <ProductSection eyebrow="Fresh Drop" title="NEW ARRIVALS" products={newArrivals} isLoggedIn={isLoggedIn} />
                    </div>
                    
                    <section className="section-block lookbook-strip" style={{ marginTop: '56px' }}>
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Editorial</p>
                                <h2>LOOKBOOK GLIMPSE</h2>
                            </div>
                            <a href={page.routes.lookbook} className="text-link">Buka lookbook</a>
                        </div>

                        <div className="lookbook-preview" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                            gap: '24px',
                            marginTop: '24px'
                        }}>
                            {lookbooks && lookbooks.map((lookbook) => (
                                <article key={lookbook.id} className="lookbook-preview__card" style={{ 
                                    border: '4px solid #000', 
                                    borderRadius: '20px', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#fff',
                                    boxShadow: '6px 6px 0px #000',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ width: '100%', height: '250px', backgroundColor: '#f4f4f5', overflow: 'hidden', borderBottom: '4px solid #000' }}>
                                        <img 
                                            src={lookbook.image_url || "/placeholder.jpg"} 
                                            alt={lookbook.title} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="lookbook-preview__body" style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <p className="eyebrow" style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>
                                            {lookbook.season_label || 'VOLUME 01 / 2026'}
                                        </p>
                                        <h3 style={{ fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', color: '#000', lineHeight: '1.2' }}>
                                            {lookbook.title}
                                        </h3>
                                        <p style={{ fontSize: '13px', color: '#52525b', marginTop: '2px', lineHeight: '1.3' }}>
                                            {lookbook.caption}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </>
    );
}