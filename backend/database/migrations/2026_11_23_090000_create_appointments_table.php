<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Appointments (Step 4 §7.1). Contact and vehicle fields are snapshots of
 * what was entered, so a booking stays correct if the customer later edits
 * their profile. vehicle_id gets its foreign key in B4 (vehicles table).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('vehicle_id')->nullable()->index();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();

            $table->string('contact_name', 100);
            $table->string('contact_phone', 20)->index();
            $table->string('contact_email', 191)->nullable();
            $table->string('vehicle_brand', 60);
            $table->string('vehicle_model', 80);
            $table->string('registration_number', 40);
            $table->string('registration_number_normalized', 40);

            $table->date('preferred_date');
            $table->string('time_note', 50)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('pending');
            $table->string('source', 20)->default('website');
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['preferred_date', 'status']);
            $table->index(['status', 'created_at']);
            // Duplicate-booking check (Step 3 §6.1).
            $table->index(['registration_number_normalized', 'preferred_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
