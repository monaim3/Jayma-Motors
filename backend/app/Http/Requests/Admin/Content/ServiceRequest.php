<?php

namespace App\Http\Requests\Admin\Content;

use App\Enums\ContentStatus;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * POST /admin/services (create: name required) and PATCH /admin/services/{id}
 * (edit: only the fields sent are checked). Slug is generated from the name when left empty.
 */
class ServiceRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('slug'))) {
            $this->merge(['slug' => strtolower(trim($this->input('slug'))) ?: null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $creating = $this->isMethod('post');
        $sometimes = $creating ? [] : ['sometimes'];
        $service = $this->route('service');

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:120'],
            'slug' => [
                'nullable', 'string', 'max:140', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('services', 'slug')->ignore($service?->id),
            ],
            'status' => [...$sometimes, 'required', Rule::enum(ContentStatus::class)],
            'is_bookable' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'short_description' => ['nullable', 'string', 'max:300'],
            'headline' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:50000'],
            'icon' => ['nullable', Rule::in(Service::ICONS)],
            'duration' => ['nullable', 'string', 'max:60'],
            // Blank rows from the editor are allowed here and dropped by ServiceCatalog.
            'included' => ['nullable', 'array', 'max:20'],
            'included.*' => ['nullable', 'string', 'max:150'],
            'signs' => ['nullable', 'array', 'max:20'],
            'signs.*' => ['nullable', 'string', 'max:150'],
            'faqs' => ['nullable', 'array', 'max:15'],
            'faqs.*.q' => ['required', 'string', 'max:200'],
            'faqs.*.a' => ['required', 'string', 'max:1000'],
            'image_path' => ['nullable', 'string', 'max:255'],
            // Alt text is required with an image (Step 3 §10, accessibility).
            'image_alt' => ['nullable', 'string', 'max:150', 'required_with:image_path'],
            'meta_title' => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:170'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.regex' => 'Use lowercase letters, numbers and single dashes only, e.g. engine-repair.',
            'slug.unique' => 'Another service already uses this URL.',
            'image_alt.required_with' => 'Describe the photo for people who cannot see it.',
            'icon.in' => 'Choose one of the available icons.',
        ];
    }
}
