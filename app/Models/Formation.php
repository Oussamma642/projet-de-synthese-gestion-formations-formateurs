<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'animateur_id',
        'city_id',
        'site_id',
        'formation_status',
        'validated_by_cdc',
        'validated_by_drif',
        'branche_id'
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    /**
     * Indique au modèle que la table utilise les champs de timestamp par défaut.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Obtenir l'animateur associé à cette formation.
     */
    public function animateur()
    {
        return $this->belongsTo(Animateur::class);
    }

    /**
     * Obtenir la ville associée à cette formation.
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Obtenir le site associé à cette formation.
     */
    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * Obtenir les participants associés à cette formation.
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