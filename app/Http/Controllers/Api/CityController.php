<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Récupérer toutes les villes
     */
    public function index()
    {
        $cities = City::with('region')->get();
        return response()->json($cities);
    }

    /**
     * Créer une nouvelle ville
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:100',
            'region_id' => 'required|exists:regions,id',
        ]);

        $city = City::create($validated);
        return response()->json($city, 201);
    }

    /**
     * Afficher une ville spécifique
     */
    public function show($id)
    {
        $city = City::with('region')->findOrFail($id);
        return response()->json($city);
    }

    /**
     * Mettre à jour une ville
     */
    public function update(Request $request, $id)
    {
        $city = City::findOrFail($id);

        $validated = $request->validate([
            'nom'       => 'required|string|max:100',
            'region_id' => 'required|exists:regions,id',
        ]);

        $city->update($validated);
        return response()->json($city);
    }

    /**
     * Supprimer une ville
     */
    public function destroy($id)
    {
        $city = City::findOrFail($id);
        $city->delete();
        return response()->json(null, 204);
    }
}
