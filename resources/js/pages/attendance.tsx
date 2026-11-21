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

/*
 * Light palette (matches welcome-light, dashboard-light, pay-runs-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   present #D1FADF / #05603A   late #FEF0C7 / #7A4B00
 *   absent #FEE4E2 / #B42318   leave #E0EAFF / #3538CD
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

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
            return 'bg-[#D1FADF] text-[#05603A]';

        case 'late':
            return 'bg-[#FEF0C7] text-[#7A4B00]';

        case 'absent':
            return 'bg-[#FEE4E2] text-[#B42318]';

        case 'on_leave':
            return 'bg-[#E0EAFF] text-[#3538CD]';

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

const inputClass =
    'h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20 disabled:opacity-40';

const labelClass = 'mb-2 block text-xs font-medium text-[#344054]';

const th = 'px-5 py-4 text-xs font-medium text-[#667085]';

const outlineButton =
    'inline-flex items-center justify-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB]';

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA] disabled:cursor-not-allowed disabled:opacity-50';

const pageButton =
    'rounded-lg border border-[#D0D5DD] p-2 text-[#475467] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40';

const errorText = 'mt-1 text-xs text-[#D92D20]';

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
                    {form.errors.employee_id && <p className={errorText}>{form.errors.employee_id}</p>}
                </div>

                <div>
                    <label className={labelClass}>Department</label>
                    <input
                        readOnly
                        value={employees.find((employee) => employee.id === form.data.employee_id)?.department ?? '—'}
                        className={`${inputClass} bg-[#F9FAFB]`}
                    />
                </div>

                <div>
                    <label className={labelClass}>Date</label>
                    <input required type="date" value={form.data.date} onChange={(event) => form.setData('date', event.target.value)} className={inputClass} />
                    {form.errors.date && <p className={errorText}>{form.errors.date}</p>}
                </div>

                <div>
                    <label className={labelClass}>Status</label>
                    <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value as AttendanceStatus)} className={inputClass}>
                        {(Object.keys(statusLabels) as AttendanceStatus[]).map((key) => (
                            <option key={key} value={key}>{statusLabels[key]}</option>
                        ))}
                    </select>
                    {form.errors.status && <p className={errorText}>{form.errors.status}</p>}
                </div>

                <div className="hidden sm:block" />

                <div>
                    <label className={labelClass}>Time In</label>
                    <input type="time" disabled={noTime} value={form.data.time_in ?? ''} onChange={(event) => form.setData('time_in', event.target.value)} className={inputClass} />
                    {form.errors.time_in && <p className={errorText}>{form.errors.time_in}</p>}
                </div>

                <div>
                    <label className={labelClass}>Time Out</label>
                    <input type="time" disabled={noTime} value={form.data.time_out ?? ''} onChange={(event) => form.setData('time_out', event.target.value)} className={inputClass} />
                    {form.errors.time_out && <p className={errorText}>{form.errors.time_out}</p>}
                </div>
            </div>

            <div>
                <label className={labelClass}>Remarks</label>
                <input value={form.data.remarks ?? ''} onChange={(event) => form.setData('remarks', event.target.value)} placeholder="Optional" className={inputClass} />
                {form.errors.remarks && <p className={errorText}>{form.errors.remarks}</p>}
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
            valueColor: 'text-[#0E7A5A]',
            iconBg: 'bg-[#D1FADF]',
            iconColor: 'text-[#0E7A5A]',
        },
        {
            label: 'Late',
            value: stats.late,
            icon: Clock,
            valueColor: 'text-[#7A4B00]',
            iconBg: 'bg-[#FEF0C7]',
            iconColor: 'text-[#7A4B00]',
        },
        {
            label: 'Absent',
            value: stats.absent,
            icon: UserX,
            valueColor: 'text-[#B42318]',
            iconBg: 'bg-[#FEE4E2]',
            iconColor: 'text-[#B42318]',
        },
        {
            label: 'On Leave',
            value: stats.on_leave,
            icon: CalendarOff,
            valueColor: 'text-[#3538CD]',
            iconBg: 'bg-[#E0EAFF]',
            iconColor: 'text-[#3538CD]',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] p-4 font-['Instrument_Sans'] text-[#101828] md:p-6"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Attendance</h1>

                            <p className="mt-1 text-sm text-[#475467]">
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
                                <div key={stat.label} className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">{stat.label}</p>

                                            <h2 className={`mt-2 ${mono} text-2xl font-medium ${stat.valueColor}`}>
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

                    <div className={`${card} p-4`}>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            {/* Search */}
                            <div className="relative md:col-span-4">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

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
                                    className={inputClass}
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
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
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
                                <h2 className="text-base font-semibold text-[#101828]">Attendance Records</h2>

                                <p className="mt-1 text-xs text-[#667085]">
                                    <span className={mono}>{records.total}</span>{' '}
                                    record{records.total !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            <p className="text-xs text-[#667085]">
                                Total hours:{' '}
                                <span className={`${mono} text-sm font-medium text-[#0E7A5A]`}>
                                    {formatHours(totalHours)}
                                </span>
                            </p>
                        </div>

                        {records.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
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

                                    <tbody className="divide-y divide-[#F2F4F7]">
                                        {records.data.map((record) => (
                                            <tr key={record.id} className="transition hover:bg-[#F9FAFB]">
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D1FADF] ${mono} text-xs font-medium text-[#05603A]`}>
                                                            {initialsOf(record.employee_name)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-[#101828]">
                                                                {record.employee_name}
                                                            </p>

                                                            <p className="text-xs text-[#667085]">
                                                                {record.employee_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {record.department}
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4 text-sm text-[#344054]">
                                                    {formatDate(record.date)}
                                                </td>

                                                {/* Time in */}
                                                <td className={`px-5 py-4 ${mono} text-sm text-[#344054]`}>
                                                    {formatTime(record.time_in)}
                                                </td>

                                                {/* Time out */}
                                                <td className={`px-5 py-4 ${mono} text-sm text-[#344054]`}>
                                                    {formatTime(record.time_out)}
                                                </td>

                                                {/* Hours */}
                                                <td className="px-5 py-4 text-right">
                                                    <span className={`${mono} text-sm font-medium text-[#101828]`}>
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
                                                            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#0E7A5A]"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete attendance"
                                                            aria-label={`Delete attendance for ${record.employee_name}`}
                                                            onClick={() => setRecordToDelete(record)}
                                                            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#FEE4E2] hover:text-[#B42318]"
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
                                    <UserCheck className="h-6 w-6 text-[#98A2B3]" />
                                </div>

                                <h3 className="font-medium text-[#101828]">No attendance records found</h3>

                                <p className="mt-1 max-w-sm text-sm text-[#667085]">
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
                            <div className="flex flex-col gap-4 border-t border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Showing{' '}
                                    <span className="font-medium text-[#101828]">{records.from ?? 0}</span>{' '}
                                    to{' '}
                                    <span className="font-medium text-[#101828]">{records.to ?? 0}</span>{' '}
                                    of{' '}
                                    <span className="font-medium text-[#101828]">{records.total}</span>{' '}
                                    records
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={records.current_page === 1}
                                        onClick={() => goToPage(records.links.find((link) => link.label.includes('Previous'))?.url ?? null)}
                                        className={pageButton}
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
                                                        ? 'bg-[#0E7A5A] text-white'
                                                        : 'text-[#475467] hover:bg-[#F2F4F7]'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}

                                    <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={records.current_page === records.last_page}
                                        onClick={() => goToPage(records.links.find((link) => link.label.includes('Next'))?.url ?? null)}
                                        className={pageButton}
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