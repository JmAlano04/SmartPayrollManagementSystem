import {
    Banknote,
    CalendarCheck,
    CalendarRange,
    CheckCircle2,
    FileEdit,
    Hash,
    Users,
    Wallet,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

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

type ViewPayrunsProps = {
    open: boolean;
    payrun: PayRun | null;
    onClose: () => void;
};

function getStatusLabel(status: PayRun['status']) {
    return String(status)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

function getPayrunNumber(payrun: PayRun) {
    return `PR-${String(payrun.id).padStart(4, '0')}`;
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
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
            <div>
                <p className="text-sm text-[#14172B]/50 dark:text-white/50">{label}</p>
                <p className="text-lg font-medium text-[#14172B] dark:text-white">{children}</p>
            </div>
        </div>
    );
}

export default function ViewPayruns({ open, payrun, onClose }: ViewPayrunsProps) {
    if (!open || !payrun) {
        return null;
    }

    const isPaid = payrun.status === 'paid';

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
                        Payrun Details
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

                <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-2">

                    <DetailItem icon={Users} label="Employees">
                        {payrun.employees_count}
                    </DetailItem>
                    

                    <DetailItem icon={Hash} label="Pay Run">
                        {getPayrunNumber(payrun)}
                    </DetailItem>


                    <DetailItem icon={CalendarRange} label="Pay period">
                        {formatDate(payrun.period_start)} – {formatDate(payrun.period_end)}
                    </DetailItem>

                    

                    <DetailItem icon={CalendarCheck} label="Pay date">
                        {formatDate(payrun.pay_date)}
                    </DetailItem>

     

                    <DetailItem icon={Banknote} label="Gross pay">
                        {formatCurrency(Number(payrun.gross_pay))}
                    </DetailItem>

                    <DetailItem icon={Wallet} label="Net pay">
                        {formatCurrency(Number(payrun.net_pay))}
                    </DetailItem>



                    
                    <DetailItem
                        icon={isPaid ? CheckCircle2 : FileEdit}
                        label="Status"
                        iconClassName={
                            isPaid
                                ? 'size-5 text-green-600 dark:text-green-400'
                                : 'size-5 text-amber-600 dark:text-amber-400'
                        }
                    >
                        {getStatusLabel(payrun.status)}
                    </DetailItem>
                </div>
            </div>
        </div>
    );
}