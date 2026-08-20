import { X } from 'lucide-react';
import * as React from 'react';

type AddModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
};

export default function AddModal({
    open,
    onClose,
    title,
    description,
    children,
}: AddModalProps) {
    if (!open) {
        return null;
    }

   return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onMouseDown={onClose}
    >
        <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#16241c]"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#14172B]/10 px-6 py-5 dark:border-white/10">

                <div>
                    <h2 className="text-lg font-semibold text-[#14172B] dark:text-white">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-[#14172B]/50 dark:text-white/50">
                            {description}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-[#14172B]/50 transition hover:bg-[#14172B]/5 hover:text-[#14172B] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

            </div>

            {/* Form / Content */}
            <div className="max-h-[75vh] overflow-y-auto p-6">
                {children}
            </div>
        </div>
    </div>
);
}