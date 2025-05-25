<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branche;
use Illuminate\Http\Request;

class BrancheController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $branches = Branche::all();
        return response()->json($branches);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get Filieres Of the branche
     */

    public function getFilieresOfBranche($id)
    {
        // 1. Retrieve the branche or fail with a 404
        $branche = Branche::findOrFail($id);

        // 2. Fetch its filières via the hasMany relationship
        $filieres = $branche->filieres; // or ->filieres()->get()

        // 3. Return them as JSON
        return response()->json($filieres);
    }

}