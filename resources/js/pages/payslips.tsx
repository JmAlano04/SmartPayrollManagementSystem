import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import GeneratePayslipModal from '@/components/GeneratePayslipModal';
import GeneratePayslipForm from '@/components/payslips/GeneratePayslipForm';
import DeleteModal from '@/components/DeleteModal';
import UpdateModal from '@/components/UpdateModal';
import UpdatePayslipForm from '@/components/payslips/UpdatePayslipsForm';
import ViewPayslip from '@/components/payslips/ViewPayslips';

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    Download,
    Eye,
    FileText,
    FileUp,
    Pencil,
    Search,
    Trash2,
    Wallet,
} from 'lucide-react';

/*
 * Light palette (matches welcome-light, dashboard-light, pay-runs-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   paid   #D1FADF / #05603A   pending #FEF0C7 / #7A4B00
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payslips',
        href: '/payslips',
    },
];

type PayslipStatus = 'paid' | 'pending' | 'draft';

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
    base_pay: number;
    overtime_pay: number;
    allowances_total: number;
    tax_amount: number;
    status: PayslipStatus;
};

type Stats = {
    total_payslips: number;
    paid_payslips: number;
    pending_payslips: number;
    draft_payslips: number;
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
    employee_code: string;
    first_name: string;
    last_name: string;
    [key: string]: unknown;
};

type PayrollRun = {
    id: number;
    period_start: string;
    period_end: string;
    status: string;
    [key: string]: unknown;
};

type Props = {
    payslips: PayslipPagination;
    stats: Stats;
    employees: Employee[];
    payrollRuns: PayrollRun[];
};

/*
|--------------------------------------------------------------------------
| Shared class names
|--------------------------------------------------------------------------
*/

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const th = 'px-5 py-4 text-xs font-medium text-[#667085]';

const mono = "font-['IBM_Plex_Mono']";

const input =
    'h-10 w-full rounded-lg border border-[#D0D5DD] bg-white text-sm text-[#101828] outline-none transition focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20';

const ghostBtn =
    'inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB]';

const iconBtn = 'rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7]';

const pageBtn =
    'rounded-lg border border-[#D0D5DD] p-2 text-[#475467] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatCurrency(value: number) {
    return `₱ ${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getStatusClass(status: PayslipStatus) {
    switch (status) {
        case 'paid':
            return 'bg-[#D1FADF] text-[#05603A]';

        case 'pending':
            return 'bg-[#FEF0C7] text-[#7A4B00]';

        case 'draft':
            return 'bg-[#F2F4F7] text-[#475467]';

        default:
            return 'bg-[#F2F4F7] text-[#475467]';
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

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function Payslips({
    payslips,
    stats,
    employees,
    payrollRuns,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | States
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [payPeriod, setPayPeriod] = useState('');

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDeletePayslipModal, setShowDeletePayslipModal] =
        useState(false);
    const [showUpdatePayslipModal, setShowUpdatePayslipModal] =
        useState(false);

    const [selectedPayslip, setSelectedPayslip] =
        useState<Payslip | null>(null);

    const [showViewPayslipModal, setShowViewPayslipModal] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Pay Periods
    |--------------------------------------------------------------------------
    */

    const payPeriods = useMemo(() => {
        return Array.from(
            new Set(payslips.data.map((payslip) => payslip.pay_period)),
        );
    }, [payslips.data]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | The actual database search should be handled by Laravel because
    | payslips.data only contains the current pagination page.
    |
    | This local filter is kept so the current page also responds
    | immediately while the backend query is being used.
    |
    */

    const filteredPayslips = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return payslips.data.filter((payslip) => {
            const firstName = String(
                payslip.employee_firstname ?? '',
            ).toLowerCase();

            const lastName = String(
                payslip.employee_lastname ?? '',
            ).toLowerCase();

            const fullName = `${firstName} ${lastName}`.toLowerCase();

            const employeeCode = String(
                payslip.employee_code ?? '',
            ).toLowerCase();

            const payslipNumber = String(
                payslip.payslip_number ?? '',
            ).toLowerCase();

            const email = String(payslip.email ?? '').toLowerCase();

            const department = String(
                payslip.department ?? '',
            ).toLowerCase();

            const position = String(payslip.position ?? '').toLowerCase();

            const payPeriodValue = String(
                payslip.pay_period ?? '',
            ).toLowerCase();

            const payDate = String(payslip.pay_date ?? '').toLowerCase();

            const grossPay = String(payslip.gross_pay ?? '').toLowerCase();

            const deductions = String(
                payslip.total_deductions ?? '',
            ).toLowerCase();

            const netPay = String(payslip.net_pay ?? '').toLowerCase();

            const basePay = String(payslip.base_pay ?? '').toLowerCase();

            const overtimePay = String(
                payslip.overtime_pay ?? '',
            ).toLowerCase();

            const allowances = String(
                payslip.allowances_total ?? '',
            ).toLowerCase();

            const taxAmount = String(payslip.tax_amount ?? '').toLowerCase();

            const statusValue = String(payslip.status ?? '').toLowerCase();

            const matchesSearch =
                searchValue === '' ||
                firstName.includes(searchValue) ||
                lastName.includes(searchValue) ||
                fullName.includes(searchValue) ||
                employeeCode.includes(searchValue) ||
                payslipNumber.includes(searchValue) ||
                email.includes(searchValue) ||
                department.includes(searchValue) ||
                position.includes(searchValue) ||
                payPeriodValue.includes(searchValue) ||
                payDate.includes(searchValue) ||
                grossPay.includes(searchValue) ||
                deductions.includes(searchValue) ||
                netPay.includes(searchValue) ||
                basePay.includes(searchValue) ||
                overtimePay.includes(searchValue) ||
                allowances.includes(searchValue) ||
                taxAmount.includes(searchValue) ||
                statusValue.includes(searchValue);

            const matchesStatus = status === '' || payslip.status === status;

            const matchesPayPeriod =
                payPeriod === '' || payslip.pay_period === payPeriod;

            return matchesSearch && matchesStatus && matchesPayPeriod;
        });
    }, [payslips.data, search, status, payPeriod]);

    /*
    |--------------------------------------------------------------------------
    | Search / Filter Handler
    |--------------------------------------------------------------------------
    */

    const applyFilters = () => {
        router.get(
            route('payslips.index'),
            {
                search: search || undefined,
                status: status || undefined,
                pay_period: payPeriod || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPayPeriod('');

        router.get(
            route('payslips.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const goToPage = (url: string | null) => {
        if (!url) return;

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Export
    |--------------------------------------------------------------------------
    */

    const handleExportCsv = () => {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        if (status) {
            params.set('status', status);
        }

        if (payPeriod) {
            params.set('pay_period', payPeriod);
        }

        const queryString = params.toString();

        window.location.href =
            `${route('payslips.export')}` +
            (queryString ? `?${queryString}` : '');
    };

    /*
    |--------------------------------------------------------------------------
    | Download All
    |--------------------------------------------------------------------------
    */

    const handleDownloadAll = () => {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        if (status) {
            params.set('status', status);
        }

        if (payPeriod) {
            params.set('pay_period', payPeriod);
        }

        const queryString = params.toString();

        window.location.href =
            `${route('payslips.downloadAll')}` +
            (queryString ? `?${queryString}` : '');
    };

    /*
    |--------------------------------------------------------------------------
    | Download Single Payslip
    |--------------------------------------------------------------------------
    */

    const handleDownload = (payslipId: number) => {
        window.location.href = route('payslips.download', payslipId);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Payslip
    |--------------------------------------------------------------------------
    */

    const handleDeletePayslip = () => {
        if (!selectedPayslip) return;

        router.delete(route('payslips.destroy', selectedPayslip.id), {
            preserveScroll: true,

            onSuccess: () => {
                setShowDeletePayslipModal(false);
                setSelectedPayslip(null);
            },

            onError: (errors) => {
                console.error('Failed to delete payslip:', errors);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Edit / View / Open Delete
    |--------------------------------------------------------------------------
    */

    const handleEdit = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowUpdatePayslipModal(true);
    };

    const handleView = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowViewPayslipModal(true);
    };

    const handleDeleteClick = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowDeletePayslipModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payslips">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] p-4 font-['Instrument_Sans'] text-[#101828] md:p-6"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                                Payslips
                            </h1>

                            <p className="mt-1 text-sm text-[#475467]">
                                Manage and monitor employee payslips
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleExportCsv}
                                className={ghostBtn}
                            >
                                <FileUp className="h-4 w-4" />
                                Export
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadAll}
                                className={ghostBtn}
                            >
                                <Download className="h-4 w-4" />
                                Download All
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]"
                            >
                                <FileText className="h-4 w-4" />
                                Generate Payslip
                            </button>
                        </div>
                    </div>

                    {/* =====================================================
                        STAT CARDS
                    ====================================================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {/* Total */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Total Payslips
                                    </p>

                                    <h2
                                        className={`mt-2 ${mono} text-2xl font-medium text-[#101828]`}
                                    >
                                        {stats.total_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-[#F2F4F7] p-3">
                                    <FileText className="h-5 w-5 text-[#344054]" />
                                </div>
                            </div>
                        </div>

                        {/* Paid */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Paid
                                    </p>

                                    <h2
                                        className={`mt-2 ${mono} text-2xl font-medium text-[#0E7A5A]`}
                                    >
                                        {stats.paid_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-[#D1FADF] p-3">
                                    <CircleCheck className="h-5 w-5 text-[#0E7A5A]" />
                                </div>
                            </div>
                        </div>

                        {/* Draft */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Draft
                                    </p>

                                    <h2
                                        className={`mt-2 ${mono} text-2xl font-medium text-[#7A4B00]`}
                                    >
                                        {stats.draft_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-[#FEF0C7] p-3">
                                    <Clock className="h-5 w-5 text-[#7A4B00]" />
                                </div>
                            </div>
                        </div>

                        {/* Net Pay */}
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Total Net Pay
                                    </p>

                                    <h2
                                        className={`mt-2 ${mono} text-xl font-medium text-[#101828]`}
                                    >
                                        {formatCurrency(stats.total_net_pay)}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-[#0E7A5A] p-3">
                                    <Wallet className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        FILTERS
                    ====================================================== */}

                    <div className={`${card} p-4`}>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            {/* Search */}
                            <div className="relative md:col-span-5">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters();
                                        }
                                    }}
                                    placeholder="Search employee, payslip, department, or amount..."
                                    className={`${input} pr-3 pl-10 placeholder:text-[#98A2B3]`}
                                />
                            </div>

                            {/* Pay Period */}
                            <div className="relative md:col-span-3">
                                <CalendarDays className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                                <select
                                    value={payPeriod}
                                    onChange={(e) => {
                                        setPayPeriod(e.target.value);
                                    }}
                                    className={`${input} appearance-none pr-3 pl-10`}
                                >
                                    <option value="">All Pay Periods</option>

                                    {payPeriods.map((period) => (
                                        <option key={period} value={period}>
                                            {period}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className={`${input} px-3`}
                                >
                                    <option value="">All Status</option>

                                    <option value="paid">Paid</option>

                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2 md:col-span-2">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="h-10 w-full rounded-full border border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        TABLE
                    ====================================================== */}

                    <div className={`${card} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
                                    <tr>
                                        <th className={`${th} text-left`}>
                                            Employee
                                        </th>

                                        <th className={`${th} text-left`}>
                                            Pay Period
                                        </th>

                                        <th className={`${th} text-right`}>
                                            Gross Pay
                                        </th>

                                        <th className={`${th} text-right`}>
                                            Deductions
                                        </th>

                                        <th className={`${th} text-right`}>
                                            Net Pay
                                        </th>

                                        <th className={`${th} text-center`}>
                                            Status
                                        </th>

                                        <th className={`${th} text-center`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#F2F4F7]">
                                    {filteredPayslips.length > 0 ? (
                                        filteredPayslips.map((payslip) => {
                                            const fullName =
                                                getFullName(payslip);

                                            return (
                                                <tr
                                                    key={payslip.id}
                                                    className="transition hover:bg-[#F9FAFB]"
                                                >
                                                    {/* Employee */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D1FADF] ${mono} text-xs font-medium text-[#05603A]`}
                                                            >
                                                                {initialsOf(
                                                                    fullName,
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-[#101828]">
                                                                    {fullName}
                                                                </p>

                                                                <p className="text-xs text-[#667085]">
                                                                    {
                                                                        payslip.employee_code
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Period */}
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-[#344054]">
                                                            {payslip.pay_period}
                                                        </p>

                                                        {payslip.pay_date && (
                                                            <p className="mt-1 text-xs text-[#667085]">
                                                                Pay date:{' '}
                                                                {payslip.pay_date}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Gross */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm text-[#344054]`}
                                                        >
                                                            {formatCurrency(
                                                                payslip.gross_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Deductions */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm text-[#475467]`}
                                                        >
                                                            {formatCurrency(
                                                                payslip.total_deductions,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Net */}
                                                    <td className="px-5 py-4 text-right">
                                                        <span
                                                            className={`${mono} text-sm font-medium text-[#101828]`}
                                                        >
                                                            {formatCurrency(
                                                                payslip.net_pay,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                                payslip.status,
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                payslip.status,
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleView(
                                                                        payslip,
                                                                    )
                                                                }
                                                                title="View payslip"
                                                                aria-label="View payslip"
                                                                className={`${iconBtn} hover:text-[#101828]`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        payslip,
                                                                    )
                                                                }
                                                                title="Edit payslip"
                                                                aria-label="Edit payslip"
                                                                className={`${iconBtn} hover:text-[#0E7A5A]`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        payslip.id,
                                                                    )
                                                                }
                                                                title="Download payslip"
                                                                aria-label="Download payslip"
                                                                className={`${iconBtn} hover:text-[#3538CD]`}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        payslip,
                                                                    )
                                                                }
                                                                title="Delete payslip"
                                                                aria-label="Delete payslip"
                                                                className={`${iconBtn} hover:bg-[#FEE4E2] hover:text-[#B42318]`}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-3 rounded-full bg-[#F2F4F7] p-4">
                                                        <Search className="h-6 w-6 text-[#98A2B3]" />
                                                    </div>

                                                    <h3 className="font-medium text-[#101828]">
                                                        No payslips found
                                                    </h3>

                                                    <p className="mt-1 text-sm text-[#667085]">
                                                        Try changing your
                                                        search or filters.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {payslips.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Showing{' '}
                                    <span className="font-medium text-[#101828]">
                                        {payslips.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-[#101828]">
                                        {payslips.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-[#101828]">
                                        {payslips.total}
                                    </span>{' '}
                                    payslips
                                </p>

                                <div className="flex items-center gap-1">
                                    {/* Previous */}
                                    <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={payslips.current_page === 1}
                                        onClick={() => {
                                            const previousLink =
                                                payslips.links.find((link) =>
                                                    link.label.includes(
                                                        'Previous',
                                                    ),
                                                );

                                            if (previousLink?.url) {
                                                goToPage(previousLink.url);
                                            }
                                        }}
                                        className={pageBtn}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {/* Page Numbers */}
                                    {payslips.links
                                        .filter(
                                            (link) =>
                                                !link.label.includes(
                                                    'Previous',
                                                ) &&
                                                !link.label.includes('Next'),
                                        )
                                        .map((link, index) => (
                                            <button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                onClick={() =>
                                                    goToPage(link.url)
                                                }
                                                disabled={!link.url}
                                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-[#0E7A5A] text-white'
                                                        : 'text-[#475467] hover:bg-[#F2F4F7]'
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}

                                    {/* Next */}
                                    <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={
                                            payslips.current_page ===
                                            payslips.last_page
                                        }
                                        onClick={() => {
                                            const nextLink =
                                                payslips.links.find((link) =>
                                                    link.label.includes(
                                                        'Next',
                                                    ),
                                                );

                                            if (nextLink?.url) {
                                                goToPage(nextLink.url);
                                            }
                                        }}
                                        className={pageBtn}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =============================================================
                GENERATE PAYSLIP MODAL
            ============================================================== */}

            <GeneratePayslipModal
                open={showGenerateModal}
                title="Generate Payslip"
                onClose={() => setShowGenerateModal(false)}
            >
                <GeneratePayslipForm
                    employees={employees}
                    payrollRuns={payrollRuns}
                    onSuccess={() => setShowGenerateModal(false)}
                />
            </GeneratePayslipModal>

            {/* =============================================================
                UPDATE PAYSLIP MODAL
            ============================================================== */}

            {selectedPayslip && (
                <UpdateModal
                    open={showUpdatePayslipModal}
                    onClose={() => {
                        setShowUpdatePayslipModal(false);
                        setSelectedPayslip(null);
                    }}
                    title="Update Payslip"
                >
                    <UpdatePayslipForm
                        payslip={selectedPayslip}
                        onSuccess={() => {
                            setShowUpdatePayslipModal(false);
                            setSelectedPayslip(null);
                        }}
                        onCancel={() => {
                            setShowUpdatePayslipModal(false);
                            setSelectedPayslip(null);
                        }}
                    />
                </UpdateModal>
            )}

            {/* =============================================================
                VIEW PAYSLIP MODAL
            ============================================================== */}

            {selectedPayslip && (
                <ViewPayslip
                    open={showViewPayslipModal}
                    payslip={selectedPayslip}
                    onClose={() => {
                        setShowViewPayslipModal(false);
                        setSelectedPayslip(null);
                    }}
                />
            )}

            {/* =============================================================
                DELETE PAYSLIP MODAL
            ============================================================== */}

            {selectedPayslip && (
                <DeleteModal
                    open={showDeletePayslipModal}
                    onClose={() => {
                        setShowDeletePayslipModal(false);
                        setSelectedPayslip(null);
                    }}
                    onConfirm={handleDeletePayslip}
                    title="Delete Payslip"
                    description={`Are you sure you want to delete payslip ${selectedPayslip.payslip_number}? This action cannot be undone.`}
                />
            )}
        </AppLayout>
    );
}