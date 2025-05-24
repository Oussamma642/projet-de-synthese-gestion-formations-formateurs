<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    use HasFactory;

    protected $table = 'filieres';

    protected $fillable = [
        'name',
        'branche_id'
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir le chef de centre associé à cette filière.
     */
    /**
     * Obtenir les participants associés à cette filière.
     */
    public function participants()
    {
        return $this->hasMany(Participant::class);
    }
    
    public function branche()
    {
        return $this->belongsTo(Branche::class);
    }
}