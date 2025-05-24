<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
    ];

    /**
     * Obtenir les villes associées à cette région.
     */
    public function cities()
    {
        return $this->hasMany(City::class);
    }

    /**
     * Obtenir les directeurs régionaux associés à cette région.
     */
    public function drs()
    {
        return $this->hasOne(Dr::class);
    }
}