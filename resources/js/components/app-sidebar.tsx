import { Link, usePage } from '@inertiajs/react';

import {
    CalendarClock,
    Home,
    // LogOut,
    ScrollText,
    Settings,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';

type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
};

const overviewItems: NavItem[] = [{ title: 'Dashboard', href: '/dashboard', icon: Home }];

const payrollItems: NavItem[] = [
    { title: 'Pay runs', href: '/payroll/runs', icon: Wallet },
    { title: 'Payslips', href: '/payroll/payslips', icon: ScrollText },
];

const peopleItems: NavItem[] = [
    { title: 'Employees', href: '/employees', icon: Users },
    { title: 'Attendance', href: '/attendance', icon: CalendarClock },
];

type User = {
    id: number;
    name: string;
    email: string;
};

type Auth = {
    user: User | null;
    role: string | null;
};

export interface SharedData {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: Auth;
    flash: {
        isFirstLogin: boolean;
        success?: string;
        error?: string;
        message?: string;
    };
    [key: string]: unknown;
}

const reportItems: NavItem[] = [{ title: 'Cost forecast', href: '/reports/forecast', icon: TrendingUp }];

function NavGroup({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="font-['JetBrains_Mono'] text-[10px] tracking-widest uppercase">{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                    <Link href={item.href}>
                                        <item.icon className="text-[#C6F432]/60 group-data-[active=true]/menu-button:text-[#C6F432]" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.badge && (
                                    <SidebarMenuBadge className="rounded-full bg-[#C6F432] px-1.5 text-[10px] font-semibold text-[#0B0F1A]">
                                        {item.badge}
                                    </SidebarMenuBadge>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export function AppSidebar() {
    const { url, props } = usePage<SharedData>();

    const user = props.auth?.user;
    const role = props.auth?.role;

    const initials =
        user?.name
            ?.split(' ')
            .map((name) => name[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() ?? 'U';

    return (
        <Sidebar
            collapsible="icon"
            className="dark border-r-0 font-['Bricolage_Grotesque'] [&_[data-sidebar=sidebar]]:border-r [&_[data-sidebar=sidebar]]:border-white/10 [&_[data-sidebar=sidebar]]:!bg-[#0B0F1A]"
            style={
                {
                    '--sidebar': '#0B0F1A',
                    '--sidebar-foreground': '#ffffff',
                    '--sidebar-border': 'rgba(255,255,255,0.1)',
                } as React.CSSProperties
            }
        >
            <SidebarHeader className="border-b border-white/10 px-2.5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C6F432] font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A]">
                        §
                    </span>

                    <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-semibold text-white">SmartPayroll</span>

                        <span className="truncate text-xs text-white/45">Acme Corp</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-1 py-2 [&_[data-sidebar=group-label]]:text-white/40 [&_[data-sidebar=menu-button]]:rounded-lg [&_[data-sidebar=menu-button]]:text-white/70 [&_[data-sidebar=menu-button]]:hover:bg-[#C6F432]/10 [&_[data-sidebar=menu-button]]:hover:text-white [&_[data-sidebar=menu-button][data-active=true]]:bg-[#C6F432]/15 [&_[data-sidebar=menu-button][data-active=true]]:font-medium [&_[data-sidebar=menu-button][data-active=true]]:text-white">
                <NavGroup label="Overview" items={overviewItems} currentPath={url} />

                <SidebarSeparator className="bg-white/10" />

                <NavGroup label="Payroll" items={payrollItems} currentPath={url} />

                <SidebarSeparator className="bg-white/10" />

                <NavGroup label="People" items={peopleItems} currentPath={url} />

                <SidebarSeparator className="bg-white/10" />

                <NavGroup label="Reports" items={reportItems} currentPath={url} />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 px-1 py-2 [&_[data-sidebar=menu-button]]:rounded-lg [&_[data-sidebar=menu-button]]:text-white/70 [&_[data-sidebar=menu-button]]:hover:bg-[#C6F432]/10 [&_[data-sidebar=menu-button]]:hover:text-white [&_[data-sidebar=menu-button][data-active=true]]:bg-[#C6F432]/15 [&_[data-sidebar=menu-button][data-active=true]]:text-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={url.startsWith('/settings')} tooltip="Settings">
                            <Link href="/settings">
                                <Settings className="text-[#C6F432]/60" />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="mt-1 data-[state=open]:bg-white/[0.06]"
                            tooltip={user?.name ?? 'User'}
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C6F432] font-['JetBrains_Mono'] text-xs font-medium text-[#0B0F1A]">
                                {initials}
                            </span>

                            <div className="flex min-w-0 flex-col text-left">
                                <span className="truncate text-sm font-medium">{user?.name ?? 'User'}</span>

                                <span className="truncate text-xs text-white/45">{role ?? 'User'}</span>
                            </div>

                            {/* <ChevronsUpDown className="ml-auto h-4 w-4 text-white/40" /> */}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}