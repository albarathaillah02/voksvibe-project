import { page } from './config/page';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FlashMessages from './components/layout/FlashMessages';
import Home from './pages/Home';
import Grid from './pages/Grid';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Lookbook from './pages/Lookbook';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';

const pages = {
    Home,
    Grid,
    Cart,
    Checkout,
    Lookbook,
    Login,
    Register,
    Profile,
    Orders,
    AdminDashboard,
    About, // ✅ SEKARANG SUDAH DIDAFTARKAN DI SINI
};

export default function Root() {
    const PageComponent = pages[page.component] || Home;

    return (
        <>
            <Header />
            <main className="page-shell">
                <FlashMessages />
                <PageComponent {...page.props} />
            </main>
            <Footer />
        </>
    );
}