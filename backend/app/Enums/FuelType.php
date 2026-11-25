<?php

namespace App\Enums;

/** Vehicle fuel type (Step 4 §5.2). */
enum FuelType: string
{
    case Petrol = 'petrol';
    case Octane = 'octane';
    case Diesel = 'diesel';
    case Cng = 'cng';
    case Hybrid = 'hybrid';
    case Electric = 'electric';
    case Other = 'other';
}
