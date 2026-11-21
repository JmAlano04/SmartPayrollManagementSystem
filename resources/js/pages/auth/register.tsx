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
 *   paper  #F5F7FA   ink    #101828   muted  #475467 / #667085   line  #D0D5DD
 *   panel  #E8EDF2   green  #0E7A5A
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

interface RegisterForm {
    [key: string]: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Ledger-line input style: underline only, no box — echoes filling in a paper form.
    const ledgerInput =
        'rounded-none border-0 border-b border-[#D0D5DD] bg-transparent px-0 text-[#101828] shadow-none placeholder:text-[#98A2B3] focus-visible:ring-0 focus-visible:border-[#0E7A5A]';

    const label = 'text-[#344054]';

    return (
        <>
            <Head title="Register">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="grid min-h-screen bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828] md:grid-cols-2"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                {/* Brand panel */}
                <div className="hidden flex-col justify-between bg-[#E8EDF2] p-10 md:flex">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-sm font-medium text-white">
                            ₱
                        </span>
                        <span className="text-lg font-semibold">SmartPayroll</span>
                    </Link>

                    <div className="max-w-sm">
                        <p className="text-4xl leading-[1.05] font-bold tracking-tight text-balance">
                            Every payslip checked before it&apos;s paid.
                        </p>
                        <p className="mt-4 text-sm leading-6 text-[#475467]">
                            Automated tax calculations, anomaly detection, and camera clock-in — payroll you don&apos;t have to
                            double-check.
                        </p>

                        <div className="mt-8 w-full max-w-[16rem] -rotate-2 rounded-2xl border border-[#E4E7EC] bg-white p-4 text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_36px_-14px_rgba(16,24,40,0.18)]">
                            <div className="flex items-center justify-between border-b border-dashed border-[#D0D5DD] pb-2">
                                <span className="text-xs font-semibold">Payslip · June</span>
                                <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#667085]">#PR-0842</span>
                            </div>
                            <dl className="mt-3 space-y-1.5 font-['IBM_Plex_Mono'] text-[11px]">
                                <div className="flex justify-between">
                                    <dt className="text-[#667085]">Base pay</dt>
                                    <dd>₱4,200.00</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[#667085]">Overtime</dt>
                                    <dd>₱180.00</dd>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-[#D0D5DD] pt-1.5 font-semibold">
                                    <dt>Net pay</dt>
                                    <dd>₱4,118.00</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <p className="font-['IBM_Plex_Mono'] text-xs text-[#667085]">12,400+ payslips verified</p>
                </div>

                {/* Form panel */}
                <div className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm rounded-3xl border border-[#E4E7EC] bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_20px_44px_-16px_rgba(16,24,40,0.14)]">
                        <Link href="/" className="mb-6 flex items-center gap-2.5 md:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-sm font-medium text-white">
                                ₱
                            </span>
                            <span className="text-lg font-semibold">SmartPayroll</span>
                        </Link>

                        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                        <p className="mt-2 text-sm text-[#475467]">Enter your details below to create your account</p>

                        <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className={label}>
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Full name"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className={label}>
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        placeholder="email@example.com"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className={label}>
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        placeholder="Password"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className={label}>
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        placeholder="Confirm password"
                                        className={ledgerInput}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full rounded-full bg-[#0E7A5A] font-semibold text-white hover:bg-[#0B6249] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7A5A]"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </div>

                            <div className="text-center text-sm text-[#475467]">
                                Already have an account?{' '}
                                <TextLink href={route('login')} className="text-[#0E7A5A]" tabIndex={6}>
                                    Log in
                                </TextLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}