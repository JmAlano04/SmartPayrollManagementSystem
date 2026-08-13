<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        return array_merge(parent::share($request), [
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth'  => [
                'user' => $user,
                'role' => $user?->getRoleNames()->first(),
            ],
            'flash' => [
                'isFirstLogin' => fn () => session($user?->last_login_at), // 👈 default false
                'success'      => fn () => session('success'),
                'error'        => fn () => session('error'),
                'message'      => fn () => session('message'),
            ],
        ]);
    }
}