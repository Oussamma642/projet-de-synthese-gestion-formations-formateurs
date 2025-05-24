<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'region_id',
    ];

    /**
     * Obtenir la région à laquelle appartient cette ville.
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Obtenir les ISTA associés à cette ville.
     */
    public function istas()
    {
        return $this->hasMany(Ista::class);
    }

    /**
     * Obtenir les sites associés à cette ville.
     */
    public function sites()
    {
        return $this->hasMany(Site::class);
    }

    /**
     * Obtenir les formations associées à cette ville.
     */
    public function formations()
    {
        return $this->hasOne(Formation::class);
    }
}