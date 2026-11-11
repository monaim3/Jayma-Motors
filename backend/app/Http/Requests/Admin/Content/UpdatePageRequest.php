<?php

namespace App\Http\Requests\Admin\Content;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * PATCH /admin/pages/{id} — pages are only edited, never created or deleted.
 */
class UpdatePageRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('slug'))) {
            $this->merge(['slug' => strtolower(trim($this->input('slug')))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'slug' => [
                'sometimes', 'required', 'string', 'max:170', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('pages', 'slug')->ignore($this->route('page')?->id),
            ],
            'status' => ['sometimes', 'required', Rule::enum(ContentStatus::class)],
            'body' => ['nullable', 'string', 'max:200000'],
            'hero_image_path' => ['nullable', 'string', 'max:255'],
            'hero_image_alt' => ['nullable', 'string', 'max:150', 'required_with:hero_image_path'],
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
            'slug.regex' => 'Use lowercase letters, numbers and single dashes only, e.g. about-us.',
            'slug.unique' => 'Another page already uses this URL.',
            'hero_image_alt.required_with' => 'Describe the photo for people who cannot see it.',
        ];
    }
}
