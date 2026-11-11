<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Old URL → current URL after a published item's slug changed (Step 4 §11.6, C9).
 */
#[Fillable(['old_path', 'new_path'])]
class SlugRedirect extends Model {}
