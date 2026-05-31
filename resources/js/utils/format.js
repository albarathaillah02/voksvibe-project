export function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

export function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
