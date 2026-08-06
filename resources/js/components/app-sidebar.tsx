import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    ChevronsUpDown,
    Home,
    LogOut,
    Percent,
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
    { title: 'Tax & deductions', href: '/payroll/tax', icon: Percent },
    { title: 'Anomalies', href: '/payroll/anomalies', icon: AlertTriangle, badge: '3' },
];

const peopleItems: NavItem[] = [
    { title: 'Employees', href: '/employee', icon: Users },
    { title: 'Attendance', href: '/attendance', icon: CalendarClock },
];

const reportItems: NavItem[] = [{ title: 'Cost forecast', href: '/reports/forecast', icon: TrendingUp }];

function NavGroup({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                    <Link href={item.href}>
                                        <item.icon className="text-[#b98a2e]/70 group-data-[active=true]/menu-button:text-[#b98a2e]" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.badge && (
                                    <SidebarMenuBadge className="rounded-full bg-[#b98a2e] px-1.5 text-[10px] font-semibold text-[#16241c]">
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
    const { url } = usePage();

    return (
        <Sidebar collapsible="icon" className="border-r-0 [&_[data-sidebar=sidebar]]:bg-[#16241c]">
            <SidebarHeader className="border-b border-white/10 px-2.5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b98a2e] font-['Space_Grotesk'] text-sm font-semibold text-white">
                        S
                    </span>
                    <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-['Space_Grotesk'] text-sm font-semibold text-white">SmartPayroll</span>
                        <span className="truncate text-xs text-white/45">Acme Corp</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-1 py-2 [&_[data-sidebar=group-label]]:text-white/40 [&_[data-sidebar=menu-button]]:text-white/75 [&_[data-sidebar=menu-button]]:hover:bg-[#b98a2e]/15 [&_[data-sidebar=menu-button]]:hover:text-white [&_[data-sidebar=menu-button][data-active=true]]:bg-[#b98a2e]/20 [&_[data-sidebar=menu-button][data-active=true]]:text-white">
                <NavGroup label="Overview" items={overviewItems} currentPath={url} />
                <SidebarSeparator className="bg-white/10" />
                <NavGroup label="Payroll" items={payrollItems} currentPath={url} />
                <SidebarSeparator className="bg-white/10" />
                <NavGroup label="People" items={peopleItems} currentPath={url} />
                <SidebarSeparator className="bg-white/10" />
                <NavGroup label="Reports" items={reportItems} currentPath={url} />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 px-1 py-2 [&_[data-sidebar=menu-button]]:text-white/75 [&_[data-sidebar=menu-button]]:hover:bg-[#b98a2e]/15 [&_[data-sidebar=menu-button]]:hover:text-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={url.startsWith('/settings')} tooltip="Settings">
                            <Link href="/settings">
                                <Settings className="text-[#b98a2e]/70" />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="mt-1 data-[state=open]:bg-white/[0.06]"
                            tooltip="Ana Cruz"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b98a2e] font-['IBM_Plex_Mono'] text-xs font-semibold text-[#16241c]">
                                AC
                            </span>
                            <div className="flex min-w-0 flex-col text-left">
                                <span className="truncate text-sm font-medium">Ana Cruz</span>
                                <span className="truncate text-xs text-white/45">HR Administrator</span>
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-white/40" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Log out">
                            <Link href="/logout" method="post" as="button" className="w-full">
                                <LogOut className="text-white/50" />
                                <span>Log out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}