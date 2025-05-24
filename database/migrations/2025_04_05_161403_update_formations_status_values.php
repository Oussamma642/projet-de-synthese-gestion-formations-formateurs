<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the enum values to use 'brouillon' instead of 'draft'
        DB::statement("ALTER TABLE formations MODIFY COLUMN formation_status ENUM('brouillon', 'redigee', 'validee') NOT NULL DEFAULT 'brouillon'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the enum values back to original
        DB::statement("ALTER TABLE formations MODIFY COLUMN formation_status ENUM('draft', 'redigee', 'validee') NOT NULL DEFAULT 'draft'");
    }
};
