import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

/*
 * Light palette (matches welcome-light, dashboard-light, attendance-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A   notice #D1FADF / #05603A
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

/*
|--------------------------------------------------------------------------
| Shared class names (same as the Attendance page)
|--------------------------------------------------------------------------
*/

const inputClass =
    'h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20 focus-visible:ring-[#0E7A5A]/20 disabled:opacity-40';

const labelClass = 'text-xs font-medium text-[#344054]';

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50';

const card =
    'overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const accentText = 'text-[#0E7A5A]';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings">
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
                        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Profile settings</h1>

                        <p className="mt-1 text-sm text-[#475467]">Update your name and email address</p>
                    </div>

                    <SettingsLayout>
                        <div className="space-y-6">
                            {/* =================================================
                                PROFILE CARD
                            ================================================== */}

                            <div className={card}>
                                <div className="border-b border-[#E4E7EC] px-5 py-4">
                                    <h2 className="text-base font-semibold text-[#101828]">Profile information</h2>

                                    <p className="mt-1 text-xs text-[#667085]">
                                        This is how you appear across SmartPayroll
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-4 p-5">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className={labelClass}>
                                                Name
                                            </Label>

                                            <Input
                                                id="name"
                                                className={inputClass}
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                            />

                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className={labelClass}>
                                                Email address
                                            </Label>

                                            <Input
                                                id="email"
                                                type="email"
                                                className={inputClass}
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />

                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="text-sm text-[#344054]">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className={`rounded-md text-sm underline focus:ring-2 focus:ring-[#0E7A5A] focus:ring-offset-2 focus:ring-offset-white focus:outline-hidden ${accentText}`}
                                                >
                                                    Click here to re-send the verification email.
                                                </Link>
                                            </p>

                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 rounded-lg bg-[#D1FADF] px-3 py-2 text-sm font-medium text-[#05603A]">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className={`font-['IBM_Plex_Mono'] text-sm ${accentText}`}>Saved</p>
                                        </Transition>

                                        <button type="submit" disabled={processing} className={primaryButton}>
                                            {processing ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className={card}>
                                <div className="border-b border-[#E4E7EC] px-5 py-4">
                                    <h2 className="text-base font-semibold text-[#101828]">Delete account</h2>

                                    <p className="mt-1 text-xs text-[#667085]">
                                        Permanently remove your account and all saved data
                                    </p>
                                </div>

                                <div className="p-5">
                                    <DeleteUser />
                                </div>
                            </div>
                        </div>
                    </SettingsLayout>
                </div>
            </div>
        </AppLayout>
    );
}