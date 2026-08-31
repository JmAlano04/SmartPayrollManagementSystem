import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type Employee = {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
};

type PayrollRun = {
    id: number;
    period_start: string;
    period_end: string;
    pay_date?: string;
    status: string;
};

type GeneratePayslipFormProps = {
    employees: Employee[];
    payrollRuns: PayrollRun[];
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormData = {
    employee_id: string;
    payroll_run_id: string;
    base_pay: string;
    overtime_pay: string;
    allowances_total: string;
    gross_pay: string;
    tax_amount: string;
    other_deductions: string;
    net_pay: string;
};

export default function GeneratePayslipForm({
    employees,
    payrollRuns,
    onSuccess,
    onCancel,
}: GeneratePayslipFormProps) {
    const [form, setForm] = useState<FormData>({
        employee_id: '',
        payroll_run_id: '',
        base_pay: '',
        overtime_pay: '0',
        allowances_total: '0',
        gross_pay: '0.00',
        tax_amount: '0',
        other_deductions: '0',
        net_pay: '0.00',
    });

    const [processing, setProcessing] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const calculatePays = (data: FormData): FormData => {
        const basePay = parseFloat(data.base_pay) || 0;

        const overtimePay =
            parseFloat(data.overtime_pay) || 0;

        const allowances =
            parseFloat(data.allowances_total) || 0;

        const taxAmount =
            parseFloat(data.tax_amount) || 0;

        const otherDeductions =
            parseFloat(data.other_deductions) || 0;

        const grossPay =
            basePay +
            overtimePay +
            allowances;

        const netPay =
            grossPay -
            taxAmount -
            otherDeductions;

        return {
            ...data,

            gross_pay: grossPay.toFixed(2),

            net_pay: Math.max(
                netPay,
                0,
            ).toFixed(2),
        };
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;

        setForm((current) => {
            const updatedForm = {
                ...current,
                [name]: value,
            };

            return calculatePays(updatedForm);
        });

        setErrors((current) => ({
            ...current,
            [name]: '',
        }));
    };

    const handleSubmit = (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        setProcessing(true);

        setErrors({});

        router.post(
            '/payroll/payslips/generate-payslips',
            form,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setForm({
                        employee_id: '',
                        payroll_run_id: '',
                        base_pay: '',
                        overtime_pay: '0',
                        allowances_total: '0',
                        gross_pay: '0.00',
                        tax_amount: '0',
                        other_deductions: '0',
                        net_pay: '0.00',
                    });

                    onSuccess?.();
                },

                onError: (errors) => {
                    setErrors(
                        errors as Record<string, string>,
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const ledgerInput =
        'w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:text-white dark:focus:border-[#5FA37F]';

    const readOnlyInput =
        'w-full rounded-none border-0 border-b border-[#16241C]/20 bg-[#16241C]/5 px-0 py-2 font-semibold shadow-none dark:border-white/20 dark:bg-white/5 dark:text-white';

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">

                {/* Employee */}

                <div className="grid gap-2">
                    <label
                        htmlFor="employee_id"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Employee
                    </label>

                    <select
                        id="employee_id"
                        name="employee_id"
                        required
                        value={form.employee_id}
                        onChange={handleChange}
                        disabled={processing}
                        className={ledgerInput}
                    >
                        <option value="">
                            Select employee
                        </option>

                        {employees.map((employee) => (
                            <option
                                key={employee.id}
                                value={employee.id}
                            >
                                {employee.employee_code} -{' '}
                                {employee.first_name}{' '}
                                {employee.last_name}
                            </option>
                        ))}
                    </select>

                    {errors.employee_id && (
                        <p className="text-sm text-red-500">
                            {errors.employee_id}
                        </p>
                    )}
                </div>

                {/* Payroll Run */}

                <div className="grid gap-2">
                    <label
                        htmlFor="payroll_run_id"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Pay Period
                    </label>

                    <select
                        id="payroll_run_id"
                        name="payroll_run_id"
                        required
                        value={form.payroll_run_id}
                        onChange={handleChange}
                        disabled={processing}
                        className={ledgerInput}
                    >
                        <option value="">
                            Select pay period
                        </option>

                        {payrollRuns.map((payrollRun) => (
                            <option
                                key={payrollRun.id}
                                value={payrollRun.id}
                            >
                                {payrollRun.period_start} -{' '}
                                {payrollRun.period_end}
                            </option>
                        ))}
                    </select>

                    {errors.payroll_run_id && (
                        <p className="text-sm text-red-500">
                            {errors.payroll_run_id}
                        </p>
                    )}
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
                        placeholder="0.00"
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

                {/* Tax */}

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

                {/* Other Deductions */}

                <div className="grid gap-2">
                    <label
                        htmlFor="other_deductions"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Other Deductions
                    </label>

                    <input
                        id="other_deductions"
                        name="other_deductions"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.other_deductions}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="0.00"
                        className={ledgerInput}
                    />

                    {errors.other_deductions && (
                        <p className="text-sm text-red-500">
                            {errors.other_deductions}
                        </p>
                    )}
                </div>

                {/* Net Pay */}

                <div className="grid gap-2 sm:col-span-2">
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

                    {errors.net_pay && (
                        <p className="text-sm text-red-500">
                            {errors.net_pay}
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
                    disabled={
                        processing ||
                        !form.employee_id ||
                        !form.payroll_run_id
                    }
                    className="flex items-center gap-2 rounded-lg bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}

                    {processing
                        ? 'Generating...'
                        : 'Generate Payslip'}
                </button>

            </div>
        </form>
    );
}