import { useState, useEffect } from 'react';
import { page } from '../config/page';
import { formatRupiah } from '../utils/format';
import { oldValue } from '../utils/oldValue';
import Banner from '../components/ui/Banner';
import Csrf from '../components/forms/Csrf';
import Field from '../components/forms/Field';
import SummaryLine from '../components/ui/SummaryLine';
import SummaryRow from '../components/ui/SummaryRow';

export default function Checkout({ items, subtotal }) {
    const user = page.auth.user;
    
    // Default kita set ke 'qris' untuk otomatisasi Xendit
    const [selectedPayment, setSelectedPayment] = useState('qris'); 
    
    // --- STATE FITUR ONGKIR ---
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [shippingServices, setShippingServices] = useState([]);
    const [selectedServicePrice, setSelectedServicePrice] = useState(0);

    // Ambil data kota dari backend Laravel saat komponen pertama kali di-render
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/shipping/cities')
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    setCities(response.data);
                }
            })
            .catch(err => console.error("Gagal memuat data kota:", err));
    }, []);

    // Fungsi otomatis saat user memilih kota tujuan
    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
        
        if (!cityId) {
            setShippingServices([]);
            setSelectedServicePrice(0);
            return;
        }

        fetch('http://127.0.0.1:8000/api/shipping/cost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destination_id: cityId,
                weight: 1000 
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                setShippingServices(response.data);
                if (response.data.length > 0) {
                    setSelectedServicePrice(response.data[0].cost[0].value);
                }
            }
        })
        .catch(err => console.error("Gagal menghitung ongkos kirim:", err));
    };

    const handleServiceChange = (e) => {
        const price = parseInt(e.target.value, 10);
        setSelectedServicePrice(price);
    };

    const grandTotal = subtotal + selectedServicePrice;

    return (
        <>
            <Banner mode="gold" eyebrow="Final Step" title="CHECKOUT" copy="Simpan alamat dan pilih metode pengiriman untuk membuat order." />
            <section className="section-block two-column">
                <form method="POST" action={page.routes.checkoutStore} className="panel-card stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Csrf />
                    
                    <input type="hidden" name="payment_method" value={selectedPayment} />
                    <input type="hidden" name="shipping_cost" value={selectedServicePrice} />

                    <div className="form-grid">
                        <Field label="Nama Penerima"><input type="text" defaultValue={user.name} disabled /></Field>
                        <Field label="Email"><input type="email" defaultValue={user.email} disabled /></Field>
                    </div>
                    
                    <Field label="Alamat Pengiriman">
                        <textarea name="shipping_address" rows="5" required defaultValue={oldValue('shipping_address', user.address)} />
                    </Field>

                    {/* FIELD KOTA TUJUAN */}
                    <Field label="Kota Tujuan">
                        <select name="shipping_city_id" value={selectedCity} onChange={handleCityChange} required>
                            <option value="">-- Pilih Kota Tujuan --</option>
                            {cities.map(city => (
                                <option key={city.city_id} value={city.city_id}>
                                    {city.type} {city.city_name} ({city.postal_code})
                                </option>
                            ))}
                        </select>
                    </Field>
                    
                    {/* FIELD METODE PENGIRIMAN */}
                    <Field label="Metode Pengiriman">
                        <select 
                            name="shipping_method" 
                            required 
                            onChange={handleServiceChange}
                            disabled={shippingServices.length === 0}
                        >
                            {shippingServices.length === 0 ? (
                                <option value="">Silakan pilih kota tujuan terlebih dahulu</option>
                            ) : (
                                shippingServices.map((service, index) => (
                                    <option key={index} value={service.cost[0].value}>
                                        JNE {service.service} ({service.description}) - {formatRupiah(service.cost[0].value)} [Estimasi: {service.cost[0].etd}]
                                    </option>
                                ))
                            )}
                        </select>
                    </Field>

                    {/* FIELD METODE PEMBAYARAN (AKTIF KEMBALI) */}
                    <Field label="Metode Pembayaran">
                        <select 
                            value={selectedPayment} 
                            onChange={(e) => setSelectedPayment(e.target.value)}
                            required
                        >
                            <option value="qris">QRIS / E-Wallet (Otomatis Xendit)</option>
                            <option value="cod">Cash on Delivery (COD / Manual)</option>
                        </select>
                    </Field>

                    {/* BOX DETAIL PEMBAYARAN - HANYA MUNCUL JIKA MEMILIH COD */}
                    {selectedPayment === 'cod' && (
                        <div style={{ 
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '24px', 
                            border: '3px solid #000', 
                            borderRadius: '12px', 
                            backgroundColor: '#fcfcfc',
                            boxShadow: '4px 4px 0px #000',
                            marginTop: '5px',
                            marginBottom: '5px'
                        }}>
                            <div style={{ width: '100%' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#000', margin: '0 0 8px 0' }}>Bayar di Tempat (COD)</p>
                                <p style={{ margin: '0', fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                                    Pesanan Anda akan langsung kami kemas. Harap siapkan uang tunai yang pas dan bayarkan langsung kepada petugas kurir saat paket Anda tiba di lokasi tujuan.
                                </p>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="action-button action-button--dark">Buat Pesanan</button>
                </form>
                
                <aside className="summary-card">
                    <p className="eyebrow">Order Preview</p>
                    <h2>{items.length} produk</h2>
                    {items.map((item) => (
                        <SummaryLine key={item.product.id} label={`${item.product.name} x${item.quantity}`} value={formatRupiah(item.line_total)} />
                    ))}
                    <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
                    <SummaryRow label="Ongkos Kirim" value={formatRupiah(selectedServicePrice)} />
                    <hr style={{ border: '1px solid #000', margin: '12px 0' }} />
                    <SummaryRow label="Total Pembayaran" value={formatRupiah(grandTotal)} />
                </aside>
            </section>
        </>
    );
}