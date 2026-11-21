
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

/*
 * Light redesign: payslip-paper feel.
 *   paper  #F5F7FA   ink    #101828   muted  #475467   line  #E4E7EC
 *   green  #0E7A5A   amber  #F2B01E   red    #D92D20   panel #E8EDF2
 * Type: Instrument Sans (UI + headings), IBM Plex Mono (figures only).
 */

type Slide = {
    key: string;
    tag: string;
    title: string;
    body: string;
    visual: ReactNode;
};

const bars = [58, 61, 57, 64, 60, 100];

const card = 'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.12)]';

const slides: Slide[] = [
    {
        key: 'payslip',
        tag: 'Verified payslips',
        title: 'Every payslip checked before it’s paid.',
        body: 'Tax, overtime and deductions calculate themselves, then get a second look.',
        visual: (
            <div className={`w-full max-w-xs p-5 text-[#101828] ${card}`}>
                <div className="flex items-center justify-between border-b border-dashed border-[#D0D5DD] pb-3">
                    <span className="text-sm font-semibold">Payslip · June</span>
                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#667085]">#PR-0842</span>
                </div>
                <dl className="mt-4 space-y-2 font-['IBM_Plex_Mono'] text-[12px]">
                    <div className="flex justify-between"><dt className="text-[#667085]">Base pay</dt><dd>₱4,200.00</dd></div>
                    <div className="flex justify-between"><dt className="text-[#667085]">Overtime</dt><dd>₱180.00</dd></div>
                    <div className="flex justify-between rounded bg-[#FEF0C7] px-2 py-1 font-medium text-[#7A4B00]"><dt>Housing ⚠ needs review</dt><dd>₱350.00</dd></div>
                    <div className="flex justify-between"><dt className="text-[#667085]">Tax</dt><dd>−₱612.00</dd></div>
                    <div className="flex justify-between border-t border-dashed border-[#D0D5DD] pt-2 text-sm font-semibold"><dt>Net pay</dt><dd>₱4,118.00</dd></div>
                </dl>
            </div>
        ),
    },
    {
        key: 'anomaly',
        tag: 'Anomaly detection',
        title: 'Unusual pay gets flagged automatically.',
        body: 'Each payslip is compared with that employee’s own history before approval.',
        visual: (
            <div className={`w-full max-w-xs p-5 ${card}`}>
                <div className="flex items-center justify-between text-xs text-[#667085]">
                    <span>Net pay · last 6 runs</span>
                    <span className="rounded-full bg-[#FEE4E2] px-2 py-0.5 font-medium text-[#B42318]">1 flagged</span>
                </div>
                <div className="mt-5 flex h-32 items-end gap-2">
                    {bars.map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`flex-1 rounded-t-md ${i === bars.length - 1 ? 'bg-[#D92D20]' : 'bg-[#D0D5DD]'}`}
                        />
                    ))}
                </div>
                <p className="mt-4 font-['IBM_Plex_Mono'] text-[11px] text-[#667085]">+68% vs. 6-month average</p>
            </div>
        ),
    },
    {
        key: 'clockin',
        tag: 'Camera clock-in',
        title: 'Clock in with a glance.',
        body: 'No badges, no shared PINs, no manual timesheets.',
        visual: (
            <div className={`relative flex h-56 w-56 items-center justify-center rounded-3xl border border-[#E4E7EC] bg-white shadow-[0_12px_32px_-12px_rgba(16,24,40,0.12)]`}>
                {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((c) => (
                    <span key={c} className={`absolute h-7 w-7 rounded-sm border-[#0E7A5A] ${c}`} />
                ))}
                <svg viewBox="0 0 64 64" className="h-24 w-24 text-[#D0D5DD]" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="32" cy="24" r="11" />
                    <path d="M10 56c2-12 11-18 22-18s20 6 22 18" />
                </svg>
                <span className="absolute bottom-6 rounded-full bg-[#D1FADF] px-3 py-1 font-['IBM_Plex_Mono'] text-[11px] font-medium text-[#05603A]">
                    Matched · 08:02
                </span>
            </div>
        ),
    },
    {
        key: 'forecast',
        tag: 'Cost forecasting',
        title: 'See next month’s payroll today.',
        body: 'Projected from real attendance and headcount trends.',
        visual: (
            <div className={`w-full max-w-xs p-5 ${card}`}>
                <p className="text-xs text-[#667085]">Projected · December</p>
                <p className="mt-1 font-['IBM_Plex_Mono'] text-2xl font-medium text-[#101828]">₱184,200</p>
                <svg viewBox="0 0 200 70" className="mt-4 w-full" fill="none">
                    <polyline points="0,58 30,50 60,52 90,38 120,40 150,26" stroke="#98A2B3" strokeWidth="2" />
                    <polyline points="150,26 175,18 200,10" stroke="#0E7A5A" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="150" cy="26" r="3.5" fill="#0E7A5A" />
                </svg>
            </div>
        ),
    },
];

const features = [
    { t: 'Smart tax engine', b: 'Brackets and deduction rules live in the database, so rates update without a deploy.' },
    { t: 'Anomaly detection', b: 'Unusual swings are flagged against each employee’s own history.' },
    { t: 'Camera clock-in', b: 'Face-scan attendance replaces badges, PINs and timesheets.' },
    { t: 'Cost forecasting', b: 'Next month’s payroll cost, projected from live attendance data.' },
];

function Carousel() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchX = useRef<number | null>(null);

    const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

    useEffect(() => {
        if (paused) return;
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
            className="relative overflow-hidden rounded-3xl bg-[#E8EDF2]"
        >
            <div className="relative h-[27rem] sm:h-[29rem]">
                {slides.map((s, i) => (
                    <div
                        key={s.key}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${slides.length}`}
                        aria-hidden={i !== index}
                        className={`absolute inset-0 flex flex-col transition-all duration-700 ease-out motion-reduce:transition-none ${
                            i === index ? 'translate-x-0 opacity-100' : i < index ? '-translate-x-8 opacity-0' : 'translate-x-8 opacity-0'
                        }`}
                    >
                        <div className="flex flex-1 items-center justify-center px-6 pt-8">{s.visual}</div>
                        <div className="px-6 pb-16 pt-6">
                            <p className="text-xs font-semibold text-[#0E7A5A]">{s.tag}</p>
                            <h3 className="mt-1.5 text-xl leading-snug font-semibold text-[#101828]">{s.title}</h3>
                            <p className="mt-1 text-sm text-[#475467]">{s.body}</p>
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
                            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-[#101828]' : 'w-3 bg-[#101828]/20 hover:bg-[#101828]/40'}`}
                        />
                    ))}
                </div>
                <div className="flex gap-2 text-[#101828]">
                    {[
                        { l: 'Previous slide', d: -1, p: 'M15 5l-7 7 7 7' },
                        { l: 'Next slide', d: 1, p: 'M9 5l7 7-7 7' },
                    ].map((b) => (
                        <button
                            key={b.l}
                            onClick={() => go(index + b.d)}
                            aria-label={b.l}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-[#F2F4F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7A5A]"
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

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7A5A]';

    return (
        <>
            <Head title="SmartPayroll — Payroll, verified">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="relative min-h-screen overflow-hidden bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7A5A] font-['IBM_Plex_Mono'] text-sm font-medium text-white">₱</span>
                        <span className="text-lg font-semibold">SmartPayroll</span>
                    </div>
                    <nav className="hidden items-center gap-8 text-sm text-[#475467] md:flex">
                        <a href="#features" className="hover:text-[#101828]">Product</a>
                        <a href="#cycle" className="hover:text-[#101828]">How it works</a>
                        <a href="#security" className="hover:text-[#101828]">Security</a>
                    </nav>
                    <div className="flex items-center gap-2 text-sm">
                        {auth.user ? (
                            <Link href={route('dashboard')} className={`rounded-full border border-[#D0D5DD] bg-white px-4 py-1.5 hover:border-[#98A2B3] ${focus}`}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className={`rounded-full px-4 py-1.5 hover:bg-[#101828]/5 ${focus}`}>Log in</Link>
                                <Link href={route('register')} className={`rounded-full bg-[#101828] px-4 py-1.5 font-medium text-white hover:bg-[#1D2939] ${focus}`}>
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
                    <div>
                        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Payday without the guesswork.
                        </h1>
                        <p className="mt-5 max-w-md text-base leading-7 text-[#475467]">
                            Tax, overtime and deductions calculate themselves. Anything unusual is flagged for review, and employees clock in with a glance at the camera.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link href={route('register')} className={`rounded-full bg-[#0E7A5A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0B6249] ${focus}`}>
                                Start free
                            </Link>
                            <a href="#features" className="text-sm font-medium text-[#344054] underline decoration-[#D0D5DD] underline-offset-4 hover:decoration-[#344054]">See what’s inside</a>
                        </div>
                        <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-dashed border-[#D0D5DD] pt-6">
                            {[['12,400+', 'payslips verified'], ['3.2s', 'avg. anomaly check'], ['0', 'missed tax updates']].map(([v, l]) => (
                                <div key={l}>
                                    <dt className="font-['IBM_Plex_Mono'] text-xl font-medium">{v}</dt>
                                    <dd className="mt-1 text-xs text-[#667085]">{l}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <Carousel />
                </section>

                <section id="features" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">Four things a spreadsheet can’t do.</h2>
                    <dl className="mt-10 grid gap-x-12 sm:grid-cols-2">
                        {features.map((f) => (
                            <div key={f.t} className="border-t border-[#D0D5DD] py-6">
                                <dt className="text-lg font-semibold">{f.t}</dt>
                                <dd className="mt-1.5 max-w-sm text-sm leading-6 text-[#475467]">{f.b}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section id="cycle" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="text-3xl font-semibold tracking-tight">How a cycle runs</h2>
                    <ol className="mt-10 grid gap-8 sm:grid-cols-3">
                        {[
                            ['Clock in', 'A face scan logs attendance. Hours and overtime tally themselves.'],
                            ['Calculate and flag', 'Pay computes automatically; anything unusual is marked for review.'],
                            ['Approve and pay', 'HR reviews flags, approves the run, and payslips go out.'],
                        ].map(([t, b], i) => (
                            <li key={t} className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D1FADF] font-['IBM_Plex_Mono'] text-xs font-medium text-[#05603A]">{i + 1}</span>
                                <h3 className="mt-4 font-semibold">{t}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-[#475467]">{b}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="security" className="px-6 pb-16 lg:px-8">
                    <div className="mx-auto max-w-6xl rounded-3xl bg-[#0E7A5A] px-6 py-14 text-center text-white">
                        <h2 className="text-3xl font-bold tracking-tight">Run your next payroll with confidence.</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
                            Bank-level data handling, role-based approvals, and a full audit trail on every run.
                        </p>
                        <Link href={route('register')} className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05603A] hover:bg-[#F2F4F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                            Start free trial
                        </Link>
                    </div>
                </section>

                <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-[#667085] sm:flex-row lg:px-8">
                    <span>© {new Date().getFullYear()} SmartPayroll</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#101828]">Privacy</a>
                        <a href="#" className="hover:text-[#101828]">Terms</a>
                    </div>
                </footer>
            </div>
        </>
    );
}