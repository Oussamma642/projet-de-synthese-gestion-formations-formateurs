<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Animateur extends Model
{
    use HasFactory;

    protected $table = 'animateurs';

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
     * Obtenir l'utilisateur associé à cet animateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtenir les formations associées à cet animateur.
     */
    public function formations()
    {
        return $this->hasOne(Formation::class);
    }
}