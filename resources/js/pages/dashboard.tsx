import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { UserPlus } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';

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
    total_gross: number;
    status: string;
}

// Payroll trend data
interface TrendItem {
    id: number;
    period_start: string;
    period_end: string;
    total_gross: number;
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
   }
}

// Dashboard props
interface Props {
    stats: Stats;
    payRuns: PayRun[];
    trend: TrendItem[];
    needsReview: NeedsReviewItem[];
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
    needsReview,
}: Props) {

    const { auth, flash } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];
    const greeting = flash?.isFirstLogin ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}`;
    
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

            return {
                employee: employeeName || 'Unknown employee',
                role: 'Employee',
                issue: item.anomaly_reason || 'Needs review',
                amount:
                    amountValue >= 0
                        ? `+₱${amountValue.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })}`
                        : `-₱${Math.abs(amountValue).toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })}`,
            };
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="flex-1 space-y-6 p-6">
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
                            <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-white">{greeting}</h1>
                            <p className="text-sm text-white/55">Payroll performance and what needs your attention today.</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] hover:bg-[#c99a3e]">
                            <UserPlus className="h-4 w-4" />
                            Add employee
                        </button>
                    </div>
                </div>

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

                            {anomalies.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[#14172B]/15 px-3 py-5 text-center text-sm text-[#14172B]/45 dark:border-white/10 dark:text-white/45">
                                    No items need review.
                                </div>
                            ) : (
                                anomalies.map((a) => (
                                    <button
                                        key={`${a.employee}-${a.issue}`}
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
                                ))
                            )}

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
                                                run.total_gross ?? 0
                                            ).toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>

                                        <td className="py-3">

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium 
                                                    ${
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