<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'description',
    ];

    /**
     * Indique au modèle que la table n'utilise pas les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Obtenir les utilisateurs associés à ce rôle.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}