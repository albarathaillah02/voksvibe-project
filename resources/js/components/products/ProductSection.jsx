import ProductCard from './ProductCard';

export default function ProductSection({ eyebrow, title, link, products }) {
    return (
        /* Tambahkan id="produk-section" di bawah ini */
        <section id="produk-section" className="section-block" style={{ padding: "60px 8% 20px 8%" }}>
            <div className="section-heading" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderBottom: "3px solid #000",
                paddingBottom: "10px",
                marginBottom: "30px"
            }}>
                <div>
                    <p className="eyebrow" style={{ textTransform: "uppercase", fontSize: "12px", letterSpacing: "2px", margin: 0, fontWeight: "600" }}>{eyebrow}</p>
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "32px", fontWeight: "900", margin: "5px 0 0 0" }}>{title}</h2>
                </div>
                {link && <a href={link} className="text-link" style={{ fontWeight: "700", color: "#000", textDecoration: "underline" }}>Lihat semua</a>}
            </div>
            
            <div className="product-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "30px"
            }}>
                {products?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}