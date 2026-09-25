import { useForm } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

type CreatePayRunFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function CreatePayRunForm({
    onSuccess,
    onCancel,
}: CreatePayRunFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        period_start: '',
        period_end: '',
        pay_date: '',
        status: 'draft',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/payroll-runs/store', {
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };



    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Pay Period */}
            <div>
                <h3 className="mb-1 text-sm font-semibold text-[#14172B] dark:text-white">
                    Pay Period
                </h3>

                <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
                    Set the starting and ending date for this payroll run.
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Period Start */}
                    <div>
                        <label
                            htmlFor="period_start"
                            className="mb-2 block text-sm font-medium text-[#14172B] dark:text-white"
                        >
                            Period Start
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={17}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="period_start"
                                type="date"
                                value={data.period_start}
                                onChange={(e) =>
                                    setData('period_start', e.target.value)
                                }
                                className="w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 pl-7 text-sm shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:bg-transparent dark:text-white dark:focus:border-[#5FA37F]"
                            />
                        </div>

                        {errors.period_start && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.period_start}
                            </p>
                        )}
                    </div>

                    {/* Period End */}
                    <div>
                        <label
                            htmlFor="period_end"
                            className="mb-2 block text-sm font-medium text-[#14172B] dark:text-white"
                        >
                            Period End
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={17}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="period_end"
                                type="date"
                                min={data.period_start || undefined}
                                value={data.period_end}
                                onChange={(e) =>
                                    setData('period_end', e.target.value)
                                }
                                className="w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 pl-7 text-sm shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:bg-transparent dark:text-white dark:focus:border-[#5FA37F]"
                            />
                        </div>

                        {errors.period_end && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.period_end}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pay Day */}
            <div>
                <label
                    htmlFor="pay_date"
                    className="mb-2 block text-sm font-medium text-[#14172B] dark:text-white"
                >
                    Pay Day
                </label>

                <div className="relative">
                    <CalendarDays
                        size={17}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                   <input
                        id="pay_date"
                        type="date"
                        min={data.period_end || undefined}
                        value={data.pay_date}
                        onChange={(e) => setData('pay_date', e.target.value)}
                        className="w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 pl-7 text-sm shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:bg-transparent dark:text-white dark:focus:border-[#5FA37F]"
                    />
                </div>

                {errors.pay_date && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.pay_date}
                    </p>
                )}
            </div>

            {/* Status */}
            <div>
                <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-[#14172B] dark:text-white"
                >
                    Status
                </label>

                <select
                    id="status"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 py-2 text-sm shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:bg-transparent dark:text-white dark:focus:border-[#5FA37F]"
                >
                    <option value="draft">Draft</option>
                    <option value="paid">Paid</option>
                </select>

                {errors.status && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.status}
                    </p>
                )}
            </div>

            {/* Information */}
            <div className="rounded-xl border border-[#b98a2e]/20 bg-[#b98a2e]/5 p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    The payroll totals and flagged anomalies will be
                    calculated automatically when payslips are generated.
                </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-[#16241c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#203629] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Creating...' : 'Create Pay Run'}
                </button>
            </div>
        </form>
    );
}