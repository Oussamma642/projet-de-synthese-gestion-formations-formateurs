<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255)->notNull();
            $table->text('description')->notNull();
            $table->date('start_date')->notNull();
            $table->date('end_date')->notNull();
            $table->foreignId('animateur_id')->constrained()->onDelete('cascade');
            $table->foreignId('city_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->enum('formation_status', ['draft', 'redigee', 'validee'])->default('draft');
            $table->boolean('validated_by_cdc')->default(false);
            $table->boolean('validated_by_drif')->default(false);
            $table->boolean('redigee_par_cdc')->default(false);
            $table->boolean('redigee_par_drif')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
