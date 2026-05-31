<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoksvibeStorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_voksvibe_storefront(): void
    {
        $this->seed();

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('VOKSVIBE');
        $response->assertSee('BEST SELLERS');
    }

    public function test_products_api_returns_seeded_products(): void
    {
        $this->seed();

        $response = $this->getJson('/api/products');

        $response->assertOk();
        $response->assertJsonStructure([
            'products' => [
                '*' => ['id', 'slug', 'namaProduk', 'harga', 'foto'],
            ],
        ]);
    }
}
