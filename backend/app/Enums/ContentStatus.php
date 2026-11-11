<?php

namespace App\Enums;

/**
 * Draft or Published; only Published is public (Step 3 §10).
 */
enum ContentStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
}
