import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

/*
 * Light palette (matches profile-light, password-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 * Type: Instrument Sans (UI + headings).
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

const card =
    'overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] p-4 font-['Instrument_Sans'] text-[#101828] md:p-6"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Appearance settings</h1>

                        <p className="mt-1 text-sm text-[#475467]">Update your account&apos;s appearance settings</p>
                    </div>

                    <SettingsLayout>
                        <div className={card}>
                            <div className="border-b border-[#E4E7EC] px-5 py-4">
                                <h2 className="text-base font-semibold text-[#101828]">Theme</h2>

                                <p className="mt-1 text-xs text-[#667085]">
                                    Choose light, dark, or follow your device setting
                                </p>
                            </div>

                            <div className="p-5">
                                <AppearanceTabs />
                            </div>
                        </div>
                    </SettingsLayout>
                </div>
            </div>
        </AppLayout>
    );
}