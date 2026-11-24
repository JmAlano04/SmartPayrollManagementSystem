<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class FaceRecognitionController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('employee/faceRecognition');
    }
}