<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cdc extends Model
{
    use HasFactory;

    protected $table = 'cdcs';

    protected $fillable = [
        'user_id',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir l'utilisateur associé à ce chef de centre.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtenir les filières associées à ce chef de centre.
     */
    public function filieres()
    {
        return $this->hasMany(Filiere::class, 'cdc_id');
    }
}