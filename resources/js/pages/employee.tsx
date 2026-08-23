import AppLayout from '@/layouts/app-layout';

import { type BreadcrumbItem } from '@/types';

import { Head, router } from '@inertiajs/react';

import { useState } from 'react';

import AddModal from '@/components/AddModal';
import UpdateModal from '@/components/UpdateModal';

import AddEmployeeForm from '@/components/employees/AddEmployeeForm';
import UpdateEmployeeForm from '@/components/employees/UpdateEmployeeForm';

import {
    Pencil,
    Search,
    Trash2,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
    Clock,
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

function initialsOf(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');
}

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
    const [showUpdateEmployeeModal, setShowUpdateEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // 👈

    // Search
    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            '/employees',
            {
                search: value || undefined,
                department: selectedDepartment || undefined,
                status: selectedStatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Department filter
    const handleDepartmentChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const department = event.target.value;

        router.get(
            '/employees',
            {
                search: search || undefined,
                department: department || undefined,
                status: selectedStatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Status filter
    const handleStatusChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const status = event.target.value;

        router.get(
            '/employees',
            {
                search: search || undefined,
                department: selectedDepartment || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Clear filters
    const clearFilters = () => {
        setSearch('');

        router.get(
            '/employees',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Pagination
    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Open update modal with selected employee 👈
    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowUpdateEmployeeModal(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-[#16241c] p-6">
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-white">
                                Employee records
                            </h1>

                            <p className="text-sm text-white/55">
                                Manage your workforce, roles, and pay details.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAddEmployeeModal(true)}
                            className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c]"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add employee
                        </button>
                    </div>
                </div>

                {/* Add employee modal */}
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

                {/* Update employee modal 👈 */}
                {selectedEmployee && (
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

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total */}
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16241c]/10">
                            <Users className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.totalEmployees}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Total employees
                        </p>
                    </div>

                    {/* Active */}
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10">
                            <UserCheck className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.activeEmployees}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Active
                        </p>
                    </div>

                    {/* Terminated */}
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14172B]/8">
                            <UserMinus className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.terminatedEmployees}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Terminated
                        </p>
                    </div>

                    {/* On leave */}
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                            <Clock className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.onLeaveCount}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            On Leave
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <Search className="h-4 w-4 text-[#14172B]/40" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by name, email, or department..."
                            className="w-full bg-transparent text-sm outline-none"
                        />
                    </div>

                    {/* Department */}
                    <select
                        value={selectedDepartment ?? ''}
                        onChange={handleDepartmentChange}
                        className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">All departments</option>

                        {departments.map((department) => (
                            <option key={department} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={selectedStatus ?? ''}
                        onChange={handleStatusChange}
                        className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">All statuses</option>

                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status === 'active'
                                    ? 'Active'
                                    : status === 'terminated'
                                      ? 'Terminated'
                                      : status === 'on_leave'
                                        ? 'On Leave'
                                        : status}
                            </option>
                        ))}
                    </select>

                    {/* Clear */}
                    {(search || selectedDepartment || selectedStatus) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-[#14172B]/10 px-3 py-2 text-sm hover:bg-[#14172B]/5"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Employee table */}
                <div className="overflow-hidden rounded-xl border border-[#14172B]/8 bg-white dark:border-white/10 dark:bg-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#14172B]/8 text-xs text-[#14172B]/45 dark:border-white/10 dark:text-white/45">
                                    <th className="px-4 py-3 font-medium">Employee</th>
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium">Position</th>
                                    <th className="px-4 py-3 font-medium">Base Salary</th>
                                    <th className="px-4 py-3 font-medium">Hired</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employees.data.length > 0 ? (
                                    employees.data.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-[#14172B]/6 last:border-0 dark:border-white/10"
                                        >
                                            {/* Employee */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16241c]/10 text-xs font-semibold">
                                                        {initialsOf(employee.name)}
                                                    </span>

                                                    <div>
                                                        <p className="font-medium text-[#14172B] dark:text-white">
                                                            {employee.name}
                                                        </p>

                                                        <p className="text-xs text-[#14172B]/45 dark:text-white/45">
                                                            {employee.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">
                                                {employee.department}
                                            </td>

                                            {/* Position */}
                                            <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">
                                                {employee.position}
                                            </td>

                                            {/* Salary */}
                                            <td className="px-4 py-3">
                                                ₱{' '}
                                                {Number(employee.salary).toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>

                                            {/* Hire date */}
                                            <td className="px-4 py-3 text-[#14172B]/60 dark:text-white/60">
                                                {employee.hire_date}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={
                                                        employee.status === 'active'
                                                            ? 'rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-xs font-medium text-[#16A34A]'
                                                            : employee.status === 'terminated'
                                                              ? 'rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600'
                                                              : 'rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-600'
                                                    }
                                                >
                                                    {employee.status === 'active'
                                                        ? 'Active'
                                                        : employee.status === 'terminated'
                                                          ? 'Terminated'
                                                          : 'On Leave'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(employee)} // 👈
                                                        className="rounded-md p-1.5 hover:bg-[#16241c]/10"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-sm text-[#14172B]/50"
                                        >
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees.last_page > 1 && (
                        <div className="flex flex-col gap-3 border-t border-[#14172B]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                            <p className="text-sm text-[#14172B]/50 dark:text-white/50">
                                Showing{' '}
                                <span className="font-medium text-[#14172B] dark:text-white">
                                    {employees.from ?? 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium text-[#14172B] dark:text-white">
                                    {employees.to ?? 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium text-[#14172B] dark:text-white">
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
                                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                            link.active
                                                ? 'bg-[#16241c] text-white'
                                                : 'text-[#14172B]/60 hover:bg-[#14172B]/5 dark:text-white/60 dark:hover:bg-white/10'
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
        </AppLayout>
    );
}