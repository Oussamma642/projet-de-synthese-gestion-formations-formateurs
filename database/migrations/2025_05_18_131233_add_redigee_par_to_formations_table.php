<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('formations', function (Blueprint $table) {
            // place les colonnes juste après validated_by_drif (optionnel)
            $table->boolean('redigee_par_cdc')
                  ->default(false)
                  ->after('validated_by_drif');
            $table->boolean('redigee_par_drif')
                  ->default(false)
                  ->after('redigee_par_cdc');
        });
    }

    public function down()
    {
        Schema::table('formations', function (Blueprint $table) {
            $table->dropColumn(['redigee_par_cdc', 'redigee_par_drif']);
        });
    }
};