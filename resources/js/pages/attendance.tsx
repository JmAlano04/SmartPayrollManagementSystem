import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import AddModal from '@/components/AddModal';
import DeleteModal from '@/components/DeleteModal';
import UpdateModal from '@/components/UpdateModal';

import {
    CalendarOff,
    CheckCircle2,
    Clock3,
    Download,
    Filter,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserX,
    X,
    XCircle,
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

type FormData = Omit<AttendanceRecord, 'id' | 'hours_worked'>;

/* -------------------------------------------------------------------------
| HARDCODED DATA (palitan na lang ng props galing backend later)
------------------------------------------------------------------------- */

const DEPARTMENTS = [
    'Engineering',
    'Finance',
    'Human Resources',
    'Marketing',
    'Operations',
];

const INITIAL_RECORDS: AttendanceRecord[] = [
    { id: 1, employee_name: 'Juan Dela Cruz', employee_code: 'EMP-001', department: 'Engineering', date: '2026-10-12', time_in: '07:56', time_out: '17:04', hours_worked: 8.13, status: 'present', remarks: null },
    { id: 2, employee_name: 'Maria Santos', employee_code: 'EMP-002', department: 'Human Resources', date: '2026-10-12', time_in: '08:02', time_out: '17:00', hours_worked: 7.97, status: 'present', remarks: null },
    { id: 3, employee_name: 'Jose Reyes', employee_code: 'EMP-003', department: 'Finance', date: '2026-10-12', time_in: '08:41', time_out: '17:30', hours_worked: 7.82, status: 'late', remarks: 'Heavy traffic' },
    { id: 4, employee_name: 'Ana Villanueva', employee_code: 'EMP-004', department: 'Marketing', date: '2026-10-12', time_in: null, time_out: null, hours_worked: 0, status: 'absent', remarks: 'No call, no show' },
    { id: 5, employee_name: 'Mark Bautista', employee_code: 'EMP-005', department: 'Engineering', date: '2026-10-12', time_in: '08:00', time_out: '17:00', hours_worked: 8, status: 'present', remarks: null },
    { id: 6, employee_name: 'Liza Mendoza', employee_code: 'EMP-006', department: 'Operations', date: '2026-10-12', time_in: null, time_out: null, hours_worked: 0, status: 'on_leave', remarks: 'Vacation leave' },
    { id: 7, employee_name: 'Carlo Ramirez', employee_code: 'EMP-007', department: 'Finance', date: '2026-10-12', time_in: '08:55', time_out: '18:00', hours_worked: 8.08, status: 'late', remarks: null },
    { id: 8, employee_name: 'Grace Aquino', employee_code: 'EMP-008', department: 'Human Resources', date: '2026-10-12', time_in: '07:48', time_out: '16:52', hours_worked: 8.07, status: 'present', remarks: null },
    { id: 9, employee_name: 'Juan Dela Cruz', employee_code: 'EMP-001', department: 'Engineering', date: '2026-10-09', time_in: '08:03', time_out: '17:10', hours_worked: 8.12, status: 'present', remarks: null },
    { id: 10, employee_name: 'Maria Santos', employee_code: 'EMP-002', department: 'Human Resources', date: '2026-10-09', time_in: '08:00', time_out: '17:00', hours_worked: 8, status: 'present', remarks: null },
    { id: 11, employee_name: 'Jose Reyes', employee_code: 'EMP-003', department: 'Finance', date: '2026-10-09', time_in: null, time_out: null, hours_worked: 0, status: 'absent', remarks: 'Sick, no medical cert' },
    { id: 12, employee_name: 'Ana Villanueva', employee_code: 'EMP-004', department: 'Marketing', date: '2026-10-09', time_in: '08:32', time_out: '17:00', hours_worked: 7.47, status: 'late', remarks: null },
];

/* Helpers */

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
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// Hours between time in and time out, minus 1 hour break for long shifts.
function calcHours(timeIn: string | null, timeOut: string | null) {
    if (!timeIn || !timeOut) {
        return 0;
    }

    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;

    if (diff <= 0) {
        return 0;
    }

    return Math.round((diff > 5 ? diff - 1 : diff) * 100) / 100;
}

const statusLabels: Record<AttendanceStatus, string> = {
    present: 'Present',
    late: 'Late',
    absent: 'Absent',
    on_leave: 'On Leave',
};

/* Shared class names */

const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#b98a2e] focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10 dark:bg-[#0f1712] dark:text-white dark:placeholder:text-white/30';

const labelClass =
    'mb-2 block text-xs font-medium text-slate-600 dark:text-white/60';

const th =
    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50';

const pillBase =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';

function StatusPill({ status }: { status: AttendanceStatus }) {
    if (status === 'present') {
        return (
            <span className={`${pillBase} bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Present
            </span>
        );
    }

    if (status === 'late') {
        return (
            <span className={`${pillBase} bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400`}>
                <Clock3 className="h-3.5 w-3.5" />
                Late
            </span>
        );
    }

    if (status === 'absent') {
        return (
            <span className={`${pillBase} bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400`}>
                <XCircle className="h-3.5 w-3.5" />
                Absent
            </span>
        );
    }

    return (
        <span className={`${pillBase} bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400`}>
            <CalendarOff className="h-3.5 w-3.5" />
            On Leave
        </span>
    );
}

/* Form (used by both Add and Update modals) */

const emptyForm: FormData = {
    employee_name: '',
    employee_code: '',
    department: DEPARTMENTS[0],
    date: '2026-10-12',
    time_in: '08:00',
    time_out: '17:00',
    status: 'present',
    remarks: '',
};

function AttendanceForm({
    initial,
    submitLabel,
    onCancel,
    onSubmit,
}: {
    initial?: FormData;
    submitLabel: string;
    onCancel: () => void;
    onSubmit: (data: FormData) => void;
}) {
    const [data, setData] = useState<FormData>(initial ?? emptyForm);

    const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setData((current) => ({ ...current, [key]: value }));

    const noTime = data.status === 'absent' || data.status === 'on_leave';

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    ...data,
                    time_in: noTime ? null : data.time_in,
                    time_out: noTime ? null : data.time_out,
                    remarks: data.remarks || null,
                });
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Employee Name</label>
                    <input required value={data.employee_name} onChange={(e) => set('employee_name', e.target.value)} placeholder="Juan Dela Cruz" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Employee ID</label>
                    <input required value={data.employee_code} onChange={(e) => set('employee_code', e.target.value)} placeholder="EMP-001" className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Department</label>
                    <select value={data.department} onChange={(e) => set('department', e.target.value)} className={inputClass}>
                        {DEPARTMENTS.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Date</label>
                    <input required type="date" value={data.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
                </div>

                <div>
                    <label className={labelClass}>Status</label>
                    <select value={data.status} onChange={(e) => set('status', e.target.value as AttendanceStatus)} className={inputClass}>
                        {(Object.keys(statusLabels) as AttendanceStatus[]).map((key) => (
                            <option key={key} value={key}>{statusLabels[key]}</option>
                        ))}
                    </select>
                </div>

                <div className="hidden sm:block" />

                <div>
                    <label className={labelClass}>Time In</label>
                    <input type="time" disabled={noTime} value={data.time_in ?? ''} onChange={(e) => set('time_in', e.target.value)} className={`${inputClass} disabled:opacity-40`} />
                </div>

                <div>
                    <label className={labelClass}>Time Out</label>
                    <input type="time" disabled={noTime} value={data.time_out ?? ''} onChange={(e) => set('time_out', e.target.value)} className={`${inputClass} disabled:opacity-40`} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Remarks</label>
                <input value={data.remarks ?? ''} onChange={(e) => set('remarks', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5">
                    Cancel
                </button>

                <button type="submit" className="rounded-lg bg-[#16241c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#22362a] focus:outline-none focus:ring-2 focus:ring-[#b98a2e] focus:ring-offset-2">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

/* Page */

export default function Attendance() {
    const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [date, setDate] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);

    const stats = useMemo(
        () => ({
            present: records.filter((r) => r.status === 'present').length,
            late: records.filter((r) => r.status === 'late').length,
            absent: records.filter((r) => r.status === 'absent').length,
            on_leave: records.filter((r) => r.status === 'on_leave').length,
        }),
        [records],
    );

    const filteredRecords = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return records
            .filter((record) => {
                const matchesSearch =
                    searchTerm === '' ||
                    record.employee_name.toLowerCase().includes(searchTerm) ||
                    record.employee_code.toLowerCase().includes(searchTerm) ||
                    record.department.toLowerCase().includes(searchTerm) ||
                    String(record.remarks ?? '').toLowerCase().includes(searchTerm);

                return (
                    matchesSearch &&
                    (status === '' || record.status === status) &&
                    (department === '' || record.department === department) &&
                    (date === '' || record.date === date)
                );
            })
            .sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id);
    }, [records, search, status, department, date]);

    const totalHours = filteredRecords.reduce((total, r) => total + r.hours_worked, 0);

    const hasFilters = search !== '' || status !== '' || department !== '' || date !== '';

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setDepartment('');
        setDate('');
    };

    /* CRUD (local state lang muna) */

    const handleAdd = (data: FormData) => {
        const nextId = Math.max(0, ...records.map((r) => r.id)) + 1;

        setRecords((current) => [
            ...current,
            { ...data, id: nextId, hours_worked: calcHours(data.time_in, data.time_out) },
        ]);
        setShowAddModal(false);
    };

    const handleUpdate = (data: FormData) => {
        if (!selectedRecord) return;

        setRecords((current) =>
            current.map((r) =>
                r.id === selectedRecord.id
                    ? { ...r, ...data, hours_worked: calcHours(data.time_in, data.time_out) }
                    : r,
            ),
        );
        setSelectedRecord(null);
    };

    const handleDelete = () => {
        if (!recordToDelete) return;

        setRecords((current) => current.filter((r) => r.id !== recordToDelete.id));
        setRecordToDelete(null);
    };

    /* Export CSV (client-side) */

    const handleExport = () => {
        const header = ['Employee', 'ID', 'Department', 'Date', 'Time In', 'Time Out', 'Hours', 'Status', 'Remarks'];
        const rows = filteredRecords.map((r) => [
            r.employee_name,
            r.employee_code,
            r.department,
            r.date,
            r.time_in ?? '',
            r.time_out ?? '',
            r.hours_worked,
            statusLabels[r.status],
            r.remarks ?? '',
        ]);

        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'attendance.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const statCards = [
        { label: 'Present', value: stats.present, icon: UserCheck, valueColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-500/10', iconColor: 'text-green-600' },
        { label: 'Late', value: stats.late, icon: Clock3, valueColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600' },
        { label: 'Absent', value: stats.absent, icon: UserX, valueColor: 'text-red-600', iconBg: 'bg-red-50 dark:bg-red-500/10', iconColor: 'text-red-600' },
        { label: 'On Leave', value: stats.on_leave, icon: CalendarOff, valueColor: 'text-[#16241c] dark:text-white', iconBg: 'bg-slate-100 dark:bg-white/10', iconColor: 'text-[#16241c] dark:text-white' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />

            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1712]">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#16241c] dark:text-white">
                                Attendance
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Monitor employee time in, time out, and attendance status
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#b98a2e] focus:ring-offset-2 dark:border-white/10 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/5 dark:focus:ring-offset-[#0f1712]"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16241c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#22362a] focus:outline-none focus:ring-2 focus:ring-[#b98a2e] focus:ring-offset-2 dark:focus:ring-offset-[#0f1712]"
                            >
                                <Plus className="h-4 w-4" />
                                Add Attendance
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                                {stat.label}
                                            </p>

                                            <p className={`mt-2 text-2xl font-bold ${stat.valueColor}`}>
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg}`}>
                                            <Icon className={`h-5 w-5 ${stat.iconColor}`} />
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className={labelClass}>Search</label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Name, ID, or department..."
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Date</label>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Department</label>

                                <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass}>
                                    <option value="">All Departments</option>
                                    {DEPARTMENTS.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>

                                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                                    <option value="">All Statuses</option>
                                    {(Object.keys(statusLabels) as AttendanceStatus[]).map((key) => (
                                        <option key={key} value={key}>{statusLabels[key]}</option>
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

                    {/* Attendance table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                    Attendance Records
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-white/40">
                                Total hours:{' '}
                                <span className="font-semibold text-[#b98a2e]">
                                    {formatHours(totalHours)}
                                </span>
                            </p>
                        </div>

                        {filteredRecords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                            <th className={`${th} text-left`}>Employee</th>
                                            <th className={`${th} text-left`}>Department</th>
                                            <th className={`${th} text-left`}>Date</th>
                                            <th className={`${th} text-left`}>Time In</th>
                                            <th className={`${th} text-left`}>Time Out</th>
                                            <th className={`${th} text-right`}>Hours</th>
                                            <th className={`${th} text-center`}>Status</th>
                                            <th className={`${th} text-center`}>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {filteredRecords.map((record) => (
                                            <tr key={record.id} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-[#16241c] dark:bg-white/10 dark:text-white">
                                                            {initialsOf(record.employee_name)}
                                                        </span>

                                                        <div>
                                                            <p className="font-medium text-[#16241c] dark:text-white">
                                                                {record.employee_name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {record.employee_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {record.department}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {formatDate(record.date)}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {formatTime(record.time_in)}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-700 dark:text-white/80">
                                                    {formatTime(record.time_out)}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <span className="text-sm font-semibold text-[#16241c] dark:text-white">
                                                        {formatHours(record.hours_worked)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <StatusPill status={record.status} />
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="Edit attendance"
                                                            aria-label={`Edit attendance for ${record.employee_name}`}
                                                            onClick={() => setSelectedRecord(record)}
                                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#b98a2e] dark:text-white/50 dark:hover:bg-white/10"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete attendance"
                                                            aria-label={`Delete attendance for ${record.employee_name}`}
                                                            onClick={() => setRecordToDelete(record)}
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
                                    <UserCheck className="h-7 w-7 text-slate-400 dark:text-white/40" />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#16241c] dark:text-white">
                                    No attendance records found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-white/40">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Add an attendance record to get started.'}
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
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16241c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#22362a]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Attendance
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Attendance Modal */}
            <AddModal
                open={showAddModal}
                title="Add Attendance"
                description="Create a new attendance record."
                onClose={() => setShowAddModal(false)}
            >
                <AttendanceForm
                    submitLabel="Save Attendance"
                    onCancel={() => setShowAddModal(false)}
                    onSubmit={handleAdd}
                />
            </AddModal>

            {/* Update Attendance Modal */}
            {selectedRecord && (
                <UpdateModal
                    open
                    onClose={() => setSelectedRecord(null)}
                    title="Update Attendance"
                >
                    <AttendanceForm
                        initial={selectedRecord}
                        submitLabel="Update Attendance"
                        onCancel={() => setSelectedRecord(null)}
                        onSubmit={handleUpdate}
                    />
                </UpdateModal>
            )}

            {/* Delete Attendance Modal */}
            {recordToDelete && (
                <DeleteModal
                    open
                    processing={false}
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