import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyTitle, emptyText }) {
    if (!products?.length) {
        return (
            <div className="empty-state" style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                <h3>{emptyTitle}</h3>
                <p>{emptyText}</p>
            </div>
        );
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "30px",
            width: "100%"
        }}>
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
    );
}