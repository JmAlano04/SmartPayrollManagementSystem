import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronRight,
    Banknote,
    Users,
    Clock,
    AlertTriangle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Dashboard statistics
interface Stats {
    employees: number;
    payrollRuns: number;
    payslips: number;
    totalPayroll: number;
}

// Payroll run data
interface PayRun {
    id: number;
    period_start: string;
    period_end: string;
    total_gross_pay: number;
    status: string;
}

// Payroll trend data
interface TrendItem {
    id: number;
    period_start: string;
    period_end: string;
    total_gross: number;
}

// Dashboard props
interface Props {
    stats: Stats;
    payRuns: PayRun[];
    trend: TrendItem[];
}

// Status badge styles
const statusStyle: Record<string, string> = {
    Paid: 'bg-[#16A34A]/15 text-[#16A34A]',
    Processing: 'bg-[#2563EB]/15 text-[#2563EB]',
    Failed: 'bg-[#DC2626]/15 text-[#DC2626]',
    Pending: 'bg-[#B98A2E]/15 text-[#B98A2E]',
    Draft: 'bg-[#6B7280]/15 text-[#6B7280]',
    Approved: 'bg-[#16A34A]/15 text-[#16A34A]',
};

export default function Dashboard({
    stats,
    payRuns,
    trend,
}: Props) {

    // Convert database trend data into chart data
   const trendData = (trend ?? []).map((item) => {
    const [year, month] = item.period_start.split('-');

    return {
        id: item.id,
        year: Number(year),
        month: new Date(
            Number(year),
            Number(month) - 1,
            1
        ).toLocaleString('en-US', {
            month: 'short',
        }),
        value: Number(item.total_gross ?? 0),
    };
    });

    // Get the highest payroll value for the chart
    const maxTrend = Math.max(
        ...trendData.map((item) => item.value),
        0
    );

    // Dashboard statistics cards
    const statCards = [
        {
            label: 'Total payroll',
            value: `₱${Number(stats?.totalPayroll ?? 0).toLocaleString(
                'en-PH',
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            )}`,
            delta: '4.2%',
            trend: 'down',
            icon: Banknote,
            tint: 'bg-[#16241c]/10 text-[#16241c]',
        },
        {
            label: 'Employees',
            value: stats?.employees ?? 0,
            delta: '2.1%',
            trend: 'up',
            icon: Users,
            tint: 'bg-[#2563EB]/10 text-[#2563EB]',
        },
        {
            label: 'Pending approvals',
            value: stats?.payrollRuns ?? 0,
            delta: '1.3%',
            trend: 'down',
            icon: Clock,
            tint: 'bg-[#B98A2E]/10 text-[#B98A2E]',
        },
        {
            label: 'Payslips',
            value: stats?.payslips ?? 0,
            delta: '0.8%',
            trend: 'down',
            icon: AlertTriangle,
            tint: 'bg-[#DC2626]/10 text-[#DC2626]',
        },
    ];

    // Temporary anomaly data
    const anomalies = [
        {
            employee: 'Jane Cooper',
            role: 'Software Engineer',
            issue: 'Overtime pay exceeds usual pattern',
            amount: '+₱450',
        },
        {
            employee: 'Devon Lane',
            role: 'Designer',
            issue: 'Missing timesheet entry',
            amount: '₱0',
        },
        {
            employee: 'Wade Warren',
            role: 'Product Manager',
            issue: 'Duplicate bonus entry detected',
            amount: '+₱1,200',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="flex-1 space-y-6 p-6">

                {/* Statistics cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10"
                        >
                            <div className="flex items-center justify-between">

                                <span
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tint}`}
                                >
                                    <stat.icon className="h-4.5 w-4.5" />
                                </span>

                                <span
                                    className={`flex items-center gap-0.5 text-xs font-medium ${
                                        stat.trend === 'up'
                                            ? 'text-[#16A34A]'
                                            : 'text-[#B98A2E]'
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

                            <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">
                                {stat.value}
                            </p>

                            <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                                {stat.label}
                            </p>

                        </div>
                    ))}

                </div>

                {/* Payroll trend and anomalies */}
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

                    {/* Payroll cost trend */}
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">
                                    Payroll cost trend
                                </h2>

                                <p className="mt-0.5 text-xs text-[#14172B]/50 dark:text-white/50">
                                    Payroll cost per pay cycle
                                </p>
                            </div>

                            <span className="rounded-full bg-[#16241c]/10 px-2.5 py-1 font-['IBM_Plex_Mono'] text-xs text-[#16241c]">
                                Gross Pay
                            </span>

                        </div>

                        {/* Display payroll trend chart */}
                        {trendData.length === 0 ? (

                            <div className="flex h-40 items-center justify-center">
                                <p className="text-sm text-[#14172B]/40 dark:text-white/40">
                                    No payroll trend data available.
                                </p>
                            </div>

                        ) : (

                            <div className="mt-16  flex h-50 items-end bg-gray-100 rounded-lg  gap-2">

                                {trendData.map((item) => (

                                    <div
                                        key={item.id}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >

                                        {/* Payroll amount */}
                                        <span className="text-[15px] text-[#14172B]/50 dark:text-white/90">
                                            ₱
                                            {item.value.toLocaleString(
                                                'en-PH',
                                                {
                                                    maximumFractionDigits: 0,
                                                }
                                            )}
                                        </span>

                                        {/* Chart bar */}
                                        <div className="relative flex h-32 w-full items-end justify-center">

                                            <div
                                                className="w-full max-w-9 rounded-t-md bg-[#16241c]/15"
                                                style={{
                                                    height: '100%',
                                                }}
                                            />

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

                                        {/* Month */}
                                        <span className="font-['IBM_Plex_Mono'] text-[15px] text-[#14172B]/45 dark:text-white/45">
                                            {item.month} {item.year}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                    {/* Anomalies */}
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">

                        <div className="flex items-center justify-between">

                            <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">
                                Needs review
                            </h2>

                            <span className="rounded-full bg-[#F5A524]/15 px-2 py-0.5 text-xs font-medium text-[#B98A2E]">
                                {anomalies.length} flagged
                            </span>

                        </div>

                        <div className="mt-4 space-y-3">

                            {anomalies.map((a) => (

                                <button
                                    key={a.employee}
                                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-[#14172B]/8 p-3 text-left transition-colors hover:border-[#F5A524]/40 hover:bg-[#F5A524]/5 dark:border-white/10"
                                >

                                    <div className="min-w-0">

                                        <p className="truncate text-sm font-medium text-[#14172B] dark:text-white">
                                            {a.employee}
                                        </p>

                                        <p className="text-xs text-[#14172B]/45 dark:text-white/45">
                                            {a.role}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#14172B]/65 dark:text-white/65">
                                            {a.issue}
                                        </p>

                                    </div>

                                    <div className="flex shrink-0 items-center gap-1 pt-0.5 font-['IBM_Plex_Mono'] text-xs text-[#B98A2E]">
                                        {a.amount}
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </div>

                                </button>

                            ))}

                        </div>

                    </div>

                </div>

                {/* Recent payroll runs */}
                <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">

                    <div className="flex items-center justify-between">

                        <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">
                            Recent pay runs
                        </h2>

                        <a
                            href="#"
                            className="text-xs font-medium text-[#16241c] hover:underline"
                        >
                            View all
                        </a>

                    </div>

                    <div className="mt-4 overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead>
                                <tr className="text-xs text-[#14172B]/45 dark:text-white/45">

                                    <th className="pb-3 font-medium">
                                        Run
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Period
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Total
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Status
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {payRuns.map((run) => (

                                    <tr
                                        key={run.id}
                                        className="border-t border-[#14172B]/6 dark:border-white/10"
                                    >

                                        <td className="py-3 font-['IBM_Plex_Mono'] text-xs text-[#14172B]/60 dark:text-white/60">
                                            #{run.id}
                                        </td>

                                        <td className="py-3 text-[#14172B] dark:text-white">
                                            {new Date(
                                                run.period_start
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}

                                            {' - '}

                                            {new Date(
                                                run.period_end
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>

                                        <td className="py-3 font-['IBM_Plex_Mono'] text-[#14172B] dark:text-white">
                                            ₱
                                            {Number(
                                                run.total_gross_pay ?? 0
                                            ).toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>

                                        <td className="py-3">

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    statusStyle[
                                                        run.status
                                                    ] ??
                                                    'bg-gray-500/15 text-gray-500'
                                                }`}
                                            >
                                                {run.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </main>
        </AppLayout>
    );
}