<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            
        ]);

        [$firstName, $lastName] = explode(' ', $user->name, 2) + ['', ''];

        // Generate unique employee code, e.g. EMP-0001, EMP-0002...
        $code = 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);

        // Default department 
        $department = $request->input('department', 'Unassigned');

        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_code' => $code,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $user->email,
            'department' => $department,
            'position' => fake()->jobTitle(),
            'hire_date' => now(),
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        $user->assignRole('employee');

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}