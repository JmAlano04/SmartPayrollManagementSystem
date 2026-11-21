<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class CostForecastController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('CostForecast');
    }
}