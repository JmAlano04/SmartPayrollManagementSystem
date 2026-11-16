import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

import AddModal from '@/components/AddModal';
import DeleteModal from '@/components/DeleteModal';
import UpdateModal from '@/components/UpdateModal';

import {
    CalendarOff,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: '/attendance',
    },
];

type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_leave';

type AttendanceRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_code: string;
    department: string;
    date: string;
    time_in: string | null;
    time_out: string | null;
    hours_worked: number;
    status: AttendanceStatus;
    remarks: string | null;
};

type EmployeeOption = {
    id: number;
    name: string;
    code: string;
    department: string | null;
};

type FormData = Pick<AttendanceRecord, 'employee_id' | 'date' | 'time_in' | 'time_out' | 'status' | 'remarks'>;

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type AttendancePagination = {
    data: AttendanceRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Stats = Record<AttendanceStatus, number>;

type Filters = {
    search: string;
    status: string;
    department: string;
    date: string;
};

type AttendancePageProps = {
    records: AttendancePagination;
    stats: Stats;
    totalHours: number;
    employees: EmployeeOption[];
    departments: string[];
    filters: Filters;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatDate(date: string) {
    if (!date) {
        return '—';
    }

    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function todayDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
}

function formatTime(time: string | null) {
    if (!time) {
        return '—';
    }

    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function formatHours(hours: number) {
    return `${Number(hours || 0).toFixed(2)} hrs`;
}

function initialsOf(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const statusLabels: Record<AttendanceStatus, string> = {
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    on_leave: 'On Leave',
};

function getStatusClass(status: AttendanceStatus) {
    switch (status) {
        case 'present':
            return 'bg-[#C6F432]/25 text-[#456000] dark:bg-[#C6F432]/10 dark:text-[#C6F432]';

        case 'late':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300';

        case 'absent':
            return 'bg-red-100 text-red-700 dark:bg-[#FF6B5B]/10 dark:text-[#FF8A7C]';

        case 'on_leave':
            return 'bg-indigo-100 text-indigo-700 dark:bg-[#9AA3FF]/10 dark:text-[#9AA3FF]';

        default:
            return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60';
    }
}

/*
|--------------------------------------------------------------------------
| Shared class names
|--------------------------------------------------------------------------
*/

const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#C6F432] focus:ring-2 focus:ring-[#C6F432]/25 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30';

const labelClass =
    'mb-2 block text-xs font-medium text-slate-600 dark:text-white/60';

const th =
    "px-5 py-4 font-['JetBrains_Mono'] text-[11px] font-medium uppercase tracking-widest text-slate-500 dark:text-white/50";

const outlineButton =
    'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white';

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#C6F432] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] transition hover:bg-[#D6FF55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6F432] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-[#0B0F1A]';

function StatusPill({ status }: { status: AttendanceStatus }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
        >
            {statusLabels[status]}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Form (used by both Add and Update modals)
|--------------------------------------------------------------------------
*/

function AttendanceForm({
    initial,
    employees,
    submitLabel,
    onCancel,
}: {
    initial?: AttendanceRecord;
    employees: EmployeeOption[];
    submitLabel: string;
    onCancel: () => void;
}) {
    const form = useForm<FormData>({
        employee_id: initial?.employee_id ?? employees[0]?.id ?? 0,
        date: initial?.date ?? todayDate(),
        time_in: initial?.time_in ?? '08:00',
        time_out: initial?.time_out ?? '17:00',
        status: initial?.status ?? 'present',
        remarks: initial?.remarks ?? '',
    });

    const noTime = form.data.status === 'absent' || form.data.status === 'on_leave';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => {
            const hasNoTime = data.status === 'absent' || data.status === 'on_leave';

            return {
                ...data,
                time_in: hasNoTime ? null : data.time_in || null,
                time_out: hasNoTime ? null : data.time_out || null,
                remarks: data.remarks?.trim() || null,
            };
        });

        const options = { onSuccess: onCancel };
        if (initial) {
            form.put(`/attendance/${initial.id}`, options);
        } else {
            form.post('/attendance', options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className={labelClass}>Employee</label>
                    <select
                        required
                        value={form.data.employee_id}
                        onChange={(event) => form.setData('employee_id', Number(event.target.value))}
                        className={inputClass}
                        disabled={employees.length === 0}
                    >
                        {employees.length === 0 ? (
                            <option value={0}>No employees available</option>
                        ) : (
                            employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name} ({employee.code}){employee.department ? ` — ${employee.department}` : ''}
                                </option>
                            ))
                        )}
                    </select>
                    {form.errors.employee_id && <p className="mt-1 text-xs text-red-500">{form.errors.employee_id}</p>}
                </div>

                <div>
                    <label className={labelClass}>Department</label>
                    <input
                        readOnly
                        value={employees.find((employee) => employee.id === form.data.employee_id)?.department ?? '—'}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Date</label>
                    <input required type="date" value={form.data.date} onChange={(event) => form.setData('date', event.target.value)} className={inputClass} />
                    {form.errors.date && <p className="mt-1 text-xs text-red-500">{form.errors.date}</p>}
                </div>

                <div>
                    <label className={labelClass}>Status</label>
                    <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value as AttendanceStatus)} className={inputClass}>
                        {(Object.keys(statusLabels) as AttendanceStatus[]).map((key) => (
                            <option key={key} value={key}>{statusLabels[key]}</option>
                        ))}
                    </select>
                    {form.errors.status && <p className="mt-1 text-xs text-red-500">{form.errors.status}</p>}
                </div>

                <div className="hidden sm:block" />

                <div>
                    <label className={labelClass}>Time In</label>
                    <input type="time" disabled={noTime} value={form.data.time_in ?? ''} onChange={(event) => form.setData('time_in', event.target.value)} className={inputClass} />
                    {form.errors.time_in && <p className="mt-1 text-xs text-red-500">{form.errors.time_in}</p>}
                </div>

                <div>
                    <label className={labelClass}>Time Out</label>
                    <input type="time" disabled={noTime} value={form.data.time_out ?? ''} onChange={(event) => form.setData('time_out', event.target.value)} className={inputClass} />
                    {form.errors.time_out && <p className="mt-1 text-xs text-red-500">{form.errors.time_out}</p>}
                </div>
            </div>

            <div>
                <label className={labelClass}>Remarks</label>
                <input value={form.data.remarks ?? ''} onChange={(event) => form.setData('remarks', event.target.value)} placeholder="Optional" className={inputClass} />
                {form.errors.remarks && <p className="mt-1 text-xs text-red-500">{form.errors.remarks}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className={outlineButton}>
                    Cancel
                </button>

                <button type="submit" disabled={form.processing || employees.length === 0} className={primaryButton}>
                    {form.processing ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function Attendance({ records, stats, totalHours, employees, departments, filters }: AttendancePageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const status = filters.status ?? '';
    const department = filters.department ?? '';
    const date = filters.date ?? '';

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const deleteForm = useForm({});

    const hasFilters = search !== '' || status !== '' || department !== '' || date !== '';

    /* Filters (handled by Laravel, 10 records per page) */

    const visit = (next: Partial<Filters>) => {
        const merged = { search, status, department, date, ...next };

        router.get(
            '/attendance',
            {
                search: merged.search || undefined,
                status: merged.status || undefined,
                department: merged.department || undefined,
                date: merged.date || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        visit({ search: value });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/attendance', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    /* Pagination */

    const goToPage = (url: string | null) => {
        if (!url) return;

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = () => {
        if (!recordToDelete) return;

        deleteForm.delete(`/attendance/${recordToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setRecordToDelete(null),
        });
    };

    /* Export CSV (all records matching the current filters, via Laravel) */

    const handleExport = () => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (department) params.set('department', department);
        if (date) params.set('date', date);

        const queryString = params.toString();

        window.location.href = `/attendance/export${queryString ? `?${queryString}` : ''}`;
    };

    const statCards = [
        {
            label: 'Present',
            value: stats.present,
            icon: UserCheck,
            valueColor: 'text-[#4D6B00] dark:text-[#C6F432]',
            iconBg: 'bg-[#C6F432]/25 dark:bg-[#C6F432]/10',
            iconColor: 'text-[#4D6B00] dark:text-[#C6F432]',
        },
        {
            label: 'Late',
            value: stats.late,
            icon: Clock,
            valueColor: 'text-amber-600 dark:text-amber-300',
            iconBg: 'bg-amber-100 dark:bg-amber-400/10',
            iconColor: 'text-amber-600 dark:text-amber-300',
        },
        {
            label: 'Absent',
            value: stats.absent,
            icon: UserX,
            valueColor: 'text-red-600 dark:text-[#FF8A7C]',
            iconBg: 'bg-red-100 dark:bg-[#FF6B5B]/10',
            iconColor: 'text-red-600 dark:text-[#FF8A7C]',
        },
        {
            label: 'On Leave',
            value: stats.on_leave,
            icon: CalendarOff,
            valueColor: 'text-[#0B0F1A] dark:text-white',
            iconBg: 'bg-slate-100 dark:bg-white/10',
            iconColor: 'text-[#0B0F1A] dark:text-white',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance">
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
                                Attendance
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Monitor employee time in, time out, and attendance status
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={handleExport} className={outlineButton}>
                                <Download className="h-4 w-4" />
                                Export
                            </button>

                            <button type="button" onClick={() => setShowAddModal(true)} className={primaryButton}>
                                <Plus className="h-4 w-4" />
                                Add Attendance
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

                                            <h2 className={`mt-2 font-['JetBrains_Mono'] text-2xl font-medium ${stat.valueColor}`}>
                                                {stat.value}
                                            </h2>
                                        </div>

                                        <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                                            <Icon className={`h-5 w-5 ${stat.iconColor}`} />
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
                            <div className="relative md:col-span-4">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search name, ID, or department..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            {/* Date */}
                            <div className="md:col-span-2">
                                <input
                                    type="date"
                                    aria-label="Filter by date"
                                    value={date}
                                    onChange={(e) => visit({ date: e.target.value })}
                                    className={`${inputClass} dark:[color-scheme:dark]`}
                                />
                            </div>

                            {/* Department */}
                            <div className="md:col-span-2">
                                <select
                                    aria-label="Filter by department"
                                    value={department}
                                    onChange={(e) => visit({ department: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                                <select
                                    aria-label="Filter by status"
                                    value={status}
                                    onChange={(e) => visit({ status: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">All Status</option>
                                    {(Object.keys(statusLabels) as AttendanceStatus[]).map((key) => (
                                        <option key={key} value={key}>{statusLabels[key]}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear */}
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
                                    Attendance Records
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    <span className="font-['JetBrains_Mono']">{records.total}</span>{' '}
                                    record{records.total !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-white/40">
                                Total hours:{' '}
                                <span className="font-['JetBrains_Mono'] text-sm font-medium text-[#4D6B00] dark:text-[#C6F432]">
                                    {formatHours(totalHours)}
                                </span>
                            </p>
                        </div>

                        {records.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                        <tr>
                                            <th className={`${th} text-left`}>Employee</th>
                                            <th className={`${th} text-left`}>Department</th>
                                            <th className={`${th} text-left`}>Date</th>
                                            <th className={`${th} text-left`}>Time In</th>
                                            <th className={`${th} text-left`}>Time Out</th>
                                            <th className={`${th} text-right`}>Hours</th>
                                            <th className={`${th} text-center`}>Status</th>
                                            <th className={`${th} text-center`}>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {records.data.map((record) => (
                                            <tr key={record.id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C6F432] font-['JetBrains_Mono'] text-xs font-medium text-[#0B0F1A]">
                                                            {initialsOf(record.employee_name)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-[#0B0F1A] dark:text-white">
                                                                {record.employee_name}
                                                            </p>

                                                            <p className="text-xs text-slate-500 dark:text-white/50">
                                                                {record.employee_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {record.department}
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {formatDate(record.date)}
                                                </td>

                                                {/* Time in */}
                                                <td className="px-5 py-4 font-['JetBrains_Mono'] text-sm text-slate-700 dark:text-white/80">
                                                    {formatTime(record.time_in)}
                                                </td>

                                                {/* Time out */}
                                                <td className="px-5 py-4 font-['JetBrains_Mono'] text-sm text-slate-700 dark:text-white/80">
                                                    {formatTime(record.time_out)}
                                                </td>

                                                {/* Hours */}
                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                        {formatHours(record.hours_worked)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 text-center">
                                                    <StatusPill status={record.status} />
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="Edit attendance"
                                                            aria-label={`Edit attendance for ${record.employee_name}`}
                                                            onClick={() => setSelectedRecord(record)}
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#4D6B00] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-[#C6F432]"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete attendance"
                                                            aria-label={`Delete attendance for ${record.employee_name}`}
                                                            onClick={() => setRecordToDelete(record)}
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
                                    <UserCheck className="h-6 w-6 text-slate-400" />
                                </div>

                                <h3 className="font-medium text-slate-700 dark:text-white">
                                    No attendance records found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-400">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Add an attendance record to get started.'}
                                </p>

                                {hasFilters ? (
                                    <button type="button" onClick={clearFilters} className={`${outlineButton} mt-4`}>
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => setShowAddModal(true)} className={`${primaryButton} mt-4`}>
                                        <Plus className="h-4 w-4" />
                                        Add Attendance
                                    </button>
                                )}
                            </div>
                        )}

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {records.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500 dark:text-white/50">
                                    Showing{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">{records.from ?? 0}</span>{' '}
                                    to{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">{records.to ?? 0}</span>{' '}
                                    of{' '}
                                    <span className="font-medium text-slate-700 dark:text-white">{records.total}</span>{' '}
                                    records
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={records.current_page === 1}
                                        onClick={() => goToPage(records.links.find((link) => link.label.includes('Previous'))?.url ?? null)}
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {records.links
                                        .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                                        .map((link, index) => (
                                            <button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                onClick={() => goToPage(link.url)}
                                                disabled={!link.url}
                                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-[#C6F432] text-[#0B0F1A]'
                                                        : 'text-slate-600 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}

                                    <button
                                        type="button"
                                        disabled={records.current_page === records.last_page}
                                        onClick={() => goToPage(records.links.find((link) => link.label.includes('Next'))?.url ?? null)}
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
                ADD ATTENDANCE MODAL
            ============================================================== */}

            <AddModal
                open={showAddModal}
                title="Add Attendance"
                description="Create a new attendance record."
                onClose={() => setShowAddModal(false)}
            >
                <AttendanceForm
                    employees={employees}
                    submitLabel="Save Attendance"
                    onCancel={() => setShowAddModal(false)}
                />
            </AddModal>

            {/* =============================================================
                UPDATE ATTENDANCE MODAL
            ============================================================== */}

            {selectedRecord && (
                <UpdateModal
                    open
                    onClose={() => setSelectedRecord(null)}
                    title="Update Attendance"
                >
                    <AttendanceForm
                        initial={selectedRecord}
                        employees={employees}
                        submitLabel="Update Attendance"
                        onCancel={() => setSelectedRecord(null)}
                    />
                </UpdateModal>
            )}

            {/* =============================================================
                DELETE ATTENDANCE MODAL
            ============================================================== */}

            {recordToDelete && (
                <DeleteModal
                    open
                    processing={deleteForm.processing}
                    onClose={() => setRecordToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Attendance Record"
                    description={`Are you sure you want to delete the attendance record of ${recordToDelete.employee_name} on ${formatDate(
                        recordToDelete.date,
                    )}? This action cannot be undone.`}
                />
            )}
        </AppLayout>
    );
}