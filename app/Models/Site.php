<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city_id',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir la ville associée à ce site.
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Obtenir les formations associées à ce site.
     */
    public function formations()
    {
        return $this->hasOne(Formation::class);
    }
}