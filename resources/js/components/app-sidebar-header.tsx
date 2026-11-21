import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

/*
 * Light palette (matches app-sidebar-light and the light pages)
 *   surface #FFFFFF   ink #101828   muted #475467 / #667085   line #E4E7EC
 *   hover   #F2F4F7   focus green #0E7A5A
 * Type: Instrument Sans (loaded by each page's <Head>).
 */

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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E4E7EC] bg-white px-4 font-['Instrument_Sans'] text-[#101828]">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]" />
                <div>
                    <p className="text-base font-semibold text-[#101828]">{pageTitle}</p>

                    {breadcrumbs.length > 1 ? (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    ) : null}
                </div>
            </div>

            <Link
                href="/logout"
                method="post"
                as="button"
                className="flex items-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] transition-colors hover:bg-[#F2F4F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7A5A]"
            >
                <LogOut className="size-4" />
                <span>Log out</span>
            </Link>
        </header>
    );
}