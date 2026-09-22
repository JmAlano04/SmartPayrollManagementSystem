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
    const [showViewPayslipModal, setShowViewPayslipModal] =
        useState(false);

    const [selectedPayslip, setSelectedPayslip] =
        useState<Payslip | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Pay Periods
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
                payslip.employee_firstname ?? ''
            ).toLowerCase();

            const lastName = String(
                payslip.employee_lastname ?? ''
            ).toLowerCase();

            const fullName =
                `${firstName} ${lastName}`.toLowerCase();

            const employeeCode = String(
                payslip.employee_code ?? ''
            ).toLowerCase();

            const payslipNumber = String(
                payslip.payslip_number ?? ''
            ).toLowerCase();

            const email = String(
                payslip.email ?? ''
            ).toLowerCase();

            const department = String(
                payslip.department ?? ''
            ).toLowerCase();

            const position = String(
                payslip.position ?? ''
            ).toLowerCase();

            const payPeriodValue = String(
                payslip.pay_period ?? ''
            ).toLowerCase();

            const payDate = String(
                payslip.pay_date ?? ''
            ).toLowerCase();

            const grossPay = String(
                payslip.gross_pay ?? ''
            ).toLowerCase();

            const deductions = String(
                payslip.total_deductions ?? ''
            ).toLowerCase();

            const netPay = String(
                payslip.net_pay ?? ''
            ).toLowerCase();

            const basePay = String(
                payslip.base_pay ?? ''
            ).toLowerCase();

            const overtimePay = String(
                payslip.overtime_pay ?? ''
            ).toLowerCase();

            const allowances = String(
                payslip.allowances_total ?? ''
            ).toLowerCase();

            const taxAmount = String(
                payslip.tax_amount ?? ''
            ).toLowerCase();

            const statusValue = String(
                payslip.status ?? ''
            ).toLowerCase();

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
            }
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
            }
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
            }
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
        window.location.href = route(
            'payslips.download',
            payslipId
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Payslip
    |--------------------------------------------------------------------------
    */

    const handleDeletePayslip = () => {
        if (!selectedPayslip) return;

        router.delete(
            route(
                'payslips.destroy',
                selectedPayslip.id
            ),
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowDeletePayslipModal(false);
                    setSelectedPayslip(null);
                },

                onError: (errors) => {
                    console.error(
                        'Failed to delete payslip:',
                        errors
                    );
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const handleEdit = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowUpdatePayslipModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | View
    |--------------------------------------------------------------------------
    */

    const handleView = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowViewPayslipModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Open Delete
    |--------------------------------------------------------------------------
    */

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
            <Head title="Payslips" />

            <div className="min-h-screen bg-slate-50 p-4 dark:bg-[#0f1712] md:p-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-[#16241c] dark:text-white">
                                Payslips
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                                Manage and monitor employee payslips
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={handleExportCsv}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                <FileUp className="h-4 w-4" />
                                Export
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadAll}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                <Download className="h-4 w-4" />
                                Download All
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowGenerateModal(true)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-[#16241c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#22362a]"
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

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-white/50">
                                        Total Payslips
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-[#16241c] dark:text-white">
                                        {stats.total_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-lg bg-[#16241c]/10 p-3">
                                    <FileText className="h-5 w-5 text-[#16241c] dark:text-white" />
                                </div>

                            </div>

                        </div>

                        {/* Paid */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-white/50">
                                        Paid
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-[#16A34A]">
                                        {stats.paid_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-lg bg-green-100 p-3">
                                    <CircleCheck className="h-5 w-5 text-green-600" />
                                </div>

                            </div>

                        </div>

                        {/* Pending */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-white/50">
                                        Pending
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-amber-600">
                                        {stats.pending_payslips}
                                    </h2>
                                </div>

                                <div className="rounded-lg bg-amber-100 p-3">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>

                            </div>

                        </div>

                        {/* Net Pay */}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-white/50">
                                        Total Net Pay
                                    </p>

                                    <h2 className="mt-2 text-xl font-bold text-[#b98a2e]">
                                        {formatCurrency(
                                            stats.total_net_pay
                                        )}
                                    </h2>
                                </div>

                                <div className="rounded-lg bg-[#b98a2e]/10 p-3">
                                    <Wallet className="h-5 w-5 text-[#b98a2e]" />
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        FILTERS
                    ====================================================== */}

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

                            {/* Search */}

                            <div className="relative">

                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter'
                                        ) {
                                            applyFilters();
                                        }
                                    }}
                                    placeholder="Search employee, payslip, department, or amount..."
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />

                            </div>

                            {/* Pay Period */}

                            <div className="relative">

                                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    value={payPeriod}
                                    onChange={(e) => {
                                        setPayPeriod(
                                            e.target.value
                                        );
                                    }}
                                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <option value="">
                                        All Pay Periods
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

                            {/* Status */}

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#b98a2e] focus:ring-1 focus:ring-[#b98a2e] dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                <option value="">
                                    All Status
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

                            {/* Buttons */}

                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="flex-1 rounded-lg bg-[#16241c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#22362a]"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    Clear
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        TABLE
                    ====================================================== */}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#16241c]">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1000px]">

                                <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">

                                    <tr>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Employee
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Pay Period
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Gross Pay
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Deductions
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Net Pay
                                        </th>

                                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">

                                    {filteredPayslips.length > 0 ? (

                                        filteredPayslips.map(
                                            (payslip) => {

                                                const fullName =
                                                    getFullName(
                                                        payslip
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            payslip.id
                                                        }
                                                        className="transition hover:bg-slate-50 dark:hover:bg-white/5"
                                                    >

                                                        {/* Employee */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16241c] text-xs font-bold text-white">
                                                                    {initialsOf(
                                                                        fullName
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="truncate font-medium text-[#16241c] dark:text-white">
                                                                        {
                                                                            fullName
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-slate-500 dark:text-white/50">
                                                                        {
                                                                            payslip.employee_code
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* Period */}

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm text-slate-700 dark:text-white/80">
                                                                {
                                                                    payslip.pay_period
                                                                }
                                                            </p>

                                                            {payslip.pay_date && (
                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    Pay date:{' '}
                                                                    {
                                                                        payslip.pay_date
                                                                    }
                                                                </p>
                                                            )}

                                                        </td>

                                                        {/* Gross */}

                                                        <td className="px-5 py-4 text-right">

                                                            <span className="text-sm font-medium text-slate-700 dark:text-white/80">
                                                                {formatCurrency(
                                                                    payslip.gross_pay
                                                                )}
                                                            </span>

                                                        </td>

                                                        {/* Deductions */}

                                                        <td className="px-5 py-4 text-right">

                                                            <span className="text-sm text-slate-600 dark:text-white/60">
                                                                {formatCurrency(
                                                                    payslip.total_deductions
                                                                )}
                                                            </span>

                                                        </td>

                                                        {/* Net */}

                                                        <td className="px-5 py-4 text-right">

                                                            <span className="text-sm font-semibold text-[#16241c] dark:text-white">
                                                                {formatCurrency(
                                                                    payslip.net_pay
                                                                )}
                                                            </span>

                                                        </td>

                                                        {/* Status */}

                                                        <td className="px-5 py-4 text-center">

                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                                    payslip.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    payslip.status
                                                                )}
                                                            </span>

                                                        </td>

                                                        {/* Actions */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center justify-center gap-1">

                                                                {/* View */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleView(
                                                                            payslip
                                                                        )
                                                                    }
                                                                    title="View payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#16241c] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>

                                                                {/* Edit */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            payslip
                                                                        )
                                                                    }
                                                                    title="Edit payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#b98a2e] dark:text-white/50 dark:hover:bg-white/10"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>

                                                                {/* Download */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDownload(
                                                                            payslip.id
                                                                        )
                                                                    }
                                                                    title="Download payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:text-white/50 dark:hover:bg-white/10"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </button>

                                                                {/* Delete */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            payslip
                                                                        )
                                                                    }
                                                                    title="Delete payslip"
                                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan={7}
                                                className="px-5 py-16 text-center"
                                            >

                                                <div className="flex flex-col items-center justify-center">

                                                    <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-white/5">
                                                        <Search className="h-6 w-6 text-slate-400" />
                                                    </div>

                                                    <h3 className="font-medium text-slate-700 dark:text-white">
                                                        No payslips found
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Try changing your search or filters.
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

                            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-sm text-slate-500 dark:text-white/50">

                                    Showing{' '}

                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {payslips.from ?? 0}
                                    </span>

                                    {' '}to{' '}

                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {payslips.to ?? 0}
                                    </span>

                                    {' '}of{' '}

                                    <span className="font-medium text-slate-700 dark:text-white">
                                        {payslips.total}
                                    </span>

                                    {' '}payslips

                                </p>

                                <div className="flex items-center gap-1">

                                    {/* Previous */}

                                    <button
                                        type="button"
                                        disabled={
                                            payslips.current_page ===
                                            1
                                        }
                                        onClick={() => {
                                            const previousLink =
                                                payslips.links.find(
                                                    (link) =>
                                                        link.label.includes(
                                                            'Previous'
                                                        )
                                                );

                                            if (
                                                previousLink?.url
                                            ) {
                                                goToPage(
                                                    previousLink.url
                                                );
                                            }
                                        }}
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {/* Page Numbers */}

                                    {payslips.links
                                        .filter(
                                            (link) =>
                                                !link.label.includes(
                                                    'Previous'
                                                ) &&
                                                !link.label.includes(
                                                    'Next'
                                                )
                                        )
                                        .map(
                                            (
                                                link,
                                                index
                                            ) => (
                                                <button
                                                    type="button"
                                                    key={`${link.label}-${index}`}
                                                    onClick={() =>
                                                        goToPage(
                                                            link.url
                                                        )
                                                    }
                                                    disabled={
                                                        !link.url
                                                    }
                                                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                                        link.active
                                                            ? 'bg-[#16241c] text-white'
                                                            : 'text-slate-600 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )
                                        )}

                                    {/* Next */}

                                    <button
                                        type="button"
                                        disabled={
                                            payslips.current_page ===
                                            payslips.last_page
                                        }
                                        onClick={() => {
                                            const nextLink =
                                                payslips.links.find(
                                                    (link) =>
                                                        link.label.includes(
                                                            'Next'
                                                        )
                                                );

                                            if (
                                                nextLink?.url
                                            ) {
                                                goToPage(
                                                    nextLink.url
                                                );
                                            }
                                        }}
                                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
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
                onClose={() =>
                    setShowGenerateModal(false)
                }
            >
                <GeneratePayslipForm
                    employees={employees}
                    payrollRuns={payrollRuns}
                    onSuccess={() =>
                        setShowGenerateModal(false)
                    }
                />
            </GeneratePayslipModal>

            {/* =============================================================
                UPDATE PAYSLIP MODAL
            ============================================================== */}

            {selectedPayslip && (
                <UpdateModal
                    open={showUpdatePayslipModal}
                    onClose={() => {
                        setShowUpdatePayslipModal(
                            false
                        );
                        setSelectedPayslip(null);
                    }}
                    title="Update Payslip"
                >
                    <UpdatePayslipForm
                        payslip={selectedPayslip}
                        onSuccess={() => {
                            setShowUpdatePayslipModal(
                                false
                            );
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
                        setShowViewPayslipModal(
                            false
                        );
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
                        setShowDeletePayslipModal(
                            false
                        );
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
