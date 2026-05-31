export default function Checkbox({ name, label, defaultChecked }) {
    return (
        <label className="checkbox-row">
            <input type="hidden" name={name} value="0" />
            <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} />
            <span>{label}</span>
        </label>
    );
}
