export default function Field({ label, children, full = false }) {
    return (
        <label className={`field ${full ? 'field--full' : ''}`}>
            <span>{label}</span>
            {children}
        </label>
    );
}
