import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

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

type Props = {
    employees: Employee[];
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
            }
        );
    };

    const handleDepartmentChange = (
        event: React.ChangeEvent<HTMLSelectElement>
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
            }
        );
    };

    const handleStatusChange = (
        event: React.ChangeEvent<HTMLSelectElement>
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
            }
        );
    };

    const clearFilters = () => {
        setSearch('');

        router.get(
            '/employees',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

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
                            className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c]"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add employee
                        </button>

                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

                <div className="flex flex-wrap items-center gap-3">

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

                    <select
                        value={selectedDepartment ?? ''}
                        onChange={handleDepartmentChange}
                        className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">
                            All departments
                        </option>

                        {departments.map((department) => (
                            <option
                                key={department}
                                value={department}
                            >
                                {department}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus ?? ''}
                        onChange={handleStatusChange}
                        className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">
                            All statuses
                        </option>

                        {statuses.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
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

                <div className="overflow-hidden rounded-xl border border-[#14172B]/8 bg-white dark:border-white/10 dark:bg-white/5">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead>
                                <tr className="border-b border-[#14172B]/8 text-xs text-[#14172B]/45 dark:border-white/10 dark:text-white/45">

                                    <th className="px-4 py-3 font-medium">
                                        Employee
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Department
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Position
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Base Salary
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Hired
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-[#14172B]/6 last:border-0 dark:border-white/10"
                                        >

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

                                            <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">
                                                {employee.department}
                                            </td>

                                            <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">
                                                {employee.position}
                                            </td>

                                            <td className="px-4 py-3">
                                                ₱{' '}
                                                {Number(employee.salary).toLocaleString(
                                                    'en-PH',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-[#14172B]/60 dark:text-white/60">
                                                {employee.hire_date}
                                            </td>

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

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">

                                                    <button
                                                        type="button"
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

                </div>

            </div>
        </AppLayout>
    );
}