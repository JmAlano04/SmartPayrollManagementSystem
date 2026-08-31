import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import GeneratePayslipModal from '@/components/GeneratePayslipModal';
import GeneratePayslipForm from '@/components/payslips/GeneratePayslipForm';


import {
    CalendarDays,
    // CheckSquare,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    Download,
    Eye,
    FileText,
    FileUp,
    // Printer,
    Search,
    // Square,
    Upload,
    Wallet,
    // X,
} from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payslips',
        href: '/payslips',
    },
];

type PayslipStatus =
    | 'paid'
    | 'pending'
    | 'draft';

type Payslip = {
    id: number;
    payslip_number: string;
    employee_code: string;
    employee_firstname: string;
    employee_lastname: string;
    email: string;
    department: string;
    position: string;
    pay_period: string;
    pay_date: string | null;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
    status: PayslipStatus;
};

type Stats = {
    total_payslips: number;
    paid_payslips: number;
    pending_payslips: number;
    total_net_pay: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PayslipPagination = {
    data: Payslip[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Employee = {
    id: number;
    [key: string]: unknown;
};

type PayrollRun = {
    id: number;
    [key: string]: unknown;
};

type Props = {
    payslips: PayslipPagination;
    stats: Stats;
    employees: Employee[];
    payrollRuns: PayrollRun[];
};

function formatCurrency(value: number) {
    return `₱ ${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getStatusClass(status: PayslipStatus) {
    switch (status) {
        case 'paid':
            return 'bg-[#22C55E]/10 text-[#16A34A]';

        case 'pending':
            return 'bg-amber-100 text-amber-700';

        case 'draft':
            return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/60';

        default:
            return 'bg-slate-100 text-slate-600';
    }
}

function getStatusLabel(status: PayslipStatus) {
    switch (status) {
        case 'paid':
            return 'Paid';

        case 'pending':
            return 'Pending';

        case 'draft':
            return 'Draft';

        default:
            return status;
    }
}

function getFullName(payslip: Payslip): string {
    return `${payslip.employee_firstname} ${payslip.employee_lastname}`;
}

function initialsOf(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Payslips({
    payslips,
    stats,
    employees,
    payrollRuns,
}: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | PAY PERIOD OPTIONS
    |--------------------------------------------------------------------------
    */

    const payPeriods = useMemo(() => {
        return Array.from(
            new Set(
                payslips.data.map(
                    (payslip) => payslip.pay_period
                )
            )
        );
    }, [payslips.data]);

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filteredPayslips = useMemo(() => {
        return payslips.data.filter((payslip) => {
            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                payslip.employee_firstname
                    .toLowerCase()
                    .includes(searchValue) ||
                payslip.employee_lastname
                    .toLowerCase()
                    .includes(searchValue) ||

                payslip.employee_code
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                status === '' ||
                payslip.status === status;

            const matchesPayPeriod =
                payPeriod === '' ||
                payslip.pay_period === payPeriod;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayPeriod
            );
        });
    }, [
        payslips.data,
        search,
        status,
        payPeriod,
    ]);

    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERS
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPayPeriod('');
    };

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payslips" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* HEADER */}

                <div className="relative overflow-hidden rounded-2xl bg-[#16241c] p-6">
                    <div className="relative flex flex-wrap items-center justify-between">

                        <div>
                            <div className="flex items-center gap-2">

                                <FileText className="h-5 w-5 text-[#b98a2e]" />

                                <h1 className="text-xl font-semibold text-white">
                                    Payslips
                                </h1>

                            </div>

                            <p className="mt-1 text-sm text-white/55">
                                Manage and review employee payroll statements.
                            </p>
                        </div>

                        <div className="relative flex flex-wrap items-center justify-between gap-7">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(true)}
                                    className="flex items-center gap-2 rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/50"
                                >
                                    <Upload className="h-4 w-4" />
                                    Import
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(true)}
                                     className="flex items-center gap-2 rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/50"
                                >
                                    <FileUp className="h-4 w-4" />
                                    Export
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(true)}
                                     className="flex items-center gap-2 rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/50"
                                >
                                    <Download className="h-4 w-4" />
                                    Download all
                                    <ChevronDown/>

                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(true)}
                                    className="flex items-center gap-2 rounded-full bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28]"
                                >
                                    <FileText className="h-4 w-4" />
                                    Generate Payslip
                                </button>


                        </div>

                       
                    </div>
                </div>

                {/* Generate payslip modal */}
                <GeneratePayslipModal
                    open={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    title="Generate Payslip"
                    description="Create a new payslip."
                >
                    <GeneratePayslipForm
                         onCancel={() => setShowGenerateModal(false)}
                         onSuccess={() => setShowGenerateModal(false)}
                         employees={employees}
                         payrollRuns={payrollRuns}
                    />
                </GeneratePayslipModal>

                {/* STATISTICS */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* TOTAL */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16241c]/10">
                            <FileText className="h-4.5 w-4.5" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.total_payslips}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Total payslips
                        </p>

                    </div>

                    {/* PAID */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10">
                            <CircleCheck className="h-4.5 w-4.5 text-[#16A34A]" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.paid_payslips}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Paid
                        </p>

                    </div>

                    {/* PENDING */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                            <Clock className="h-4.5 w-4.5 text-amber-600" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {stats.pending_payslips}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Pending
                        </p>

                    </div>

                    {/* NET PAY */}

                    <div className="rounded-xl border border-[#14172B]/8 bg-white p-5 dark:border-white/10 dark:bg-white/5">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b98a2e]/15">
                            <Wallet className="h-4.5 w-4.5 text-[#b98a2e]" />
                        </span>

                        <p className="mt-4 text-2xl font-semibold text-[#14172B] dark:text-white">
                            {formatCurrency(
                                Number(stats.total_net_pay)
                            )}
                        </p>

                        <p className="mt-0.5 text-xs text-[#14172B]/55 dark:text-white/55">
                            Total net pay
                        </p>

                    </div>

                </div>

                {/* FILTERS */}

                <div className="flex flex-wrap items-center gap-3">

                    {/* SEARCH */}

                    <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#14172B]/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">

                        <Search className="h-4 w-4 text-[#14172B]/40 dark:text-white/40" />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search employee or payslip..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#14172B]/40 dark:text-white dark:placeholder:text-white/40"
                        />

                    </div>

                    {/* PAY PERIOD */}

                    <div className="relative">

                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#14172B]/40 dark:text-white/40" />

                        <select
                            value={payPeriod}
                            onChange={(event) =>
                                setPayPeriod(
                                    event.target.value
                                )
                            }
                            className="rounded-lg border border-[#14172B]/10 bg-white py-2 pl-9 pr-8 text-sm text-[#14172B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >

                            <option value="">
                                All pay periods
                            </option>

                            {payPeriods.map(
                                (period) => (
                                    <option
                                        key={period}
                                        value={period}
                                    >
                                        {period}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* STATUS */}

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                            )
                        }
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

                    {/* CLEAR */}

                    {(search ||
                        status ||
                        payPeriod) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-[#14172B]/10 px-3 py-2 text-sm text-[#14172B] transition hover:bg-[#14172B]/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                        >
                            Clear
                        </button>
                    )}

                </div>

                {/* TABLE */}

                <div className="overflow-hidden rounded-xl border border-[#14172B]/8 bg-white dark:border-white/10 dark:bg-white/5">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead>

                                <tr className="border-b border-[#14172B]/8 text-xs text-[#14172B]/45 dark:border-white/10 dark:text-white/45">

                                    <th className="px-4 py-3 font-medium">
                                        Employee
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Pay Period
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Gross Pay
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Deductions
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

                                {filteredPayslips.length > 0 ? (

                                    filteredPayslips.map(
                                        (payslip) => (

                                            <tr
                                                key={payslip.id}
                                                className="border-b border-[#14172B]/6 last:border-0 dark:border-white/10"
                                            >

                                                {/* EMPLOYEE */}

                                                <td className="px-4 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16241c]/10 text-xs font-semibold text-[#16241c] dark:bg-white/10 dark:text-white">

                                                            {initialsOf(
                                                                getFullName(payslip)
                                                            )}

                                                        </span>

                                                        <div>

                                                            <p className="font-medium text-[#14172B] dark:text-white">
                                                                {getFullName(payslip)}
                                                            </p>

                                                            <p className="text-xs text-[#14172B]/45 dark:text-white/45">
                                                                {payslip.employee_code}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* PERIOD */}

                                                <td className="px-4 py-4">

                                                    <p className="text-sm text-[#14172B]/70 dark:text-white/70">
                                                        {payslip.pay_period}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-[#14172B]/40 dark:text-white/40">
                                                        Pay date:{' '}
                                                        {payslip.pay_date ?? 'N/A'}
                                                    </p>

                                                </td>

                                                {/* GROSS */}

                                                <td className="px-4 py-4 font-medium text-[#14172B] dark:text-white">

                                                    {formatCurrency(
                                                        Number(
                                                            payslip.gross_pay
                                                        )
                                                    )}

                                                </td>

                                                {/* DEDUCTIONS */}

                                                <td className="px-4 py-4 text-red-500">

                                                    -{' '}

                                                    {formatCurrency(
                                                        Number(
                                                            payslip.total_deductions
                                                        )
                                                    )}

                                                </td>

                                                {/* NET */}

                                                <td className="px-4 py-4">

                                                    <span className="font-semibold text-[#16241c] dark:text-white">

                                                        {formatCurrency(
                                                            Number(
                                                                payslip.net_pay
                                                            )
                                                        )}

                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-4 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                            payslip.status
                                                        )}`}
                                                    >

                                                        {getStatusLabel(
                                                            payslip.status
                                                        )}

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-4 py-4">

                                                    <div className="flex justify-end gap-1">

                                                        <button
                                                            type="button"
                                                            title="View payslip"
                                                            className="rounded-md p-1.5 text-[#14172B]/60 transition hover:bg-[#16241c]/10 hover:text-[#16241c] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                                                        >

                                                            <Eye className="h-4 w-4" />

                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Download payslip"
                                                            className="rounded-md p-1.5 text-[#14172B]/60 transition hover:bg-[#16241c]/10 hover:text-[#16241c] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                                                        >

                                                            <Download className="h-4 w-4" />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center"
                                        >

                                            <div className="flex flex-col items-center">

                                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16241c]/10 dark:bg-white/10">

                                                    <FileText className="h-5 w-5 text-[#16241c]/60 dark:text-white/60" />

                                                </span>

                                                <p className="mt-3 text-sm font-medium text-[#14172B] dark:text-white">
                                                    No payslips found
                                                </p>

                                                <p className="mt-1 text-xs text-[#14172B]/45 dark:text-white/45">
                                                    Try changing your search or filters.
                                                </p>

                                            </div>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

                    <div className="flex flex-col gap-3 border-t border-[#14172B]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">

                        <p className="text-sm text-[#14172B]/50 dark:text-white/50">

                            Showing{' '}

                            <span className="font-medium text-[#14172B] dark:text-white">
                                {payslips.from ?? 0}
                            </span>

                            {' '}to{' '}

                            <span className="font-medium text-[#14172B] dark:text-white">
                                {payslips.to ?? 0}
                            </span>

                            {' '}of{' '}

                            <span className="font-medium text-[#14172B] dark:text-white">
                                {payslips.total}
                            </span>

                            {' '}payslips

                        </p>

                        <div className="flex items-center gap-1">

                            {payslips.links.map(
                                (link, index) => {

                                    /*
                                    |--------------------------------------------------------------------------
                                    | PREVIOUS
                                    |--------------------------------------------------------------------------
                                    */

                                    if (index === 0) {
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                className="rounded-lg p-2 text-[#14172B]/60 transition hover:bg-[#14172B]/5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/60 dark:hover:bg-white/10"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                        );
                                    }

                                    /*
                                    |--------------------------------------------------------------------------
                                    | NEXT
                                    |--------------------------------------------------------------------------
                                    */

                                    if (
                                        index ===
                                        payslips.links.length - 1
                                    ) {
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                className="rounded-lg p-2 text-[#14172B]/60 transition hover:bg-[#14172B]/5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/60 dark:hover:bg-white/10"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        );
                                    }

                                    /*
                                    |--------------------------------------------------------------------------
                                    | PAGE NUMBERS
                                    |--------------------------------------------------------------------------
                                    */

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() =>
                                                goToPage(link.url)
                                            }
                                            className={`rounded-lg px-3 py-1.5 text-sm transition ${
                                                link.active
                                                    ? 'bg-[#16241c] text-white'
                                                    : 'text-[#14172B]/60 hover:bg-[#14172B]/5 dark:text-white/60 dark:hover:bg-white/10'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </AppLayout>
    );
}