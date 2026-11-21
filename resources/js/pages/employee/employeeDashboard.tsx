import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type ComponentType } from 'react';

import {
    Banknote,
    CalendarCheck,
    CheckCircle2,
    Clock3,
    Download,
    Timer,
    XCircle,
} from 'lucide-react';

/* Breadcrumbs */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

/* Data the backend sends for an employee (Inertia prop: employee) */

interface EmployeePayslip {
    id: number;
    payslip_number: string;
    pay_period: string;
    pay_date: string | null;
    status: string;
    net_pay: number;
}

interface EmployeeLatestPayslip extends EmployeePayslip {
    base_pay: number;
    overtime_pay: number;
    allowances_total: number;
    gross_pay: number;
    tax_amount: number;
    total_deductions: number;
}

interface EmployeeAttendanceRecord {
    id: number;
    date: string;
    time_in: string | null;
    time_out: string | null;
    hours_worked: number;
    status: 'present' | 'late' | 'absent' | 'on_leave';
}

interface EmployeeAttendance {
    present: number;
    late: number;
    absent: number;
    on_leave: number;
    hours_worked: number;
    recent: EmployeeAttendanceRecord[];
}

interface EmployeeData {
    position?: string | null;
    department?: string | null;
    latestPayslip: EmployeeLatestPayslip | null;
    payslips: EmployeePayslip[];
    attendance: EmployeeAttendance;
}

/* Helpers */

function formatCurrency(amount: number) {
    return `₱ ${Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/* Status pills (same look as the other pages) */

type StatusStyle = {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
};

const okPill = 'bg-[#C6F432]/25 text-[#456000] dark:bg-[#C6F432]/10 dark:text-[#C6F432]';
const waitPill = 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300';

const statusStyles: Record<string, StatusStyle> = {
    paid: { label: 'Paid', icon: CheckCircle2, className: okPill },
    approved: { label: 'Approved', icon: CheckCircle2, className: okPill },
    draft: { label: 'Draft', icon: Clock3, className: waitPill },
    pending: { label: 'Pending', icon: Clock3, className: waitPill },
    processing: {
        label: 'Processing',
        icon: Clock3,
        className: 'bg-indigo-100 text-indigo-700 dark:bg-[#4F5BFF]/15 dark:text-[#9AA3FF]',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-[#FF6B5B]/15 dark:text-[#FF8A7C]',
    },
};

const fallbackStatus: StatusStyle = {
    label: '',
    icon: Clock3,
    className: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60',
};

/* Shared class names */

const card =
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121829]';

const cardHeader =
    'flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10';

const th =
    'px-5 py-3 font-[\'JetBrains_Mono\'] text-[11px] font-medium uppercase tracking-widest text-slate-500 dark:text-white/50';

const accentText = 'text-[#4D6B00] dark:text-[#C6F432]';

/* =========================================================================
   Employee view
   ========================================================================= */

const attendanceStyles: Record<string, { label: string; className: string }> = {
    present: { label: 'Present', className: okPill },
    late: { label: 'Late', className: waitPill },
    absent: {
        label: 'Absent',
        className: 'bg-red-100 text-red-700 dark:bg-[#FF6B5B]/15 dark:text-[#FF8A7C]',
    },
    on_leave: {
        label: 'On Leave',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-[#4F5BFF]/15 dark:text-[#9AA3FF]',
    },
};

function formatLocalDate(date: string | null) {
    if (!date) {
        return '—';
    }

    const [year, month, day] = date.split('-').map(Number);

    if ([year, month, day].some((part) => Number.isNaN(part))) {
        return date;
    }

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
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

const emptyAttendance: EmployeeAttendance = {
    present: 0,
    late: 0,
    absent: 0,
    on_leave: 0,
    hours_worked: 0,
    recent: [],
};

const outlineBtn =
    'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10';

const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#C6F432] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] shadow-sm transition hover:bg-[#D6FF55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6F432] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F1A]';

export default function EmployeeDashboard({ employee }: { employee?: EmployeeData | null }) {
    const { auth, flash } = usePage<SharedData>().props;

    const firstName = (auth?.user?.name ?? '').split(' ')[0] || 'there';

    const greeting = flash?.isFirstLogin
        ? `Welcome, ${firstName}!`
        : `Welcome back, ${firstName}`;

    const latest = employee?.latestPayslip ?? null;
    const payslips = employee?.payslips ?? [];
    const attendance = employee?.attendance ?? emptyAttendance;

    const subtitle =
        [employee?.position, employee?.department].filter(Boolean).join(' · ') ||
        'Your pay, attendance and payslips at a glance';

    const statCards = [
        {
            label: 'Latest Net Pay',
            value: formatCurrency(latest?.net_pay ?? 0),
            icon: Banknote,
            iconBg: 'bg-[#C6F432]',
            iconColor: 'text-[#0B0F1A]',
            valueSize: 'text-xl',
        },
        {
            label: 'Hours This Month',
            value: formatHours(attendance.hours_worked),
            icon: Timer,
            iconBg: 'bg-slate-100 dark:bg-white/10',
            iconColor: 'text-[#0B0F1A] dark:text-white',
            valueSize: 'text-xl',
        },
        {
            label: 'Days Present',
            value: attendance.present,
            icon: CalendarCheck,
            iconBg: 'bg-indigo-50 dark:bg-[#4F5BFF]/15',
            iconColor: 'text-indigo-600 dark:text-[#9AA3FF]',
            valueSize: 'text-2xl',
        },
        {
            label: 'Late / Absent',
            value: `${attendance.late} / ${attendance.absent}`,
            icon: Clock3,
            iconBg: 'bg-amber-50 dark:bg-amber-400/10',
            iconColor: 'text-amber-600 dark:text-amber-300',
            valueSize: 'text-2xl',
        },
    ];

    const stubRows: { label: string; value: number; negative?: boolean }[] = latest
        ? [
              { label: 'Base pay', value: latest.base_pay },
              { label: 'Overtime', value: latest.overtime_pay },
              { label: 'Allowances', value: latest.allowances_total },
          ]
        : [];

    const latestStatus = latest
        ? (statusStyles[String(latest.status).toLowerCase()] ?? fallbackStatus)
        : fallbackStatus;
    const LatestStatusIcon = latestStatus.icon;

    const counters = [
        { label: 'Present', value: attendance.present, color: accentText },
        { label: 'Late', value: attendance.late, color: 'text-amber-600 dark:text-amber-300' },
        { label: 'Absent', value: attendance.absent, color: 'text-red-600 dark:text-[#FF8A7C]' },
        { label: 'On leave', value: attendance.on_leave, color: 'text-indigo-600 dark:text-[#9AA3FF]' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="dark min-h-full bg-[#0B0F1A] font-['Bricolage_Grotesque'] text-white">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0B0F1A] dark:text-white">
                                {greeting}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                {subtitle}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <a href="/attendance" className={outlineBtn}>
                                <CalendarCheck className="h-4 w-4" />
                                My Attendance
                            </a>

                            {latest ? (
                                <a
                                    href={route('payslips.download', latest.id)}
                                    className={primaryBtn}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Latest Payslip
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className={`${primaryBtn} cursor-not-allowed opacity-50`}
                                >
                                    <Download className="h-4 w-4" />
                                    Download Latest Payslip
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div key={stat.label} className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                                {stat.label}
                                            </p>

                                            <p
                                                className={`mt-2 font-['JetBrains_Mono'] font-medium text-[#0B0F1A] dark:text-white ${stat.valueSize}`}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                                        >
                                            <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Latest payslip + attendance */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                        {/* Latest payslip */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold text-[#0B0F1A] dark:text-white">
                                        Latest Payslip
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                        {latest
                                            ? `${latest.payslip_number} · ${latest.pay_period}`
                                            : 'Your most recent pay'}
                                    </p>
                                </div>

                                {latest && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${latestStatus.className}`}
                                    >
                                        <LatestStatusIcon className="h-3.5 w-3.5" />
                                        {latestStatus.label || latest.status}
                                    </span>
                                )}
                            </div>

                            <div className="p-5">
                                {latest ? (
                                    <dl className="space-y-2.5 font-['JetBrains_Mono'] text-[13px]">
                                        {stubRows.map((row) => (
                                            <div key={row.label} className="flex justify-between">
                                                <dt className="text-slate-500 dark:text-white/60">
                                                    {row.label}
                                                </dt>
                                                <dd className="text-slate-700 dark:text-white/80">
                                                    {formatCurrency(row.value)}
                                                </dd>
                                            </div>
                                        ))}

                                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 dark:border-white/15">
                                            <dt className="text-slate-700 dark:text-white/80">Gross pay</dt>
                                            <dd className="font-medium text-[#0B0F1A] dark:text-white">
                                                {formatCurrency(latest.gross_pay)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-white/60">Tax</dt>
                                            <dd className="text-slate-700 dark:text-white/80">
                                                −{formatCurrency(latest.tax_amount)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-white/60">
                                                Total deductions
                                            </dt>
                                            <dd className="text-slate-700 dark:text-white/80">
                                                −{formatCurrency(latest.total_deductions)}
                                            </dd>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-[#C6F432]/25 px-3 py-3 dark:bg-[#C6F432]/10">
                                            <dt className="text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                Net pay
                                            </dt>
                                            <dd className={`text-base font-medium ${accentText}`}>
                                                {formatCurrency(latest.net_pay)}
                                            </dd>
                                        </div>

                                        {latest.pay_date && (
                                            <p className="pt-1 text-xs text-slate-400">
                                                Pay date: {formatLocalDate(latest.pay_date)}
                                            </p>
                                        )}
                                    </dl>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-white/40">
                                        No payslip has been issued to you yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attendance this month */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold text-[#0B0F1A] dark:text-white">
                                        Attendance This Month
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                        Your recent time in and time out
                                    </p>
                                </div>

                                <a
                                    href="/attendance"
                                    className={`text-sm font-medium transition hover:underline ${accentText}`}
                                >
                                    View all
                                </a>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="grid grid-cols-4 gap-2">
                                    {counters.map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-xl bg-slate-50 px-3 py-3 text-center dark:bg-white/5"
                                        >
                                            <p
                                                className={`font-['JetBrains_Mono'] text-xl font-medium ${item.color}`}
                                            >
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-500 dark:text-white/50">
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {attendance.recent.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-white/40">
                                        No attendance records yet this month.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-slate-100 dark:divide-white/5">
                                        {attendance.recent.slice(0, 5).map((record) => {
                                            const style =
                                                attendanceStyles[record.status] ?? {
                                                    label: record.status,
                                                    className: fallbackStatus.className,
                                                };

                                            return (
                                                <li
                                                    key={record.id}
                                                    className="flex items-center justify-between gap-3 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                            {formatLocalDate(record.date)}
                                                        </p>
                                                        <p className="mt-0.5 font-['JetBrains_Mono'] text-xs text-slate-500 dark:text-white/50">
                                                            {formatTime(record.time_in)} –{' '}
                                                            {formatTime(record.time_out)}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-3">
                                                        <span className="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-white/70">
                                                            {formatHours(record.hours_worked)}
                                                        </span>
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
                                                        >
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* My payslips */}
                    <div className={`${card} overflow-hidden`}>
                        <div className={cardHeader}>
                            <div>
                                <h2 className="text-base font-semibold text-[#0B0F1A] dark:text-white">
                                    My Payslips
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    Your recent payslips
                                </p>
                            </div>

                            <a
                                href={route('payslips.index')}
                                className={`text-sm font-medium transition hover:underline ${accentText}`}
                            >
                                View all
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                        <th className={`${th} text-left`}>Payslip</th>
                                        <th className={`${th} text-left`}>Pay Period</th>
                                        <th className={`${th} text-right`}>Net Pay</th>
                                        <th className={`${th} text-center`}>Status</th>
                                        <th className={`${th} text-center`}>Download</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {payslips.length > 0 ? (
                                        payslips.map((payslip) => {
                                            const style =
                                                statusStyles[String(payslip.status).toLowerCase()] ??
                                                fallbackStatus;
                                            const StatusIcon = style.icon;

                                            return (
                                                <tr
                                                    key={payslip.id}
                                                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                                >
                                                    <td className="px-5 py-4 font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                        {payslip.payslip_number}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-slate-700 dark:text-white/80">
                                                            {payslip.pay_period}
                                                        </p>

                                                        {payslip.pay_date && (
                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Paid {formatLocalDate(payslip.pay_date)}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <span className="font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                            {formatCurrency(payslip.net_pay)}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
                                                        >
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {style.label || payslip.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-center">
                                                        <a
                                                            href={route('payslips.download', payslip.id)}
                                                            title="Download payslip"
                                                            aria-label={`Download payslip ${payslip.payslip_number}`}
                                                            className="inline-flex rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-[#9AA3FF]"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-sm text-slate-500 dark:text-white/40"
                                            >
                                                No payslips available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}