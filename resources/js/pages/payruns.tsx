import AppLayout from '@/layouts/app-layout';
import AddModal from '@/components/AddModal';
import AddPayrunsForm from '@/components/payruns/AddPayrunsForm';

import UpdateModal from '@/components/UpdateModal';
import UpdatePayrunsForm from '@/components/payruns/UpdatePayrunsForm';

import ViewPayruns from '@/components/payruns/ViewPayruns';

import DeleteModal from '@/components/DeleteModal';
import { Head, router } from '@inertiajs/react';

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

function getPayrunNumber(payrun: PayRun) {
    return `PR-${String(payrun.id).padStart(4, '0')}`;
}

/* Shared class names */

const card =
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121829]';

const th =
    "px-5 py-3 font-['JetBrains_Mono'] text-[11px] font-medium uppercase tracking-widest text-slate-500 dark:text-white/50";

const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#C6F432] focus:ring-2 focus:ring-[#C6F432]/25 dark:border-white/10 dark:bg-[#0B0F1A] dark:text-white';

const accentText = 'text-[#4D6B00] dark:text-[#C6F432]';

const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#C6F432] px-5 py-2.5 text-sm font-semibold text-[#0B0F1A] shadow-sm transition hover:bg-[#D6FF55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6F432] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F1A]';

const ghostBtn =
    'inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5';

const iconBtn =
    'rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export default function PayRuns({ payRuns, stats }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const [showUpdatePayrunsModal, setShowUpdatePayrunsModal] = useState(false);

    const [selectedPayruns, setSelectedPayruns] = useState<PayRun | null>(null);

    const [payrunToDelete, setPayrunToDelete] = useState<PayRun | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showViewPayrunsModal, setShowViewPayrunsModal] = useState(false);

    const payPeriods = useMemo(() => {
        const periods = payRuns.map(
            (payrun) => `${payrun.period_start} — ${payrun.period_end}`,
        );

        return [...new Set(periods)];
    }, [payRuns]);

    const filteredPayRuns = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return payRuns.filter((payrun) => {
            const payrunId = String(payrun.id).toLowerCase();
            const payrunNumber = getPayrunNumber(payrun).toLowerCase();
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

            const matchesStatus = status === '' || payrun.status === status;

            const payrunPeriod = `${payrun.period_start} — ${payrun.period_end}`;

            const matchesPayPeriod =
                payPeriod === '' || payrunPeriod === payPeriod;

            return matchesSearch && matchesStatus && matchesPayPeriod;
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

    const hasFilters = search !== '' || status !== '' || payPeriod !== '';

    /* Update handlers */
    const handleEditPayrun = (payrun: PayRun) => {
        setSelectedPayruns(payrun);
        setShowUpdatePayrunsModal(true);
    };

    /*
    | Delete handlers
    */

    const handleDeleteClick = (payrun: PayRun) => {
        setPayrunToDelete(payrun);
    };

    const handleCloseDeleteModal = () => {
        // Don't allow closing while the request is running.
        if (isDeleting) return;
        setPayrunToDelete(null);
    };

    const handleDeletePayrun = () => {
        // Guard against double clicks and a missing selection.
        if (!payrunToDelete || isDeleting) return;

        router.delete(route('payruns.destroy', payrunToDelete.id), {
            preserveScroll: true,

            onStart: () => setIsDeleting(true),

            onSuccess: () => setPayrunToDelete(null),

            onError: (errors) => {
                // Validation-style errors only. Add a toast here if you have one.
                console.error('Failed to delete pay run:', errors);
            },

            // Runs on success AND failure, so the button never stays stuck.
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleDownloadPayrun = (payslipId: number) => {
        window.location.href = route('payruns.download', payslipId);
    };

    return (
        <AppLayout>
            <Head title="Pay Runs">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="dark min-h-full bg-[#0B0F1A] font-['Bricolage_Grotesque'] text-white">
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#0B0F1A] dark:text-white">
                                Pay Runs
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Manage and monitor your payroll runs
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGenerateModal(true)}
                            className={primaryBtn}
                        >
                            <Plus className="h-4 w-4" />
                            Add Payroll
                        </button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Pay Runs */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Total Pay Runs
                                    </p>

                                    <p className="mt-2 font-['JetBrains_Mono'] text-2xl font-medium text-[#0B0F1A] dark:text-white">
                                        {stats.total_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
                                    <Banknote className="h-5 w-5 text-[#0B0F1A] dark:text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Paid */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Paid
                                    </p>

                                    <p
                                        className={`mt-2 font-['JetBrains_Mono'] text-2xl font-medium ${accentText}`}
                                    >
                                        {stats.paid_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C6F432]/25 dark:bg-[#C6F432]/10">
                                    <CheckCircle2
                                        className={`h-5 w-5 ${accentText}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Draft */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Draft
                                    </p>

                                    <p className="mt-2 font-['JetBrains_Mono'] text-2xl font-medium text-amber-600 dark:text-amber-300">
                                        {stats.pending_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-400/10">
                                    <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                </div>
                            </div>
                        </div>

                        {/* Total Net Pay */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/50">
                                        Total Net Pay
                                    </p>

                                    <p className="mt-2 font-['JetBrains_Mono'] text-xl font-medium text-[#0B0F1A] dark:text-white">
                                        {formatCurrency(totalNetPay)}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C6F432]">
                                    <Banknote className="h-5 w-5 text-[#0B0F1A]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`${card} p-5`}>
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className={`h-4 w-4 ${accentText}`} />

                            <h2 className="text-sm font-semibold text-[#0B0F1A] dark:text-white">
                                Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Search */}
                            <div>
                                <label
                                    htmlFor="payrun-search"
                                    className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60"
                                >
                                    Search
                                </label>

                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="payrun-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search pay runs..."
                                        className={`${field} pl-9 placeholder:text-slate-400 dark:placeholder:text-white/30`}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="payrun-status"
                                    className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60"
                                >
                                    Status
                                </label>

                                <select
                                    id="payrun-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={field}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            {/* Pay Period */}
                            <div>
                                <label
                                    htmlFor="payrun-period"
                                    className="mb-2 block text-xs font-medium text-slate-600 dark:text-white/60"
                                >
                                    Pay Period
                                </label>

                                <select
                                    id="payrun-period"
                                    value={payPeriod}
                                    onChange={(e) =>
                                        setPayPeriod(e.target.value)
                                    }
                                    className={field}
                                >
                                    <option value="">All Pay Periods</option>

                                    {payPeriods.map((period) => (
                                        <option key={period} value={period}>
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
                                    className={ghostBtn}
                                >
                                    <X className="h-4 w-4" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pay Runs Table */}
                    <div className={`${card} overflow-hidden`}>
                        {/* Table Header */}
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                            <div>
                                <h2 className="text-base font-semibold text-[#0B0F1A] dark:text-white">
                                    Payroll Runs
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                                    {filteredPayRuns.length} payroll run
                                    {filteredPayRuns.length !== 1 ? 's' : ''}{' '}
                                    found
                                </p>
                            </div>
                        </div>

                        {filteredPayRuns.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                            <th className={`${th} text-left`}>
                                                Pay Run
                                            </th>

                                            <th className={`${th} text-left`}>
                                                Pay Period
                                            </th>

                                            <th className={`${th} text-left`}>
                                                Pay Date
                                            </th>

                                            <th className={`${th} text-right`}>
                                                Gross Pay
                                            </th>

                                            <th className={`${th} text-right`}>
                                                Net Pay
                                            </th>

                                            <th className={`${th} text-center`}>
                                                Status
                                            </th>

                                            <th className={`${th} text-center`}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {filteredPayRuns.map((payrun) => {
                                            const isPaid =
                                                payrun.status === 'paid';
                                            const isDraft =
                                                payrun.status === 'draft';
                                            const payrunNumber =
                                                getPayrunNumber(payrun);

                                            return (
                                                <tr
                                                    key={payrun.id}
                                                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                                                >
                                                    {/* Pay Run */}
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-medium text-[#0B0F1A] dark:text-white">
                                                                {payrun.name ||
                                                                    payrunNumber}
                                                            </p>

                                                            <p className="mt-1 font-['JetBrains_Mono'] text-xs text-slate-400">
                                                                {payrunNumber}
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
                                                        <span className="font-['JetBrains_Mono'] text-sm text-slate-700 dark:text-white/80">
                                                            {formatCurrency(
                                                                payrun.gross_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Net Pay */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A] dark:text-white">
                                                            {formatCurrency(
                                                                payrun.net_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-center">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C6F432]/25 px-2.5 py-1 text-xs font-medium text-[#456000] dark:bg-[#C6F432]/10 dark:text-[#C6F432]">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
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
                                                                title="View pay run"
                                                                onClick={() => {
                                                                    setSelectedPayruns(
                                                                        payrun,
                                                                    );
                                                                    setShowViewPayrunsModal(
                                                                        true,
                                                                    );
                                                                }}
                                                                aria-label={`View pay run ${payrunNumber}`}
                                                                className={`${iconBtn} hover:text-[#0B0F1A] dark:hover:text-white`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            {/* Edit */}
                                                            <button
                                                                type="button"
                                                                title="Edit pay run"
                                                                onClick={() =>
                                                                    handleEditPayrun(
                                                                        payrun,
                                                                    )
                                                                }
                                                                aria-label={`Edit pay run ${payrunNumber}`}
                                                                className={`${iconBtn} hover:text-[#4D6B00] dark:hover:text-[#C6F432]`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>

                                                            {/* Download */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownloadPayrun(
                                                                        payrun.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDraft
                                                                }
                                                                title="Download pay run"
                                                                aria-label={`Download pay run ${payrunNumber}`}
                                                                className={`${iconBtn} hover:text-indigo-600 dark:hover:text-[#9AA3FF]`}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>

                                                            {/* Delete (paid runs are protected) */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        payrun,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isPaid
                                                                }
                                                                title={
                                                                    isPaid
                                                                        ? 'Paid pay runs cannot be deleted'
                                                                        : 'Delete pay run'
                                                                }
                                                                aria-label={`Delete pay run ${payrunNumber}`}
                                                                className={`${iconBtn} hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#FF6B5B]/10 dark:hover:text-[#FF8A7C]`}
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

                                <h3 className="mt-4 text-base font-semibold text-[#0B0F1A] dark:text-white">
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
                                        className={`mt-4 ${ghostBtn}`}
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
                                        className={`mt-4 ${primaryBtn}`}
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

            {/* Update Pay Run Modal */}
            {selectedPayruns && (
                <UpdateModal
                    open={showUpdatePayrunsModal}
                    onClose={() => {
                        setShowUpdatePayrunsModal(false);
                        setSelectedPayruns(null);
                    }}
                    title="Update Pay Run"
                >
                    <UpdatePayrunsForm
                        payrun={selectedPayruns}
                        onCancel={() => {
                            setShowUpdatePayrunsModal(false);
                            setSelectedPayruns(null);
                        }}
                        onSuccess={() => {
                            setShowUpdatePayrunsModal(false);
                            setSelectedPayruns(null);
                        }}
                    />
                </UpdateModal>
            )}

            {/* View Pay Run Modal */}
            {selectedPayruns && (
                <ViewPayruns
                    open={showViewPayrunsModal}
                    payrun={selectedPayruns}
                    onClose={() => {
                        setShowViewPayrunsModal(false);
                        setSelectedPayruns(null);
                    }}
                />
            )}

            {/* Delete Pay Run Modal */}
            {payrunToDelete && (
                <DeleteModal
                    open
                    processing={isDeleting}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDeletePayrun}
                    title="Delete Pay Run"
                    description={`Are you sure you want to delete ${
                        payrunToDelete.name || getPayrunNumber(payrunToDelete)
                    } (${getPayrunNumber(payrunToDelete)}, ${formatDate(
                        payrunToDelete.period_start,
                    )} to ${formatDate(
                        payrunToDelete.period_end,
                    )})? This action cannot be undone.`}
                />
            )}
        </AppLayout>
    );
}