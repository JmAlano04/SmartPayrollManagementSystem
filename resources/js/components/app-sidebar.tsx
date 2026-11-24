import { Link, usePage } from '@inertiajs/react';

import {
    CalendarClock,
    Camera,
    Home,
    ScrollText,
    Settings,
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

/*
 * Light palette (matches welcome-light, dashboard-light, login-light)
 *   surface #FFFFFF   ink #101828   muted #475467 / #667085   line #E4E7EC
 *   hover   #F2F4F7   active #D1FADF / #05603A   green #0E7A5A
 * Type: Instrument Sans (UI), IBM Plex Mono (figures / initials only).
 */

// ==========================================
// TYPES
// ==========================================

type UserRole = 'admin' | 'hr' | 'employee';

type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
};

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

type RoleNavigation = {
    payroll: NavItem[];
    people: NavItem[];
    attendance: NavItem[];
};

// ==========================================
// ROLE MAPPING
// ==========================================

// Backend role name (Spatie) -> sidebar role key
const roleAliases: Record<string, UserRole> = {
    admin: 'admin',
    hr_manager: 'hr',
    hr: 'hr',
    employee: 'employee',
};

const roleLabels: Record<UserRole, string> = {
    admin: 'Admin',
    hr: 'HR Manager',
    employee: 'Employee',
};

// ==========================================
// NAVIGATION ITEMS
// ==========================================

const overviewItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
];

// ---------- Admin ----------

const adminPayrollItems: NavItem[] = [
    {
        title: 'Pay Runs',
        href: '/payroll/runs',
        icon: Wallet,
    },
    {
        title: 'Payslips',
        href: '/payroll/payslips',
        icon: ScrollText,
    },
];

const adminPeopleItems: NavItem[] = [
    {
        title: 'Employees',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarClock,
    },
];

// ---------- HR ----------

const hrPayrollItems: NavItem[] = [
    {
        title: 'Payslips',
        href: '/payroll/payslips',
        icon: ScrollText,
    },
];

const hrPeopleItems: NavItem[] = [
    {
        title: 'Employees',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarClock,
    },
];

// ---------- Employee ----------

const employeePayrollItems: NavItem[] = [
    {
        title: 'My Payslips',
        href: '/payroll/payslips-employee',
        icon: ScrollText,
    },
];

const employeeAttendanceItems: NavItem[] = [
    {
        title: 'Face Registration',
        href: '/face-recognition', // change to your actual camera route
        icon: Camera,
    },
];

// ==========================================
// ROLE-BASED NAVIGATION
// ==========================================

const roleNavigation: Record<UserRole, RoleNavigation> = {
    admin: {
        payroll: adminPayrollItems,
        people: adminPeopleItems,
        attendance: [],
    },

    hr: {
        payroll: hrPayrollItems,
        people: hrPeopleItems,
        attendance: [],
    },

    // Employee sees only: Dashboard (overview), My Payslips, Camera
    employee: {
        payroll: employeePayrollItems,
        people: [],
        attendance: employeeAttendanceItems,
    },
};

// ==========================================
// NAVIGATION GROUP COMPONENT
// ==========================================

function NavGroup({
    label,
    items,
    currentPath,
}: {
    label: string;
    items: NavItem[];
    currentPath: string;
}) {
    if (items.length === 0) return null;

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium">
                {label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            currentPath.startsWith(`${item.href}/`);

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                >
                                    <Link href={item.href}>
                                        <item.icon className="text-[#98A2B3] group-data-[active=true]/menu-button:text-[#0E7A5A]" />

                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>

                                {item.badge && (
                                    <SidebarMenuBadge className="rounded-full bg-[#0E7A5A] px-1.5 text-[10px] font-semibold text-white">
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

// ==========================================
// MAIN SIDEBAR
// ==========================================

export function AppSidebar() {
    const { url, props } = usePage<SharedData>();

    const user = props.auth?.user;

    // Map the backend role name (e.g. "hr_manager") to a sidebar role key
    const role: UserRole | undefined = props.auth?.role
        ? roleAliases[props.auth.role.toLowerCase()]
        : undefined;

    // Null if the role is invalid or unassigned
    const navigation = role ? roleNavigation[role] : null;

    // Only groups that have items, so separators sit between groups and
    // never trail after the last one.
    const groups = navigation
        ? [
              { label: 'Payroll', items: navigation.payroll },
              { label: 'People', items: navigation.people },
              { label: 'Attendance', items: navigation.attendance },
          ].filter((group) => group.items.length > 0)
        : [];

    const initials =
        user?.name
            ?.split(' ')
            .map((name) => name[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() ?? 'U';

    const roleLabel = role ? roleLabels[role] : 'User';

    return (
        <Sidebar
            collapsible="icon"
            className="border-r-0 font-['Instrument_Sans'] [&_[data-sidebar=sidebar]]:border-r [&_[data-sidebar=sidebar]]:border-[#E4E7EC] [&_[data-sidebar=sidebar]]:!bg-white"
            style={
                {
                    '--sidebar': '#FFFFFF',
                    '--sidebar-foreground': '#101828',
                    '--sidebar-border': '#E4E7EC',
                } as React.CSSProperties
            }
        >
            {/* HEADER */}
            <SidebarHeader className="border-b border-[#E4E7EC] px-2.5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-sm font-medium text-white">
                        ₱
                    </span>

                    <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-semibold text-[#101828]">
                            SmartPayroll
                        </span>

                        <span className="truncate text-xs text-[#667085]">
                            {roleLabel} Portal
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            {/* NAVIGATION */}
            <SidebarContent className="px-1 py-2 [&_[data-sidebar=group-label]]:text-[#667085] [&_[data-sidebar=menu-button]]:rounded-lg [&_[data-sidebar=menu-button]]:text-[#475467] [&_[data-sidebar=menu-button]]:hover:bg-[#F2F4F7] [&_[data-sidebar=menu-button]]:hover:text-[#101828] [&_[data-sidebar=menu-button][data-active=true]]:bg-[#D1FADF] [&_[data-sidebar=menu-button][data-active=true]]:font-medium [&_[data-sidebar=menu-button][data-active=true]]:text-[#05603A]">
                {/* ALL AUTHENTICATED USERS */}
                <NavGroup
                    label="Overview"
                    items={overviewItems}
                    currentPath={url}
                />

                {/* ADMIN / HR / EMPLOYEE */}
                {groups.map((group) => (
                    <React.Fragment key={group.label}>
                        <SidebarSeparator className="bg-[#E4E7EC]" />

                        <NavGroup
                            label={group.label}
                            items={group.items}
                            currentPath={url}
                        />
                    </React.Fragment>
                ))}

                {/* INVALID OR UNASSIGNED ROLE */}
                {!navigation && (
                    <SidebarGroup>
                        <SidebarGroupLabel>No Assigned Role</SidebarGroupLabel>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="border-t border-[#E4E7EC] px-1 py-2 [&_[data-sidebar=menu-button]]:rounded-lg [&_[data-sidebar=menu-button]]:text-[#475467] [&_[data-sidebar=menu-button]]:hover:bg-[#F2F4F7] [&_[data-sidebar=menu-button]]:hover:text-[#101828] [&_[data-sidebar=menu-button][data-active=true]]:bg-[#D1FADF] [&_[data-sidebar=menu-button][data-active=true]]:text-[#05603A]">
                <SidebarMenu>
                    {/* SETTINGS (hidden for employees) */}
                    {role && role !== 'employee' && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={
                                    url === '/settings' ||
                                    url.startsWith('/settings/')
                                }
                                tooltip="Settings"
                            >
                                <Link href="/settings">
                                    <Settings className="text-[#98A2B3] group-data-[active=true]/menu-button:text-[#0E7A5A]" />

                                    <span>Settings</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {/* USER INFORMATION */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="mt-1 data-[state=open]:bg-[#F2F4F7]"
                            tooltip={user?.name ?? 'User'}
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-xs font-medium text-white">
                                {initials}
                            </span>

                            <div className="flex min-w-0 flex-col text-left">
                                <span className="truncate text-sm font-medium text-[#101828]">
                                    {user?.name ?? 'User'}
                                </span>

                                <span className="truncate text-xs text-[#667085]">
                                    {roleLabel}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}