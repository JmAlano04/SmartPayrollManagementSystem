import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    DollarSign,
    Eye,
    FileText,
    Plus,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pay Runs',
        href: '/payruns',
    },
];

// NOTE: DB/backend status values are 'pending' | 'paid' (see
// PayrollService::getStats()). 'pending' is displayed as "Draft" in the UI —
// that's a display-label choice, not a third status value. Add more values
// here if payroll_runs.status ever gets others (e.g. 'cancelled').
type PayRun = {
    id: number;
    name: string;
    period_start: string;
    period_end: string;
    pay_date: string;
    employees_count: number;
    gross_pay: number;
    net_pay: number;
    status: 'pending' | 'paid';
};

type Stats = {
    total_payroll_runs: number;
    paid_payroll_runs: number;
    pending_payroll_runs: number; // shown in the UI as "Draft" count
};

type PayrunsIndexProps = {
    payRuns: PayRun[];
    stats: Stats;
};

export default function PayrunsIndex({ payRuns, stats }: PayrunsIndexProps) {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');

    const payPeriods = useMemo(
        () =>
            Array.from(
                new Set(
                    payRuns.map(
                        (payrun) =>
                            `${payrun.period_start} — ${payrun.period_end}`,
                    ),
                ),
            ).sort((a, b) => a.localeCompare(b)),
        [payRuns],
    );

    const applySearch = () => {
        setSearch(searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearch('');
        setStatus('');
        setPayPeriod('');
    };

    /*
    |--------------------------------------------------------------------------
    | Stats — sourced from the server (stats prop), not derived from the
    | locally-loaded payRuns array, so the cards stay correct even if
    | payRuns is ever paginated or filtered.
    |--------------------------------------------------------------------------
    */

    const totalPayRuns = stats.total_payroll_runs;
    const paidPayRuns = stats.paid_payroll_runs;

    const draftPayRuns = stats.pending_payroll_runs;

    
    const totalNetPay = payRuns.reduce(
        (total, payrun) => total + payrun.net_pay,
        0,
    );

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredPayRuns = payRuns.filter((payrun) => {
        const payrunPeriod = `${payrun.period_start} — ${payrun.period_end}`;
        const matchesSearch =
            !search ||
            payrun.name.toLowerCase().includes(search.toLowerCase()) ||
            payrunPeriod.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            !status ||
            (status === 'draft' && payrun.status === 'pending') ||
            payrun.status === status;
        const matchesPayPeriod = !payPeriod || payrunPeriod === payPeriod;

        return matchesSearch && matchesStatus && matchesPayPeriod;
    });

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const formatMoney = (value: number) => {
        return value.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Backend value 'pending' is intentionally displayed as "Draft".
    const formatStatus = (status: PayRun['status']) => {
        switch (status) {
            case 'paid':
                return 'Paid';

            case 'pending':
                return 'Draft';

            default:
                return status;
        }
    };

    const statusClass = (status: PayRun['status']) => {
        switch (status) {
            case 'paid':
                return 'bg-[#22C55E]/10 text-[#16A34A]';

            case 'pending':
                return 'bg-gray-100 text-gray-600'; // neutral styling to match "Draft" framing

            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pay Runs" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="relative overflow-hidden rounded-2xl bg-[#16241c] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>
                            <h1 className="text-xl font-semibold text-white">
                                Pay runs
                            </h1>

                            <p className="text-sm text-white/55">
                                Create, process, and manage employee payroll.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28]"
                        >
                            <Plus className="h-4 w-4" />
                            Create pay run
                        </button>

                    </div>
                </div>

                {/* =====================================================
                    STATS
                ====================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Total */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16241c]/10">
                            <FileText className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {totalPayRuns}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Total pay runs
                        </p>

                    </div>

                    {/* Paid */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {paidPayRuns}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Paid
                        </p>

                    </div>

                    {/* Draft */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                            <Clock3 className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {draftPayRuns}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Draft
                        </p>

                    </div>

                    {/* Net Pay */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b98a2e]/10">
                            <DollarSign className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            ₱{formatMoney(totalNetPay)}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Total net pay
                        </p>

                    </div>

                </div>

                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <form
                    className="flex flex-wrap items-center gap-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        applySearch();
                    }}
                >
                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">

                        <Search className="h-4 w-4 text-[#14172B]/40" />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search pay run..."
                            className="w-full bg-transparent text-sm outline-none"
                        />

                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#16241c] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1d2f25]"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>

                    <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#14172B]/40 dark:text-white/40" />

                        <select
                            value={payPeriod}
                            onChange={(event) => setPayPeriod(event.target.value)}
                            className="rounded-lg border border-[#14172B]/10 bg-white py-2 pl-9 pr-8 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                            <option value="">
                                All pay periods
                            </option>

                            {payPeriods.map((period) => (
                                <option key={period} value={period}>
                                    {period}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* STATUS */}
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                        <option value="">
                            All statuses
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="draft">
                            Draft
                        </option>
                    </select>

                    {(search || searchInput || status || payPeriod) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-[#14172B]/10 px-3 py-2 text-sm text-[#14172B] transition hover:bg-[#14172B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* =====================================================
                    PAY RUN TABLE
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border border-[#14172B]/8 bg-white dark:border-white/10 dark:bg-white/5">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead>
                                <tr className="border-b border-[#14172B]/8 text-xs text-[#14172B]/45 dark:border-white/10 dark:text-white/45">

                                    <th className="px-4 py-3 font-medium">
                                        Pay Run
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Pay Period
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Pay Date
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Employees
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Gross Pay
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Net Pay
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredPayRuns.length > 0 ? (

                                    filteredPayRuns.map((payrun) => (

                                        <tr
                                            key={payrun.id}
                                            className="border-b border-[#14172B]/6 last:border-0 dark:border-white/10"
                                        >

                                            {/* Pay Run */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-3">

                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#16241c]/10">
                                                        <FileText className="h-4 w-4" />
                                                    </span>

                                                    <div>
                                                        <p className="font-medium text-[#14172B] dark:text-white">
                                                            {payrun.name}
                                                        </p>

                                                        <p className="text-xs text-[#14172B]/45 dark:text-white/45">
                                                            PR-
                                                            {String(payrun.id).padStart(
                                                                4,
                                                                '0',
                                                            )}
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>

                                            {/* Period */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-2 text-[#14172B]/70 dark:text-white/70">

                                                    <CalendarDays className="h-4 w-4 text-[#14172B]/40" />

                                                    <span>
                                                        {payrun.period_start}
                                                        {' — '}
                                                        {payrun.period_end}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* Pay Date */}

                                            <td className="px-4 py-4 text-[#14172B]/70 dark:text-white/70">
                                                {payrun.pay_date}
                                            </td>

                                            {/* Employees */}

                                            <td className="px-4 py-4">
                                                {payrun.employees_count}
                                            </td>

                                            {/* Gross */}

                                            <td className="px-4 py-4">
                                                ₱{formatMoney(payrun.gross_pay)}
                                            </td>

                                            {/* Net */}

                                            <td className="px-4 py-4 font-medium">
                                                ₱{formatMoney(payrun.net_pay)}
                                            </td>

                                            {/* Status */}

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                        payrun.status,
                                                    )}`}
                                                >
                                                    {formatStatus(payrun.status)}
                                                </span>

                                            </td>

                                            {/* Actions */}

                                            <td className="px-4 py-4">

                                                <div className="flex justify-end gap-1">

                                                    <button
                                                        type="button"
                                                        className="rounded-md p-1.5 hover:bg-[#16241c]/10"
                                                        title="View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={8}
                                            className="px-4 py-12 text-center"
                                        >

                                            <div className="flex flex-col items-center">

                                                <FileText className="mb-3 h-8 w-8 text-[#14172B]/30" />

                                                <p className="text-sm font-medium text-[#14172B]/70 dark:text-white/70">
                                                    No pay runs found
                                                </p>

                                                <p className="mt-1 text-xs text-[#14172B]/40">
                                                    Try another search.
                                                </p>

                                            </div>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </AppLayout>
    );
}