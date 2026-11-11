<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Page;
use App\Models\Service;
use Illuminate\Database\Seeder;

/**
 * Starting content (Step 4 §16): the 8 services and the About / Terms / Privacy
 * pages exactly as the website showed them on 2026-11-11 (exported from the
 * frontend into database/seeders/data). Only missing rows are added, so running
 * it again never overwrites edits made in the admin panel.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->services();
        $this->pages();
    }

    private function services(): void
    {
        $rows = json_decode(file_get_contents(__DIR__.'/data/services.json'), true, flags: JSON_THROW_ON_ERROR);

        foreach ($rows as $row) {
            Service::withTrashed()->firstOrCreate(['slug' => $row['slug']], [
                'name' => $row['name'],
                'short_description' => $row['short_description'],
                'headline' => $row['headline'],
                'description' => '<p>'.e($row['intro']).'</p>',
                'icon' => $row['icon'],
                'duration' => $row['duration'],
                'included' => $row['included'],
                'signs' => $row['signs'],
                'faqs' => $row['faqs'],
                'image_path' => $row['image_path'],
                'image_alt' => $row['image_alt'],
                'is_bookable' => true,
                'status' => ContentStatus::Published,
                'sort_order' => $row['sort_order'],
                'meta_title' => "{$row['name']} in Dhaka",
                'meta_description' => mb_strimwidth($row['intro'], 0, 170, '…'),
            ]);
        }
    }

    private function pages(): void
    {
        $pages = [
            'about' => [
                'title' => 'About Us',
                'slug' => 'about',
                'hero_image_path' => '/videos/why-jayma-poster.jpg',
                'hero_image_alt' => 'Inside the Jayma Motors workshop: cars lined up under the steel roof',
                'meta_description' => 'Jayma Motors has cared for cars in Vatara, Dhaka since 2008 — a 60,000 sq ft multi-brand workshop with certified technicians, a paint booth and genuine Shell Helix oils.',
            ],
            'terms' => [
                'title' => 'Terms & Conditions',
                'slug' => 'terms',
                'meta_description' => "The terms for booking and using Jayma Motors' car service and repair workshop in Vatara, Dhaka.",
            ],
            'privacy' => [
                'title' => 'Privacy Policy',
                'slug' => 'privacy',
                'meta_description' => 'How Jayma Motors collects, uses and protects your personal information.',
            ],
        ];

        foreach ($pages as $key => $page) {
            Page::firstOrCreate(['key' => $key], [
                ...$page,
                'body' => trim(file_get_contents(__DIR__."/data/pages/{$key}.html")),
                'status' => ContentStatus::Published,
            ]);
        }
    }
}
