import { useState } from 'react';
import { page } from '../config/page';
import { formatRupiah } from '../utils/format';
import Banner from '../components/ui/Banner';
import Csrf from '../components/forms/Csrf';
import MethodInput from '../components/forms/MethodInput';
import SummaryRow from '../components/ui/SummaryRow';

export default function Cart({ items, subtotal }) {
    const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);

    // 🔍 STATE BARU: Untuk menyimpan teks kata kunci pencarian produk di keranjang
    const [searchQuery, setSearchQuery] = useState('');

    // 🔍 LOGIKA FILTER: Menyaring produk berdasarkan input teks dari user (cek nama & kategori)
    const filteredItems = items.filter(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Banner mode="dark" eyebrow="Shopping Bag" title="KERANJANG" copy="Kelola item sebelum checkout ke pesanan." />
            
            <section className="section-block two-column" style={{ alignItems: "flex-start" }}>
                
                {/* BAGIAN DAFTAR ITEM (KIRI) */}
                <div style={{ flex: "2", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* 🔍 BARIS INPUT PENCARIAN NEOBRUTALISM */}
                    <div className="search-box-wrap">
                        <input 
                            type="text"
                            placeholder="🔍 Cari produk di dalam keranjang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 20px",
                                fontSize: "14px",
                                fontWeight: "600",
                                border: "3px solid #000",
                                backgroundColor: "#fff",
                                boxShadow: "4px 4px 0px #000",
                                outline: "none",
                                fontFamily: "'Poppins', sans-serif"
                            }}
                        />
                    </div>

                    {/* 📦 SCROLL BOX INTERNAL: Membatasi tinggi tumpukan agar tidak memanjang ke bawah */}
                    <div className="stack" style={{ 
                        maxHeight: "600px",    // Batasi tinggi list produk maksimal 600px
                        overflowY: "auto",     // Otomatis aktifkan scroll vertikal jika item melebihi 600px
                        paddingRight: "10px",  // Jarak aman agar scrollbar tidak menempel di card
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px"
                    }}>
                        {filteredItems.length ? filteredItems.map((item) => (
                            <article key={item.product.id} className="cart-card">
                                <img src={item.product.image_url} alt={item.product.name} className="cart-card__image" />
                                <div className="cart-card__body">
                                    <p className="eyebrow">{item.product.category}</p>
                                    <h2>{item.product.name}</h2>
                                    <p>{item.product.description}</p>
                                    <strong>{formatRupiah(item.line_total)}</strong>
                                </div>
                                <div className="cart-card__actions">
                                    <form method="POST" action={`${page.routes.cartBase}/${item.product.id}`} className="cart-inline-form">
                                        <Csrf />
                                        <MethodInput method="PATCH" />
                                        <input type="number" name="quantity" min="1" max={item.product.stock} defaultValue={item.quantity} className="quantity-input" />
                                        <button type="submit" className="chip-button">Update</button>
                                    </form>
                                    <form method="POST" action={`${page.routes.cartBase}/${item.product.id}`}>
                                        <Csrf />
                                        <MethodInput method="DELETE" />
                                        <button type="submit" className="chip-button chip-button--danger">Hapus</button>
                                    </form>
                                </div>
                            </article>
                        )) : (
                            <div className="empty-state" style={{ backgroundColor: "#fff", border: "3px dashed #000" }}>
                                <h3>{searchQuery ? "Produk tidak ditemukan." : "Keranjang masih kosong."}</h3>
                                <p>{searchQuery ? "Coba cari dengan kata kunci baju atau aksesoris VOKSVIBE lainnya." : "Pilih produk dari katalog untuk mulai checkout."}</p>
                                {!searchQuery && (
                                    <a href={page.routes.home} className="action-button">Belanja sekarang</a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 📌 BAGIAN SUMMARY CARD (KANAN) - DIKUNCI STICKY AGAR IKUT LAYAR */}
                <aside className="summary-card" style={{
                    position: "sticky",    // Membuat posisi komponen melekat pintar
                    top: "40px",           // Jarak pembatas aman 40px dari atas browser saat scroll dijalankan
                    zIndex: 10
                }}>
                    <p className="eyebrow">Summary</p>
                    <h2>Ringkasan Belanja</h2>
                    <SummaryRow label="Total Item" value={totalItems} />
                    <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
                    <SummaryRow label="Estimasi Ongkir" value={formatRupiah(15000)} />
                    <a href={page.routes.checkout} className={`action-button ${items.length ? '' : 'is-disabled'}`}>Lanjut Checkout</a>
                </aside>

            </section>
        </>
    );
}