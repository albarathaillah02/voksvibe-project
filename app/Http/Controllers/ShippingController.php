<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ShippingController extends Controller
{
    // Fungsi untuk mengambil semua daftar kota di Indonesia (Bypass Menggunakan Data Lokal)
    public function getCities()
    {
        // Data tiruan lokal agar aman dari kendala blokir internet/proxy saat demo
        $mockCities = [
            ['city_id' => '151', 'city_name' => 'Jakarta Barat', 'type' => 'Kota', 'postal_code' => '11210'],
            ['city_id' => '152', 'city_name' => 'Jakarta Pusat', 'type' => 'Kota', 'postal_code' => '10110'],
            ['city_id' => '153', 'city_name' => 'Jakarta Selatan', 'type' => 'Kota', 'postal_code' => '12110'],
            ['city_id' => '154', 'city_name' => 'Jakarta Timur', 'type' => 'Kota', 'postal_code' => '13110'],
            ['city_id' => '155', 'city_name' => 'Jakarta Utara', 'type' => 'Kota', 'postal_code' => '14110'],
            ['city_id' => '256', 'city_name' => 'Malang', 'type' => 'Kota', 'postal_code' => '65111'],
            ['city_id' => '444', 'city_name' => 'Surabaya', 'type' => 'Kota', 'postal_code' => '60111'],
            ['city_id' => '23', 'city_name' => 'Bandung', 'type' => 'Kota', 'postal_code' => '40111'],
            ['city_id' => '501', 'city_name' => 'Yogyakarta', 'type' => 'Kota', 'postal_code' => '55111'],
        ];

        return response()->json([
            'success' => true,
            'data' => $mockCities
        ]);
    }

    // Fungsi untuk menghitung biaya ongkos kirim otomatis (Bypass Menggunakan Data Lokal)
    public function checkCost(Request $request)
    {
        $destinationCityId = $request->input('destination_id'); 
        $weightInGrams = $request->input('weight', 1000); 
        
        // Logika tiruan: Ongkir dihitung flat atau berdasarkan simulasi ID kota agar tetap dinamis
        $baseCost = 15000; // Tarif dasar Rp 15.000
        if ($destinationCityId == '256') {
            $baseCost = 8000; // Sesama Malang lebih murah
        }

        $totalCalculatedCost = $baseCost * ceil($weightInGrams / 1000);

        // Struktur data dibuat persis seperti kembalian JSON asli dari RajaOngkir
        $mockCosts = [
            [
                'service' => 'REG',
                'description' => 'Layanan Reguler',
                'cost' => [
                    [
                        'value' => $totalCalculatedCost,
                        'etd' => '2-3 HARI',
                        'note' => ''
                    ]
                ]
            ],
            [
                'service' => 'OKE',
                'description' => 'Ongkos Kirim Ekonomis',
                'cost' => [
                    [
                        'value' => $totalCalculatedCost - 3000,
                        'etd' => '4-5 HARI',
                        'note' => ''
                    ]
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $mockCosts
        ]);
    }
}