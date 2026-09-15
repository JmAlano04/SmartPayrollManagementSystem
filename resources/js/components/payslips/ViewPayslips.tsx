

type Payslip = {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    employee_name?: string;
    payslip_number: string;
    pay_period: string;
    status: string;
    gross_pay: number | string;
    net_pay: number | string;
};

type ViewPayslipsProps = {
    open: boolean;
    payslip: Payslip;
    onClose: () => void;
};

function getStatusLabel(status: Payslip['status']) {
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

function getFullName(payslip: Payslip) {
    return payslip.employee_name ?? [payslip.first_name, payslip.middle_name, payslip.last_name]
        .filter(Boolean)
        .join(' ');
}


export default function ViewPayslips({ open, payslip, onClose }: ViewPayslipsProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-[#16241c]">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[#14172B] dark:text-white">
                        Payslip Details
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-[#14172B]/60 hover:text-[#14172B] dark:text-white/60 dark:hover:text-white"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Employee</p>
                        <p className="font-medium text-[#14172B] dark:text-white">
                            {getFullName(payslip)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Payslip number</p>
                        <p className="font-medium text-[#14172B] dark:text-white">{payslip.payslip_number}</p>
                    </div>
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Pay period</p>
                        <p className="font-medium text-[#14172B] dark:text-white">{payslip.pay_period}</p>
                    </div>
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Status</p>
                        <p className="font-medium text-[#14172B] dark:text-white">{getStatusLabel(payslip.status)}</p>
                    </div>
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Gross pay</p>
                        <p className="font-medium text-[#14172B] dark:text-white">{formatCurrency(Number(payslip.gross_pay))}</p>
                    </div>
                    <div>
                        <p className="text-[#14172B]/50 dark:text-white/50">Net pay</p>
                        <p className="font-medium text-[#14172B] dark:text-white">{formatCurrency(Number(payslip.net_pay))}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}