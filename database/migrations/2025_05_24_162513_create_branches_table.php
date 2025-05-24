<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();                  // Primary key
            $table->string('nom', 100);    // Your "nom" column
            $table->timestamps();          // created_at & updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('branches');
    }
};