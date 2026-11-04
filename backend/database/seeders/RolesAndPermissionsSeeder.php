<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionName;
use App\Enums\Role as RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Creates roles and permissions and syncs the default assignment (Step 4 §15).
     * Safe to run again: existing rows are reused.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (RoleName::cases() as $role) {
            Role::findOrCreate($role->value, 'web');
        }

        $byRole = [];

        foreach (PermissionName::cases() as $permission) {
            Permission::findOrCreate($permission->value, 'web');

            foreach ($permission->defaultRoles() as $role) {
                $byRole[$role->value][] = $permission->value;
            }
        }

        // Seeders run without model events, so the permission cache must be cleared manually.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (RoleName::cases() as $role) {
            Role::findByName($role->value, 'web')->syncPermissions($byRole[$role->value] ?? []);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
