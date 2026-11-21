<?php

namespace App\Services;

use App\Models\CostForecast;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CostForecastService
{
    public const METHOD = 'wma_headcount_v1';
    public const HISTORY_RUNS = 6;
    public const MAX_HORIZON = 6;

    private const DEPT = "COALESCE(employees.department, 'Unassigned')";

    /**
     * Past approved/paid runs, oldest first, with components recomputed from payslips.
     */
    public function history(): Collection
    {
        $runs = DB::table('payroll_runs')
            ->whereIn('status', ['approved', 'paid'])
            ->orderByDesc('period_start')
            ->limit(self::HISTORY_RUNS)
            ->get(['id', 'period_start', 'period_end', 'total_net'])
            ->sortBy('period_start')
            ->values();

        if ($runs->isEmpty()) {
            return collect();
        }

        $totals = DB::table('payslips')
            ->whereIn('payroll_run_id', $runs->pluck('id'))
            ->groupBy('payroll_run_id')
            ->selectRaw('
                payroll_run_id,
                COUNT(*) AS headcount,
                SUM(base_pay) AS base_pay,
                SUM(overtime_pay) AS overtime_pay,
                SUM(allowances_total) AS allowances,
                SUM(gross_pay) AS gross,
                SUM(tax_amount) AS tax,
                SUM(other_deductions) AS deductions,
                SUM(is_flagged_anomaly) AS flagged
            ')
            ->get()
            ->keyBy('payroll_run_id');

        return $runs->map(function ($run) use ($totals) {
            $t = $totals->get($run->id);

            if (! $t || (int) $t->headcount === 0) {
                return null;
            }

            $gross = (float) $t->gross;
            $tax = (float) $t->tax;
            $deductions = (float) $t->deductions;
            $net = round($gross - $tax - $deductions, 2);
            $storedNet = (float) $run->total_net;

            return [
                'run_id' => (int) $run->id,
                'period_start' => (string) $run->period_start,
                'period_end' => (string) $run->period_end,
                'label' => CarbonImmutable::parse($run->period_start)->format('M Y'),
                'headcount' => (int) $t->headcount,
                'base_pay' => (float) $t->base_pay,
                'overtime_pay' => (float) $t->overtime_pay,
                'allowances' => (float) $t->allowances,
                'gross' => $gross,
                'tax' => $tax,
                'deductions' => $deductions,
                'net' => $net,
                'stored_net' => $storedNet,
                'net_differs' => abs($storedNet - $net) > 0.5,
                'flagged' => (int) $t->flagged,
            ];
        })->filter()->values();
    }

    /**
     * Build and save forecasts for the next $months months.
     * Returns an empty collection when there is no history to learn from.
     */
    public function generate(int $months = 3, int $headcountChange = 0, ?int $userId = null): Collection
    {
        $history = $this->history();

        if ($history->isEmpty()) {
            return collect();
        }

        $months = max(1, min(self::MAX_HORIZON, $months));
        $rows = $this->project($history, $months, $headcountChange);

        return DB::transaction(function () use ($rows, $userId) {
            return collect($rows)->map(fn (array $row) => CostForecast::updateOrCreate(
                ['period_start' => $row['period_start']],
                array_merge(Arr::except($row, ['period_start']), [
                    'generated_by' => $userId,
                    'generated_at' => now(),
                ]),
            ));
        });
    }

    /**
     * Pure calculation: returns one array per forecast month, keyed like the table.
     */
    private function project(Collection $history, int $months, int $headcountChange): array
    {
        $n = $history->count();

        $perHead = fn (string $key) => $history
            ->map(fn (array $h) => $h[$key] / $h['headcount'])
            ->all();

        $basePerHead = $this->weightedMean($perHead('base_pay'));
        $otPerHead = $this->weightedMean($perHead('overtime_pay'));
        $allowPerHead = $this->weightedMean($perHead('allowances'));
        $dedPerHead = $this->weightedMean($perHead('deductions'));

        $taxRate = $this->weightedMean(
            $history->map(fn (array $h) => $h['gross'] > 0 ? $h['tax'] / $h['gross'] : 0.0)->all(),
        );

        $cv = $this->coefficientOfVariation($perHead('net'));
        $spread = max($cv, 0.03);
        $confidence = ($n >= 6 && $cv < 0.08) ? 'high' : ($n >= 3 ? 'medium' : 'low');

        $currentHeadcount = (int) DB::table('employees')->where('status', 'active')->count();
        $headcount = max(0, $currentHeadcount + $headcountChange);

        $historyWorkingDays = (float) $history->avg(fn (array $h) => $this->workingDays(
            CarbonImmutable::parse($h['period_start']),
            CarbonImmutable::parse($h['period_end']),
        ));

        $otIndex = $this->overtimeTrendIndex();
        $departments = $this->departmentShares($history);

        $anchor = CarbonImmutable::parse($history->last()['period_start'])->startOfMonth();
        $rows = [];

        for ($h = 1; $h <= $months; $h++) {
            $start = $anchor->addMonthsNoOverflow($h);
            $end = $start->endOfMonth();

            $workingDays = $this->workingDays($start, $end);
            $workingDayFactor = $historyWorkingDays > 0 ? $workingDays / $historyWorkingDays : 1.0;

            $base = round($basePerHead * $headcount, 2);
            $overtime = round($otPerHead * $headcount * $workingDayFactor * $otIndex, 2);
            $allowances = round($allowPerHead * $headcount, 2);
            $gross = round($base + $overtime + $allowances, 2);
            $tax = round($gross * $taxRate, 2);
            $deductions = round($dedPerHead * $headcount, 2);
            $net = round($gross - $tax - $deductions, 2);

            $halfWidth = $net * $spread * 1.28 * sqrt($h); // ~80% band, widening with distance

            $rows[] = [
                'period_start' => $start->toDateString(),
                'period_end' => $end->toDateString(),
                'horizon' => $h,
                'method' => self::METHOD,
                'projected_headcount' => $headcount,
                'projected_base_pay' => $base,
                'projected_overtime_pay' => $overtime,
                'projected_allowances' => $allowances,
                'projected_gross' => $gross,
                'projected_tax' => $tax,
                'projected_other_deductions' => $deductions,
                'projected_net' => $net,
                'lower_bound_net' => max(0, round($net - $halfWidth, 2)),
                'upper_bound_net' => round($net + $halfWidth, 2),
                'confidence' => $confidence,
                'history_months' => $n,
                'assumptions' => [
                    'current_headcount' => $currentHeadcount,
                    'headcount_change' => $headcountChange,
                    'working_days' => $workingDays,
                    'working_days_history_avg' => round($historyWorkingDays, 1),
                    'overtime_trend_index' => round($otIndex, 3),
                    'tax_rate_percent' => round($taxRate * 100, 2),
                    'spread_percent' => round($spread * 100, 1),
                ],
                'breakdown' => [
                    'departments' => collect($departments)->map(fn (array $d) => [
                        'department' => $d['department'],
                        'headcount' => $d['headcount'],
                        'share_percent' => round($d['share'] * 100, 1),
                        'projected_gross' => round($gross * $d['share'], 2),
                        'projected_net' => round($net * $d['share'], 2),
                    ])->all(),
                ],
            ];
        }

        return $rows;
    }

    /**
     * Newest value counts most: weights 1, 2, 3 ... n (oldest to newest).
     */
    private function weightedMean(array $values): float
    {
        $values = array_values($values);
        $numerator = 0.0;
        $denominator = 0.0;

        foreach ($values as $i => $value) {
            $weight = $i + 1;
            $numerator += $value * $weight;
            $denominator += $weight;
        }

        return $denominator > 0 ? $numerator / $denominator : 0.0;
    }

    /**
     * Spread of a series relative to its mean. With under two points the
     * spread is unknown, so a conservative 10% is returned.
     */
    private function coefficientOfVariation(array $values): float
    {
        $count = count($values);

        if ($count < 2) {
            return 0.10;
        }

        $mean = array_sum($values) / $count;

        if ($mean <= 0) {
            return 0.10;
        }

        $variance = array_sum(array_map(fn ($v) => ($v - $mean) ** 2, $values)) / $count;

        return sqrt($variance) / $mean;
    }

    /**
     * Mon-Fri days in the range. Philippine public holidays are not excluded.
     */
    private function workingDays(CarbonImmutable $start, CarbonImmutable $end): int
    {
        $days = 0;

        for ($day = $start; $day->lte($end); $day = $day->addDay()) {
            if ($day->isWeekday()) {
                $days++;
            }
        }

        return $days;
    }

    /**
     * Latest month's overtime hours per attendance record vs. the previous
     * (up to three) months. Returns 1.0 (no change) until there are two
     * months of attendance. Clamped so one odd month cannot swing the forecast.
     */
    private function overtimeTrendIndex(): float
    {
        $rates = DB::table('attendance')
            ->where('is_absent', 0)
            ->selectRaw("DATE_FORMAT(work_date, '%Y-%m') AS ym, SUM(overtime_hours) AS overtime, COUNT(*) AS days")
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->filter(fn ($r) => (int) $r->days > 0)
            ->map(fn ($r) => (float) $r->overtime / (int) $r->days)
            ->values();

        if ($rates->count() < 2) {
            return 1.0;
        }

        $prior = $rates->slice(0, -1)->take(-3)->avg();

        if (! $prior) {
            return 1.0;
        }

        return max(0.8, min(1.25, $rates->last() / $prior));
    }

    /**
     * Each department's share of the projected total: current active headcount
     * x average gross per payslip in that department over the history window.
     * Departments with no history use the overall average.
     */
    private function departmentShares(Collection $history): array
    {
        $headcounts = DB::table('employees')
            ->where('status', 'active')
            ->selectRaw(self::DEPT.' AS department, COUNT(*) AS headcount')
            ->groupByRaw(self::DEPT)
            ->pluck('headcount', 'department');

        if ($headcounts->isEmpty()) {
            return [];
        }

        $avgGross = DB::table('payslips')
            ->join('employees', 'employees.id', '=', 'payslips.employee_id')
            ->whereIn('payslips.payroll_run_id', $history->pluck('run_id'))
            ->selectRaw(self::DEPT.' AS department, AVG(payslips.gross_pay) AS avg_gross')
            ->groupByRaw(self::DEPT)
            ->pluck('avg_gross', 'department');

        $fallback = $avgGross->isEmpty() ? 0.0 : (float) $avgGross->avg();

        $weights = $headcounts->map(
            fn ($count, $dept) => (float) $count * (float) ($avgGross[$dept] ?? $fallback),
        );

        $total = $weights->sum();

        return $headcounts
            ->map(fn ($count, $dept) => [
                'department' => (string) $dept,
                'headcount' => (int) $count,
                'share' => $total > 0 ? $weights[$dept] / $total : 1 / $headcounts->count(),
            ])
            ->sortByDesc('share')
            ->values()
            ->all();
    }
}