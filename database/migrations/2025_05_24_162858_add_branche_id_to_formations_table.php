<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('formations', function (Blueprint $table) {
            // 1) add branche_id (nullable if existing rows have no branch yet)
            $table->foreignId('branche_id')
                  ->nullable()
                  ->constrained('branches')  // references branches.id
                  ->onDelete('cascade');     // delete a formation if its branch is deleted
        });

        // OPTIONAL: backfill existing rows to a default branch:
        // \DB::table('formations')->update(['branche_id' => 1]);
    }

    public function down()
    {
        Schema::table('formations', function (Blueprint $table) {
            // 1) drop the FK
            $table->dropForeign(['branche_id']);
            // 2) drop the column
            $table->dropColumn('branche_id');
        });
    }
};