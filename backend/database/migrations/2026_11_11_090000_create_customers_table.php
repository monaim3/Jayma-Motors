<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Customer profiles, online or walk-in (Step 4 §4.2). Online sign-up creates a
 * users row plus a customers row with user_id; a walk-in has user_id = NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('name', 100)->index();
            // Not unique: an unverified sign-up may share a walk-in's phone until staff link them (Step 3 §4.4).
            $table->string('phone', 20)->index();
            $table->string('email', 191)->nullable()->index();
            $table->string('address', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('linked_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
