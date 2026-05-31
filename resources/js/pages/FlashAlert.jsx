import React, { useState, useEffect } from 'react';

export default function FlashAlert({ message, duration = 4000 }) {
    const [visible, setVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // 1. Memicu animasi fade-out sebelum komponen benar-benar hilang dari DOM
        const animationTimer = setTimeout(() => {
            setVisible(false);
        }, duration - 500); // Mulai memudar 500ms sebelum durasi habis

        // 2. Menghapus komponen dari layar secara total setelah durasi selesai
        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, duration);

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(removeTimer);
        };
    }, [duration, message]);

    if (!shouldRender || !message) return null;

    return (
        <div 
            className="flash-alert-container"
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '16px',
                padding: '0 24px',
                boxSizing: 'border-box',
                transition: 'all 0.5s ease-in-out',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(-10px)',
            }}
        >
            <div 
                className="flash-alert-box"
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    backgroundColor: '#ecfdf5', // Hijau mint lembut sesuai ss kamu
                    color: '#065f46',
                    padding: '16px 24px',
                    borderRadius: '20px',
                    border: '4px solid #000',
                    boxShadow: visible ? '6px 6px 0px #000' : '0px 0px 0px #000',
                    fontWeight: '800',
                    fontSize: '15px',
                    textAlign: 'left'
                }}
            >
                {message}
            </div>
        </div>
    );
}