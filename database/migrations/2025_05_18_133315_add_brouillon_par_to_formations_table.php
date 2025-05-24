<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->boolean('brouillon_par_cdc')
                  ->default(false)
                  ->after('redigee_par_drif'); // ou après le champ de votre choix
            $table->boolean('brouillon_par_drif')
                  ->default(false)
                  ->after('brouillon_par_cdc');
        });
    }

    public function down()
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->dropColumn(['brouillon_par_cdc', 'brouillon_par_drif']);
        });
    }
};