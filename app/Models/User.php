<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    /**
     * Obtenir le rôle de l'utilisateur.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Obtenir le directeur régional associé à cet utilisateur.
     */
    public function dr()
    {
        return $this->hasOne(Dr::class);
    }

    /**
     * Obtenir le DRIF associé à cet utilisateur.
     */
    public function drif()
    {
        return $this->hasOne(Drif::class);
    }

    /**
     * Obtenir le CDC associé à cet utilisateur.
     */
    public function cdc()
    {
        return $this->hasOne(Cdc::class);
    }

    /**
     * Obtenir l'animateur associé à cet utilisateur.
     */
    public function animateur()
    {
        return $this->hasOne(Animateur::class);
    }

    /**
     * Obtenir le participant associé à cet utilisateur.
     */
    public function participant()
    {
        return $this->hasOne(Participant::class);
    }
}