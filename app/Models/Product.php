<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    public const CATEGORIES = [
        'T-SHIRT',
        'SHIRT',
        'HOODIE',
        'JACKET',
        'ACCESSORY',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'slug',
        'category',
        'name',
        'description',
        'price',
        'original_price',
        'rating',
        'stock',
        'image_url',
        'is_trending',
        'is_sale',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'original_price' => 'integer',
            'rating' => 'decimal:1',
            'stock' => 'integer',
            'is_trending' => 'boolean',
            'is_sale' => 'boolean',
        ];
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $search = trim((string) $search);

        return $query->when($search !== '', function (Builder $builder) use ($search): void {
            $builder->where(function (Builder $nested) use ($search): void {
                $nested
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        });
    }
}
