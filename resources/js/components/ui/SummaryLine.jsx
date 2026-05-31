export default function SummaryLine({ label, value }) {
    return (
        <div className="summary-line-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}
