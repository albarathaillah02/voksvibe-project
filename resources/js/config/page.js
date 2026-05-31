// Helper bersih untuk membaca data global langsung dari cetakan react.blade.php
const getVoksvibePageData = () => {
    return window.__VOKSVIBE_PAGE__ || {};
};

export const page = {
    // 1. MEMBACA PROPERTI HALAMAN UTAMA (Termasuk props dari controller Laravel)
    get component() {
        return getVoksvibePageData().component || '';
    },

    get props() {
        return getVoksvibePageData().props || {};
    },

    get flash() {
        return getVoksvibePageData().flash || { status: null, errors: [] };
    },

    get old() {
        return getVoksvibePageData().old || {};
    },

    get csrfToken() {
        return getVoksvibePageData().csrfToken || '';
    },

    // 2. KODE MENYELAMAT: MENGEMBALIKAN ALUR AUTENTIKASI, ROUTE, & QUERY BAWAAN
    get auth() {
        return getVoksvibePageData().auth || { user: null, isAdmin: false };
    },

    get routes() {
        // Menggabungkan rute dari backend dengan rute default/fallback front-end
        const backendRoutes = getVoksvibePageData().routes || {};
        return {
            home: '/',
            about: '/about', // <-- Rute About ditambahkan sebagai fallback aman
            ...backendRoutes
        };
    },

    get currentRoute() {
        return getVoksvibePageData().currentRoute || '';
    },

    get query() {
        return getVoksvibePageData().query || {};
    },

    // 3. MENYINKRONKAN KODE KERANJANG DAN NAVIGASI KELOMPOKMU KE DALAM STRUKTUR UTAMA
    get sharedCartCount() {
        return getVoksvibePageData().sharedCartCount ?? 0;
    },

    get categoryNavigation() {
        return getVoksvibePageData().categoryNavigation || [];
    }
};