<?php

namespace App\Enums;

/**
 * Spatie role names (Step 4 §15).
 */
enum Role: string
{
    case SuperAdmin = 'super-admin';
    case Manager = 'manager';
    case ServiceAdvisor = 'service-advisor';
    case Customer = 'customer';

    /**
     * @return list<string>
     */
    public static function staffRoles(): array
    {
        return [self::SuperAdmin->value, self::Manager->value, self::ServiceAdvisor->value];
    }
}
