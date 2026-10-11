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
    CheckCircle2,
    Clock3,
    Filter,
    Pencil,
    Search,
    Trash2,
    UserCheck,
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

/* Helpers */

function initialsOf(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
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

/* Shared class names */

const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#b98a2e] focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10 dark:bg-[#0f1712] dark:text-white dark:placeholder:text-white/30';

const labelClass =
    'mb-2 block text-xs font-medium text-slate-600 dark:text-white/60';

const th =
    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50';

const actionButton =
    'rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/10';

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
            valueColor: 'text-[#16241c] dark:text-white',
            iconBg: 'bg-slate-100 dark:bg-white/10',
            iconColor: 'text-[#16241c] dark:text-white',
        },
        {
            label: 'Active',
            value: stats.activeEmployees,
            icon: UserCheck,
            valueColor: 'text-green-600',
            iconBg: 'bg-green-50 dark:bg-green-500/10',
            iconColor: 'text-green-600',
        },
        {
            label: 'Terminated',
            value: stats.terminatedEmployees,
            icon: UserMinus,
            valueColor: 'text-red-600',
            iconBg: 'bg-red-50 dark:bg-red-500/10',
            iconColor: 'text-red-600',
        },
        {
            label: 'On Leave',
            value: stats.onLeaveCount,
            icon: Clock3,
            valueColor: 'text-amber-600',
            iconBg: 'bg-amber-50 dark:bg-amber-500/10',
            iconColor: 'text-amber-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1712]">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#16241c] dark:text-white">
                                Employees
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Manage your workforce, roles, and pay details
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAddEmployeeModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16241c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#22362a] focus:outline-none focus:ring-2 focus:ring-[#b98a2e] focus:ring-offset-2 dark:focus:ring-offset-[#0f1712]"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Employee
                        </button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                                {stat.label}
                                            </p>

                                            <p
                                                className={`mt-2 text-2xl font-bold ${stat.valueColor}`}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}
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

                    {/* Filters */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#b98a2e]" />

                            <h2 className="text-sm font-semibold text-[#16241c] dark:text-white">
                                Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Search */}
                            <div>
                                <label className={labelClass}>Search</label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        placeholder="Search by name, email, or department..."
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div>
                                <label className={labelClass}>
                                    Department
                                </label>

                                <select
                                    value={selectedDepartment ?? ''}
                                    onChange={handleDepartmentChange}
                                    className={inputClass}
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
                            <div>
                                <label className={labelClass}>Status</label>

                                <select
                                    value={selectedStatus ?? ''}
                                    onChange={handleStatusChange}
                                    className={inputClass}
                                >
                                    <option value="">All Statuses</option>

                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {statusLabels[status] ?? status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {hasFilters && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Employee table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                    Employee Records
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    {employees.total} employee
                                    {employees.total !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>

                        {employees.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
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
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {employees.data.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                            >
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-[#16241c] dark:bg-white/10 dark:text-white">
                                                            {initialsOf(
                                                                employee.name,
                                                            )}
                                                        </span>

                                                        <div>
                                                            <p className="font-medium text-[#16241c] dark:text-white">
                                                                {employee.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
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
                                                    <span className="text-sm font-semibold text-[#16241c] dark:text-white">
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

                                                {/* Employment Type */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {employee.employment_type} 
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 text-center">
                                                    {employee.status ===
                                                    'active' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Active
                                                        </span>
                                                    ) : employee.status ===
                                                      'terminated' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                                            <UserMinus className="h-3.5 w-3.5" />
                                                            Terminated
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                            <Clock3 className="h-3.5 w-3.5" />
                                                            On Leave
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4 text-center">
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
                                                            className={`${actionButton} hover:text-[#b98a2e]`}
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
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-500/10"
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                                    <Users className="h-7 w-7 text-slate-400 dark:text-white/40" />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#16241c] dark:text-white">
                                    No employees found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-white/40">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Add your first employee to get started.'}
                                </p>

                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
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
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16241c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#22362a]"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Add Employee
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {employees.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500 dark:text-white/50">
                                    Showing{' '}
                                    <span className="font-medium text-[#16241c] dark:text-white">
                                        {employees.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-[#16241c] dark:text-white">
                                        {employees.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-[#16241c] dark:text-white">
                                        {employees.total}
                                    </span>{' '}
                                    employees
                                </p>

                                <div className="flex items-center gap-1">
                                    {employees.links.map((link, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => goToPage(link.url)}
                                            className={`rounded-lg px-3 py-1.5 text-sm transition ${
                                                link.active
                                                    ? 'bg-[#16241c] text-white dark:bg-[#b98a2e] dark:text-[#16241c]'
                                                    : 'text-slate-600 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/10'
                                            } ${
                                                !link.url
                                                    ? 'cursor-not-allowed opacity-40'
                                                    : ''
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Employee Modal */}
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

            {/* Update Employee Modal */}
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

            {/* Delete Employee Modal */}
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