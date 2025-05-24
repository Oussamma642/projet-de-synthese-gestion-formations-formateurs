<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'ista_id',
        'user_id',
        'filiere_id',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir la formation associée à ce participant.
     */
    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * Obtenir l'ISTA associé à ce participant.
     */
    public function ista()
    {
        return $this->belongsTo(Ista::class);
    }

    /**
     * Obtenir l'utilisateur associé à ce participant.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtenir la filière associée à ce participant.
     */
    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }
}