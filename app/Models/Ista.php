<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ista extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city_id',
        'address',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir la ville à laquelle appartient cet ISTA.
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Obtenir les participants associés à cet ISTA.
     */
    public function participants()
    {
        return $this->hasMany(Participant::class);
    }
}