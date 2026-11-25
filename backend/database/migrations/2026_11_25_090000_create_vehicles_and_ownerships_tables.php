<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vehicles and their ownership history (Step 4 §5.2, §5.3), and the
 * appointments.vehicle_id foreign key that B3 left for this milestone.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete(); // current owner
            $table->foreignId('vehicle_brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('brand_name', 60);
            $table->string('model', 80);
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('registration_number', 40);
            $table->string('registration_number_normalized', 40)->unique();
            $table->string('chassis_number', 40)->nullable()->unique();
            $table->string('color', 30)->nullable();
            $table->string('fuel_type', 20)->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'archived_at']);
        });

        Schema::create('vehicle_ownerships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable(); // NULL = current owner
            $table->foreignId('transferred_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['vehicle_id', 'ended_at']);
            $table->index('customer_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['vehicle_id']);
        });
        Schema::dropIfExists('vehicle_ownerships');
        Schema::dropIfExists('vehicles');
    }
};
