import {
    Banknote,
    CalendarRange,
    CheckCircle2,
    Clock,
    FileEdit,
    Hash,
    User,
    Wallet,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

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

    base_pay: number;
    overtime_pay: number;
    allowances_total: number;
    gross_pay: number;
    tax_amount: number;
    total_deductions: number;
    net_pay: number;

    status: PayslipStatus;
};

type ViewPayslipsProps = {
    open: boolean;
    payslip: Payslip | null;
    onClose: () => void;
};

function getStatusLabel(status: Payslip['status']) {
    return String(status)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusStyle(status: Payslip['status']): { icon: LucideIcon; className: string } {
    switch (String(status).toLowerCase()) {
        case 'paid':
        case 'released':
            return { icon: CheckCircle2, className: 'size-5 text-green-600 dark:text-green-400' };
        case 'draft':
            return { icon: FileEdit, className: 'size-5 text-amber-600 dark:text-amber-400' };
        default:
            return { icon: Clock, className: 'size-5 text-[#14172B]/70 dark:text-white/70' };
    }
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

function getFullName(payslip: Payslip) {

    const fullName = [
        payslip.employee_firstname,
        payslip.employee_lastname,
    ]
        .filter(Boolean)
        .join(' ');

    return fullName || 'Unknown employee';
}

type DetailItemProps = {
    icon: LucideIcon;
    label: string;
    children: ReactNode;
    iconClassName?: string;
};

function DetailItem({ icon: Icon, label, children, iconClassName }: DetailItemProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#14172B]/5 dark:bg-white/10">
                <Icon
                    className={iconClassName ?? 'size-5 text-[#14172B]/70 dark:text-white/70'}
                    aria-hidden="true"
                />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-[#14172B]/50 dark:text-white/50">{label}</p>
                <p className="text-lg font-medium text-[#14172B] dark:text-white">{children}</p>
            </div>
        </div>
    );
}

export default function ViewPayslips({ open, payslip, onClose }: ViewPayslipsProps) {
    if (!open || !payslip) {
        return null;
    }

    const status = getStatusStyle(payslip.status);

    return (
        <div
            onMouseDown={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
            <div
                onMouseDown={(event) => event.stopPropagation()}
                className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl dark:bg-[#16241c]"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#14172B] dark:text-white">
                        Payslip Details
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1 text-[#14172B]/60 hover:bg-[#14172B]/5 hover:text-[#14172B] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailItem icon={User} label="Employee">
                        {getFullName(payslip)}
                    </DetailItem>

                    <DetailItem icon={Hash} label="Payslip number">
                        {payslip.payslip_number ?? '—'}
                    </DetailItem>

                    <DetailItem icon={CalendarRange} label="Pay period">
                        {payslip.pay_period}
                    </DetailItem>

                    <DetailItem icon={status.icon} label="Status" iconClassName={status.className}>
                        {getStatusLabel(payslip.status)}
                    </DetailItem>

                    <DetailItem icon={Banknote} label="Gross pay">
                        {formatCurrency(Number(payslip.gross_pay))}
                    </DetailItem>

                    <DetailItem icon={Wallet} label="Net pay">
                        {formatCurrency(Number(payslip.net_pay))}
                    </DetailItem>
                </div>
            </div>
        </div>
    );
}