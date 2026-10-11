import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, type ComponentType } from 'react';

import AddModal from '@/components/AddModal';
import AddEmployeeForm from '@/components/employees/AddEmployeeForm';

import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';

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

/* Status pills (same look as the Pay Runs page) */

type StatusStyle = {
    label: string;
    className: string;
    icon: ComponentType<{ className?: string }>;
};

const statusStyles: Record<string, StatusStyle> = {
    paid: {
        label: 'Paid',
        icon: CheckCircle2,
        className:
            'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        className:
            'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    },
    draft: {
        label: 'Draft',
        icon: Clock3,
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    },
    pending: {
        label: 'Pending',
        icon: Clock3,
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    },
    processing: {
        label: 'Processing',
        icon: Clock3,
        className:
            'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        className:
            'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    },
};

const fallbackStatus: StatusStyle = {
    label: '',
    icon: Clock3,
    className: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60',
};

/* Shared class names */

const card =
    'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16241c]';

const cardHeader =
    'flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10';

const th =
    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50';

/* Dashboard */

export default function Dashboard({
    stats,
    payRuns,
    trend,
    needsReview,
}: Props) {
    const { auth, flash } = usePage<SharedData>().props;

    const firstName = auth.user.name.split(' ')[0];

    const greeting = flash.isFirstLogin
        ? `Welcome, ${firstName}!`
        : `Welcome back, ${firstName}`;

    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

    /* Payroll trend */

    const trendData = (trend ?? []).map((item) => {
        const [year, month] = item.period_start.split('-');

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
            label: 'Total Payroll',
            value: formatCurrency(stats?.totalPayroll ?? 0),
            delta: '4.2%',
            trend: 'down',
            icon: Banknote,
            iconBg: 'bg-[#b98a2e]/10',
            iconColor: 'text-[#b98a2e]',
            valueSize: 'text-xl',
        },
        {
            label: 'Employees',
            value: stats?.employees ?? 0,
            delta: '2.1%',
            trend: 'up',
            icon: Users,
            iconBg: 'bg-slate-100 dark:bg-white/10',
            iconColor: 'text-[#16241c] dark:text-white',
            valueSize: 'text-2xl',
        },
        {
            label: 'Pending Approvals',
            value: stats?.payrollRuns ?? 0,
            delta: '1.3%',
            trend: 'down',
            icon: Clock3,
            iconBg: 'bg-amber-50 dark:bg-amber-500/10',
            iconColor: 'text-amber-600',
            valueSize: 'text-2xl',
        },
        {
            label: 'Payslips',
            value: stats?.payslips ?? 0,
            delta: '0.8%',
            trend: 'down',
            icon: FileText,
            iconBg: 'bg-green-50 dark:bg-green-500/10',
            iconColor: 'text-green-600',
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
            <Head title="Dashboard" />

            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1712]">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#16241c] dark:text-white">
                                {greeting}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Payroll performance and what needs your
                                attention today
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
                                <div key={stat.label} className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                                {stat.label}
                                            </p>

                                            <p
                                                className={`mt-2 font-bold text-[#16241c] dark:text-white ${stat.valueSize}`}
                                            >
                                                {stat.value}
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${
                                                    stat.trend === 'up'
                                                        ? 'text-green-600'
                                                        : 'text-amber-600'
                                                }`}
                                            >
                                                {stat.trend === 'up' ? (
                                                    <ArrowUpRight className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDownRight className="h-3 w-3" />
                                                )}
                                                {stat.delta}
                                            </span>
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

                    {/* Trend + Needs review */}
                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        {/* Payroll cost trend */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                        Payroll Cost Trend
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                        Payroll cost per pay cycle
                                    </p>
                                </div>

                                <span className="rounded-full bg-[#b98a2e]/10 px-2.5 py-1 text-xs font-medium text-[#b98a2e]">
                                    Net Pay
                                </span>
                            </div>

                            <div className="p-5">
                                {trendData.length === 0 ? (
                                    <div className="flex h-40 items-center justify-center">
                                        <p className="text-sm text-slate-500 dark:text-white/40">
                                            No payroll trend data available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-2 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                                        {trendData.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-1 flex-col items-center gap-2"
                                            >
                                                <span className="text-[11px] text-slate-500 dark:text-white/70">
                                                    ₱
                                                    {item.value.toLocaleString(
                                                        'en-PH',
                                                        {
                                                            maximumFractionDigits: 0,
                                                        },
                                                    )}
                                                </span>

                                                <div className="relative flex h-32 w-full items-end justify-center">
                                                    <div className="h-full w-full max-w-9 rounded-t-md bg-[#16241c]/10 dark:bg-white/10" />

                                                    <div
                                                        className="absolute bottom-0 w-full max-w-9 rounded-t-md bg-[#b98a2e]"
                                                        style={{
                                                            height:
                                                                maxTrend > 0
                                                                    ? `${(item.value / maxTrend) * 100}%`
                                                                    : '0%',
                                                        }}
                                                    />
                                                </div>

                                                <span className="text-[11px] text-slate-400 dark:text-white/45">
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
                                <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                    Needs Review
                                </h2>

                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                    {anomalies.length} flagged
                                </span>
                            </div>

                            <div className="space-y-3 p-5">
                                {anomalies.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-white/40">
                                        No items need review.
                                    </div>
                                ) : (
                                    anomalies.map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            className="flex w-full items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-[#b98a2e]/40 hover:bg-[#b98a2e]/5 focus:outline-none focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[#16241c] dark:text-white">
                                                    {a.employee}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {a.role}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/60">
                                                    {a.issue}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1 pt-0.5 text-xs font-medium text-[#b98a2e]">
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
                                <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                    Recent Pay Runs
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    Your latest payroll runs
                                </p>
                            </div>

                            <a
                                href="/payroll-runs"
                                className="text-sm font-medium text-[#b98a2e] transition hover:underline"
                            >
                                View all
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
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

                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
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
                                                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                                >
                                                    <td className="px-5 py-4 font-medium text-[#16241c] dark:text-white">
                                                        {getPayrunNumber(
                                                            run.id,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-slate-700 dark:text-white/80">
                                                            {formatDate(
                                                                run.period_start,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            to{' '}
                                                            {formatDate(
                                                                run.period_end,
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-sm font-semibold text-[#16241c] dark:text-white">
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
                                                className="px-6 py-12 text-center text-sm text-slate-500 dark:text-white/40"
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