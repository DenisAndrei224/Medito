<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', env('CORS_ALLOWED_ORIGINS'));
        $response->headers->set('Access-Control-Allow-Methods', env('CORS_ALLOWED_METHODS'));
        $response->headers->set('Access-Control-Allow-Headers', env('CORS_ALLOWED_HEADERS'));

        return $response;
    }
}
