export default function Banner({ mode, eyebrow, title, copy }) {
    return (
        <section className={`banner banner--${mode}`}>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{copy}</p>
        </section>
    );
}
