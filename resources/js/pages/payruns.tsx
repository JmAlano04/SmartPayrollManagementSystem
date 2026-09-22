import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Search, Filter, X } from 'lucide-react';
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
    | Search + Filter
    |--------------------------------------------------------------------------
    */

    const filteredPayRuns = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return payRuns.filter((payrun) => {
            /*
            |--------------------------------------------------------------------------
            | Pay Run ID
            |--------------------------------------------------------------------------
            */

            const payrunId = String(payrun.id).toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Formatted Pay Run ID
            | Example: PR-0001
            |--------------------------------------------------------------------------
            */

            const payrunNumber = `pr-${String(payrun.id)
                .padStart(4, '0')
                .toLowerCase()}`;

            /*
            |--------------------------------------------------------------------------
            | Pay Period
            |--------------------------------------------------------------------------
            */

            const period =
                `${payrun.period_start} — ${payrun.period_end}`.toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Pay Date
            |--------------------------------------------------------------------------
            */

            const payDate = String(
                payrun.pay_date ?? '',
            ).toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Gross Pay
            |--------------------------------------------------------------------------
            */

            const grossPay = String(
                payrun.gross_pay ?? '',
            ).toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Net Pay
            |--------------------------------------------------------------------------
            */

            const netPay = String(
                payrun.net_pay ?? '',
            ).toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Status
            |
            | Backend:
            | pending = Draft
            | paid    = Paid
            |--------------------------------------------------------------------------
            */

            const statusText =
                payrun.status === 'pending'
                    ? 'draft'
                    : payrun.status.toLowerCase();

            /*
            |--------------------------------------------------------------------------
            | Search Matching
            |--------------------------------------------------------------------------
            */

            const matchesSearch =
                !searchTerm ||
                payrunId.includes(searchTerm) ||
                payrunNumber.includes(searchTerm) ||
                period.includes(searchTerm) ||
                payDate.includes(searchTerm) ||
                grossPay.includes(searchTerm) ||
                netPay.includes(searchTerm) ||
                statusText.includes(searchTerm);

            /*
            |--------------------------------------------------------------------------
            | Status Filter
            |--------------------------------------------------------------------------
            */

            const matchesStatus =
                !status ||
                (status === 'draft' &&
                    payrun.status === 'pending') ||
                payrun.status === status;

            /*
            |--------------------------------------------------------------------------
            | Pay Period Filter
            |--------------------------------------------------------------------------
            */

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

            <div className="space-y-6 p-6">

                {/* =========================================================
                    HEADER
                ========================================================== */}

                <div>
                    <h1 className="text-2xl font-bold text-[#16241c]">
                        Pay Runs
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and monitor payroll runs.
                    </p>
                </div>

                {/* =========================================================
                    STATS
                ========================================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* Total Payroll Runs */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Payroll Runs
                        </p>

                        <p className="mt-2 text-2xl font-bold text-[#16241c]">
                            {stats.total_payroll_runs}
                        </p>
                    </div>

                    {/* Paid */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Paid Payroll Runs
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {stats.paid_payroll_runs}
                        </p>
                    </div>

                    {/* Draft */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Draft Payroll Runs
                        </p>

                        <p className="mt-2 text-2xl font-bold text-yellow-600">
                            {stats.pending_payroll_runs}
                        </p>
                    </div>
                </div>

                {/* =========================================================
                    FILTERS
                ========================================================== */}

                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search pay run, period, date, or status..."
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e]"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* STATUS */}

                        <div className="flex items-center gap-2">

                            <Filter
                                size={17}
                                className="text-gray-400"
                            />

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e]"
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
                                setPayPeriod(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e]"
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
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* SEARCH RESULT COUNT */}

                    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

                        <span>
                            Showing{' '}
                            <strong className="text-gray-700">
                                {filteredPayRuns.length}
                            </strong>{' '}
                            of{' '}
                            <strong className="text-gray-700">
                                {payRuns.length}
                            </strong>{' '}
                            pay runs
                        </span>

                        <span>
                            Total Net Pay:{' '}
                            <strong className="text-[#16241c]">
                                {formatCurrency(totalNetPay)}
                            </strong>
                        </span>
                    </div>
                </div>

                {/* =========================================================
                    PAY RUN TABLE
                ========================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="border-b bg-gray-50">

                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Pay Run ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Pay Period
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Pay Date
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Gross Pay
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Net Pay
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y">

                                {filteredPayRuns.length > 0 ? (

                                    filteredPayRuns.map((payrun) => (

                                        <tr
                                            key={payrun.id}
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* PAY RUN ID */}

                                            <td className="px-5 py-4">

                                                <div className="font-semibold text-[#16241c]">
                                                    PR-
                                                    {String(
                                                        payrun.id,
                                                    ).padStart(
                                                        4,
                                                        '0',
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-400">
                                                    {payrun.name}
                                                </div>

                                            </td>

                                            {/* PERIOD */}

                                            <td className="px-5 py-4 text-sm text-gray-700">

                                                {formatDate(
                                                    payrun.period_start,
                                                )}

                                                <span className="mx-2 text-gray-400">
                                                    —
                                                </span>

                                                {formatDate(
                                                    payrun.period_end,
                                                )}

                                            </td>

                                            {/* PAY DATE */}

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {formatDate(
                                                    payrun.pay_date,
                                                )}
                                            </td>

                                            {/* GROSS PAY */}

                                            <td className="px-5 py-4 text-right text-sm font-medium text-gray-700">
                                                {formatCurrency(
                                                    Number(
                                                        payrun.gross_pay ||
                                                            0,
                                                    ),
                                                )}
                                            </td>

                                            {/* NET PAY */}

                                            <td className="px-5 py-4 text-right text-sm font-semibold text-[#16241c]">
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

                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Paid
                                                    </span>

                                                ) : (

                                                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                        Draft
                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center"
                                        >

                                            <div className="flex flex-col items-center justify-center">

                                                <Search
                                                    size={40}
                                                    className="mb-3 text-gray-300"
                                                />

                                                <h3 className="text-sm font-semibold text-gray-700">
                                                    No pay runs found
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Try changing your search
                                                    or filters.
                                                </p>

                                                {hasFilters && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            clearFilters
                                                        }
                                                        className="mt-4 text-sm font-medium text-[#b98a2e] hover:underline"
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

            </div>
        </AppLayout>
    );
}