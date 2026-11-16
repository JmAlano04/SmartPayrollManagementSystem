import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';

interface AppHeaderLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeaderLayout({ children, breadcrumbs }: AppHeaderLayoutProps) {
    return (
        <div className="dark min-h-screen bg-[#0B0F1A] text-white">
            <AppShell>
                <AppHeader breadcrumbs={breadcrumbs} />
                <AppContent>{children}</AppContent>
            </AppShell>
        </div>
    );
}
