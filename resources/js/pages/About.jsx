import React, { useState, useEffect } from 'react';

export default function About({ banner_bg }) {
    // State untuk memicu animasi transisi halus setelah komponen dimuat
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const hasBackgroundImage = !!banner_bg;

    // Mengatur kecerahan overlay gambar banner atas (0.50)
    const dynamicBannerStyle = hasBackgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${banner_bg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#ffffff', 
    } : {};

    // Mempertahankan teks putih solid mutlak tanpa shadow / efek fade
    const cleanWhiteTextStyle = {
        color: '#ffffff',
        textShadow: 'none',
        opacity: 1
    };

    return (
        <div 
            className="w-full min-h-screen pb-12 transition-all duration-1000 ease-out bg-white text-black font-sans" 
            style={{ 
                opacity: isMounted ? 1 : 0,
                transform: isMounted ? 'translateY(0)' : 'translateY(20px)'
            }}
        >
            {/* SECTION BANNER */}
            <section 
                className="banner banner--gold"
                style={dynamicBannerStyle}
            >
                {/* 1. Teks Brand Profile */}
                <p 
                    className="eyebrow tracking-widest uppercase font-bold text-xs" 
                    style={cleanWhiteTextStyle}
                >
                    Brand Profile
                </p>

                {/* 2. Judul Utama ABOUT US */}
                <h1 
                    className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
                    style={cleanWhiteTextStyle}
                >
                    ABOUT US
                </h1>

                {/* 3. Teks Subjudul */}
                <p 
                    className="text-sm md:text-base font-semibold max-w-xl mt-2 leading-relaxed" 
                    style={cleanWhiteTextStyle}
                >
                    Kisah, visi, dan pergerakan subkultur di balik layar VOKSVIBE Streetwear.
                </p>
            </section>

            {/* KONTEN ARTIKEL */}
            <div className="max-w-6xl mx-auto px-6 md:px-16 mt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    
                    {/* Sisi Kiri: Frame Gambar (Border dan Background Hitam Total Dihapus) */}
                    <div className="w-full flex justify-center items-center md:sticky md:top-24">
                        <img 
                            src="/about_voksvibe.png" // Sesuaikan dengan nama file gambar manifesto di folder public Anda
                            alt="About VOKSVIBE" 
                            className="w-full h-auto object-contain rounded-sm"
                        />
                    </div>

                    {/* Sisi Kanan: Teks Deskripsi & Find Us */}
                    <div className="space-y-8 text-sm md:text-base font-normal tracking-normal leading-relaxed text-justify text-neutral-800">
                        <div className="space-y-6">
                            <p>
                                <span className="font-extrabold text-black tracking-tight">VOKSVIBE</span> adalah sebuah brand pakaian yang menarik dan tidak konvensional asal Indonesia. Bukan sekadar menghadirkan brand yang lebih matang dan berpikiran maju, kami juga merefleksikan setiap isu atau tema rilisan kami layaknya sebuah album musik, di mana setiap artikel pakaian adalah lagu yang kami tulis.
                            </p>
                            <p>
                                Digerakkan oleh pencarian mimpi budaya anak muda lokal, hidup di tengah alam semesta yang tampak acuh tak acuh dengan keberadaan kita. VOKSVIBE adalah kobaran api brand berbahaya yang sempat hilang selama bertahun-tahun, dan kini dilepaskan kembali ke tengah masyarakat sehari-hari untuk mengartikan dunia ini secara objektif.
                            </p>
                            <p>
                                Cinta pertama kami selalu dan akan selamanya tertuju pada musik, seni, dan pergerakan subkultur. Kami mencoba untuk berkontribusi kembali ke akar kami melalui produk-produk serta peluang yang kami sediakan melalui perusahaan ini. Kami tetap terlibat sangat dalam pada proses produksi dan pengarahan, demi menjaga rasa hormat terhadap komunitas-komunitas yang terus kami dukung.
                            </p>
                        </div>

                        {/* BAGIAN: FIND US ON */}
                        <div className="pt-6 border-t border-neutral-200 text-left">
                            <h3 className="text-sm font-bold tracking-wider uppercase text-black mb-4 font-sans">
                                FIND US ON
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <a 
                                    href="https://instagram.com/barathllh" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-sm font-sans"
                                >
                                    Instagram
                                </a>
                                <a 
                                    href="https://shopee.co.id/voksvibe" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-sm font-sans"
                                >
                                    Shopee
                                </a>
                                <a 
                                    href="https://tiktok.com/@voksvibe" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-sm font-sans"
                                >
                                    TikTok
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}