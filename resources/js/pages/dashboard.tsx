import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, type ComponentType } from 'react';

import AddModal from '@/components/AddModal';
import AddEmployeeForm from '@/components/employees/AddEmployeeForm';

import {
    Banknote,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';

/*
 * Light palette (matches welcome-light.tsx)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   amber  #F2B01E   red    #D92D20
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

/* Breadcrumbs */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

/* Types */

interface Stats {
    employees: number;
    payrollRuns: number;
    payslips: number;
    totalPayroll: number;
}

interface PayRun {
    id: number;
    period_start: string;
    period_end: string;
    total_net: number;
    status: string;
}

interface TrendItem {
    id: number;
    period_start: string;
    period_end: string;
    total_net: number;
}

interface NeedsReviewItem {
    id: number;
    employee_id: number;
    gross_pay: number;
    anomaly_reason: string;
    is_flagged_anomaly: boolean;
    employee: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

interface Props {
    stats: Stats;
    payRuns: PayRun[];
    trend: TrendItem[];
    needsReview: NeedsReviewItem[];
}

/* Helpers */

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

function getPayrunNumber(id: number) {
    return `PR-${String(id).padStart(4, '0')}`;
}

/* Status pills */

type StatusStyle = {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
};

const okPill = 'bg-[#D1FADF] text-[#05603A]';
const waitPill = 'bg-[#FEF0C7] text-[#7A4B00]';

const statusStyles: Record<string, StatusStyle> = {
    paid: { label: 'Paid', icon: CheckCircle2, className: okPill },
    approved: { label: 'Approved', icon: CheckCircle2, className: okPill },
    draft: { label: 'Draft', icon: Clock3, className: waitPill },
    pending: { label: 'Pending', icon: Clock3, className: waitPill },
    processing: {
        label: 'Processing',
        icon: Clock3,
        className: 'bg-[#E0EAFF] text-[#3538CD]',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'bg-[#FEE4E2] text-[#B42318]',
    },
};

const fallbackStatus: StatusStyle = {
    label: '',
    icon: Clock3,
    className: 'bg-[#F2F4F7] text-[#475467]',
};

/* Shared class names */

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const cardHeader =
    'flex items-center justify-between border-b border-[#E4E7EC] px-5 py-4';

const th = 'px-5 py-3 text-xs font-medium text-[#667085]';

const accentText = 'text-[#0E7A5A]';

const mono = "font-['IBM_Plex_Mono']";

/* Dashboard */

export default function Dashboard({
    stats,
    payRuns,
    trend,
    needsReview,
}: Props) {
    const { auth, flash } = usePage<SharedData>().props;

    const firstName = (auth?.user?.name ?? '').split(' ')[0] || 'there';

    const greeting = flash?.isFirstLogin
        ? `Welcome, ${firstName}!`
        : `Welcome back, ${firstName}`;

    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

    /* Payroll trend */

    const trendData = (trend ?? []).map((item) => {
        const [year, month] = (item.period_start ?? '').split('-');

        return {
            id: item.id,
            year: Number(year),
            month: new Date(Number(year), Number(month) - 1, 1).toLocaleString(
                'en-US',
                { month: 'short' },
            ),
            value: Number(item.total_net ?? 0),
        };
    });

    const maxTrend = Math.max(...trendData.map((item) => item.value), 0);

    /* Stat cards */

    const statCards = [
        {
            label: 'Total Payroll - Paid',
            value: formatCurrency(stats?.totalPayroll ?? 0),
            icon: Banknote,
            iconBg: 'bg-[#0E7A5A]',
            iconColor: 'text-white',
            valueSize: 'text-xl',
        },
        {
            label: 'Employees',
            value: stats?.employees ?? 0,
            icon: Users,
            iconBg: 'bg-[#F2F4F7]',
            iconColor: 'text-[#344054]',
            valueSize: 'text-2xl',
        },
        {
            label: 'Draft Payroll Runs',
            value: stats?.payrollRuns ?? 0,
            icon: Clock3,
            iconBg: 'bg-[#FEF0C7]',
            iconColor: 'text-[#7A4B00]',
            valueSize: 'text-2xl',
        },
        {
            label: 'Payslips',
            value: stats?.payslips ?? 0,
            icon: FileText,
            iconBg: 'bg-[#E0EAFF]',
            iconColor: 'text-[#3538CD]',
            valueSize: 'text-2xl',
        },
    ];

    /* Needs review */

    const anomalies = (needsReview ?? [])
        .filter((item) => item.is_flagged_anomaly)
        .slice(0, 3)
        .map((item) => {
            const employeeName = [
                item.employee?.first_name,
                item.employee?.last_name,
            ]
                .filter(Boolean)
                .join(' ');

            const amountValue = Number(item.gross_pay ?? 0);
            const sign = amountValue >= 0 ? '+' : '-';

            return {
                id: item.id,
                employee: employeeName || 'Unknown employee',
                role: 'Employee',
                issue: item.anomaly_reason || 'Needs review',
                amount: `${sign}${formatCurrency(Math.abs(amountValue))}`,
            };
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                                {greeting}
                            </h1>

                            <p className="mt-1 text-sm text-[#475467]">
                                Payroll performance and what needs your
                                attention today
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAddEmployeeModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]"
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
                                <div key={stat.label} className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#667085]">
                                                {stat.label}
                                            </p>

                                            <p
                                                className={`mt-2 ${mono} font-medium text-[#101828] ${stat.valueSize}`}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
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

                    {/* Trend + Needs review */}
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        {/* Payroll cost trend */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold text-[#101828]">
                                        Payroll Cost Trend
                                    </h2>

                                    <p className="mt-1 text-xs text-[#667085]">
                                        Payroll cost per pay cycle
                                    </p>
                                </div>

                                <span className="rounded-full bg-[#D1FADF] px-2.5 py-1 text-xs font-medium text-[#05603A]">
                                    Net Pay
                                </span>
                            </div>

                            <div className="p-5">
                                {trendData.length === 0 ? (
                                    <div className="flex h-40 items-center justify-center">
                                        <p className="text-sm text-[#667085]">
                                            No payroll trend data available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-2 rounded-xl bg-[#F9FAFB] p-3">
                                        {trendData.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                            >
                                                <span
                                                    className={`${mono} text-[10px] text-[#475467]`}
                                                >
                                                    ₱
                                                    {item.value.toLocaleString(
                                                        'en-PH',
                                                        {
                                                            maximumFractionDigits: 0,
                                                        },
                                                    )}
                                                </span>

                                                <div className="relative flex h-32 w-full items-end justify-center">
                                                    <div className="h-full w-full max-w-9 rounded-t-md bg-[#E4E7EC]" />

                                                    <div
                                                        className="absolute bottom-0 w-full max-w-9 rounded-t-md bg-[#0E7A5A]"
                                                        style={{
                                                            height:
                                                                maxTrend > 0
                                                                    ? `${(item.value / maxTrend) * 100}%`
                                                                    : '0%',
                                                        }}
                                                    />
                                                </div>

                                                <span className="text-[11px] text-[#667085]">
                                                    {item.month} {item.year}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Needs review */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <h2 className="text-base font-semibold text-[#101828]">
                                    Needs Review
                                </h2>

                                <span className="inline-flex items-center rounded-full bg-[#FEE4E2] px-2.5 py-1 text-xs font-medium text-[#B42318]">
                                    {anomalies.length} flagged
                                </span>
                            </div>

                            <div className="space-y-3 p-5">
                                {anomalies.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#D0D5DD] px-3 py-6 text-center text-sm text-[#667085]">
                                        No items need review.
                                    </div>
                                ) : (
                                    anomalies.map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            className="flex w-full items-start justify-between gap-3 rounded-xl border border-[#E4E7EC] p-3 text-left transition hover:border-[#0E7A5A]/40 hover:bg-[#D1FADF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A]/60"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[#101828]">
                                                    {a.employee}
                                                </p>

                                                <p className="text-xs text-[#667085]">
                                                    {a.role}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[#475467]">
                                                    {a.issue}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex shrink-0 items-center gap-1 pt-0.5 ${mono} text-xs font-medium ${accentText}`}
                                            >
                                                {a.amount}
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent pay runs */}
                    <div className={`${card} overflow-hidden`}>
                        <div className={cardHeader}>
                            <div>
                                <h2 className="text-base font-semibold text-[#101828]">
                                    Recent Pay Runs
                                </h2>

                                <p className="mt-1 text-xs text-[#667085]">
                                    Your latest payroll runs
                                </p>
                            </div>

                            <a
                                href="/payroll-runs"
                                className={`text-sm font-medium transition hover:underline ${accentText}`}
                            >
                                View all
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
                                        <th className={`${th} text-left`}>
                                            Pay Run
                                        </th>
                                        <th className={`${th} text-left`}>
                                            Pay Period
                                        </th>
                                        <th className={`${th} text-right`}>
                                            Net Pay
                                        </th>
                                        <th className={`${th} text-center`}>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#F2F4F7]">
                                    {payRuns?.length > 0 ? (
                                        payRuns.map((run) => {
                                            const style =
                                                statusStyles[
                                                    String(
                                                        run.status,
                                                    ).toLowerCase()
                                                ] ?? fallbackStatus;
                                            const StatusIcon = style.icon;

                                            return (
                                                <tr
                                                    key={run.id}
                                                    className="transition hover:bg-[#F9FAFB]"
                                                >
                                                    <td
                                                        className={`px-5 py-4 ${mono} text-sm font-medium text-[#101828]`}
                                                    >
                                                        {getPayrunNumber(
                                                            run.id,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-[#344054]">
                                                            {formatDate(
                                                                run.period_start,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#667085]">
                                                            to{' '}
                                                            {formatDate(
                                                                run.period_end,
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm font-medium text-[#101828]`}
                                                        >
                                                            {formatCurrency(
                                                                run.total_net,
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
                                                        >
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {style.label ||
                                                                run.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center text-sm text-[#667085]"
                                            >
                                                No recent pay runs available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
        </AppLayout>
    );
}