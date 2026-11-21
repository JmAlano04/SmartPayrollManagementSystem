import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AddModal from '@/components/AddModal';
import DeleteModal from '@/components/DeleteModal';
import UpdateModal from '@/components/UpdateModal';

import AddEmployeeForm from '@/components/employees/AddEmployeeForm';
import UpdateEmployeeForm from '@/components/employees/UpdateEmployeeForm';

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    Pencil,
    Search,
    Trash2,
    UserMinus,
    UserPlus,
    Users,
    X,
} from 'lucide-react';

/*
 * Light palette (matches welcome-light, dashboard-light, pay-runs-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   active #D1FADF / #05603A   leave #FEF0C7 / #7A4B00
 *   red    #FEE4E2 / #B42318
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

type Employee = {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    employment_type: string;
    salary: number;
    status: 'active' | 'terminated' | 'on_leave';
    hire_date: string;
};

type Stats = {
    totalEmployees: number;
    activeEmployees: number;
    terminatedEmployees: number;
    onLeaveCount: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type EmployeesPagination = {
    data: Employee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Props = {
    employees: EmployeesPagination;
    stats: Stats;
    departments: string[];
    statuses: string[];
    selectedDepartment?: string;
    selectedStatus?: string;
    search?: string;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function initialsOf(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatCurrency(amount: number) {
    return `₱ ${Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(date: string) {
    if (!date) {
        return '—';
    }

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const statusLabels: Record<string, string> = {
    active: 'Active',
    terminated: 'Terminated',
    on_leave: 'On Leave',
};

function getStatusClass(status: Employee['status']) {
    switch (status) {
        case 'active':
            return 'bg-[#D1FADF] text-[#05603A]';

        case 'on_leave':
            return 'bg-[#FEF0C7] text-[#7A4B00]';

        case 'terminated':
            return 'bg-[#FEE4E2] text-[#B42318]';

        default:
            return 'bg-[#F2F4F7] text-[#475467]';
    }
}

/*
|--------------------------------------------------------------------------
| Shared class names
|--------------------------------------------------------------------------
*/

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const mono = "font-['IBM_Plex_Mono']";

const fieldClass =
    'h-10 w-full rounded-lg border border-[#D0D5DD] bg-white text-sm text-[#101828] outline-none transition focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20';

const th = 'px-5 py-4 text-xs font-medium text-[#667085]';

const actionButton = 'rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7]';

const outlineBtn =
    'inline-flex items-center justify-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB]';

const primaryBtn =
    'inline-flex items-center gap-2 rounded-full bg-[#0E7A5A] text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]';

const pageBtn =
    'rounded-lg border border-[#D0D5DD] p-2 text-[#475467] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40';

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EmployeesIndex({
    employees,
    stats,
    departments,
    statuses,
    selectedDepartment,
    selectedStatus,
    search: initialSearch,
}: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showUpdateEmployeeModal, setShowUpdateEmployeeModal] =
        useState(false);
    const [showDeleteEmployeeModal, setDeleteEmployeeModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null,
    );

    const hasFilters = Boolean(search || selectedDepartment || selectedStatus);

    /* Filters */

    const visit = (params: Record<string, string | undefined>) => {
        router.get('/employees', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);

        visit({
            search: value || undefined,
            department: selectedDepartment || undefined,
            status: selectedStatus || undefined,
        });
    };

    const handleDepartmentChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        visit({
            search: search || undefined,
            department: event.target.value || undefined,
            status: selectedStatus || undefined,
        });
    };

    const handleStatusChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        visit({
            search: search || undefined,
            department: selectedDepartment || undefined,
            status: event.target.value || undefined,
        });
    };

    const clearFilters = () => {
        setSearch('');
        visit({});
    };

    /* Pagination */

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    /* Update */

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowUpdateEmployeeModal(true);
    };

    /* Delete */

    const handleDeleteClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDeleteEmployeeModal(true);
    };

    const handleCloseDeleteModal = () => {
        if (isDeleting) return;

        setDeleteEmployeeModal(false);
        setSelectedEmployee(null);
    };

    const handleDeleteEmployee = () => {
        if (!selectedEmployee || isDeleting) return;

        router.delete(`/employees/destroy/${selectedEmployee.id}`, {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onSuccess: () => {
                setDeleteEmployeeModal(false);
                setSelectedEmployee(null);
            },
            onError: (errors) => {
                console.error('Failed to delete employee:', errors);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    /* Stat cards */

    const statCards = [
        {
            label: 'Total Employees',
            value: stats.totalEmployees,
            icon: Users,
            valueColor: 'text-[#101828]',
            iconBg: 'bg-[#F2F4F7]',
            iconColor: 'text-[#344054]',
        },
        {
            label: 'Active',
            value: stats.activeEmployees,
            icon: CircleCheck,
            valueColor: 'text-[#0E7A5A]',
            iconBg: 'bg-[#D1FADF]',
            iconColor: 'text-[#0E7A5A]',
        },
        {
            label: 'On Leave',
            value: stats.onLeaveCount,
            icon: Clock,
            valueColor: 'text-[#7A4B00]',
            iconBg: 'bg-[#FEF0C7]',
            iconColor: 'text-[#7A4B00]',
        },
        {
            label: 'Terminated',
            value: stats.terminatedEmployees,
            icon: UserMinus,
            valueColor: 'text-[#B42318]',
            iconBg: 'bg-[#FEE4E2]',
            iconColor: 'text-[#B42318]',
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] p-4 font-['Instrument_Sans'] text-[#101828] md:p-6"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                                Employees
                            </h1>

                            <p className="mt-1 text-sm text-[#475467]">
                                Manage your workforce, roles, and pay details
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddEmployeeModal(true)}
                                className={`${primaryBtn} px-5 py-2.5`}
                            >
                                <UserPlus className="h-4 w-4" />
                                Add Employee
                            </button>
                        </div>
                    </div>

                    {/* =====================================================
                        STAT CARDS
                    ====================================================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.label}
                                    className={`${card} p-5`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">
                                                {stat.label}
                                            </p>

                                            <h2
                                                className={`mt-2 ${mono} text-2xl font-medium ${stat.valueColor}`}
                                            >
                                                {stat.value}
                                            </h2>
                                        </div>

                                        <div
                                            className={`rounded-xl p-3 ${stat.iconBg}`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${stat.iconColor}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* =====================================================
                        FILTERS
                    ====================================================== */}

                    <div className={`${card} p-4`}>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            {/* Search */}
                            <div className="relative md:col-span-5">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    placeholder="Search by name, email, or department..."
                                    className={`${fieldClass} pr-3 pl-10 placeholder:text-[#98A2B3]`}
                                />
                            </div>

                            {/* Department */}
                            <div className="relative md:col-span-3">
                                <CalendarDays className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                                <select
                                    value={selectedDepartment ?? ''}
                                    onChange={handleDepartmentChange}
                                    className={`${fieldClass} appearance-none pr-3 pl-10`}
                                >
                                    <option value="">All Departments</option>

                                    {departments.map((department) => (
                                        <option
                                            key={department}
                                            value={department}
                                        >
                                            {department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                                <select
                                    value={selectedStatus ?? ''}
                                    onChange={handleStatusChange}
                                    className={`${fieldClass} px-3`}
                                >
                                    <option value="">All Status</option>

                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {statusLabels[status] ?? status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2 md:col-span-2">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    disabled={!hasFilters}
                                    className={`${outlineBtn} h-10 w-full disabled:cursor-not-allowed disabled:opacity-40`}
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        TABLE
                    ====================================================== */}

                    <div className={`${card} overflow-hidden`}>
                        <div className="flex flex-col gap-2 border-b border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[#101828]">
                                    Employee Records
                                </h2>

                                <p className="mt-1 text-xs text-[#667085]">
                                    <span className={mono}>
                                        {employees.total}
                                    </span>{' '}
                                    employee
                                    {employees.total !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>

                        {employees.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
                                        <tr>
                                            <th className={`${th} text-left`}>
                                                Employee
                                            </th>
                                            <th className={`${th} text-left`}>
                                                Department
                                            </th>
                                            <th className={`${th} text-left`}>
                                                Position
                                            </th>
                                            <th className={`${th} text-right`}>
                                                Base Salary
                                            </th>
                                            <th className={`${th} text-left`}>
                                                Hired
                                            </th>
                                            <th className={`${th} text-left`}>
                                                Employment Type
                                            </th>
                                            <th className={`${th} text-center`}>
                                                Status
                                            </th>
                                            <th className={`${th} text-center`}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-[#F2F4F7]">
                                        {employees.data.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="transition hover:bg-[#F9FAFB]"
                                            >
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D1FADF] ${mono} text-xs font-medium text-[#05603A]`}
                                                        >
                                                            {initialsOf(
                                                                employee.name,
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-[#101828]">
                                                                {employee.name}
                                                            </p>

                                                            <p className="truncate text-xs text-[#667085]">
                                                                {employee.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {employee.department}
                                                </td>

                                                {/* Position */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {employee.position}
                                                </td>

                                                {/* Salary */}
                                                <td className="px-5 py-4 text-right">
                                                    <span
                                                        className={`${mono} text-sm text-[#344054]`}
                                                    >
                                                        {formatCurrency(
                                                            employee.salary,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Hire date */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {formatDate(
                                                        employee.hire_date,
                                                    )}
                                                </td>

                                                {/* Employment type */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {employee.employment_type}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            employee.status,
                                                        )}`}
                                                    >
                                                        {statusLabels[
                                                            employee.status
                                                        ] ?? employee.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="Edit employee"
                                                            aria-label={`Edit ${employee.name}`}
                                                            onClick={() =>
                                                                handleEdit(
                                                                    employee,
                                                                )
                                                            }
                                                            className={`${actionButton} hover:text-[#0E7A5A]`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete employee"
                                                            aria-label={`Delete ${employee.name}`}
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    employee,
                                                                )
                                                            }
                                                            className={`${actionButton} hover:bg-[#FEE4E2] hover:text-[#B42318]`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-3 rounded-full bg-[#F2F4F7] p-4">
                                    <Users className="h-6 w-6 text-[#98A2B3]" />
                                </div>

                                <h3 className="font-medium text-[#101828]">
                                    No employees found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-[#667085]">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Add your first employee to get started.'}
                                </p>

                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className={`${outlineBtn} mt-4 py-2`}
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAddEmployeeModal(true)
                                        }
                                        className={`${primaryBtn} mt-4 px-5 py-2`}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Add Employee
                                    </button>
                                )}
                            </div>
                        )}

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {employees.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Showing{' '}
                                    <span className="font-medium text-[#101828]">
                                        {employees.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-[#101828]">
                                        {employees.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-[#101828]">
                                        {employees.total}
                                    </span>{' '}
                                    employees
                                </p>

                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={employees.current_page === 1}
                                        onClick={() => {
                                            const previousLink =
                                                employees.links.find((link) =>
                                                    link.label.includes(
                                                        'Previous',
                                                    ),
                                                );

                                            if (previousLink?.url) {
                                                goToPage(previousLink.url);
                                            }
                                        }}
                                        className={pageBtn}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {/* Page numbers */}
                                    {employees.links
                                        .filter(
                                            (link) =>
                                                !link.label.includes(
                                                    'Previous',
                                                ) &&
                                                !link.label.includes('Next'),
                                        )
                                        .map((link, index) => (
                                            <button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                disabled={!link.url}
                                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-[#0E7A5A] text-white'
                                                        : 'text-[#475467] hover:bg-[#F2F4F7]'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}

                                    {/* Next */}
                                    <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={
                                            employees.current_page ===
                                            employees.last_page
                                        }
                                        onClick={() => {
                                            const nextLink =
                                                employees.links.find((link) =>
                                                    link.label.includes('Next'),
                                                );

                                            if (nextLink?.url) {
                                                goToPage(nextLink.url);
                                            }
                                        }}
                                        className={pageBtn}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =============================================================
                ADD EMPLOYEE MODAL
            ============================================================== */}

            <AddModal
                open={showAddEmployeeModal}
                onClose={() => setShowAddEmployeeModal(false)}
                title="Add New Employee"
                description="Create a new employee record."
            >
                <AddEmployeeForm
                    onCancel={() => setShowAddEmployeeModal(false)}
                    onSuccess={() => setShowAddEmployeeModal(false)}
                />
            </AddModal>

            {/* =============================================================
                UPDATE EMPLOYEE MODAL
            ============================================================== */}

            {selectedEmployee && showUpdateEmployeeModal && (
                <UpdateModal
                    open={showUpdateEmployeeModal}
                    onClose={() => {
                        setShowUpdateEmployeeModal(false);
                        setSelectedEmployee(null);
                    }}
                    title="Update Employee"
                >
                    <UpdateEmployeeForm
                        employee={selectedEmployee}
                        onCancel={() => {
                            setShowUpdateEmployeeModal(false);
                            setSelectedEmployee(null);
                        }}
                        onSuccess={() => {
                            setShowUpdateEmployeeModal(false);
                            setSelectedEmployee(null);
                        }}
                    />
                </UpdateModal>
            )}

            {/* =============================================================
                DELETE EMPLOYEE MODAL
            ============================================================== */}

            {selectedEmployee && showDeleteEmployeeModal && (
                <DeleteModal
                    open
                    processing={isDeleting}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDeleteEmployee}
                    title="Delete Employee"
                    description={`Are you sure you want to delete ${selectedEmployee.name}? This action cannot be undone.`}
                />
            )}
        </AppLayout>
    );
}