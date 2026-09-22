import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock3,
    Filter,
    Search,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
    pending_payroll_runs: number;
};

type Props = {
    payRuns: PayRun[];
    stats: Stats;
};

export default function PayRuns({ payRuns, stats }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');

    /*
    |--------------------------------------------------------------------------
    | Pay Period Options
    |--------------------------------------------------------------------------
    */

    const payPeriods = useMemo(() => {
        const periods = payRuns.map(
            (payrun) =>
                `${payrun.period_start} — ${payrun.period_end}`,
        );

        return [...new Set(periods)];
    }, [payRuns]);

    /*
    |--------------------------------------------------------------------------
    | Filter Pay Runs
    |--------------------------------------------------------------------------
    */

    const filteredPayRuns = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return payRuns.filter((payrun) => {
            const payrunId = String(payrun.id).toLowerCase();

            const payrunNumber = `pr-${String(payrun.id)
                .padStart(4, '0')
                .toLowerCase()}`;

            const period =
                `${payrun.period_start} — ${payrun.period_end}`.toLowerCase();

            const payDate = String(
                payrun.pay_date ?? '',
            ).toLowerCase();

            const grossPay = String(
                payrun.gross_pay ?? '',
            ).toLowerCase();

            const netPay = String(
                payrun.net_pay ?? '',
            ).toLowerCase();

            const statusText =
                payrun.status === 'pending'
                    ? 'draft'
                    : payrun.status.toLowerCase();

            const matchesSearch =
                !searchTerm ||
                payrunId.includes(searchTerm) ||
                payrunNumber.includes(searchTerm) ||
                period.includes(searchTerm) ||
                payDate.includes(searchTerm) ||
                grossPay.includes(searchTerm) ||
                netPay.includes(searchTerm) ||
                statusText.includes(searchTerm);

            const matchesStatus =
                !status ||
                (status === 'draft' &&
                    payrun.status === 'pending') ||
                payrun.status === status;

            const payrunPeriod =
                `${payrun.period_start} — ${payrun.period_end}`;

            const matchesPayPeriod =
                !payPeriod ||
                payrunPeriod === payPeriod;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayPeriod
            );
        });
    }, [payRuns, search, status, payPeriod]);

    /*
    |--------------------------------------------------------------------------
    | Total Net Pay
    |--------------------------------------------------------------------------
    */

    const totalNetPay = filteredPayRuns.reduce(
        (total, payrun) =>
            total + Number(payrun.net_pay || 0),
        0,
    );

    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPayPeriod('');
    };

    const hasFilters =
        search !== '' ||
        status !== '' ||
        payPeriod !== '';

    /*
    |--------------------------------------------------------------------------
    | Format Currency
    |--------------------------------------------------------------------------
    */

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date: string) => {
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleDateString(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Pay Runs" />

            <main className="space-y-6 p-6">

                {/* =========================================================
                    HEADER
                ========================================================== */}

                <div className="relative overflow-hidden rounded-2xl bg-[#16241c] p-6">
                    {/* Background pattern */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '18px 18px',
                        }}
                    />

                    <div className="relative">
                        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                            Pay Runs
                        </h1>

                        <p className="mt-1 font-['Space_Grotesk'] text-sm text-white/55">
                            Manage and monitor your payroll runs.
                        </p>
                    </div>
                </div>

                {/* =========================================================
                    STATS
                ========================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* TOTAL */}

                    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16241c]/10 text-[#16241c]">
                                <Banknote className="h-4 w-4" />
                            </span>

                            <span className="font-['IBM_Plex_Mono'] text-xs text-[#14172B]/40 dark:text-white/40">
                                TOTAL
                            </span>
                        </div>

                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.total_payroll_runs}
                        </p>

                        <p className="mt-0.5 font-['Space_Grotesk'] text-xs text-[#14172B]/55 dark:text-white/55">
                            Total payroll runs
                        </p>
                    </div>

                    {/* PAID */}

                    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>

                            <span className="font-['IBM_Plex_Mono'] text-xs text-[#16A34A]">
                                PAID
                            </span>
                        </div>

                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.paid_payroll_runs}
                        </p>

                        <p className="mt-0.5 font-['Space_Grotesk'] text-xs text-[#14172B]/55 dark:text-white/55">
                            Paid payroll runs
                        </p>
                    </div>

                    {/* DRAFT */}

                    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">
                        <div className="flex items-center justify-between">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b98a2e]/10 text-[#b98a2e]">
                                <Clock3 className="h-4 w-4" />
                            </span>

                            <span className="font-['IBM_Plex_Mono'] text-xs text-[#b98a2e]">
                                DRAFT
                            </span>
                        </div>

                        <p className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.pending_payroll_runs}
                        </p>

                        <p className="mt-0.5 font-['Space_Grotesk'] text-xs text-[#14172B]/55 dark:text-white/55">
                            Draft payroll runs
                        </p>
                    </div>
                </div>

                {/* =========================================================
                    FILTERS
                ========================================================== */}

                <div className="rounded-2xl bg-white p-5 ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                        {/* SEARCH */}

                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#14172B]/35 dark:text-white/35"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search pay run, period, date, or status..."
                                className="w-full rounded-xl border border-[#14172B]/10 bg-transparent py-2.5 pl-10 pr-10 font-['Space_Grotesk'] text-sm outline-none transition placeholder:text-[#14172B]/35 focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:text-white dark:placeholder:text-white/35"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch('')
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14172B]/35 transition hover:text-[#14172B] dark:text-white/35 dark:hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* STATUS */}

                        <div className="flex items-center gap-2">
                            <Filter
                                size={16}
                                className="text-[#14172B]/35 dark:text-white/35"
                            />

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border border-[#14172B]/10 bg-white px-4 py-2.5 font-['Space_Grotesk'] text-sm text-[#14172B] outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:bg-[#16241c] dark:text-white"
                            >
                                <option value="">
                                    All statuses
                                </option>

                                <option value="paid">
                                    Paid
                                </option>

                                <option value="draft">
                                    Draft
                                </option>
                            </select>
                        </div>

                        {/* PAY PERIOD */}

                        <select
                            value={payPeriod}
                            onChange={(event) =>
                                setPayPeriod(
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-[#14172B]/10 bg-white px-4 py-2.5 font-['Space_Grotesk'] text-sm text-[#14172B] outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:bg-[#16241c] dark:text-white"
                        >
                            <option value="">
                                All pay periods
                            </option>

                            {payPeriods.map((period) => (
                                <option
                                    key={period}
                                    value={period}
                                >
                                    {period}
                                </option>
                            ))}
                        </select>

                        {/* CLEAR */}

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-xl border border-[#14172B]/10 px-4 py-2.5 font-['Space_Grotesk'] text-sm font-medium text-[#14172B]/60 transition hover:bg-[#16241c]/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* FILTER SUMMARY */}

                    <div className="mt-4 flex flex-col gap-2 border-t border-[#14172B]/5 pt-4 font-['Space_Grotesk'] text-xs text-[#14172B]/50 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-white/50">
                        <span>
                            Showing{' '}
                            <strong className="text-[#14172B] dark:text-white">
                                {filteredPayRuns.length}
                            </strong>{' '}
                            of{' '}
                            <strong className="text-[#14172B] dark:text-white">
                                {payRuns.length}
                            </strong>{' '}
                            pay runs
                        </span>

                        <span>
                            Total Net Pay:{' '}
                            <strong className="font-['IBM_Plex_Mono'] text-[#16241c] dark:text-white">
                                {formatCurrency(
                                    totalNetPay,
                                )}
                            </strong>
                        </span>
                    </div>
                </div>

                {/* =========================================================
                    PAY RUN TABLE
                ========================================================== */}

                <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#14172B]/5 dark:bg-white/5 dark:ring-white/10">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead className="border-b border-[#14172B]/5 bg-[#16241c]/[0.025] dark:border-white/10 dark:bg-white/[0.02]">
                                <tr>
                                    <th className="px-5 py-4 text-left font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Pay Run
                                    </th>

                                    <th className="px-5 py-4 text-left font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Pay Period
                                    </th>

                                    <th className="px-5 py-4 text-left font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Pay Date
                                    </th>

                                    <th className="px-5 py-4 text-right font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Gross Pay
                                    </th>

                                    <th className="px-5 py-4 text-right font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Net Pay
                                    </th>

                                    <th className="px-5 py-4 text-center font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wide text-[#14172B]/45 dark:text-white/45">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#14172B]/5 dark:divide-white/10">

                                {filteredPayRuns.length > 0 ? (
                                    filteredPayRuns.map(
                                        (payrun) => (
                                            <tr
                                                key={
                                                    payrun.id
                                                }
                                                className="transition-colors hover:bg-[#16241c]/[0.025] dark:hover:bg-white/[0.02]"
                                            >

                                                {/* PAY RUN */}

                                                <td className="px-5 py-4">
                                                    <div className="font-['IBM_Plex_Mono'] text-sm font-semibold text-[#16241c] dark:text-white">
                                                        PR-
                                                        {String(
                                                            payrun.id,
                                                        ).padStart(
                                                            4,
                                                            '0',
                                                        )}
                                                    </div>

                                                    <div className="mt-0.5 font-['Space_Grotesk'] text-xs text-[#14172B]/40 dark:text-white/40">
                                                        {payrun.name}
                                                    </div>
                                                </td>

                                                {/* PERIOD */}

                                                <td className="px-5 py-4 font-['Space_Grotesk'] text-sm text-[#14172B]/70 dark:text-white/70">
                                                    <div>
                                                        {formatDate(
                                                            payrun.period_start,
                                                        )}
                                                    </div>

                                                    <div className="text-xs text-[#14172B]/35 dark:text-white/35">
                                                        to{' '}
                                                        {formatDate(
                                                            payrun.period_end,
                                                        )}
                                                    </div>
                                                </td>

                                                {/* PAY DATE */}

                                                <td className="px-5 py-4 font-['Space_Grotesk'] text-sm text-[#14172B]/70 dark:text-white/70">
                                                    {formatDate(
                                                        payrun.pay_date,
                                                    )}
                                                </td>

                                                {/* GROSS */}

                                                <td className="px-5 py-4 text-right font-['IBM_Plex_Mono'] text-sm text-[#14172B]/70 dark:text-white/70">
                                                    {formatCurrency(
                                                        Number(
                                                            payrun.gross_pay ||
                                                                0,
                                                        ),
                                                    )}
                                                </td>

                                                {/* NET */}

                                                <td className="px-5 py-4 text-right font-['IBM_Plex_Mono'] text-sm font-semibold text-[#16241c] dark:text-white">
                                                    {formatCurrency(
                                                        Number(
                                                            payrun.net_pay ||
                                                                0,
                                                        ),
                                                    )}
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4 text-center">
                                                    {payrun.status ===
                                                    'paid' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-3 py-1.5 font-['Space_Grotesk'] text-xs font-medium text-[#16A34A]">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b98a2e]/10 px-3 py-1.5 font-['Space_Grotesk'] text-xs font-medium text-[#b98a2e]">
                                                            <Clock3 className="h-3 w-3" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">

                                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16241c]/5 text-[#16241c]/40">
                                                    <Search className="h-5 w-5" />
                                                </span>

                                                <h3 className="mt-4 font-['Space_Grotesk'] text-sm font-semibold text-[#14172B] dark:text-white">
                                                    No pay runs found
                                                </h3>

                                                <p className="mt-1 font-['Space_Grotesk'] text-sm text-[#14172B]/45 dark:text-white/45">
                                                    Try changing your
                                                    search or filters.
                                                </p>

                                                {hasFilters && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            clearFilters
                                                        }
                                                        className="mt-4 font-['Space_Grotesk'] text-sm font-medium text-[#b98a2e] hover:underline"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}