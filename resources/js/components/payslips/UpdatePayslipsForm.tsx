import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

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

    base_pay: number;
    overtime_pay: number;
    allowances_total: number;
    gross_pay: number;
    tax_amount: number;
    total_deductions: number;
    net_pay: number;

    status: PayslipStatus;
};

type UpdatePayslipFormProps = {
    payslip: Payslip | null;
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormData = {
    base_pay: string;
    overtime_pay: string;
    allowances_total: string;
    gross_pay: string;
    tax_amount: string;
    total_deductions: string;
    net_pay: string;
    status: PayslipStatus;
};

export default function UpdatePayslipForm({
    payslip,
    onSuccess,
    onCancel,
}: UpdatePayslipFormProps) {
    const [form, setForm] = useState<FormData>({
        base_pay: payslip?.base_pay?.toString() ?? '',
        overtime_pay: payslip?.overtime_pay?.toString() ?? '',
        allowances_total:
            payslip?.allowances_total?.toString() ?? '',
        gross_pay: payslip?.gross_pay?.toString() ?? '',
        tax_amount: payslip?.tax_amount?.toString() ?? '',
        total_deductions:
            payslip?.total_deductions?.toString() ?? '',
        net_pay: payslip?.net_pay?.toString() ?? '',
        status: payslip?.status ?? 'draft',
    });



      console.log('=== UPDATE PAYSLIP DEBUG ===');
    console.log('Selected Payslip:', payslip);
    console.log('Payslip ID:', payslip?.id);
    console.log('Employee:', payslip?.employee_firstname, payslip?.employee_lastname);
    console.log('Pay Period:', payslip?.pay_period);
    console.log('Base Pay:', payslip?.base_pay);
    console.log('Overtime Pay:', payslip?.overtime_pay);
    console.log('Allowances:', payslip?.allowances_total);
    console.log('Gross Pay:', payslip?.gross_pay);
    console.log('Tax:', payslip?.tax_amount);
    console.log('Total Deductions:', payslip?.total_deductions);
    console.log('Net Pay:', payslip?.net_pay);
    console.log('Status:', payslip?.status);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((current) => {
            const updated = {
                ...current,
                [name]: value,
            };

            // Automatically calculate Gross Pay
            if (
                name === 'base_pay' ||
                name === 'overtime_pay' ||
                name === 'allowances_total'
            ) {
                const basePay =
                    parseFloat(
                        name === 'base_pay'
                            ? value
                            : current.base_pay
                    ) || 0;

                const overtimePay =
                    parseFloat(
                        name === 'overtime_pay'
                            ? value
                            : current.overtime_pay
                    ) || 0;

                const allowances =
                    parseFloat(
                        name === 'allowances_total'
                            ? value
                            : current.allowances_total
                    ) || 0;

                updated.gross_pay = (
                    basePay +
                    overtimePay +
                    allowances
                ).toFixed(2);
            }

            // Automatically calculate Net Pay
            if (
                name === 'base_pay' ||
                name === 'overtime_pay' ||
                name === 'allowances_total' ||
                name === 'tax_amount' ||
                name === 'total_deductions'
            ) {
                const basePay =
                    parseFloat(
                        name === 'base_pay'
                            ? value
                            : current.base_pay
                    ) || 0;

                const overtimePay =
                    parseFloat(
                        name === 'overtime_pay'
                            ? value
                            : current.overtime_pay
                    ) || 0;

                const allowances =
                    parseFloat(
                        name === 'allowances_total'
                            ? value
                            : current.allowances_total
                    ) || 0;

                const tax =
                    parseFloat(
                        name === 'tax_amount'
                            ? value
                            : current.tax_amount
                    ) || 0;

                const deductions =
                    parseFloat(
                        name === 'total_deductions'
                            ? value
                            : current.total_deductions
                    ) || 0;

                const gross =
                    basePay +
                    overtimePay +
                    allowances;

                updated.gross_pay = gross.toFixed(2);

                updated.net_pay = Math.max(
                    gross - tax - deductions,
                    0
                ).toFixed(2);
            }

            return updated;
        });

        setErrors((current) => ({
            ...current,
            [name]: '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!payslip) {
            return;
        }

        setProcessing(true);
        setErrors({});

        router.put(`/payslips/update/${payslip.id}`, form, {
            preserveScroll: true,

            onSuccess: () => {
                onSuccess?.();
            },

            onError: (errors) => {
                setErrors(
                    errors as Record<string, string>
                );
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const ledgerInput =
        'rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:text-white dark:focus:border-[#5FA37F]';

    const readOnlyInput =
        'rounded-none border-0 border-b border-[#16241C]/20 bg-[#16241C]/5 px-0 font-semibold shadow-none dark:border-white/20 dark:bg-white/5 dark:text-white';

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">

                {/* Employee */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#16241C] dark:text-white">
                        Employee
                    </label>

                    <input
                        type="text"
                        value={`${payslip?.employee_firstname ?? ''} ${payslip?.employee_lastname ?? ''}`}
                        readOnly
                        className={readOnlyInput}
                    />
                </div>

                {/* Pay Period */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#16241C] dark:text-white">
                        Pay Period
                    </label>

                    <input
                        type="text"
                        value={payslip?.pay_period ?? ''}
                        readOnly
                        className={readOnlyInput}
                    />
                </div>

                {/* Base Pay */}
                <div className="grid gap-2">
                    <label
                        htmlFor="base_pay"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Base Pay
                    </label>

                    <input
                        id="base_pay"
                        name="base_pay"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.base_pay}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="25000"
                        className={ledgerInput}
                    />

                    {errors.base_pay && (
                        <p className="text-sm text-red-500">
                            {errors.base_pay}
                        </p>
                    )}
                </div>

                {/* Overtime Pay */}
                <div className="grid gap-2">
                    <label
                        htmlFor="overtime_pay"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Overtime Pay
                    </label>

                    <input
                        id="overtime_pay"
                        name="overtime_pay"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.overtime_pay}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="0.00"
                        className={ledgerInput}
                    />

                    {errors.overtime_pay && (
                        <p className="text-sm text-red-500">
                            {errors.overtime_pay}
                        </p>
                    )}
                </div>

                {/* Allowances */}
                <div className="grid gap-2">
                    <label
                        htmlFor="allowances_total"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Total Allowances
                    </label>

                    <input
                        id="allowances_total"
                        name="allowances_total"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.allowances_total}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="0.00"
                        className={ledgerInput}
                    />

                    {errors.allowances_total && (
                        <p className="text-sm text-red-500">
                            {errors.allowances_total}
                        </p>
                    )}
                </div>

                {/* Gross Pay */}
                <div className="grid gap-2">
                    <label
                        htmlFor="gross_pay"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Gross Pay
                    </label>

                    <input
                        id="gross_pay"
                        name="gross_pay"
                        type="number"
                        value={form.gross_pay}
                        readOnly
                        className={readOnlyInput}
                    />

                    <p className="text-xs text-[#16241C]/50 dark:text-white/50">
                        Base Pay + Overtime Pay + Allowances
                    </p>
                </div>

                {/* Tax Amount */}
                <div className="grid gap-2">
                    <label
                        htmlFor="tax_amount"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Tax Amount
                    </label>

                    <input
                        id="tax_amount"
                        name="tax_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.tax_amount}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="0.00"
                        className={ledgerInput}
                    />

                    {errors.tax_amount && (
                        <p className="text-sm text-red-500">
                            {errors.tax_amount}
                        </p>
                    )}
                </div>

                {/* Total Deductions */}
                <div className="grid gap-2">
                    <label
                        htmlFor="total_deductions"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Other Deductions
                    </label>

                    <input
                        id="total_deductions"
                        name="total_deductions"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.total_deductions}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="0.00"
                        className={ledgerInput}
                    />

                    {errors.total_deductions && (
                        <p className="text-sm text-red-500">
                            {errors.total_deductions}
                        </p>
                    )}
                </div>

                {/* Net Pay */}
                <div className="grid gap-2">
                    <label
                        htmlFor="net_pay"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Net Pay
                    </label>

                    <input
                        id="net_pay"
                        name="net_pay"
                        type="number"
                        value={form.net_pay}
                        readOnly
                        className={readOnlyInput}
                    />

                    <p className="text-xs text-[#16241C]/50 dark:text-white/50">
                        Gross Pay - Tax Amount - Other Deductions
                    </p>
                </div>

                {/* Status */}
                <div className="grid gap-2">
                    <label
                        htmlFor="status"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        disabled={processing}
                        className={ledgerInput}
                    >
                        <option value="draft">
                            Draft
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="paid">
                            Paid
                        </option>
                    </select>

                    {errors.status && (
                        <p className="text-sm text-red-500">
                            {errors.status}
                        </p>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3 border-t border-[#14172B]/10 pt-5 dark:border-white/10">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="rounded-lg border border-[#14172B]/10 px-4 py-2.5 text-sm font-medium text-[#14172B] transition hover:bg-[#14172B]/5 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={processing || !payslip}
                    className="flex items-center gap-2 rounded-lg bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}

                    {processing
                        ? 'Updating...'
                        : 'Update Payslip'}
                </button>
            </div>
        </form>
    );
}