// Components
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/*
 * Light palette (matches welcome-light, dashboard-light, login-light)
 *   paper  #F5F7FA   ink    #101828   muted  #475467   line  #D0D5DD
 *   green  #0E7A5A
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    const ledgerInput =
        'rounded-none border-0 border-b border-[#D0D5DD] bg-transparent px-0 text-[#101828] shadow-none placeholder:text-[#98A2B3] focus-visible:ring-0 focus-visible:border-[#0E7A5A]';

    return (
        <>
            <Head title="Forgot password">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-6 py-12 font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <Link href="/" className="mb-8 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-sm font-medium text-white">
                        ₱
                    </span>
                    <span className="text-lg font-semibold">SmartPayroll</span>
                </Link>

                <div className="w-full max-w-sm rounded-3xl border border-[#E4E7EC] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_20px_44px_-16px_rgba(16,24,40,0.14)]">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
                    <p className="mt-2 text-sm text-[#475467]">Enter your email to receive a password reset link</p>

                    {status && <div className="mt-6 rounded-lg bg-[#D1FADF] px-3 py-2 text-sm font-medium text-[#05603A]">{status}</div>}

                    <div className="mt-8 space-y-6">
                        <form onSubmit={submit}>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[#344054]">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    className={ledgerInput}
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full rounded-full bg-[#0E7A5A] font-semibold text-white hover:bg-[#0B6249] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7A5A]"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </form>

                        <div className="space-x-1 text-center text-sm text-[#475467]">
                            <span>Or, return to</span>
                            <TextLink href={route('login')} className="text-[#0E7A5A]">
                                log in
                            </TextLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}