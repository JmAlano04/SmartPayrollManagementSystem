import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/*
 * Light palette (matches profile-light, attendance-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #E4E7EC
 *   green  #0E7A5A
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

/*
|--------------------------------------------------------------------------
| Shared class names (same as the Profile and Attendance pages)
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

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings">
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
                        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Password settings</h1>

                        <p className="mt-1 text-sm text-[#475467]">
                            Ensure your account is using a long, random password to stay secure
                        </p>
                    </div>

                    <SettingsLayout>
                        <div className={card}>
                            <div className="border-b border-[#E4E7EC] px-5 py-4">
                                <h2 className="text-base font-semibold text-[#101828]">Update password</h2>

                                <p className="mt-1 text-xs text-[#667085]">
                                    Use at least 8 characters with a mix of letters, numbers and symbols
                                </p>
                            </div>

                            <form onSubmit={updatePassword} className="space-y-4 p-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password" className={labelClass}>
                                        Current password
                                    </Label>

                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        type="password"
                                        className={inputClass}
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />

                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className={labelClass}>
                                            New password
                                        </Label>

                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type="password"
                                            className={inputClass}
                                            autoComplete="new-password"
                                            placeholder="New password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation" className={labelClass}>
                                            Confirm password
                                        </Label>

                                        <Input
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            type="password"
                                            className={inputClass}
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                        />

                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

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
                                        {processing ? 'Saving…' : 'Save password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </SettingsLayout>
                </div>
            </div>
        </AppLayout>
    );
}