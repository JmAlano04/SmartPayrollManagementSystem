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
            return 'bg-[#C6F432]/25 text-[#456000] dark:bg-[#C6F432]/10 dark:text-[#C6F432]';

        case 'on_leave':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300';

        case 'terminated':
            return 'bg-red-100 text-red-700 dark:bg-[#FF6B5B]/10 dark:text-[#FF8A7C]';

        default:
            return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60';
    }
}

/*
|--------------------------------------------------------------------------
| Shared class names
|--------------------------------------------------------------------------
*/

const fieldClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white text-sm outline-none transition focus:border-[#C6F432] focus:ring-2 focus:ring-[#C6F432]/25 dark:border-white/10 dark:bg-white/5 dark:text-white';

const th =
    "px-5 py-4 font-['JetBrains_Mono'] text-[11px] font-medium uppercase tracking-widest text-slate-500 dark:text-white/50";

const actionButton =
    'rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/10';

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
            valueColor: 'text-[#0B0F1A] dark:text-white',
            iconBg: 'bg-slate-100 dark:bg-white/10',
            iconColor: 'text-[#0B0F1A] dark:text-white',
        },
        {
            label: 'Active',
            value: stats.activeEmployees,
            icon: CircleCheck,
            valueColor: 'text-[#4D6B00] dark:text-[#C6F432]',
            iconBg: 'bg-[#C6F432]/25 dark:bg-[#C6F432]/10',
            iconColor: 'text-[#4D6B00] dark:text-[#C6F432]',
        },
        {
            label: 'On Leave',
            value: stats.onLeaveCount,
            icon: Clock,
            valueColor: 'text-amber-600 dark:text-amber-300',
            iconBg: 'bg-amber-100 dark:bg-amber-400/10',
            iconColor: 'text-amber-600 dark:text-amber-300',
        },
        {
            label: 'Terminated',
            value: stats.terminatedEmployees,
            icon: UserMinus,
            valueColor: 'text-red-600 dark:text-[#FF8A7C]',
            iconBg: 'bg-red-100 dark:bg-[#FF6B5B]/10',
            iconColor: 'text-red-600 dark:text-[#FF8A7C]',
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
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="dark min-h-full bg-[#0B0F1A] p-4 font-['Bricolage_Grotesque'] text-white md:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0B0F1A] dark:text-white">
                                Employees
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Manage your workforce, roles, and pay details
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddEmployeeModal(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#C6F432] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] transition hover:bg-[#D6FF55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6F432] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F1A]"
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
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#121829]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-white/50">
                                                {stat.label}
                                            </p>

                                            <h2
                                                className={`mt-2 font-['JetBrains_Mono'] text-2xl font-medium ${stat.valueColor}`}
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

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#121829]">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            {/* Search */}
                            <div className="relative md:col-span-5">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    placeholder="Search by name, email, or department..."
                                    className={`${fieldClass} pl-10 pr-3`}
                                />
                            </div>

                            {/* Department */}
                            <div className="relative md:col-span-3">
                                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    value={selectedDepartment ?? ''}
                                    onChange={handleDepartmentChange}
                                    className={`${fieldClass} appearance-none pl-10 pr-3`}
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
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
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

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121829]">
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[#0B0F1A] dark:text-white">
                                    Employee Records
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    <span className="font-['JetBrains_Mono']">
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
                                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
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

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {employees.data.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="transition hover:bg-slate-50 dark:hover:bg-white/5"
                                            >
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C6F432] font-['JetBrains_Mono'] text-xs font-medium text-[#0B0F1A]">
                                                            {initialsOf(
                                                                employee.name,
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-[#0B0F1A] dark:text-white">
                                                                {employee.name}
                                                            </p>

                                                            <p className="truncate text-xs text-slate-500 dark:text-white/50">
                                                                {employee.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {employee.department}
                                                </td>

                                                {/* Position */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {employee.position}
                                                </td>

                                                {/* Salary */}
                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-['JetBrains_Mono'] text-sm text-slate-700 dark:text-white/80">
                                                        {formatCurrency(
                                                            employee.salary,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Hire date */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {formatDate(
                                                        employee.hire_date,
                                                    )}
                                                </td>

                                                {/* Employment type */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
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
                                                            className={`${actionButton} hover:text-[#4D6B00] dark:hover:text-[#C6F432]`}
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
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-[#FF6B5B]/10 dark:hover:text-[#FF8A7C]"
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
                                <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-white/5">
                                    <Users className="h-6 w-6 text-slate-400" />
                                </div>

                                <h3 className="font-medium text-slate-700 dark:text-white">
                                    No employees found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-400">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Add your first employee to get started.'}
                                </p>

                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C6F432] px-5 py-2 text-sm font-semibold text-[#0B0F1A] transition hover:bg-[#D6FF55]"
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
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500 dark:text-white/50">
                                    Showing{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {employees.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {employees.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {employees.total}
                                    </span>{' '}
                                    employees
                                </p>

                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <button
                                        type="button"
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
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
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
                                                        ? 'bg-[#C6F432] text-[#0B0F1A]'
                                                        : 'text-slate-600 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}

                                    {/* Next */}
                                    <button
                                        type="button"
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
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
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