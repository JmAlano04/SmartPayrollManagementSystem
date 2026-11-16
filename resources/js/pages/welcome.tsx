import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

type Slide = {
    key: string;
    tag: string;
    title: string;
    body: string;
    visual: ReactNode;
};

const bars = [58, 61, 57, 64, 60, 100];

const slides: Slide[] = [
    {
        key: 'payslip',
        tag: '01 — Verified payslips',
        title: 'Every payslip checked before it’s paid.',
        body: 'Tax, overtime and deductions calculate themselves, then get a second look.',
        visual: (
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-[#0B0F1A] shadow-2xl">
                <div className="flex items-center justify-between border-b border-dashed border-[#0B0F1A]/20 pb-3">
                    <span className="text-sm font-semibold">Payslip · June</span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#0B0F1A]/50">#PR-0842</span>
                </div>
                <dl className="mt-4 space-y-2 font-['JetBrains_Mono'] text-[12px]">
                    <div className="flex justify-between"><dt className="text-[#0B0F1A]/60">Base pay</dt><dd>₱4,200.00</dd></div>
                    <div className="flex justify-between"><dt className="text-[#0B0F1A]/60">Overtime</dt><dd>₱180.00</dd></div>
                    <div className="flex justify-between rounded bg-[#C6F432] px-2 py-1 font-medium"><dt>Housing ⚠</dt><dd>₱350.00</dd></div>
                    <div className="flex justify-between"><dt className="text-[#0B0F1A]/60">Tax</dt><dd>−₱612.00</dd></div>
                    <div className="flex justify-between border-t border-dashed border-[#0B0F1A]/20 pt-2 text-sm font-semibold"><dt>Net pay</dt><dd>₱4,118.00</dd></div>
                </dl>
            </div>
        ),
    },
    {
        key: 'anomaly',
        tag: '02 — Anomaly detection',
        title: 'Unusual pay gets flagged automatically.',
        body: 'Each payslip is compared with that employee’s own history before approval.',
        visual: (
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#121829] p-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Net pay · last 6 runs</span>
                    <span className="rounded-full bg-[#FF6B5B]/15 px-2 py-0.5 font-medium text-[#FF8A7C]">1 flagged</span>
                </div>
                <div className="mt-5 flex h-32 items-end gap-2">
                    {bars.map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`flex-1 rounded-t-md ${i === bars.length - 1 ? 'bg-[#FF6B5B]' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
                <p className="mt-4 font-['JetBrains_Mono'] text-[11px] text-white/60">+68% vs. 6-month average</p>
            </div>
        ),
    },
    {
        key: 'clockin',
        tag: '03 — Camera clock-in',
        title: 'Clock in with a glance.',
        body: 'No badges, no shared PINs, no manual timesheets.',
        visual: (
            <div className="relative flex h-56 w-56 items-center justify-center rounded-3xl bg-[#121829]">
                {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((c) => (
                    <span key={c} className={`absolute h-7 w-7 rounded-sm border-[#C6F432] ${c}`} />
                ))}
                <svg viewBox="0 0 64 64" className="h-24 w-24 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="32" cy="24" r="11" />
                    <path d="M10 56c2-12 11-18 22-18s20 6 22 18" />
                </svg>
                <span className="absolute bottom-6 rounded-full bg-[#C6F432] px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-medium text-[#0B0F1A]">
                    Matched · 08:02
                </span>
            </div>
        ),
    },
    {
        key: 'forecast',
        tag: '04 — Cost forecasting',
        title: 'See next month’s payroll today.',
        body: 'Projected from real attendance and headcount trends.',
        visual: (
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#121829] p-5">
                <p className="text-xs text-white/60">Projected · December</p>
                <p className="mt-1 font-['JetBrains_Mono'] text-2xl font-medium text-[#C6F432]">₱184,200</p>
                <svg viewBox="0 0 200 70" className="mt-4 w-full" fill="none">
                    <polyline points="0,58 30,50 60,52 90,38 120,40 150,26" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
                    <polyline points="150,26 175,18 200,10" stroke="#C6F432" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="150" cy="26" r="3.5" fill="#C6F432" />
                </svg>
            </div>
        ),
    },
];

const features = [
    { n: '01', t: 'Smart tax engine', b: 'Brackets and deduction rules live in the database, so rates update without a deploy.' },
    { n: '02', t: 'Anomaly detection', b: 'Unusual swings are flagged against each employee’s own history.' },
    { n: '03', t: 'Camera clock-in', b: 'Face-scan attendance replaces badges, PINs and timesheets.' },
    { n: '04', t: 'Cost forecasting', b: 'Next month’s payroll cost, projected from live attendance data.' },
];

function Carousel() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchX = useRef<number | null>(null);

    const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
        return () => clearInterval(id);
    }, [paused]);

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Product highlights"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
                touchX.current = null;
            }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A2240] to-[#0F1426]"
        >
            <div className="relative h-[27rem] sm:h-[29rem]">
                {slides.map((s, i) => (
                    <div
                        key={s.key}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${slides.length}`}
                        aria-hidden={i !== index}
                        className={`absolute inset-0 flex flex-col transition-all duration-700 ease-out ${
                            i === index ? 'translate-x-0 opacity-100' : i < index ? '-translate-x-8 opacity-0' : 'translate-x-8 opacity-0'
                        }`}
                    >
                        <div className="flex flex-1 items-center justify-center px-6 pt-8">{s.visual}</div>
                        <div className="px-6 pb-16 pt-6">
                            <p className="font-['JetBrains_Mono'] text-[11px] tracking-widest text-[#C6F432] uppercase">{s.tag}</p>
                            <h3 className="mt-2 text-xl leading-snug font-semibold">{s.title}</h3>
                            <p className="mt-1 text-sm text-white/65">{s.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5">
                <div className="flex gap-2">
                    {slides.map((s, i) => (
                        <button
                            key={s.key}
                            onClick={() => go(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            aria-current={i === index}
                            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-[#C6F432]' : 'w-3 bg-white/25 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    {[
                        { l: 'Previous slide', d: -1, p: 'M15 5l-7 7 7 7' },
                        { l: 'Next slide', d: 1, p: 'M9 5l7 7-7 7' },
                    ].map((b) => (
                        <button
                            key={b.l}
                            onClick={() => go(index + b.d)}
                            aria-label={b.l}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C6F432]"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d={b.p} />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
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
                    backgroundImage:
                        'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
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

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6F432]';

    return (
        <>
            <Head title="SmartPayroll — Payroll, verified">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative isolate min-h-screen overflow-hidden bg-[#0B0F1A] font-['Bricolage_Grotesque'] text-[#E8ECF5]">
                <Background />
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6F432] font-['JetBrains_Mono'] text-sm font-medium text-[#0B0F1A]">§</span>
                        <span className="text-lg font-semibold">SmartPayroll</span>
                    </div>
                    <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
                        <a href="#features" className="hover:text-white">Product</a>
                        <a href="#cycle" className="hover:text-white">How it works</a>
                        <a href="#security" className="hover:text-white">Security</a>
                    </nav>
                    <div className="flex items-center gap-2 text-sm">
                        {auth.user ? (
                            <Link href={route('dashboard')} className={`rounded-full border border-white/20 px-4 py-1.5 hover:border-white/40 ${focus}`}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className={`rounded-full px-4 py-1.5 hover:bg-white/10 ${focus}`}>Log in</Link>
                                <Link href={route('register')} className={`rounded-full bg-[#C6F432] px-4 py-1.5 font-medium text-[#0B0F1A] hover:bg-[#D6FF55] ${focus}`}>
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                    <div>
                        <p className="inline-block rounded-full border border-[#C6F432]/40 px-3 py-1 font-['JetBrains_Mono'] text-[11px] tracking-widest text-[#C6F432] uppercase">
                            Payroll, verified
                        </p>
                        <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Payday without <span className="text-[#C6F432]">the guesswork.</span>
                        </h1>
                        <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                            Tax, overtime and deductions calculate themselves. Anything unusual is flagged for review, and employees clock in with a glance at the camera.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link href={route('register')} className={`rounded-full bg-[#C6F432] px-6 py-3 text-sm font-semibold text-[#0B0F1A] hover:bg-[#D6FF55] ${focus}`}>
                                Start free
                            </Link>
                            <a href="#features" className="text-sm font-medium text-white/80 hover:text-white">See what’s inside →</a>
                        </div>
                        <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
                            {[['12,400+', 'payslips verified'], ['3.2s', 'avg. anomaly check'], ['0', 'missed tax updates']].map(([v, l]) => (
                                <div key={l}>
                                    <dt className="font-['JetBrains_Mono'] text-xl font-medium">{v}</dt>
                                    <dd className="mt-1 text-xs text-white/55">{l}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <Carousel />
                </section>

                <section id="features" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="text-3xl font-semibold tracking-tight">Four things a spreadsheet can’t do.</h2>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {features.map((f) => (
                            <div key={f.n} className="rounded-2xl border border-white/10 bg-[#121829] p-6 transition-colors hover:border-[#C6F432]/40">
                                <span className="font-['JetBrains_Mono'] text-xs text-[#C6F432]">{f.n}</span>
                                <h3 className="mt-3 text-lg font-semibold">{f.t}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-white/65">{f.b}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="cycle" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="text-3xl font-semibold tracking-tight">How a cycle runs</h2>
                    <ol className="mt-10 grid gap-8 sm:grid-cols-3">
                        {[
                            ['Clock in', 'A face scan logs attendance. Hours and overtime tally themselves.'],
                            ['Calculate & flag', 'Pay computes automatically; anything unusual is marked for review.'],
                            ['Approve & pay', 'HR reviews flags, approves the run, and payslips go out.'],
                        ].map(([t, b], i) => (
                            <li key={t} className="border-t-2 border-[#C6F432] pt-4">
                                <span className="font-['JetBrains_Mono'] text-xs text-white/45">0{i + 1}</span>
                                <h3 className="mt-1 font-semibold">{t}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-white/65">{b}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="security" className="px-6 pb-16 lg:px-8">
                    <div className="mx-auto max-w-6xl rounded-3xl bg-[#C6F432] px-6 py-14 text-center text-[#0B0F1A]">
                        <h2 className="text-3xl font-bold tracking-tight">Run your next payroll with confidence.</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm text-[#0B0F1A]/75">
                            Bank-level data handling, role-based approvals, and a full audit trail on every run.
                        </p>
                        <Link href={route('register')} className="mt-8 inline-block rounded-full bg-[#0B0F1A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1A2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0F1A]">
                            Start free trial
                        </Link>
                    </div>
                </section>

                <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-white/45 sm:flex-row lg:px-8">
                    <span className="font-['JetBrains_Mono']">© {new Date().getFullYear()} SmartPayroll</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </footer>
            </div>
        </>
    );
}