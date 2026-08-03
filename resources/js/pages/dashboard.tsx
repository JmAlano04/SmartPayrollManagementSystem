import { Head } from '@inertiajs/react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, ChevronRight, Search, Users, Wallet } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const stats = [
    {
        label: 'Payroll this cycle',
        value: '$284,600',
        delta: '+4.2%',
        trend: 'up' as const,
        icon: Wallet,
        tint: 'bg-[#16241c]/10 text-[#16241c]',
    },
    {
        label: 'Active employees',
        value: '342',
        delta: '+6 this month',
        trend: 'up' as const,
        icon: Users,
        tint: 'bg-[#22C55E]/10 text-[#16A34A]',
    },
    {
        label: 'Flagged anomalies',
        value: '3',
        delta: 'needs review',
        trend: 'down' as const,
        icon: AlertTriangle,
        tint: 'bg-[#F5A524]/15 text-[#B98A2E]',
    },
    {
        label: 'Next pay date',
        value: 'Jun 30',
        delta: 'in 5 days',
        trend: 'up' as const,
        icon: CalendarClock,
        tint: 'bg-[#EC4899]/10 text-[#EC4899]',
    },
];

const trend = [
    { month: 'Jan', value: 210 },
    { month: 'Feb', value: 225 },
    { month: 'Mar', value: 238 },
    { month: 'Apr', value: 251 },
    { month: 'May', value: 266 },
    { month: 'Jun', value: 284 },
];
const maxTrend = Math.max(...trend.map((t) => t.value));

const anomalies = [
    {
        employee: 'Marco Reyes',
        role: 'Field Technician',
        issue: 'Overtime 3.4× above 90-day average',
        amount: '$612.00',
    },
    {
        employee: 'Priya Nandan',
        role: 'Account Manager',
        issue: 'Housing allowance added mid-cycle',
        amount: '$350.00',
    },
    {
        employee: 'Diego Fuentes',
        role: 'Warehouse Lead',
        issue: 'Clock-in gap of 2 unverified days',
        amount: '$0.00',
    },
];

const payRuns = [
    { id: 'PR-0846', period: 'Jun 16 – Jun 30', employees: 342, total: '$284,600.00', status: 'Processing' as const },
    { id: 'PR-0845', period: 'Jun 1 – Jun 15', employees: 338, total: '$271,120.00', status: 'Paid' as const },
    { id: 'PR-0844', period: 'May 16 – May 31', employees: 336, total: '$266,940.00', status: 'Paid' as const },
    { id: 'PR-0843', period: 'May 1 – May 15', employees: 334, total: '$258,310.00', status: 'Flagged' as const },
];

const statusStyle: Record<string, string> = {
    Processing: 'bg-[#16241c]/10 text-[#16241c]',
    Paid: 'bg-[#22C55E]/10 text-[#16A34A]',
    Flagged: 'bg-[#F5A524]/15 text-[#B98A2E]',
};

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-[#F3F4FB] dark:bg-[#0A0C16]">
                    {/* Top bar */}
                    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#14172B]/8 bg-white/70 px-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="text-[#14172B]/60 dark:text-white/60" />
                            <div>
                                <p className="font-['Space_Grotesk'] text-base font-semibold text-[#14172B] dark:text-white">Dashboard</p>
                                <p className="text-xs text-[#14172B]/50 dark:text-white/50">Overview for Acme Corp</p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 rounded-full bg-[#14172B]/5 px-3 py-1.5 text-sm text-[#14172B]/50 sm:flex dark:bg-white/5 dark:text-white/50">
                            <Search className="h-3.5 w-3.5" />
                            <span>Search employees, pay runs…</span>
                        </div>

                        <button className="rounded-full bg-[#16241c] px-4 py-2 text-sm font-medium text-white hover:bg-[#233A2B]">
                            Run payroll
                        </button>
                    </header>

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
                                                <div
                                                    className="w-full max-w-9 rounded-t-md bg-[#16241c]/15"
                                                    style={{ height: '100%' }}
                                                />
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
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[run.status]}`}
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
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}