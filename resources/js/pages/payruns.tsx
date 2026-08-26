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
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pay Runs',
        href: '/payruns',
    },
];

type PayRun = {
    id: number;
    name: string;
    period_start: string;
    period_end: string;
    pay_date: string;
    employees_count: number;
    gross_pay: number;
    net_pay: number;
    status: 'draft' | 'processing' | 'completed' | 'cancelled';
};

/*
|--------------------------------------------------------------------------
| HARD-CODED DATA
|--------------------------------------------------------------------------
*/

const payRuns: PayRun[] = [
    {
        id: 1,
        name: 'July 2026 Payroll',
        period_start: 'July 1, 2026',
        period_end: 'July 15, 2026',
        pay_date: 'July 15, 2026',
        employees_count: 24,
        gross_pay: 985000,
        net_pay: 872500,
        status: 'completed',
    },
    {
        id: 2,
        name: 'July 2026 Payroll',
        period_start: 'July 16, 2026',
        period_end: 'July 31, 2026',
        pay_date: 'July 31, 2026',
        employees_count: 24,
        gross_pay: 1025000,
        net_pay: 908750,
        status: 'completed',
    },
    {
        id: 3,
        name: 'August 2026 Payroll',
        period_start: 'August 1, 2026',
        period_end: 'August 15, 2026',
        pay_date: 'August 15, 2026',
        employees_count: 26,
        gross_pay: 1105000,
        net_pay: 976300,
        status: 'processing',
    },
    {
        id: 4,
        name: 'August 2026 Payroll',
        period_start: 'August 16, 2026',
        period_end: 'August 31, 2026',
        pay_date: 'August 31, 2026',
        employees_count: 26,
        gross_pay: 0,
        net_pay: 0,
        status: 'draft',
    },
];

export default function PayrunsIndex() {
    const [search, setSearch] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Stats
    |--------------------------------------------------------------------------
    */

    const totalPayRuns = payRuns.length;

    const completedPayRuns = payRuns.filter(
        (payrun) => payrun.status === 'completed',
    ).length;

    const processingPayRuns = payRuns.filter(
        (payrun) => payrun.status === 'processing',
    ).length;

    const totalNetPay = payRuns.reduce(
        (total, payrun) => total + payrun.net_pay,
        0,
    );

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredPayRuns = payRuns.filter((payrun) =>
        payrun.name.toLowerCase().includes(search.toLowerCase()),
    );

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

    const formatStatus = (status: PayRun['status']) => {
        switch (status) {
            case 'completed':
                return 'Completed';

            case 'processing':
                return 'Processing';

            case 'cancelled':
                return 'Cancelled';

            default:
                return 'Draft';
        }
    };

    const statusClass = (status: PayRun['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-[#22C55E]/10 text-[#16A34A]';

            case 'processing':
                return 'bg-amber-100 text-amber-600';

            case 'cancelled':
                return 'bg-red-100 text-red-600';

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

                    {/* Completed */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {completedPayRuns}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Completed
                        </p>

                    </div>

                    {/* Processing */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                            <Clock3 className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {processingPayRuns}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Processing
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

                <div className="flex flex-wrap items-center gap-3">

                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">

                        <Search className="h-4 w-4 text-[#14172B]/40" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search pay run..."
                            className="w-full bg-transparent text-sm outline-none"
                        />

                    </div>

                </div>

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