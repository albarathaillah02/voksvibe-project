import React, { useState, useEffect } from 'react';
import { page } from '../../config/page';

export default function FlashMessages() {
    const [visible, setVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    const hasStatus = !!page?.flash?.status;
    const hasErrors = !!(page?.flash?.errors && page?.flash?.errors?.length > 0);

    useEffect(() => {
        setVisible(true);
        setShouldRender(true);

        // Memicu animasi memudar keluar pada detik ke-3.5
        const animationTimer = setTimeout(() => {
            setVisible(false);
        }, 3500);

        // Menghapus elemen secara total pada detik ke-4
        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, 4000);

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(removeTimer);
        };
    }, [page?.flash?.status, page?.flash?.errors]);

    if (!shouldRender || (!hasStatus && !hasErrors)) return null;

    return (
        /* 🚀 CONTAINER UTAMA: Melayang di atas seluruh elemen page */
        <div 
            style={{
                position: 'fixed',
                top: '24px',          // Muncul di area atas layar
                right: '24px',        // Muncul di pojok kanan
                zIndex: 9999,         // Memastikan berada di lapisan paling depan
                maxWidth: '400px',    // Lebar maksimal pop-up toast
                width: 'calc(100% - 48px)',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Efek bounce sedikit
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.9)', // Slide out ke kanan
            }}
        >
            {/* 🟢 POP-UP SUKSES (HIJAU MINT BRUTALIST) */}
            {hasStatus && (
                <div 
                    style={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '4px solid #000',
                        boxShadow: '6px 6px 0px #000',
                        fontWeight: '800',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <div>{page?.flash?.status}</div>
                </div>
            )}

            {/* 🔴 POP-UP ERROR (MERAH BRUTALIST) */}
            {hasErrors && (
                <div 
                    style={{
                        backgroundColor: '#fef2f2',
                        color: '#991b1b',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '4px solid #000',
                        boxShadow: '6px 6px 0px #000',
                        fontWeight: '800',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <div>{page?.flash?.errors?.join(' ')}</div>
                </div>
            )}
        </div>
    );
}