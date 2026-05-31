import React, { useState, useEffect } from 'react';
import Banner from '../components/ui/Banner';

export default function Lookbook({ lookbooks = [], featuredProducts }) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 50);

        // Fungsi pembaca URL parameter terbaru
        const readUrlParams = () => {
            if (typeof window !== 'undefined') {
                const searchParams = new URLSearchParams(window.location.search);
                const currentQuery = searchParams.get('q') || '';
                setSearchQuery(currentQuery);
            }
        };

        // Jalankan sekali di awal load halaman
        readUrlParams();

        // PASANG EVENT LISTENER: Mendengarkan sinyal perubahan dari Header.jsx secara real-time
        window.addEventListener('urlSearchUpdate', readUrlParams);

        // Bersihkan timer dan event listener saat komponen dilepas
        return () => {
            clearTimeout(timer);
            window.removeEventListener('urlSearchUpdate', readUrlParams);
        };
    }, []);

    // LOGIKA PENYARINGAN KARTU LOOKBOOK
    const filteredLookbooks = lookbooks.filter((lookbook) => {
        if (!searchQuery.trim()) return true;

        const cleanQuery = searchQuery.toLowerCase().trim();
        const titleText = lookbook.title ? String(lookbook.title).toLowerCase().trim() : '';
        const captionText = lookbook.caption ? String(lookbook.caption).toLowerCase().trim() : '';

        return titleText.includes(cleanQuery) || captionText.includes(cleanQuery);
    });

    return (
        <div 
            className="transition-all duration-1000 ease-out"
            style={{
                opacity: isMounted ? 1 : 0,
                transform: isMounted ? 'translateY(0)' : 'translateY(20px)'
            }}
        >
            <Banner 
                mode="gold" 
                eyebrow="Volume 01 / 2026" 
                title={searchQuery ? `SEARCH: "${searchQuery.toUpperCase()}"` : "LOOKBOOK"} 
                copy={searchQuery ? `Menampilkan hasil pencarian editorial untuk "${searchQuery}".` : "Koleksi visual editorial yang mengikuti mood dan susunan kartu dari referensi Voksvibe."} 
            />
            
            <section className="section-block">
                {filteredLookbooks.length > 0 ? (
                    /* STRUKTUR UTAMA DALAM BENTUK GRID */
                    <div className="lookbook-grid">
                        {filteredLookbooks.map((lookbook) => (
                            <article key={lookbook.id} className="lookbook-card">
                                <img 
                                    src={lookbook.image_url} 
                                    alt={lookbook.title} 
                                    className="lookbook-card__image" 
                                />
                                <div className="lookbook-card__body">
                                    <p className="eyebrow">{lookbook.season_label}</p>
                                    <h2>{lookbook.title}</h2>
                                    <p>{lookbook.caption}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 mx-auto max-w-4xl rounded-[32px]" style={{ border: '4px dashed #e5e5e5', margin: '20px auto' }}>
                        <p className="text-xl font-bold text-neutral-400">
                            Koleksi Editorial dengan judul "{searchQuery}" tidak ditemukan.
                        </p>
                        <a href="/lookbook" className="inline-block mt-4 text-sm font-bold underline text-black hover:text-[#FFCC00]">
                            Kembali Lihat Semua Lookbook
                        </a>
                    </div>
                )}
            </section>
        </div>
    );
}