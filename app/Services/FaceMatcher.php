<?php

namespace App\Support;

final class FaceMatcher
{
    /** Max Euclidean distance to accept a match. Lower = stricter. 0.45 - 0.6 is the usual range. */
    public const THRESHOLD = 0.5;

    /** The best match must beat the 2nd-best employee by at least this much. */
    public const AMBIGUITY_MARGIN = 0.04;

    public static function distance(array $a, array $b): float
    {
        $sum = 0.0;

        foreach ($a as $i => $v) {
            $d = $v - $b[$i];
            $sum += $d * $d;
        }

        return sqrt($sum);
    }

    /**
     * Normalize employees.face_descriptor (JSON) into a list of 128-number arrays.
     * Accepts the new format (5 descriptors) and a single flat descriptor.
     *
     * @return array<int, array<int, float>>
     */
    public static function parse(mixed $raw): array
    {
        $data = is_string($raw) ? json_decode($raw, true) : $raw;

        if (! is_array($data) || ! $data) {
            return [];
        }

        if (is_numeric($data[0] ?? null)) {
            $data = [$data]; // single descriptor
        }

        return array_values(array_filter(
            array_map(fn ($d) => is_array($d) && count($d) === 128 ? array_map('floatval', $d) : null, $data),
        ));
    }

    /**
     * @param  array<int, array{id:int, descriptors:array}>  $templates
     * @return array{id:int, distance:float}|null
     */
    public static function identify(array $probe, array $templates): ?array
    {
        $best = []; // employee id => closest distance across that employee's samples

        foreach ($templates as $t) {
            $min = INF;

            foreach ($t['descriptors'] as $descriptor) {
                $min = min($min, self::distance($probe, $descriptor));
            }

            $best[$t['id']] = $min;
        }

        if (! $best) {
            return null;
        }

        asort($best);
        $ids = array_keys($best);
        $first = $best[$ids[0]];

        if ($first > self::THRESHOLD) {
            return null;
        }

        if (isset($ids[1]) && ($best[$ids[1]] - $first) < self::AMBIGUITY_MARGIN) {
            return null; // two employees look too similar to be sure
        }

        return ['id' => $ids[0], 'distance' => round($first, 4)];
    }
}