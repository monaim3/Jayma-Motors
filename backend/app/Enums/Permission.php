<?php

namespace App\Enums;

/**
 * Spatie permission names and their default role assignment (Step 4 §15).
 */
enum Permission: string
{
    case DashboardView = 'dashboard.view';
    case AppointmentsManage = 'appointments.manage';
    case EnquiriesManage = 'enquiries.manage';
    case CustomersManage = 'customers.manage';
    case VehiclesManage = 'vehicles.manage';
    case VehiclesTransfer = 'vehicles.transfer';
    case ServiceRecordsManage = 'service-records.manage';
    case ServiceRecordsEditCompleted = 'service-records.edit-completed';
    case ServiceRecordsCancel = 'service-records.cancel';
    case ReviewsModerate = 'reviews.moderate';
    case ContentManage = 'content.manage';
    case SettingsManage = 'settings.manage';
    case UsersManage = 'users.manage';
    case AuditLogsView = 'audit-logs.view';

    /**
     * @return list<Role>
     */
    public function defaultRoles(): array
    {
        return match ($this) {
            self::DashboardView,
            self::AppointmentsManage,
            self::EnquiriesManage,
            self::CustomersManage,
            self::VehiclesManage,
            self::ServiceRecordsManage => [Role::ServiceAdvisor, Role::Manager, Role::SuperAdmin],

            self::VehiclesTransfer,
            self::ServiceRecordsEditCompleted,
            self::ServiceRecordsCancel,
            self::ReviewsModerate,
            self::ContentManage,
            self::SettingsManage => [Role::Manager, Role::SuperAdmin],

            self::UsersManage,
            self::AuditLogsView => [Role::SuperAdmin],
        };
    }
}
