import { page } from '../config/page';
import { capitalize, formatRupiah } from '../utils/format';
import Banner from '../components/ui/Banner';

export default function Orders({ orders }) {
    return (
        <>
            <Banner mode="gold" eyebrow="Order History" title="PESANAN SAYA" copy="Riwayat pesanan user yang tersimpan di database VOKSVIBE." />
            <section className="section-block stack">
                {orders.length ? orders.map((order) => (
                    <article key={order.id} className="order-card">
                        <div className="order-card__header">
                            <div>
                                <p className="eyebrow">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                <h2>{order.order_code}</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Tombol Cetak Invoice PDF */}
                                <a 
                                    href={`/orders/${order.id}/download-invoice`} 
                                    className="action-button"
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#ffcc00',
                                        color: '#111111',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '9pt',
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        border: '2px solid #111111',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#111111';
                                        e.target.style.color = '#ffcc00';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#ffcc00';
                                        e.target.style.color = '#111111';
                                    }}
                                >
                                    Cetak Invoice (PDF)
                                </a>
                                
                                <span className={`status-pill status-pill--${order.status}`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image_url} alt={item.product_name} />
                                    <div>
                                        <strong>{item.product_name}</strong>
                                        <p>{item.product_category} {'\u00b7'} x{item.quantity}</p>
                                    </div>
                                    <strong>{formatRupiah(item.line_total)}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="order-card__footer">
                            <span>{capitalize(order.shipping_method)} {'\u00b7'} {order.shipping_address}</span>
                            <strong>Total {formatRupiah(order.total_amount)}</strong>
                        </div>
                    </article>
                )) : (
                    <div className="empty-state">
                        <h3>Belum ada pesanan.</h3>
                        <p>Kamu bisa mulai belanja dari katalog utama.</p>
                        <a href={page.routes.home} className="action-button">Kembali ke toko</a>
                    </div>
                )}
            </section>
        </>
    );
}