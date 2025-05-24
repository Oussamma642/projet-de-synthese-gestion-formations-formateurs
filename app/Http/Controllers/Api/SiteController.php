<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    /**
     * Récupérer tous les sites
     */
    public function index()
    {
        $sites = Site::with('city')->get();
        return response()->json($sites);
    }

    /**
     * Récupérer les sites d'une ville spécifique
     */
    public function getSitesByCity($cityId)
    {
        $sites = Site::where('city_id', $cityId)->get();
        return response()->json($sites);
    }

    /**
     * Créer un nouveau site
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'required|string',
            'city_id' => 'required|exists:cities,id',
        ]);

        $site = Site::create($validated);
        return response()->json($site, 201);
    }

    /**
     * Afficher un site spécifique
     */
    public function show($id)
    {
        $site = Site::with('city')->findOrFail($id);
        return response()->json($site);
    }

    /**
     * Mettre à jour un site
     */
    public function update(Request $request, $id)
    {
        $site = Site::findOrFail($id);

        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'required|string',
            'city_id' => 'required|exists:cities,id',
        ]);

        $site->update($validated);
        return response()->json($site);
    }

    /**
     * Supprimer un site
     */
    public function destroy($id)
    {
        $site = Site::findOrFail($id);
        $site->delete();
        return response()->json(null, 204);
    }
}
