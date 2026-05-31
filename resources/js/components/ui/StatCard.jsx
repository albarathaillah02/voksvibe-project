export default function StatCard({ label, value }) {
    return (
        <article className="stat-card">
            <p>{label}</p>
            <h2>{value}</h2>
        </article>
    );
}
