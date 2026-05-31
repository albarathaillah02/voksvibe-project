import { useState, useEffect } from 'react';
import { page } from '../../config/page';
import { formatRupiah } from '../../utils/format';

export default function ProductCard({ product }) {
    // 1. Cek secara real-time status login user lewat object global aplikasi
    const isLoggedIn = !!(page.auth && page.auth.user);

    // 2. State kustom untuk mengatur muncul/hilangnya pop-up notifikasi
    const [notification, setNotification] = useState({
        show: false,
        message: ''
    });

    // 3. Auto-hide: Bersihkan pop-up otomatis setelah 3 detik
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, message: '' });
            }, 3000); // 3000ms = 3 detik

            return () => clearTimeout(timer); // Bersihkan memory leak
        }
    }, [notification.show]);

    // 4. Fungsi penangan klik tombol "Add to Cart"
    const handleAddToCartSubmit = (e) => {
        e.preventDefault(); // Menghentikan full page reload browser secara total

        // Jika status isLoggedIn salah (user belum login)
        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }

        // Tembak data ke Laravel di latar belakang (senyap)
        fetch(`${page.routes.cartBase}/${product.id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ quantity: 1 })
        })
        .then(response => {
            if (response.ok) {
                // MASUKKAN POP-UP NOTIFIKASI DISINI
                setNotification({
                    show: true,
                    message: `⚡ BERHASIL MASUK KERANJANG!`
                });

                // --- MANIPULASI ANGKA KERANJANG SECARA INSTAN ---
                const cartBadge = document.querySelector('.cart-count, [class*="cart-count"], [class*="badge"], #cart-count');
                if (cartBadge) {
                    const currentCount = parseInt(cartBadge.innerText || '0', 10);
                    cartBadge.innerText = (currentCount + 1).toString();
                } else {
                    window.dispatchEvent(new CustomEvent('cart:updated'));
                }
            } else {
                setNotification({
                    show: true,
                    message: '❌ GAGAL MENAMBAHKAN PRODUK!'
                });
            }
        })
        .catch(err => {
            console.error('Error saat add to cart:', err);
        });
    };

    return (
        <article className="product-card" style={{
            border: "3px solid #000",
            backgroundColor: "#fff",
            boxShadow: "8px 8px 0px #000",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Poppins', sans-serif",
            position: "relative" // Dibutuhkan agar peletakan pop-up tidak berantakan
        }}>
            
            {/* 🔴 KOMPONEN POP-UP NOTIFIKASI NEOBRUTALISM VOKSVIBE */}
            {notification.show && (
                <div style={{
                    position: "absolute",
                    top: "15px",
                    left: "15px",
                    right: "15px",
                    zIndex: 99,
                    backgroundColor: notification.message.includes('⚡') ? "#FFCC00" : "#FF0000", // Kuning jika sukses, merah jika gagal
                    color: "#000",
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0px #000",
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: "900",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    animation: "fadeIn 0.2s ease"
                }}>
                    {notification.message}
                </div>
            )}

            <div className="product-card__image-wrap" style={{
                width: "100%",
                height: "240px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                borderBottom: "3px solid #000",
                marginBottom: "15px",
                overflow: "hidden",
                position: "relative"
            }}>
                <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="product-card__image" 
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
                {product.is_sale && (
                    <span className="product-card__label" style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "#FF0000",
                        color: "#fff",
                        padding: "4px 8px",
                        fontWeight: "900",
                        fontSize: "11px",
                        border: "2px solid #000"
                    }}>
                        SALE
                    </span>
                )}
            </div>

            <div className="product-card__meta" style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                textTransform: "uppercase",
                marginBottom: "8px"
            }}>
                <span>{product.category}</span>
                <span style={{ color: "#000", fontWeight: "700" }}>{'\u2605'} {Number(product.rating || 0).toFixed(1)}</span>
            </div>

            <h3 className="product-card__title" style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "16px",
                fontWeight: "900",
                textTransform: "uppercase",
                margin: "0 0 10px 0",
                color: "#000",
                minHeight: "42px",
                lineHeight: "1.3"
            }}>
                {product.name}
            </h3>

            <p className="product-card__description" style={{
                fontSize: "13px",
                color: "#555",
                margin: "0 0 15px 0",
                display: "-webkit-box",
                WebkitLineClamp: "2",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "36px"
            }}>
                {product.description}
            </p>

            <div className="product-card__price-row" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderTop: "2px dashed #ccc",
                paddingTop: "12px"
            }}>
                <div>
                    <strong style={{ fontSize: "15px", fontWeight: "800", color: "#000" }}>{formatRupiah(product.price)}</strong>
                    {product.original_price && (
                        <span className="product-card__old-price" style={{
                            fontSize: "12px",
                            textDecoration: "line-through",
                            color: "#999",
                            marginLeft: "8px"
                        }}>
                            {formatRupiah(product.original_price)}
                        </span>
                    )}
                </div>
                <span className="product-card__stock" style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>
                    {product.stock} stok
                </span>
            </div>

            <form 
                onSubmit={handleAddToCartSubmit}
                className="product-card__form" 
                style={{ marginTop: "auto" }}
            >
                <button type="submit" className="action-button" style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "3px solid #000",
                    fontWeight: "800",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: "4px 4px 0px #FFCC00",
                    transition: "all 0.1s ease"
                }}
                onMouseEnter={(e) => { e.target.style.transform = "translate(-2px, -2px)"; e.target.style.boxShadow = "6px 6px 0px #FFCC00"; }}
                onMouseLeave={(e) => { e.target.style.transform = "translate(0, 0)"; e.target.style.boxShadow = "4px 4px 0px #FFCC00"; }}
                >
                    Add to Cart
                </button>
            </form>
        </article>
    );
}