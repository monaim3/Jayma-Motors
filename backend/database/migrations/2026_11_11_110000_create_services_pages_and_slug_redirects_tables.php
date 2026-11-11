<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Services catalogue, editable pages and old-URL redirects (Step 4 §6.1, §11.5, §11.6).
 *
 * services: icon, headline, duration, included, signs and faqs added 2026-11-11
 * (owner approved) so every part of a service page is editable in the admin panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->string('short_description', 300)->nullable();
            $table->string('headline', 150)->nullable();
            $table->longText('description')->nullable();
            $table->string('icon', 40)->nullable();
            $table->string('duration', 60)->nullable();
            $table->json('included')->nullable();
            $table->json('signs')->nullable();
            $table->json('faqs')->nullable();
            $table->string('image_path', 255)->nullable();
            $table->string('image_alt', 150)->nullable();
            $table->boolean('is_bookable')->default(true);
            $table->string('status', 20)->default('draft');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 170)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('title', 150);
            $table->string('slug', 170)->unique();
            $table->longText('body')->nullable();
            $table->string('hero_image_path', 255)->nullable();
            $table->string('hero_image_alt', 150)->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 170)->nullable();
            $table->timestamps();
        });

        Schema::create('slug_redirects', function (Blueprint $table) {
            $table->id();
            $table->string('old_path', 255)->unique();
            $table->string('new_path', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slug_redirects');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('services');
    }
};
