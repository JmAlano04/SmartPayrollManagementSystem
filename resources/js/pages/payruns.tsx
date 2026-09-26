import AppLayout from '@/layouts/app-layout';
import AddModal from '@/components/AddModal';
import AddPayrunsForm from '@/components/payruns/AddPayrunsForm';
import { Head } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock3,
    Filter,
    Plus,
    Trash2,
    Pencil,
    Eye,
    Download,
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
    status: 'draft' | 'paid';
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

export default function PayRuns({ payRuns, stats }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const payPeriods = useMemo(() => {
        const periods = payRuns.map(
            (payrun) =>
                `${payrun.period_start} — ${payrun.period_end}`,
        );

        return [...new Set(periods)];
    }, [payRuns]);

    const filteredPayRuns = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return payRuns.filter((payrun) => {
            const payrunId = String(payrun.id).toLowerCase();

            const payrunNumber =
                `pr-${String(payrun.id).padStart(4, '0')}`.toLowerCase();

            const period =
                `${payrun.period_start} — ${payrun.period_end}`.toLowerCase();

            const payDate = String(payrun.pay_date ?? '').toLowerCase();
            const grossPay = String(payrun.gross_pay ?? '').toLowerCase();
            const netPay = String(payrun.net_pay ?? '').toLowerCase();
            const employeesCount = String(
                payrun.employees_count ?? '',
            ).toLowerCase();

            const name = String(payrun.name ?? '').toLowerCase();

            const matchesSearch =
                searchTerm === '' ||
                payrunId.includes(searchTerm) ||
                payrunNumber.includes(searchTerm) ||
                name.includes(searchTerm) ||
                period.includes(searchTerm) ||
                payDate.includes(searchTerm) ||
                grossPay.includes(searchTerm) ||
                netPay.includes(searchTerm) ||
                employeesCount.includes(searchTerm) ||
                payrun.status.includes(searchTerm);

            const matchesStatus =
                status === '' || payrun.status === status;

            const payrunPeriod =
                `${payrun.period_start} — ${payrun.period_end}`;

            const matchesPayPeriod =
                payPeriod === '' || payrunPeriod === payPeriod;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayPeriod
            );
        });
    }, [payRuns, search, status, payPeriod]);

    const totalNetPay = filteredPayRuns.reduce(
        (total, payrun) => total + Number(payrun.net_pay || 0),
        0,
    );

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPayPeriod('');
    };

    const hasFilters =
        search !== '' ||
        status !== '' ||
        payPeriod !== '';

    return (
        <AppLayout>
            <Head title="Pay Runs" />

            <div className="min-h-screen bg-slate-50 dark:bg-[#0f1712]">
                <div className="mx-auto max-w-7xl space-y-6 p-6">

                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#16241c] dark:text-white">
                                Pay Runs
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Manage and monitor your payroll runs
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGenerateModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16241c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#22362a] focus:outline-none focus:ring-2 focus:ring-[#b98a2e] focus:ring-offset-2 dark:focus:ring-offset-[#0f1712]"
                        >
                            <Plus className="h-4 w-4" />
                            Add Payroll
                        </button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Total Pay Runs */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Total Pay Runs
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-[#16241c] dark:text-white">
                                        {stats.total_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                                    <Banknote className="h-5 w-5 text-[#16241c] dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Paid */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Paid
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-green-600">
                                        {stats.paid_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Draft */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Draft
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-amber-600">
                                        {stats.pending_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                    <Clock3 className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Net Pay */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Total Net Pay
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-[#16241c] dark:text-white">
                                        {formatCurrency(totalNetPay)}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#b98a2e]/10">
                                    <Banknote className="h-5 w-5 text-[#b98a2e]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#b98a2e]" />

                            <h2 className="text-sm font-semibold text-[#16241c] dark:text-white">
                                Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* Search */}
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60">
                                    Search
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search pay runs..."
                                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#b98a2e] focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10 dark:bg-[#0f1712] dark:text-white dark:placeholder:text-white/30"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60">
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#b98a2e] focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10 dark:bg-[#0f1712] dark:text-white"
                                >
                                    <option value="">
                                        All Statuses
                                    </option>

                                    <option value="draft">
                                        Draft
                                    </option>

                                    <option value="paid">
                                        Paid
                                    </option>
                                </select>
                            </div>

                            {/* Pay Period */}
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60">
                                    Pay Period
                                </label>

                                <select
                                    value={payPeriod}
                                    onChange={(e) =>
                                        setPayPeriod(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#b98a2e] focus:ring-2 focus:ring-[#b98a2e]/20 dark:border-white/10 dark:bg-[#0f1712] dark:text-white"
                                >
                                    <option value="">
                                        All Pay Periods
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
                            </div>
                        </div>

                        {hasFilters && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pay Runs Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                        {/* Table Header */}
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                            <div>
                                <h2 className="text-base font-semibold text-[#16241c] dark:text-white">
                                    Payroll Runs
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    {filteredPayRuns.length}{' '}
                                    payroll run
                                    {filteredPayRuns.length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    found
                                </p>
                            </div>
                        </div>

                        {filteredPayRuns.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Pay Run
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Pay Period
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Pay Date
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Gross Pay
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Net Pay
                                            </th>

                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                Status
                                            </th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                                                ACTION
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {filteredPayRuns.map((payrun) => {
                                            const isPaid =
                                                payrun.status === 'paid';

                                            return (
                                                <tr
                                                    key={payrun.id}
                                                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                                >
                                                    {/* Pay Run */}
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-medium text-[#16241c] dark:text-white">
                                                                {payrun.name ||
                                                                    `PR-${String(
                                                                        payrun.id,
                                                                    ).padStart(
                                                                        4,
                                                                        '0',
                                                                    )}`}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                PR-
                                                                {String(
                                                                    payrun.id,
                                                                ).padStart(
                                                                    4,
                                                                    '0',
                                                                )}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Pay Period */}
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-slate-700 dark:text-white/80">
                                                            {formatDate(
                                                                payrun.period_start,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            to{' '}
                                                            {formatDate(
                                                                payrun.period_end,
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Pay Date */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-slate-700 dark:text-white/80">
                                                            {formatDate(
                                                                payrun.pay_date,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Gross Pay */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-white/80">
                                                            {formatCurrency(
                                                                payrun.gross_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Net Pay */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-sm font-semibold text-[#16241c] dark:text-white">
                                                            {formatCurrency(
                                                                payrun.net_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-center">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                                <Clock3 className="h-3.5 w-3.5" />
                                                                Draft
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Action */}
                                                    <td className="px-5 py-4 text-center">
<div className="flex items-center justify-center gap-1">

                                                                {/* View */}

                                                                <button
                                                                    type="button"
                                                                   
                                                                    title="View payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#16241c] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>

                                                                {/* Edit */}

                                                                <button
                                                                    type="button"
                                                                   
                                                                    
                                                                    title="Edit payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#b98a2e] dark:text-white/50 dark:hover:bg-white/10"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>

                                                                {/* Download */}

                                                                <button
                                                                    type="button"
                                                                   
                                                                    title="Download payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:text-white/50 dark:hover:bg-white/10"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </button>

                                                                {/* Delete */}

                                                                <button
                                                                    type="button"
                                                                   
                                                                    title="Delete payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>

                                                            </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                                    <Banknote className="h-7 w-7 text-slate-400 dark:text-white/40" />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#16241c] dark:text-white">
                                    No payroll runs found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-white/40">
                                    {hasFilters
                                        ? 'Try changing your filters or search keywords.'
                                        : 'Create your first payroll run to get started.'}
                                </p>

                                {hasFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowGenerateModal(true)
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#16241c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#22362a]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Payroll
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Payroll Modal */}
            <AddModal
                open={showGenerateModal}
                title="Add Payroll"
                onClose={() => setShowGenerateModal(false)}
            >
                <AddPayrunsForm
                    onCancel={() => setShowGenerateModal(false)}
                    onSuccess={() => setShowGenerateModal(false)}
                />
            </AddModal>
        </AppLayout>
    );
}