import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

import {
    SidebarMenuButton,
   
} from '@/components/ui/sidebar';


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

          

            <button className="rounded-full border border-gray-300 px-2 font-medium text-gray-600 hover:bg-gray-100">
                        <SidebarMenuButton asChild tooltip="Log out">
                            <Link href="/logout" method="post" as="button" className="w-full">
                                <LogOut className="text-black/50" />
                                <span className='text-[12px] text-black/50'>Log out</span>
                            </Link>
                        </SidebarMenuButton>

            </button>
        </header>
    );
}