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

/*
 * Light palette (matches welcome-light, dashboard-light, login-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   paid   #D1FADF / #05603A   draft #FEF0C7 / #7A4B00
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

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
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const th = 'px-5 py-3 text-xs font-medium text-[#667085]';

const mono = "font-['IBM_Plex_Mono']";

const field =
    'w-full rounded-xl border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm text-[#101828] outline-none transition focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20';

const accentText = 'text-[#0E7A5A]';

const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]';

const ghostBtn =
    'inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB]';

const iconBtn =
    'rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

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
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                                Pay Runs
                            </h1>

                            <p className="mt-1 text-sm text-[#475467]">
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
                                    <p className="text-sm font-medium text-[#667085]">
                                        Total Pay Runs
                                    </p>

                                    <p
                                        className={`mt-2 ${mono} text-2xl font-medium text-[#101828]`}
                                    >
                                        {stats.total_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F4F7]">
                                    <Banknote className="h-5 w-5 text-[#344054]" />
                                </div>
                            </div>
                        </div>

                        {/* Paid */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#667085]">
                                        Paid
                                    </p>

                                    <p
                                        className={`mt-2 ${mono} text-2xl font-medium ${accentText}`}
                                    >
                                        {stats.paid_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D1FADF]">
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
                                    <p className="text-sm font-medium text-[#667085]">
                                        Draft
                                    </p>

                                    <p
                                        className={`mt-2 ${mono} text-2xl font-medium text-[#7A4B00]`}
                                    >
                                        {stats.pending_payroll_runs}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF0C7]">
                                    <Clock3 className="h-5 w-5 text-[#7A4B00]" />
                                </div>
                            </div>
                        </div>

                        {/* Total Net Pay */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#667085]">
                                        Total Net Pay
                                    </p>

                                    <p
                                        className={`mt-2 ${mono} text-xl font-medium text-[#101828]`}
                                    >
                                        {formatCurrency(totalNetPay)}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E7A5A]">
                                    <Banknote className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`${card} p-5`}>
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className={`h-4 w-4 ${accentText}`} />

                            <h2 className="text-sm font-semibold text-[#101828]">
                                Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Search */}
                            <div>
                                <label
                                    htmlFor="payrun-search"
                                    className="mb-2 block text-xs font-medium text-[#344054]"
                                >
                                    Search
                                </label>

                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                                    <input
                                        id="payrun-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search pay runs..."
                                        className={`${field} pl-9 placeholder:text-[#98A2B3]`}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="payrun-status"
                                    className="mb-2 block text-xs font-medium text-[#344054]"
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
                                    className="mb-2 block text-xs font-medium text-[#344054]"
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
                        <div className="flex flex-col gap-2 border-b border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[#101828]">
                                    Payroll Runs
                                </h2>

                                <p className="mt-1 text-xs text-[#667085]">
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
                                        <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
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

                                    <tbody className="divide-y divide-[#F2F4F7]">
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
                                                    className="transition hover:bg-[#F9FAFB]"
                                                >
                                                    {/* Pay Run */}
                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-medium text-[#101828]">
                                                                {payrun.name ||
                                                                    payrunNumber}
                                                            </p>

                                                            <p
                                                                className={`mt-1 ${mono} text-xs text-[#667085]`}
                                                            >
                                                                {payrunNumber}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Pay Period */}
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-[#344054]">
                                                            {formatDate(
                                                                payrun.period_start,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#667085]">
                                                            to{' '}
                                                            {formatDate(
                                                                payrun.period_end,
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Pay Date */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-[#344054]">
                                                            {formatDate(
                                                                payrun.pay_date,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Gross Pay */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm text-[#344054]`}
                                                        >
                                                            {formatCurrency(
                                                                payrun.gross_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Net Pay */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm font-medium text-[#101828]`}
                                                        >
                                                            {formatCurrency(
                                                                payrun.net_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-center">
                                                        {isPaid ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FADF] px-2.5 py-1 text-xs font-medium text-[#05603A]">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF0C7] px-2.5 py-1 text-xs font-medium text-[#7A4B00]">
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
                                                                className={`${iconBtn} hover:text-[#101828]`}
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
                                                                className={`${iconBtn} hover:text-[#0E7A5A]`}
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
                                                                className={`${iconBtn} hover:text-[#3538CD]`}
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
                                                                className={`${iconBtn} hover:bg-[#FEE4E2] hover:text-[#B42318]`}
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F4F7]">
                                    <Banknote className="h-7 w-7 text-[#98A2B3]" />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#101828]">
                                    No payroll runs found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-[#667085]">
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