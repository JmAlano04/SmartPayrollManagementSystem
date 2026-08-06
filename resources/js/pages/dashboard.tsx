import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, ChevronRight, Banknote, Users, Clock, AlertTriangle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const stats = [
    { label: 'Total payroll', value: '₱284,500', delta: '4.2%', trend: 'up', icon: Banknote, tint: 'bg-[#16241c]/10 text-[#16241c]' },
    { label: 'Employees', value: '128', delta: '2.1%', trend: 'up', icon: Users, tint: 'bg-[#2563EB]/10 text-[#2563EB]' },
    { label: 'Pending approvals', value: '6', delta: '1.3%', trend: 'down', icon: Clock, tint: 'bg-[#B98A2E]/10 text-[#B98A2E]' },
    { label: 'Anomalies', value: '3', delta: '0.8%', trend: 'down', icon: AlertTriangle, tint: 'bg-[#DC2626]/10 text-[#DC2626]' },
];

const trend = [
    { month: 'Feb', value: 210 },
    { month: 'Mar', value: 225 },
    { month: 'Apr', value: 240 },
    { month: 'May', value: 232 },
    { month: 'Jun', value: 260 },
    { month: 'Jul', value: 284 },
];
const maxTrend = Math.max(...trend.map((t) => t.value));

const anomalies = [
    { employee: 'Jane Cooper', role: 'Software Engineer', issue: 'Overtime pay exceeds usual pattern', amount: '+₱450' },
    { employee: 'Devon Lane', role: 'Designer', issue: 'Missing timesheet entry', amount: '₱0' },
    { employee: 'Wade Warren', role: 'Product Manager', issue: 'Duplicate bonus entry detected', amount: '+₱1,200' },
];

const payRuns = [
    { id: 'PR-2026-07', period: 'Jul 1 – Jul 31, 2026', employees: 128, total: '₱284,500', status: 'Paid' },
    { id: 'PR-2026-06', period: 'Jun 1 – Jun 30, 2026', employees: 126, total: '₱276,300', status: 'Paid' },
    { id: 'PR-2026-05', period: 'May 1 – May 31, 2026', employees: 124, total: '₱268,900', status: 'Failed' },
    { id: 'PR-2026-04', period: 'Apr 1 – Apr 30, 2026', employees: 122, total: '₱261,400', status: 'Processing' },
];

const statusStyle: Record<string, string> = {
    Paid: 'bg-[#16A34A]/15 text-[#16A34A]',
    Processing: 'bg-[#2563EB]/15 text-[#2563EB]',
    Failed: 'bg-[#DC2626]/15 text-[#DC2626]',
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <main className="flex-1 space-y-6 p-6">

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tint}`}>
                                    <stat.icon className="h-4.5 w-4.5" />
                                </span>
                                <span
                                    className={`flex items-center gap-0.5 text-xs font-medium ${
                                        stat.trend === 'up' ? 'text-[#16A34A]' : 'text-[#B98A2E]'
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
                            <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    {/* Cost trend */}
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">
                                    Payroll cost trend
                                </h2>
                                <p className="mt-0.5 text-xs text-[#14172B]/50 dark:text-white/50">Last 6 pay cycles, in thousands</p>
                            </div>
                            <span className="rounded-full bg-[#16241c]/10 px-2.5 py-1 font-['IBM_Plex_Mono'] text-xs text-[#16241c]">
                                +35.2% YoY
                            </span>
                        </div>

                        <div className="mt-8 flex h-40 items-end gap-4">
                            {trend.map((t) => (
                                <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="relative flex h-32 w-full items-end justify-center">
                                        <div className="w-full max-w-9 rounded-t-md bg-[#16241c]/15" style={{ height: '100%' }} />
                                        <div
                                            className="absolute bottom-0 w-full max-w-9 rounded-t-md bg-[#16241c]"
                                            style={{ height: `${(t.value / maxTrend) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#14172B]/45 dark:text-white/45">
                                        {t.month}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Anomalies queue */}
                    <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">Needs review</h2>
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
                                        <p className="truncate text-sm font-medium text-[#14172B] dark:text-white">{a.employee}</p>
                                        <p className="text-xs text-[#14172B]/45 dark:text-white/45">{a.role}</p>
                                        <p className="mt-1 text-xs leading-5 text-[#14172B]/65 dark:text-white/65">{a.issue}</p>
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

                {/* Recent pay runs */}
                <div className="rounded-2xl bg-white p-6 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="font-['Space_Grotesk'] font-semibold text-[#14172B] dark:text-white">Recent pay runs</h2>
                        <a href="#" className="text-xs font-medium text-[#16241c] hover:underline">
                            View all
                        </a>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-xs text-[#14172B]/45 dark:text-white/45">
                                    <th className="pb-3 font-medium">Run</th>
                                    <th className="pb-3 font-medium">Period</th>
                                    <th className="pb-3 font-medium">Employees</th>
                                    <th className="pb-3 font-medium">Total</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payRuns.map((run) => (
                                    <tr key={run.id} className="border-t border-[#14172B]/6 dark:border-white/10">
                                        <td className="py-3 font-['IBM_Plex_Mono'] text-xs text-[#14172B]/60 dark:text-white/60">
                                            {run.id}
                                        </td>
                                        <td className="py-3 text-[#14172B] dark:text-white">{run.period}</td>
                                        <td className="py-3 text-[#14172B]/70 dark:text-white/70">{run.employees}</td>
                                        <td className="py-3 font-['IBM_Plex_Mono'] text-[#14172B] dark:text-white">{run.total}</td>
                                        <td className="py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[run.status]}`}>
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