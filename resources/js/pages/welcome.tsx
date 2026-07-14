import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="SmartPayroll — Payroll, verified">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,600i|ibm-plex-sans:400,500,600|ibm-plex-mono:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#EFF5F0] font-['IBM_Plex_Sans'] text-[#16241C] dark:bg-[#0E1712] dark:text-[#EAF2EC]">
                {/* Header */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-[#16241C]/30 font-['IBM_Plex_Mono'] text-xs dark:border-[#EAF2EC]/30">
                            §
                        </span>
                        <span className="font-['Fraunces'] text-lg font-medium">SmartPayroll</span>
                    </div>

                    <nav className="hidden items-center gap-8 text-sm text-[#16241C]/70 md:flex dark:text-[#EAF2EC]/70">
                        <a href="#ledger" className="hover:text-[#16241C] dark:hover:text-[#EAF2EC]">
                            Product
                        </a>
                        <a href="#cycle" className="hover:text-[#16241C] dark:hover:text-[#EAF2EC]">
                            How it works
                        </a>
                        <a href="#security" className="hover:text-[#16241C] dark:hover:text-[#EAF2EC]">
                            Security
                        </a>
                    </nav>

                    <div className="flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md border border-[#16241C]/20 px-4 py-1.5 hover:border-[#16241C]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B4F] dark:border-[#EAF2EC]/20 dark:hover:border-[#EAF2EC]/40"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-4 py-1.5 hover:bg-[#16241C]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B4F] dark:hover:bg-[#EAF2EC]/5"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-[#16241C] px-4 py-1.5 text-[#EFF5F0] hover:bg-[#233A2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B4F] dark:bg-[#EAF2EC] dark:text-[#16241C] dark:hover:bg-white"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 opacity-100 transition-opacity duration-700 starting:opacity-0 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:py-20">
                    <div>
                        <p className="font-['IBM_Plex_Mono'] text-xs tracking-[0.2em] text-[#B98A2E] uppercase">Payroll, verified</p>
                        <h1 className="mt-4 font-['Fraunces'] text-4xl leading-[1.1] font-medium text-balance lg:text-5xl">
                            Every payslip checked before it&apos;s paid.
                        </h1>
                        <p className="mt-5 max-w-md text-[15px] leading-7 text-[#16241C]/75 dark:text-[#EAF2EC]/75">
                            Tax brackets, overtime, and deductions calculate themselves. Unusual pay gets flagged for review
                            automatically. Employees clock in with a glance at the camera. Nothing reaches payday unchecked.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href={route('register')}
                                className="rounded-md bg-[#16241C] px-6 py-2.5 text-sm text-[#EFF5F0] hover:bg-[#233A2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B4F] dark:bg-[#EAF2EC] dark:text-[#16241C] dark:hover:bg-white"
                            >
                                Start free
                            </Link>
                            <a
                                href="#ledger"
                                className="text-sm font-medium text-[#16241C]/80 hover:text-[#16241C] dark:text-[#EAF2EC]/80 dark:hover:text-[#EAF2EC]"
                            >
                                See how it works →
                            </a>
                        </div>

                        <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-[#16241C]/10 pt-6 dark:border-[#EAF2EC]/10">
                            <div>
                                <dt className="font-['IBM_Plex_Mono'] text-xl font-medium">12,400+</dt>
                                <dd className="mt-1 text-xs text-[#16241C]/60 dark:text-[#EAF2EC]/60">payslips verified</dd>
                            </div>
                            <div>
                                <dt className="font-['IBM_Plex_Mono'] text-xl font-medium">3.2s</dt>
                                <dd className="mt-1 text-xs text-[#16241C]/60 dark:text-[#EAF2EC]/60">avg. anomaly check</dd>
                            </div>
                            <div>
                                <dt className="font-['IBM_Plex_Mono'] text-xl font-medium">0</dt>
                                <dd className="mt-1 text-xs text-[#16241C]/60 dark:text-[#EAF2EC]/60">missed tax updates</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Signature element: the payslip stub */}
                    <div className="relative mx-auto w-full max-w-sm rotate-2 opacity-100 transition-[opacity,transform] duration-700 starting:translate-y-4 starting:opacity-0 lg:mx-0">
                        <div className="rounded-lg border border-[#16241C]/10 bg-white p-6 shadow-[0_20px_40px_-20px_rgba(22,36,28,0.35)] dark:border-[#EAF2EC]/10 dark:bg-[#152019]">
                            <div className="flex items-center justify-between border-b-2 border-dashed border-[#16241C]/15 pb-3 dark:border-[#EAF2EC]/15">
                                <span className="font-['Fraunces'] text-sm font-medium">Payslip · June</span>
                                <span className="font-['IBM_Plex_Mono'] text-xs text-[#16241C]/50 dark:text-[#EAF2EC]/50">
                                    #PR-0842
                                </span>
                            </div>

                            <dl className="mt-4 space-y-2 font-['IBM_Plex_Mono'] text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-[#16241C]/70 dark:text-[#EAF2EC]/70">Base pay</dt>
                                    <dd>$4,200.00</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[#16241C]/70 dark:text-[#EAF2EC]/70">Overtime</dt>
                                    <dd>$180.00</dd>
                                </div>
                                <div className="flex justify-between rounded-sm bg-[#B98A2E]/12 px-2 py-1">
                                    <dt className="text-[#8A6112] dark:text-[#E8C878]">Housing allowance ⚠</dt>
                                    <dd className="text-[#8A6112] dark:text-[#E8C878]">$350.00</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[#16241C]/70 dark:text-[#EAF2EC]/70">Tax</dt>
                                    <dd>−$612.00</dd>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-[#16241C]/15 pt-2 text-sm font-medium dark:border-[#EAF2EC]/15">
                                    <dt>Net pay</dt>
                                    <dd>$4,118.00</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="absolute -top-5 -right-5 flex h-16 w-16 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-[#2F6B4F] font-['IBM_Plex_Mono'] text-[10px] font-medium tracking-wide text-[#2F6B4F] uppercase dark:border-[#5FA37F] dark:text-[#5FA37F]">
                            Verified
                        </div>
                    </div>
                </section>

                {/* Feature ledger */}
                <section id="ledger" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="font-['Fraunces'] text-2xl font-medium">What&apos;s on the ledger</h2>
                    <p className="mt-2 max-w-lg text-sm text-[#16241C]/70 dark:text-[#EAF2EC]/70">
                        Four line items that separate this from a spreadsheet with formulas in it.
                    </p>

                    <div className="mt-10 grid gap-8 border-t border-[#16241C]/10 pt-10 sm:grid-cols-2 dark:border-[#EAF2EC]/10">
                        {[
                            {
                                mark: '§ 01',
                                title: 'Smart tax engine',
                                body: 'Tax brackets and deduction rules live in the database, not in code — update rates without a deploy.',
                            },
                            {
                                mark: '§ 02',
                                title: 'Anomaly detection',
                                body: 'Every payslip is compared against the employee\u2019s own history. Unusual swings get flagged before approval.',
                            },
                            {
                                mark: '§ 03',
                                title: 'Camera clock-in',
                                body: 'Employees clock in with a face scan — no badges, no shared PINs, no manual timesheets.',
                            },
                            {
                                mark: '§ 04',
                                title: 'Cost forecasting',
                                body: 'See next month\u2019s payroll cost today, projected from real attendance and headcount trends.',
                            },
                        ].map((item) => (
                            <div key={item.mark} className="flex gap-4">
                                <span className="font-['IBM_Plex_Mono'] text-xs text-[#B98A2E]">{item.mark}</span>
                                <div>
                                    <h3 className="font-medium">{item.title}</h3>
                                    <p className="mt-1.5 text-sm leading-6 text-[#16241C]/70 dark:text-[#EAF2EC]/70">{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How a cycle runs */}
                <section id="cycle" className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <h2 className="font-['Fraunces'] text-2xl font-medium">How a cycle runs</h2>

                    <div className="mt-10 grid gap-6 border-t border-[#16241C]/10 pt-10 sm:grid-cols-3 dark:border-[#EAF2EC]/10">
                        {[
                            { step: '1', title: 'Clock in', body: 'A face scan logs attendance — hours and overtime tally themselves.' },
                            { step: '2', title: 'Calculate & flag', body: 'Pay computes automatically; anything unusual is marked for review.' },
                            { step: '3', title: 'Approve & pay', body: 'HR reviews flags, approves the run, and payslips go out.' },
                        ].map((item, i, arr) => (
                            <div key={item.step} className="relative">
                                <span className="font-['IBM_Plex_Mono'] text-xs text-[#16241C]/40 dark:text-[#EAF2EC]/40">
                                    {item.step} / {arr.length}
                                </span>
                                <h3 className="mt-2 font-medium">{item.title}</h3>
                                <p className="mt-1.5 text-sm leading-6 text-[#16241C]/70 dark:text-[#EAF2EC]/70">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA band */}
                <section id="security" className="bg-[#16241C] dark:bg-[#0A130D]">
                    <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-8">
                        <h2 className="font-['Fraunces'] text-3xl font-medium text-[#EFF5F0]">
                            Run your next payroll with confidence.
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm text-[#EFF5F0]/70">
                            Bank-level data handling, role-based approvals, and a full audit trail on every run.
                        </p>
                        <Link
                            href={route('register')}
                            className="mt-8 inline-block rounded-md bg-[#EFF5F0] px-6 py-2.5 text-sm font-medium text-[#16241C] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5FA37F]"
                        >
                            Start free trial
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-[#16241C]/50 sm:flex-row lg:px-8 dark:text-[#EAF2EC]/50">
                    <span className="font-['IBM_Plex_Mono']">© {new Date().getFullYear()} SmartPayroll</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#16241C] dark:hover:text-[#EAF2EC]">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-[#16241C] dark:hover:text-[#EAF2EC]">
                            Terms
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
