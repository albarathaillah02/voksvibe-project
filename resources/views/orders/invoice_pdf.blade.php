<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice Resmi VOKSVIBE</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2d3748; font-size: 11pt; line-height: 1.5; padding: 10px; }
        .header-table { width: 100%; border-bottom: 3px solid #ffcc00; padding-bottom: 15px; margin-bottom: 20px; }
        .brand { font-size: 26pt; font-weight: 900; color: #1a202c; letter-spacing: 0.5px; }
        .brand span { color: #ffcc00; }
        .invoice-title { font-size: 16pt; font-weight: bold; text-align: right; color: #4a5568; }
        .meta-table { width: 100%; margin-bottom: 30px; }
        .meta-table td { border: none; padding: 0; vertical-align: top; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th { background-color: #1a202c; color: #ffffff; padding: 10px 8px; font-size: 10pt; text-transform: uppercase; text-align: left; }
        .items-table td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-container { float: right; width: 40%; margin-top: 20px; }
        .total-table { width: 100%; border-collapse: collapse; }
        .total-table td { padding: 6px; font-size: 10pt; }
        .grand-total { font-weight: bold; font-size: 11pt; border-top: 2px solid #1a202c; background-color: #f7fafc; }
        .footer { text-align: center; margin-top: 80px; font-size: 9pt; color: #718096; border-top: 1px solid #edf2f7; padding-top: 15px; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="border: none;">
                <div class="brand">VOKS<span>VIBE</span></div>
                <div style="font-size: 9.5pt; color: #718096; margin-top: 4px;">Malang, East Java, Indonesia</div>
            </td>
            <td style="border: none;" class="invoice-title">
                NOTA PENJUALAN
                <div style="font-size: 10.5pt; font-weight: normal; color: #718096; margin-top: 6px;">Kode: {{ $transaction->order_code }}</div>
            </td>
        </tr>
    </table>

    <table class="meta-table">
        <tr>
            <td style="width: 55%;">
                <strong style="color: #1a202c;">Penerima / Pembeli:</strong><br>
                <span style="font-size: 11pt; font-weight: bold;">{{ $transaction->user->name }}</span><br>
                Email: {{ $transaction->user->email }}<br>
                Alamat Kirim: {{ $transaction->shipping_address ?? 'Alamat Belum Diisi' }}
            </td>
            <td style="width: 45%;" class="text-right">
                <strong>Tanggal Transaksi:</strong><br>
                {{ $transaction->created_at->format('d F Y, H:i') }} WIB<br>
                <strong>Status Pembayaran:</strong><br>
                <span style="color: #2b6cb0; font-weight: bold; text-transform: uppercase;">{{ $transaction->status }}</span>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 8%;">No</th>
                <th style="width: 47%;">Nama Item Produk</th>
                <th class="text-right" style="width: 15%;">Harga Satuan</th>
                <th class="text-center" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 20%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transaction->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>
                    <strong style="color: #1a202c;">{{ $item->product_name }}</strong><br>
                    <span style="font-size: 8.5pt; color: #718096;">Kategori: {{ $item->product_category }}</span>
                </td>
                <td class="text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">Rp {{ number_format($item->line_total, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-container">
        <table class="total-table">
            <tr>
                <td>Subtotal Produk:</td>
                <td class="text-right">Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Biaya Pengiriman:</td>
                <td class="text-right">Rp {{ number_format($transaction->shipping_cost ?? 0, 0, ',', '.') }}</td>
            </tr>
            <tr class="grand-total">
                <td>Total Bayar:</td>
                <td class="text-right">Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <div style="clear: both;"></div>

    <div class="footer">
        Terima kasih telah berbelanja di VOKSVIBE!<br>
        Harap simpan nota digital PDF ini sebagai bukti transaksi resmi kelompok Anda.
    </div>

</body>
</html>