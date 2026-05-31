export default function Footer() {
    return (
        <footer className="site-footer">
            <div>
                <div className="site-footer__brand">VOKSVIBE</div>
                <p className="site-footer__text">Streetwear brand from Indonesia. Stay authentic, stay vibe.</p>
            </div>
            <div className="site-footer__columns">
                <div>
                    <h3 className="site-footer__heading">Bantuan</h3>
                    <p className="site-footer__text">WhatsApp: <a href="https://wa.me/6285741843675?text=Halo%20VOKSVIBE,%20saya%20ingin%20bertanya" target="_blank" rel="noopener noreferrer">+62 857-4184-3675</a></p>
                    <p className="site-footer__text">Instagram: <a href="https://instagram.com/barathllh" target="_blank" rel="noopener noreferrer">@barathllh</a></p>
                </div>
                <div>
                    <h3 className="site-footer__heading">Menu</h3>
                    <p className="site-footer__text">Home</p>
                    <p className="site-footer__text">Category</p>
                    <p className="site-footer__text">Trending Now</p>
                    <p className="site-footer__text">Lookbook</p>
                    <p className="site-footer__text">Sale</p>
                </div>
            </div>
        </footer>
    );
}
