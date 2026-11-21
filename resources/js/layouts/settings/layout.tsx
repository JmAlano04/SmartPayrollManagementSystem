import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

/*
 * Light palette (matches profile-light, app-sidebar-light)
 *   surface #FFFFFF   ink #101828   muted #475467 / #667085   line #E4E7EC
 *   hover   #F2F4F7   active #D1FADF / #05603A
 * Type: Instrument Sans (loaded by each page's <Head>).
 */

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    // {
    //     title: 'Appearance',
    //     url: '/settings/appearance',
    //     icon: null,
    // },
];

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="font-['Instrument_Sans']">
            <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-6">
                <aside className="w-full lg:w-56 lg:shrink-0">
                    <nav aria-label="Settings" className={cn(card, 'flex flex-row gap-1 overflow-x-auto lg:flex-col')}>
                        <p className="hidden px-3 pt-2 pb-1 text-xs font-medium text-[#667085] lg:block">Settings</p>

                        {sidebarNavItems.map((item) => {
                            const isActive = currentPath === item.url;

                            return (
                                <Button
                                    key={item.url}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'justify-start rounded-lg text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]',
                                        'lg:w-full',
                                        isActive &&
                                            'bg-[#D1FADF] font-medium text-[#05603A] hover:bg-[#D1FADF] hover:text-[#05603A]',
                                    )}
                                >
                                    <Link href={item.url} prefetch aria-current={isActive ? 'page' : undefined}>
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-2 bg-[#E4E7EC] md:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="max-w-3xl space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}