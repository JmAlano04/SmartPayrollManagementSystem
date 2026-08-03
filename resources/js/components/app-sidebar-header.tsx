import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Search } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#14172B]/8 bg-white/70 px-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="text-[#14172B]/60 dark:text-white/60" />
                <div>
                    {breadcrumbs.length > 0 ? (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    ) : (
                        <>
                            <p className="font-['Space_Grotesk'] text-base font-semibold text-[#14172B] dark:text-white">
                                Dashboard
                            </p>
                            <p className="text-xs text-[#14172B]/50 dark:text-white/50">
                                Overview for Acme Corp
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-[#14172B]/5 px-3 py-1.5 text-sm text-[#14172B]/50 sm:flex dark:bg-white/5 dark:text-white/50">
                <Search className="h-3.5 w-3.5" />
                <span>Search employees, pay runs…</span>
            </div>

            <button className="rounded-full bg-[#16241c] px-4 py-2 text-sm font-medium text-white hover:bg-[#233A2B]">
                Run payroll
            </button>
        </header>
    );
}