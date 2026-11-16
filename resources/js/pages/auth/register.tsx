import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterForm {
    [key: string]: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

const floaters = [
    { c: '₱', l: '8%', t: '22%', d: '0s', s: '14s' },
    { c: '%', l: '88%', t: '16%', d: '-4s', s: '18s' },
    { c: '§', l: '72%', t: '58%', d: '-8s', s: '16s' },
    { c: '+', l: '14%', t: '68%', d: '-2s', s: '20s' },
    { c: '₱', l: '46%', t: '84%', d: '-10s', s: '15s' },
    { c: '=', l: '92%', t: '80%', d: '-6s', s: '19s' },
];

function Background() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <style>{`
                @keyframes sp-drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8vw,10vh) scale(1.15); } }
                @keyframes sp-drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10vw,6vh) scale(1.1); } }
                @keyframes sp-drift-c { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,-12vh) scale(1.2); } }
                @keyframes sp-grid { from { background-position: 0 0; } to { background-position: 48px 48px; } }
                @keyframes sp-float { 0%,100% { transform: translateY(0) rotate(0deg); opacity: .15; } 50% { transform: translateY(-40px) rotate(12deg); opacity: .4; } }
                @media (prefers-reduced-motion: reduce) { .sp-anim { animation: none !important; } }
            `}</style>

            <div
                className="sp-anim absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    animation: 'sp-grid 8s linear infinite',
                    maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
                }}
            />
            <div
                className="sp-anim absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-[#C6F432]/20 blur-[120px]"
                style={{ animation: 'sp-drift-a 22s ease-in-out infinite' }}
            />
            <div
                className="sp-anim absolute top-1/4 -right-40 h-[36rem] w-[36rem] rounded-full bg-[#4F5BFF]/25 blur-[130px]"
                style={{ animation: 'sp-drift-b 26s ease-in-out infinite' }}
            />
            <div
                className="sp-anim absolute -bottom-48 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[#FF6B5B]/15 blur-[120px]"
                style={{ animation: 'sp-drift-c 30s ease-in-out infinite' }}
            />
            {floaters.map((f, i) => (
                <span
                    key={i}
                    className="sp-anim absolute font-['JetBrains_Mono'] text-3xl text-[#C6F432]"
                    style={{ left: f.l, top: f.t, animation: `sp-float ${f.s} ease-in-out ${f.d} infinite` }}
                >
                    {f.c}
                </span>
            ))}
        </div>
    );
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
        'rounded-none border-0 border-b border-white/20 bg-transparent px-0 text-[#E8ECF5] shadow-none placeholder:text-white/35 focus-visible:ring-0 focus-visible:border-[#C6F432]';

    return (
        <>
            <Head title="Register">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative isolate grid min-h-screen overflow-hidden bg-[#0B0F1A] font-['Bricolage_Grotesque'] text-[#E8ECF5] md:grid-cols-2">
                <Background />

                {/* Brand panel */}
                <div className="relative hidden flex-col justify-between p-10 md:flex">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6F432] font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A]">
                            §
                        </span>
                        <span className="text-lg font-semibold">SmartPayroll</span>
                    </Link>

                    <div className="max-w-sm">
                        <p className="inline-block rounded-full border border-[#C6F432]/40 px-3 py-1 font-['JetBrains_Mono'] text-[11px] tracking-widest text-[#C6F432] uppercase">
                            Payroll, verified
                        </p>
                        <p className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance">
                            Every payslip checked <span className="text-[#C6F432]">before it&apos;s paid.</span>
                        </p>
                        <p className="mt-4 text-sm leading-6 text-white/70">
                            Automated tax calculations, anomaly detection, and camera clock-in — payroll you don&apos;t have to
                            double-check.
                        </p>

                        <div className="mt-8 w-full max-w-[16rem] -rotate-2 rounded-2xl bg-white p-4 text-[#0B0F1A] shadow-2xl">
                            <div className="flex items-center justify-between border-b border-dashed border-[#0B0F1A]/20 pb-2">
                                <span className="text-xs font-semibold">Payslip · June</span>
                                <span className="font-['JetBrains_Mono'] text-[10px] text-[#0B0F1A]/50">#PR-0842</span>
                            </div>
                            <dl className="mt-3 space-y-1.5 font-['JetBrains_Mono'] text-[11px]">
                                <div className="flex justify-between">
                                    <dt className="text-[#0B0F1A]/60">Base pay</dt>
                                    <dd>₱4,200.00</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[#0B0F1A]/60">Overtime</dt>
                                    <dd>₱180.00</dd>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-[#0B0F1A]/20 pt-1.5 font-semibold">
                                    <dt>Net pay</dt>
                                    <dd>₱4,118.00</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <p className="font-['JetBrains_Mono'] text-xs text-white/50">12,400+ payslips verified</p>
                </div>

                {/* Form panel */}
                <div className="relative flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121829]/80 p-8 backdrop-blur">
                        <Link href="/" className="mb-6 flex items-center gap-2.5 md:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6F432] font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A]">
                                §
                            </span>
                            <span className="text-lg font-semibold">SmartPayroll</span>
                        </Link>

                        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                        <p className="mt-2 text-sm text-white/65">Enter your details below to create your account</p>

                        <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
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
                                    <Label htmlFor="email">Email address</Label>
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
                                    <Label htmlFor="password">Password</Label>
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
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
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
                                    className="mt-2 w-full rounded-full bg-[#C6F432] font-semibold text-[#0B0F1A] hover:bg-[#D6FF55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6F432]"
                                    tabIndex={5}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create account
                                </Button>
                            </div>

                            <div className="text-center text-sm text-white/65">
                                Already have an account?{' '}
                                <TextLink href={route('login')} className="text-[#C6F432]" tabIndex={6}>
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