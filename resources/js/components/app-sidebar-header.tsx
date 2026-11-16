import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

// 'payroll/runs/index' -> 'Runs', 'employee-list' -> 'Employee List'
function titleFromComponent(component: string): string {
    const parts = component.split('/').filter((part) => part.toLowerCase() !== 'index');
    const last = parts[parts.length - 1] ?? 'Dashboard';

    return last
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { component } = usePage();

    const pageTitle =
        breadcrumbs.length > 0
            ? breadcrumbs[breadcrumbs.length - 1].title
            : titleFromComponent(component);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0B0F1A] px-4 text-white">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="text-white/60" />
                <div>
                    <p className="font-['Space_Grotesk'] font-sans text-base text-white">{pageTitle}</p>

                    {breadcrumbs.length > 1 ? (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    ) : null}
                </div>
            </div>

            <Link
                href="/logout"
                method="post"
                as="button"
                className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10"
            >
                <LogOut className="size-4" />
                <span>Log out</span>
            </Link>
        </header>
    );
}