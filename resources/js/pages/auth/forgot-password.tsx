// Components
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    const ledgerInput =
        'rounded-none border-0 border-b border-white/20 bg-transparent px-0 text-[#E8ECF5] shadow-none placeholder:text-white/35 focus-visible:ring-0 focus-visible:border-[#C6F432]';

    return (
        <>
            <Head title="Forgot password">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0B0F1A] px-6 py-12 font-['Bricolage_Grotesque'] text-[#E8ECF5]">
                <Background />

                <Link href="/" className="mb-8 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6F432] font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A]">
                        §
                    </span>
                    <span className="text-lg font-semibold">SmartPayroll</span>
                </Link>

                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121829]/80 p-8 backdrop-blur">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
                    <p className="mt-2 text-sm text-white/65">Enter your email to receive a password reset link</p>

                    {status && <div className="mt-6 rounded-lg bg-[#C6F432]/10 px-3 py-2 text-sm font-medium text-[#C6F432]">{status}</div>}

                    <div className="mt-8 space-y-6">
                        <form onSubmit={submit}>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
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
                                    className="w-full rounded-full bg-[#C6F432] font-semibold text-[#0B0F1A] hover:bg-[#D6FF55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6F432]"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </form>

                        <div className="space-x-1 text-center text-sm text-white/65">
                            <span>Or, return to</span>
                            <TextLink href={route('login')} className="text-[#C6F432]">
                                log in
                            </TextLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}