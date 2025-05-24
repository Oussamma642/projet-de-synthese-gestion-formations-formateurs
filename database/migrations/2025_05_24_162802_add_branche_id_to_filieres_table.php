<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('filieres', function (Blueprint $table) {
            // add branche_id; make it nullable if existing rows don’t have one yet
            $table->foreignId('branche_id')
                  ->nullable()
                  ->constrained('branches')  // references branches.id
                  ->onDelete('cascade');     // adjust as needed
        });
    }

    public function down()
    {
        Schema::table('filieres', function (Blueprint $table) {
            // drop the FK first, then the column
            $table->dropForeign(['branche_id']);
            $table->dropColumn('branche_id');
        });
    }
};