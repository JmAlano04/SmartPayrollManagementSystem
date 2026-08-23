import { LoaderCircle, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type DeleteModalProps = {
    open: boolean;
    title?: string;
    description?: string;
    children?: ReactNode;
    processing?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export default function DeleteModal({
    open,
    title = 'Delete Employee',
    description = 'Are you sure you want to delete this employee? This action cannot be undone.',
    children,
    processing = false,
    onClose,
    onConfirm,
}: DeleteModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !processing
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#16241c]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10">
                        <Trash2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-[#14172B] dark:text-white">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm text-[#14172B]/60 dark:text-white/60">
                            {description}
                        </p>
                    </div>
                </div>

                {children && (
                    <div className="mt-4">
                        {children}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3 border-t border-[#14172B]/10 pt-5 dark:border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border border-[#14172B]/10 px-4 py-2.5 text-sm font-medium text-[#14172B] transition hover:bg-[#14172B]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}

                        {processing ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}