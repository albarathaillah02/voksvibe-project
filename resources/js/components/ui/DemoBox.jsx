export default function DemoBox({ title, text }) {
    return (
        <div className="demo-box">
            <strong>{title}</strong>
            <span>{text}</span>
        </div>
    );
}
