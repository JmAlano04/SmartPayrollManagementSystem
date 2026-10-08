import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

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

type Props = {
    payrun: PayRun | null;
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormData = {
    name: string;
    period_start: string;
    period_end: string;
    pay_date: string;
    status: 'draft' | 'paid';
};

const pad = (n: number) => String(n).padStart(2, '0');

// Converts whatever string the API sends into the database format (YYYY-MM-DD),
// which is also what <input type="date"> needs.
//   "2026-10-08"                    -> "2026-10-08"
//   "10/08/2026"                    -> "2026-10-08"
//   "2026-10-07T16:00:00.000000Z"   -> "2026-10-08" (UTC timestamp, shown in local time)
const toDateInput = (value?: string | null) => {
    if (!value) return '';

    const v = value.trim();

    // Already in database format
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

    // mm/dd/yyyy
    const us = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (us) return `${us[3]}-${us[1]}-${us[2]}`;

    // ISO datetime or any other parseable string
    const parsed = new Date(v);
    if (Number.isNaN(parsed.getTime())) return '';

    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
};
function getPayrunNumber(payrun: PayRun) {
    return `PR-${String(payrun.id).padStart(4, '0')}`;
}

const formatCurrency = (amount: number) =>
    `₱ ${Number(amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function UpdatePayrunsForm({ payrun, onSuccess, onCancel }: Props) {
    const [form, setForm] = useState<FormData>({
        name: payrun ? getPayrunNumber(payrun) : '',
        period_start: toDateInput(payrun?.period_start),
        period_end: toDateInput(payrun?.period_end),
        pay_date: toDateInput(payrun?.pay_date),
        status: payrun?.status ?? 'draft',
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!payrun || processing) return;

        router.put(route('payruns.update', payrun.id), form, {
            preserveScroll: true,
            onStart: () => {
                setProcessing(true);
                setErrors({});
            },
            onSuccess: () => onSuccess?.(),
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    const ledgerInput =
        'w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:text-white dark:focus:border-[#5FA37F]';

    const readOnlyInput =
        'w-full rounded-none border-0 border-b border-[#16241C]/20 bg-[#16241C]/5 px-0 py-2 font-semibold shadow-none dark:border-white/20 dark:bg-white/5 dark:text-white';

    const labelClass = 'text-sm font-medium text-[#16241C] dark:text-white';

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="grid gap-2 sm:col-span-2">
                    <label htmlFor="name" className={labelClass}>Pay Run Name</label>
                    <input
                        id="name" name="name" type="text" required
                        value={form.name} readOnly onChange={handleChange}
                        disabled={processing} className={readOnlyInput} 
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Period start */}
                <div className="grid gap-2">
                    <label htmlFor="period_start" className={labelClass}>Period Start</label>
                    <input
                        id="period_start" name="period_start" type="date" required
                        value={form.period_start} onChange={handleChange}
                        disabled={processing} className={ledgerInput}
                    />
                    {errors.period_start && <p className="text-sm text-red-500">{errors.period_start}</p>}
                </div>

                {/* Period end */}
                <div className="grid gap-2">
                    <label htmlFor="period_end" className={labelClass}>Period End</label>
                    <input
                        id="period_end" name="period_end" type="date" required
                        min={form.period_start || undefined}
                        value={form.period_end} onChange={handleChange}
                        disabled={processing} className={ledgerInput}
                    />
                    {errors.period_end && <p className="text-sm text-red-500">{errors.period_end}</p>}
                </div>

                {/* Pay date */}
                <div className="grid gap-2">
                    <label htmlFor="pay_date" className={labelClass}>Pay Date</label>
                    <input
                        id="pay_date" name="pay_date" type="date" required
                        value={form.pay_date} onChange={handleChange}
                        disabled={processing} className={ledgerInput}
                    />
                    {errors.pay_date && <p className="text-sm text-red-500">{errors.pay_date}</p>}
                </div>

                {/* Status */}
                <div className="grid gap-2">
                    <label htmlFor="status" className={labelClass}>Status</label>
                    <select
                        id="status" name="status"
                        value={form.status} onChange={handleChange}
                        disabled={processing} className={ledgerInput}
                    >
                        <option value="draft">Draft</option>
                        <option value="paid">Paid</option>
                    </select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>

                {/* Read-only totals */}
                <div className="grid gap-2">
                    <label className={labelClass}>Gross Pay</label>
                    <input type="text" readOnly value={formatCurrency(payrun?.gross_pay ?? 0)} className={readOnlyInput} />
                </div>

                <div className="grid gap-2">
                    <label className={labelClass}>Net Pay</label>
                    <input type="text" readOnly value={formatCurrency(payrun?.net_pay ?? 0)} className={readOnlyInput} />
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3 border-t border-[#14172B]/10 pt-5 dark:border-white/10">
                <button
                    type="button" onClick={onCancel} disabled={processing}
                    className="rounded-lg border border-[#14172B]/10 px-4 py-2.5 text-sm font-medium text-[#14172B] transition hover:bg-[#14172B]/5 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                    Cancel
                </button>

                <button
                    type="submit" disabled={processing || !payrun}
                    className="flex items-center gap-2 rounded-lg bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {processing ? 'Updating...' : 'Update Pay Run'}
                </button>
            </div>
        </form>
    );
}