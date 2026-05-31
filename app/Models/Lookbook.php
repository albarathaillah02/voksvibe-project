<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lookbook extends Model
{
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'image_url',
        'caption',
        'season_label',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
