<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    /**
     * Afficher la liste des régions
     */
    public function index()
    {
        $regions = Region::all();
        return response()->json($regions);
    }

    /**
     * Enregistrer une nouvelle région
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:255|unique:regions',
            'code'        => 'required|string|max:50|unique:regions',
            'description' => 'nullable|string',
        ]);

        $region = Region::create($validated);
        return response()->json($region, 201);
    }

    /**
     * Afficher une région spécifique
     */
    public function show(string $id)
    {
        $region = Region::findOrFail($id);
        return response()->json($region);
    }

    /**
     * Mettre à jour une région
     */
    public function update(Request $request, string $id)
    {
        $region = Region::findOrFail($id);

        $validated = $request->validate([
            'nom'         => 'required|string|max:255|unique:regions,nom,' . $id,
            'code'        => 'required|string|max:50|unique:regions,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $region->update($validated);
        return response()->json($region);
    }

    /**
     * Supprimer une région
     */
    public function destroy(string $id)
    {
        $region = Region::findOrFail($id);
        $region->delete();
        return response()->json(null, 204);
    }
}