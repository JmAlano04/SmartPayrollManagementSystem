import DeleteModal from '@/components/DeleteModal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { Banknote, CalendarRange, Sparkles, Trash2, TrendingUp, Users, Wallet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cost Forecast', href: '/reports/forecast' }];

/* ---------- Static sample data ---------- */

type Forecast = {
    id: number;
    label: string;
    confidence: 'low' | 'medium' | 'high';
    headcount: number;
    base: number;
    overtime: number;
    allowances: number;
    gross: number;
    tax: number;
    net: number;
    lower: number;
    upper: number;
};

const history = [
    { label: 'May 2026', net: 412000 },
    { label: 'Jun 2026', net: 418500 },
    { label: 'Jul 2026', net: 421300 },
    { label: 'Aug 2026', net: 430800 },
    { label: 'Sep 2026', net: 436200 },
    { label: 'Oct 2026', net: 441900 },
];

const initialForecasts: Forecast[] = [
    { id: 1, label: 'Nov 2026', confidence: 'high', headcount: 48, base: 520000, overtime: 24000, allowances: 36000, gross: 580000, tax: 98600, net: 449500, lower: 438000, upper: 461000 },
    { id: 2, label: 'Dec 2026', confidence: 'medium', headcount: 48, base: 520000, overtime: 31000, allowances: 36000, gross: 587000, tax: 99800, net: 454700, lower: 440000, upper: 469000 },
    { id: 3, label: 'Jan 2027', confidence: 'low', headcount: 49, base: 531000, overtime: 22000, allowances: 37000, gross: 590000, tax: 100300, net: 456800, lower: 436000, upper: 478000 },
];

const departments = [
    { department: 'Engineering', headcount: 16, share_percent: 38, net: 170800 },
    { department: 'Operations', headcount: 12, share_percent: 25, net: 112400 },
    { department: 'Sales', headcount: 9, share_percent: 19, net: 85400 },
    { department: 'Finance & HR', headcount: 6, share_percent: 11, net: 49500 },
    { department: 'Admin', headcount: 5, share_percent: 7, net: 31400 },
];

const assumptions: [string, string][] = [
    ['Pay runs learned from', '6'],
    ['Active employees today', '48'],
    ['Headcount change', '0'],
    ['Effective tax rate', '17%'],
    ['Working days', '21 (past avg 21.2)'],
    ['Overtime trend', '×1.04'],
];

/* ---------- Helpers ---------- */

const mono = "font-['IBM_Plex_Mono']";

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';

const th = 'px-5 py-3 text-xs font-medium text-[#667085]';

const field =
    'h-10 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm text-[#101828] outline-none transition focus:border-[#0E7A5A] focus:ring-2 focus:ring-[#0E7A5A]/20';

const primaryBtn =
    'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const formatCurrency = (n: number) =>
    `₱ ${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompact = (n: number) => `₱${(n / 1000).toFixed(1)}k`;

const confidenceStyle: Record<Forecast['confidence'], string> = {
    high: 'bg-[#D1FADF] text-[#05603A]',
    medium: 'bg-[#FEF0C7] text-[#7A4B00]',
    low: 'bg-[#F2F4F7] text-[#475467]',
};

/* ---------- Chart ---------- */

function ForecastChart({ forecasts }: { forecasts: Forecast[] }) {
    const points = [
        ...history.map((h) => ({ label: h.label, value: h.net, lower: null as number | null, upper: null as number | null, forecast: false })),
        ...forecasts.map((f) => ({ label: f.label, value: f.net, lower: f.lower, upper: f.upper, forecast: true })),
    ];

    const width = 640;
    const height = 260;
    const padX = 12;
    const padTop = 24;
    const padBottom = 30;
    const plotH = height - padTop - padBottom;
    const maxValue = Math.max(...points.map((p) => p.upper ?? p.value), 1) * 1.08;
    const slot = (width - padX * 2) / points.length;
    const barW = Math.min(slot * 0.5, 56);
    const y = (v: number) => padTop + plotH - (v / maxValue) * plotH;

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Net payroll cost by month">
                <line x1={padX} x2={width - padX} y1={y(0)} y2={y(0)} stroke="#E4E7EC" />
                {points.map((p, i) => {
                    const cx = padX + slot * i + slot / 2;
                    return (
                        <g key={`${p.label}-${i}`}>
                            <rect
                                x={cx - barW / 2}
                                y={y(p.value)}
                                width={barW}
                                height={Math.max(y(0) - y(p.value), 0)}
                                rx={4}
                                fill={p.forecast ? '#0E7A5A' : '#D0D5DD'}
                            />
                            {p.forecast && p.lower !== null && p.upper !== null && (
                                <g stroke="#101828" strokeOpacity={0.55} strokeWidth={1.5}>
                                    <line x1={cx} x2={cx} y1={y(p.lower)} y2={y(p.upper)} />
                                    <line x1={cx - 6} x2={cx + 6} y1={y(p.upper)} y2={y(p.upper)} />
                                    <line x1={cx - 6} x2={cx + 6} y1={y(p.lower)} y2={y(p.lower)} />
                                </g>
                            )}
                            <text x={cx} y={y(p.upper ?? p.value) - 6} textAnchor="middle" fontSize={10} fill="#475467" fontFamily="IBM Plex Mono, monospace">
                                {formatCompact(p.value)}
                            </text>
                            <text x={cx} y={height - 10} textAnchor="middle" fontSize={11} fill="#667085">
                                {p.label}
                            </text>
                        </g>
                    );
                })}
            </svg>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#D0D5DD]" /> Past pay runs (net)
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#0E7A5A]" /> Forecast (net)
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-px bg-[#101828]/55" /> Likely range (about 80%)
                </span>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */

export default function CostForecast() {
    const [forecasts, setForecasts] = useState<Forecast[]>(initialForecasts);
    const [months, setMonths] = useState(3);
    const [headcountChange, setHeadcountChange] = useState(0);
    const [toDelete, setToDelete] = useState<Forecast | null>(null);

    const next = forecasts[0];
    const lastActual = history[history.length - 1].net;
    const changePercent = next ? Math.round(((next.net - lastActual) / lastActual) * 1000) / 10 : 0;
    const horizonTotal = forecasts.reduce((sum, f) => sum + f.net, 0);

    const confirmDelete = () => {
        if (!toDelete) return;
        setForecasts((prev) => prev.filter((f) => f.id !== toDelete.id));
        setToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cost Forecast">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500" rel="stylesheet" />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] p-4 font-['Instrument_Sans'] text-[#101828] md:p-6"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cost Forecast</h1>
                        <p className="mt-1 text-sm text-[#475467]">Projected payroll cost from past pay runs, attendance and headcount</p>
                    </div>

                    {/* Generate (static, no submit) */}
                    <form onSubmit={(e) => e.preventDefault()} className={`${card} p-5`}>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div>
                                <label htmlFor="months" className="mb-2 block text-xs font-medium text-[#344054]">
                                    Months to forecast
                                </label>
                                <select id="months" value={months} onChange={(e) => setMonths(Number(e.target.value))} className={`${field} w-full md:w-44`}>
                                    {[1, 2, 3, 4, 5, 6].map((m) => (
                                        <option key={m} value={m}>
                                            {m} month{m > 1 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="headcount_change" className="mb-2 block text-xs font-medium text-[#344054]">
                                    What if headcount changes by
                                </label>
                                <input
                                    id="headcount_change"
                                    type="number"
                                    min={-100}
                                    max={100}
                                    value={headcountChange}
                                    onChange={(e) => setHeadcountChange(Number(e.target.value))}
                                    className={`${field} w-full md:w-44`}
                                />
                            </div>

                            <button type="submit" className={primaryBtn}>
                                <Sparkles className="h-4 w-4" />
                                Regenerate forecast
                            </button>
                        </div>

                        <p className="mt-3 text-xs text-[#667085]">Learns from your last {history.length} approved or paid pay runs.</p>
                    </form>

                    {!next ? (
                        <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
                            <div className="mb-3 rounded-full bg-[#F2F4F7] p-4">
                                <CalendarRange className="h-6 w-6 text-[#98A2B3]" />
                            </div>
                            <h2 className="font-medium">No forecast yet</h2>
                            <p className="mt-1 max-w-sm text-sm text-[#667085]">Choose how many months to look ahead and generate your first forecast.</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">{next.label} net payroll</p>
                                            <p className={`mt-2 ${mono} text-xl font-medium`}>{formatCurrency(next.net)}</p>
                                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#B42318]">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                {Math.abs(changePercent)}% above last pay run
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-[#0E7A5A] p-3">
                                            <Wallet className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">{next.label} gross payroll</p>
                                            <p className={`mt-2 ${mono} text-xl font-medium`}>{formatCurrency(next.gross)}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#F2F4F7] p-3">
                                            <Banknote className="h-5 w-5 text-[#344054]" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">
                                                Net, next {forecasts.length} month{forecasts.length !== 1 ? 's' : ''}
                                            </p>
                                            <p className={`mt-2 ${mono} text-xl font-medium`}>{formatCurrency(horizonTotal)}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#D1FADF] p-3">
                                            <CalendarRange className="h-5 w-5 text-[#0E7A5A]" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`${card} p-5`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#667085]">Projected headcount</p>
                                            <p className={`mt-2 ${mono} text-2xl font-medium`}>{next.headcount}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#E0EAFF] p-3">
                                            <Users className="h-5 w-5 text-[#3538CD]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className={`${card} overflow-hidden`}>
                                <div className="border-b border-[#E4E7EC] px-5 py-4">
                                    <h2 className="text-base font-semibold">Net payroll cost trend</h2>
                                    <p className="mt-1 text-xs text-[#667085]">Past pay runs and the forecast, with the likely range</p>
                                </div>
                                <div className="p-5">
                                    <ForecastChart forecasts={forecasts} />
                                </div>
                            </div>

                            {/* Table */}
                            <div className={`${card} overflow-hidden`}>
                                <div className="border-b border-[#E4E7EC] px-5 py-4">
                                    <h2 className="text-base font-semibold">Monthly forecast</h2>
                                    <p className="mt-1 text-xs text-[#667085]">Each month is built from the same parts as a payslip</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1100px]">
                                        <thead>
                                            <tr className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
                                                <th className={`${th} text-left`}>Month</th>
                                                <th className={`${th} text-right`}>Headcount</th>
                                                <th className={`${th} text-right`}>Base pay</th>
                                                <th className={`${th} text-right`}>Overtime</th>
                                                <th className={`${th} text-right`}>Allowances</th>
                                                <th className={`${th} text-right`}>Gross</th>
                                                <th className={`${th} text-right`}>Tax</th>
                                                <th className={`${th} text-right`}>Net</th>
                                                <th className={`${th} text-right`}>Likely range</th>
                                                <th className={`${th} text-center`}>Confidence</th>
                                                <th className={`${th} text-center`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F2F4F7]">
                                            {forecasts.map((f) => (
                                                <tr key={f.id} className="transition hover:bg-[#F9FAFB]">
                                                    <td className="px-5 py-4 text-sm font-medium">{f.label}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#344054]`}>{f.headcount}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#344054]`}>{formatCurrency(f.base)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#344054]`}>{formatCurrency(f.overtime)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#344054]`}>{formatCurrency(f.allowances)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#344054]`}>{formatCurrency(f.gross)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm text-[#475467]`}>{formatCurrency(f.tax)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-sm font-medium`}>{formatCurrency(f.net)}</td>
                                                    <td className={`px-5 py-4 text-right ${mono} text-xs text-[#667085]`}>
                                                        {formatCompact(f.lower)} – {formatCompact(f.upper)}
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${confidenceStyle[f.confidence]}`}>
                                                            {f.confidence}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            title="Delete forecast"
                                                            aria-label={`Delete forecast for ${f.label}`}
                                                            onClick={() => setToDelete(f)}
                                                            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#FEE4E2] hover:text-[#B42318]"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Departments + assumptions */}
                            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                                <div className={`${card} overflow-hidden`}>
                                    <div className="border-b border-[#E4E7EC] px-5 py-4">
                                        <h2 className="text-base font-semibold">By department · {next.label}</h2>
                                        <p className="mt-1 text-xs text-[#667085]">Share of projected net payroll</p>
                                    </div>
                                    <div className="space-y-4 p-5">
                                        {departments.map((d) => (
                                            <div key={d.department}>
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <p className="text-sm font-medium">
                                                        {d.department}{' '}
                                                        <span className="text-xs font-normal text-[#667085]">
                                                            · {d.headcount} employee{d.headcount !== 1 ? 's' : ''}
                                                        </span>
                                                    </p>
                                                    <p className={`${mono} text-sm text-[#344054]`}>{formatCurrency(d.net)}</p>
                                                </div>
                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F2F4F7]">
                                                    <div className="h-full rounded-full bg-[#0E7A5A]" style={{ width: `${d.share_percent}%` }} />
                                                </div>
                                                <p className="mt-1 text-xs text-[#667085]">{d.share_percent}% of total</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`${card} overflow-hidden`}>
                                    <div className="border-b border-[#E4E7EC] px-5 py-4">
                                        <h2 className="text-base font-semibold">How it was calculated</h2>
                                        <p className="mt-1 text-xs text-[#667085]">Assumptions behind {next.label}</p>
                                    </div>
                                    <dl className="divide-y divide-[#F2F4F7] px-5 text-sm">
                                        {assumptions.map(([label, value]) => (
                                            <div key={label} className="flex items-center justify-between gap-3 py-3">
                                                <dt className="text-[#667085]">{label}</dt>
                                                <dd className={`${mono}`}>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                    <p className="border-t border-[#E4E7EC] px-5 py-3 text-xs leading-5 text-[#667085]">
                                        Recent runs count more than older ones. Working days exclude weekends only, not public holidays.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {toDelete && (
                <DeleteModal
                    open
                    processing={false}
                    onClose={() => setToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Forecast"
                    description={`Are you sure you want to delete the forecast for ${toDelete.label}? You can generate it again at any time.`}
                />
            )}
        </AppLayout>
    );
}