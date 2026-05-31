@php
    use Illuminate\Support\Js;

    $voksvibePage = [
        'component' => $component,
        'props' => $props ?? [],
        'flash' => [
            'status' => session('status'),
            'errors' => $errors->all(),
        ],
        'old' => old(),
        'csrfToken' => csrf_token(),
        'auth' => [
            'user' => auth()->user(),
            'isAdmin' => auth()->user()?->isAdmin() ?? false,
        ],
        'sharedCartCount' => $sharedCartCount,
        'categoryNavigation' => $categoryNavigation,
        'currentRoute' => request()->route()?->getName(),
        'query' => request()->query(),
        'routes' => [
            'home' => route('store.home'),
            'categoryBase' => url('/category'),
            'trending' => route('store.trending'),
            'sale' => route('store.sale'),
            'lookbook' => route('store.lookbook'),
            'login' => route('login'),
            'loginStore' => route('login.store'),
            'register' => route('register'),
            'registerStore' => route('register.store'),
            'logout' => route('logout'),
            'cart' => route('cart.index'),
            'cartBase' => url('/cart'),
            'checkout' => route('checkout.show'),
            'checkoutStore' => route('checkout.store'),
            'profile' => route('account.profile'),
            'profileUpdate' => route('account.profile.update'),
            'orders' => route('account.orders'),
            'admin' => route('admin.dashboard'),
            'adminProductsBase' => url('/admin/products'),
            'adminOrdersBase' => url('/admin/orders'),
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? 'VOKSVIBE' }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,900;1,900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/voksvibe.css') }}">
    
    @viteReactRefresh

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="root"></div>

    <script>
        window.__VOKSVIBE_PAGE__ = {{ Js::from($voksvibePage) }};
    </script>
</body>
</html>