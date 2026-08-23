import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

type Employee = {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    salary: number;
    status: 'active' | 'on_leave' | 'terminated';
    hire_date: string;
};

type UpdateEmployeeFormProps = {
    employee: Employee | null;
    onSuccess?: () => void;
    onCancel?: () => void;
};

type FormData = {
    name: string;
    email: string;
    department: string;
    position: string;
    salary: string;
    hire_date: string;
    status: 'active' | 'on_leave' | 'terminated';
};

export default function UpdateEmployeeForm({
    employee,
    onSuccess,
    onCancel,
}: UpdateEmployeeFormProps) {
    const [form, setForm] = useState<FormData>({
        name: employee?.name ?? '',
        email: employee?.email ?? '',
        department: employee?.department ?? '',
        position: employee?.position ?? '',
        salary: employee?.salary?.toString() ?? '',
        hire_date: employee?.hire_date ?? '',
        status: employee?.status ?? 'active',
    });

    const [processing, setProcessing] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

        if (!employee) {
            return;
        }

        setProcessing(true);
        setErrors({});

        router.put(`/employees/${employee.id}`, form, {
            preserveScroll: true,

            onSuccess: () => {
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
            <div className="grid gap-6 sm:grid-cols-2">

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

                {/* Department */}
                <div className="grid gap-2">
                    <label
                        htmlFor="department"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Department
                    </label>

                    <input
                        id="department"
                        name="department"
                        type="text"
                        value={form.department}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="Finance"
                        className={ledgerInput}
                    />

                    {errors.department && (
                        <p className="text-sm text-red-500">
                            {errors.department}
                        </p>
                    )}
                </div>

                {/* Position */}
                <div className="grid gap-2">
                    <label
                        htmlFor="position"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Position
                    </label>

                    <input
                        id="position"
                        name="position"
                        type="text"
                        value={form.position}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="Accountant"
                        className={ledgerInput}
                    />

                    {errors.position && (
                        <p className="text-sm text-red-500">
                            {errors.position}
                        </p>
                    )}
                </div>

                {/* Salary */}
                <div className="grid gap-2">
                    <label
                        htmlFor="salary"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Base Salary
                    </label>

                    <input
                        id="salary"
                        name="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.salary}
                        onChange={handleChange}
                        disabled={processing}
                        placeholder="25000"
                        className={ledgerInput}
                    />

                    {errors.salary && (
                        <p className="text-sm text-red-500">
                            {errors.salary}
                        </p>
                    )}
                </div>

                {/* Hire Date */}
                <div className="grid gap-2">
                    <label
                        htmlFor="hire_date"
                        className="text-sm font-medium text-[#16241C] dark:text-white"
                    >
                        Hire Date
                    </label>

                    <input
                        id="hire_date"
                        name="hire_date"
                        type="date"
                        required
                        value={form.hire_date}
                        onChange={handleChange}
                        disabled={processing}
                        className={ledgerInput}
                    />

                    {errors.hire_date && (
                        <p className="text-sm text-red-500">
                            {errors.hire_date}
                        </p>
                    )}
                </div>

                {/* Status */}
                <div className="grid gap-2 sm:col-span-2">
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
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
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
                    disabled={processing || !employee}
                    className="flex items-center gap-2 rounded-lg bg-[#b98a2e] px-5 py-2.5 text-sm font-medium text-[#16241c] transition hover:bg-[#a97d28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}

                    {processing ? 'Updating...' : 'Update Employee'}
                </button>
            </div>
        </form>
    );
}