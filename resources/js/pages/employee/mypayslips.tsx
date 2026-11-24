import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, type ComponentProps } from 'react';

import ViewMyPayslip from '@/components/payslips/ViewPayslips';

import {
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Download,
    Eye,
    FileText,
    Wallet,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Payslips', href: '/my-payslips' },
];

type MyPayslip = {
    id: number;
    payslip_number: string;
    pay_period: string;
    pay_date: string | null;
    base_pay: number;
    overtime_pay: number;
    allowances_total: number;
    gross_pay: number;
    tax_amount: number;
    other_deductions: number;
    total_deductions: number;
    net_pay: number;
    status: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    employee: { name: string; employee_code: string };
    stats: {
        total_payslips: number;
        latest_net_pay: number;
        ytd_net_pay: number;
    };
    payslips: {
        data: MyPayslip[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
};

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';
const th = 'px-4 py-4 text-xs font-medium text-[#667085]';
const td = 'px-4 py-4 align-top text-sm break-words text-[#344054]';
const tdNum = 'px-4 py-4 text-right align-top whitespace-nowrap';
const mono = "font-['IBM_Plex_Mono']";
const pageBtn =
    'rounded-lg border border-[#D0D5DD] p-2 text-[#475467] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40';

function formatCurrency(value: number) {
    return `₱ ${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function MyPayslips({ employee, stats, payslips }: Props) {
    const [selectedPayslip, setSelectedPayslip] = useState<MyPayslip | null>(
        null,
    );

    const goToPage = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleDownload = (id: number) => {
        window.location.href = route('employee.payslips.download', id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Payslips">
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
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Payslips
                        </h1>
                        <p className="mt-1 text-sm text-[#475467]">
                            {employee.name} ·{' '}
                            <span className={mono}>{employee.employee_code}</span>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Total Payslips
                                    </p>
                                    <h2
                                        className={`mt-2 ${mono} text-2xl font-medium`}
                                    >
                                        {stats.total_payslips}
                                    </h2>
                                </div>
                                <div className="rounded-xl bg-[#F2F4F7] p-3">
                                    <FileText className="h-5 w-5 text-[#344054]" />
                                </div>
                            </div>
                        </div>

                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Latest Net Pay
                                    </p>
                                    <h2
                                        className={`mt-2 ${mono} text-xl font-medium text-[#0E7A5A]`}
                                    >
                                        {formatCurrency(stats.latest_net_pay)}
                                    </h2>
                                </div>
                                <div className="rounded-xl bg-[#D1FADF] p-3">
                                    <CircleCheck className="h-5 w-5 text-[#0E7A5A]" />
                                </div>
                            </div>
                        </div>

                        <div className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#667085]">
                                        Net Pay This Year
                                    </p>
                                    <h2
                                        className={`mt-2 ${mono} text-xl font-medium`}
                                    >
                                        {formatCurrency(stats.ytd_net_pay)}
                                    </h2>
                                </div>
                                <div className="rounded-xl bg-[#0E7A5A] p-3">
                                    <Wallet className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={`${card} overflow-hidden`}>
                        <div className="w-full">
                            <table className="w-full table-auto">
                                <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
                                    <tr>
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
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#F2F4F7]">
                                    {payslips.data.length > 0 ? (
                                        payslips.data.map((payslip) => (
                                            <tr
                                                key={payslip.id}
                                                className="transition hover:bg-[#F9FAFB]"
                                            >
                                                <td className={td}>
                                                    <p className="font-medium text-[#101828]">
                                                        {payslip.pay_period}
                                                    </p>
                                                    <p
                                                        className={`mt-1 text-xs text-[#667085] ${mono}`}
                                                    >
                                                        {payslip.payslip_number}
                                                    </p>
                                                    {payslip.pay_date && (
                                                        <p className="mt-1 text-xs text-[#667085]">
                                                            Pay date:{' '}
                                                            {payslip.pay_date}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className={tdNum}>
                                                    <span
                                                        className={`${mono} text-sm text-[#344054]`}
                                                    >
                                                        {formatCurrency(
                                                            payslip.gross_pay,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className={tdNum}>
                                                    <span
                                                        className={`${mono} text-sm text-[#475467]`}
                                                    >
                                                        {formatCurrency(
                                                            payslip.total_deductions,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className={tdNum}>
                                                    <span
                                                        className={`${mono} text-sm font-medium text-[#101828]`}
                                                    >
                                                        {formatCurrency(
                                                            payslip.net_pay,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-center align-top">
                                                    <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedPayslip(
                                                                payslip,
                                                            )
                                                        }
                                                        title="View payslip"
                                                        aria-label="View payslip"
                                                        className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
                                                    >
                                                        <Eye className="h-4 w-4" />
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
                                                        className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#0E7A5A]"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-16 text-center"
                                            >
                                                <h3 className="font-medium text-[#101828]">
                                                    No payslips yet
                                                </h3>
                                              
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {payslips.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-[#E4E7EC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#667085]">
                                    Showing {payslips.from ?? 0} to{' '}
                                    {payslips.to ?? 0} of {payslips.total}{' '}
                                    payslips
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={payslips.current_page === 1}
                                        onClick={() =>
                                            goToPage(
                                                payslips.links.find((l) =>
                                                    l.label.includes(
                                                        'Previous',
                                                    ),
                                                )?.url ?? null,
                                            )
                                        }
                                        className={pageBtn}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {payslips.links
                                        .filter(
                                            (l) =>
                                                !l.label.includes('Previous') &&
                                                !l.label.includes('Next'),
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

                                    <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={
                                            payslips.current_page ===
                                            payslips.last_page
                                        }
                                        onClick={() =>
                                            goToPage(
                                                payslips.links.find((l) =>
                                                    l.label.includes('Next'),
                                                )?.url ?? null,
                                            )
                                        }
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

            <ViewMyPayslip
                open={selectedPayslip !== null}
                payslip={
                    selectedPayslip as ComponentProps<
                        typeof ViewMyPayslip
                    >['payslip']
                }
                onClose={() => setSelectedPayslip(null)}
            />
        </AppLayout>
    );
}