import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type AddEmployeeFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

const initialForm: FormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function AddEmployeeForm({
    onSuccess,
    onCancel,
}: AddEmployeeFormProps) {
    const [form, setForm] = useState<FormData>(initialForm);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setProcessing(true);
        setErrors({});

        router.post('/employees/store', form, {
            preserveScroll: true,

            onSuccess: () => {
                setForm(initialForm);
                onSuccess?.();
            },

            onError: (errors) => {
                setErrors(errors as Record<string, string>);
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const ledgerInput =
        'rounded-none border-0 border-b border-[#16241C]/20 bg-transparent px-0 shadow-none focus:border-[#2F6B4F] focus:outline-none focus:ring-0 dark:border-white/20 dark:text-white dark:focus:border-[#5FA37F]';

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">

                {/* Name */}
                <div className="grid gap-2">
                    <label
                        htmlFor="name"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="Juan Dela Cruz"
                        className={ledgerInput}
                    />

                    {errors.name && (
                        <p className="text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Email address
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="email@example.com"
                        className={ledgerInput}
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="Password"
                        className={ledgerInput}
                    />

                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                    <label
                        htmlFor="password_confirmation"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Confirm password
                    </label>

                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="Confirm password"
                        className={ledgerInput}
                    />

                    {errors.password_confirmation && (
                        <p className="text-sm text-red-500">
                            {errors.password_confirmation}
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
                    disabled={processing}
                    className="flex items-center gap-2 rounded-lg bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}

                    {processing ? 'Creating...' : 'Create Employee'}
                </button>
            </div>
        </form>
    );
}