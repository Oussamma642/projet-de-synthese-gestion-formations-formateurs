<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dr extends Model
{
    use HasFactory;

    protected $table = 'drs';

    protected $fillable = [
        'user_id',
        'region_id',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir l'utilisateur associé à ce directeur régional.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtenir la région associée à ce directeur régional.
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}