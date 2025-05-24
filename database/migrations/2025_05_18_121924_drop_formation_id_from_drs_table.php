<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up()
    {
        Schema::table('drs', function (Blueprint $table) {
            $table->dropForeign(['formation_id']);
            $table->dropColumn('formation_id');
        });
    }

    public function down()
    {
        Schema::table('drs', function (Blueprint $table) {
            $table->foreignId('formation_id')
                ->nullable()
                ->constrained()
                ->after('region_id');
        });
    }

};