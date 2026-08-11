import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, Search, Trash2, UserCheck, UserMinus, UserPlus, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Employees', href: '/employees' }];

type Employee = {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    salary: string;
    status: 'active' | 'inactive';
    hire_date: string;
};

const employees: Employee[] = [
    { id: 1, name: 'Ana Cruz', email: 'ana.cruz@company.com', department: 'HR', position: 'HR Administrator', salary: '2400.00', status: 'active', hire_date: '2023-03-14' },
    { id: 2, name: 'Marco Reyes', email: 'marco.reyes@company.com', department: 'Operations', position: 'Field Technician', salary: '1980.00', status: 'active', hire_date: '2022-07-01' },
    { id: 3, name: 'Priya Nandan', email: 'priya.nandan@company.com', department: 'Sales', position: 'Account Manager', salary: '2650.00', status: 'active', hire_date: '2021-11-20' },
    { id: 4, name: 'Diego Fuentes', email: 'diego.fuentes@company.com', department: 'Warehouse', position: 'Warehouse Lead', salary: '2100.00', status: 'inactive', hire_date: '2020-05-09' },
];

function initialsOf(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');
}

export default function EmployeesIndex() {
    const activeCount = employees.filter((e) => e.status === 'active').length;
    const inactiveCount = employees.filter((e) => e.status === 'inactive').length;
    const departmentCount = new Set(employees.map((e) => e.department)).size;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-[#16241c] p-6">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '18px 18px',
                        }}
                    />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-white">Employee records</h1>
                            <p className="text-sm text-white/55">Manage your workforce, roles, and pay details.</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] hover:bg-[#c99a3e]">
                            <UserPlus className="h-4 w-4" />
                            Add employee
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16241c]/10 text-[#16241c] dark:bg-[#b98a2e]/15 dark:text-[#b98a2e]">
                            <Users className="h-4.5 w-4.5" />
                        </span>
                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">{employees.length}</p>
                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">Total employees</p>
                    </div>
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#16A34A]">
                            <UserCheck className="h-4.5 w-4.5" />
                        </span>
                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">{activeCount}</p>
                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">Active</p>
                    </div>
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14172B]/8 text-[#14172B]/60 dark:bg-white/10 dark:text-white/50">
                            <UserMinus className="h-4.5 w-4.5" />
                        </span>
                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">{inactiveCount}</p>
                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">Inactive</p>
                    </div>
                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EC4899]/10 text-[#EC4899]">
                            <UserPlus className="h-4.5 w-4.5" />
                        </span>
                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">{departmentCount}</p>
                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">Departments</p>
                    </div>
                </div>

                {/* Filters — plain HTML controls, no extra UI-kit dependencies */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <Search className="h-4 w-4 text-[#14172B]/40 dark:text-white/40" />
                        <input
                            placeholder="Search by name, email, or department…"
                            className="w-full bg-transparent text-sm text-[#14172B] outline-none placeholder:text-[#14172B]/40 dark:text-white dark:placeholder:text-white/40"
                        />
                    </div>

                    <select className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white">
                        <option>All departments</option>
                        <option>HR</option>
                        <option>Operations</option>
                        <option>Sales</option>
                        <option>Warehouse</option>
                    </select>

                    <select className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white">
                        <option>All statuses</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-[#14172B]/8 bg-white dark:border-white/10 dark:bg-white/5">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#14172B]/8 text-xs text-[#14172B]/45 dark:border-white/10 dark:text-white/45">
                                <th className="px-4 py-3 font-medium">Employee</th>
                                <th className="px-4 py-3 font-medium">Department</th>
                                <th className="px-4 py-3 font-medium">Position</th>
                                <th className="px-4 py-3 font-medium">Salary</th>
                                <th className="px-4 py-3 font-medium">Hired</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id} className="border-b border-[#14172B]/6 last:border-0 dark:border-white/10">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16241c]/10 font-['IBM_Plex_Mono'] text-xs font-semibold text-[#16241c] dark:bg-[#b98a2e]/15 dark:text-[#b98a2e]">
                                                {initialsOf(employee.name)}
                                            </span>
                                            <div>
                                                <p className="font-medium text-[#14172B] dark:text-white">{employee.name}</p>
                                                <p className="text-xs text-[#14172B]/45 dark:text-white/45">{employee.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">{employee.department}</td>
                                    <td className="px-4 py-3 text-[#14172B]/70 dark:text-white/70">{employee.position}</td>
                                    <td className="px-4 py-3 font-['IBM_Plex_Mono'] text-[#14172B] dark:text-white">
                                        ${Number(employee.salary).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-[#14172B]/60 dark:text-white/60">{employee.hire_date}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                employee.status === 'active'
                                                    ? 'rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-xs font-medium text-[#16A34A]'
                                                    : 'rounded-full bg-[#14172B]/8 px-2.5 py-1 text-xs font-medium text-[#14172B]/55 dark:bg-white/10 dark:text-white/50'
                                            }
                                        >
                                            {employee.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button className="rounded-md p-1.5 text-[#14172B]/50 hover:bg-[#16241c]/10 hover:text-[#16241c] dark:text-white/50">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button className="rounded-md p-1.5 text-[#14172B]/50 hover:bg-red-50 hover:text-red-600 dark:text-white/50">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}