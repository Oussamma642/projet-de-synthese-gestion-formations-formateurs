<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('cdcs', function (Blueprint $table) {
            // 1) add the column:
            $table->foreignId('branche_id')
                  ->nullable()                  // if you want it optional; remove if NOT NULL
                  ->constrained('branches')     // references `id` on `branches`
                  ->onDelete('cascade');        // cascade delete if branch is deleted
        });
    }

    public function down()
    {
        Schema::table('cdcs', function (Blueprint $table) {
            // drop the FK constraint first...
            $table->dropForeign(['branche_id']);
            // ...then drop the column
            $table->dropColumn('branche_id');
        });
    }
};