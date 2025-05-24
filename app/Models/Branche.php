<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Formation;
class Branche extends Model
{
    use HasFactory;
    protected $fillable = ['nom'];
    
    public function formations()
    {
         return $this->hasOne(Formation::class);
    }
    public function filieres()
    {
        return $this->hasMany(Filiere::class);
    }
    public function cdc()
    {
        return $this->hasOne(Cdc::class);
    }
}