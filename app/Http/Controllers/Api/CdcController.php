<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cdc;
use App\Models\Filiere;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class CdcController extends Controller
{
    // Récupérer tous les CDCs
    public function index()
    {

        // $cdcs = Cdc::with('user')->get();

        // Récupérer l'ID du rôle DR
        $cdcRole = Role::where('name', 'cdc')->first();

        if (! $cdcRole) {
            return response()->json(['message' => 'Rôle DR non trouvé'], 404);
        }

        $cdcs = Cdc::with(['user', 'branche'])
            ->whereHas('user', function ($query) use ($cdcRole) {
                $query->where('role_id', $cdcRole->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($cdcs, 200);
    }

    // Créer un nouveau CDC
    public function store(Request $request)
    {
        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'branche_id' => 'required|exists:branches,id',
        ]);

        $cdc = Cdc::create($request->all());

        return response()->json($cdc, 201);
    }

    // Afficher un CDC spécifique
    public function show($id)
    {
        $cdc = Cdc::with('user')->find($id);

        if (! $cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        return response()->json($cdc, 200);
    }

    public function getFilieresOfCdc($cdcId)
    {
        $filieres = Filiere::where('cdc_id', $cdcId)->get();
        return response()->json($filieres);
    }

    // Afficher un CDC qui belongs to the auth user
    public function getCdcOfAuthUser($userId)
    {
        // $cdc = Cdc::with('user')->find($id);
        $cdc = Cdc::where('user_id', $userId)->get();

        if (! $cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        return response()->json($cdc, 200);
    }

    // Mettre à jour un CDC
    public function update(Request $request, $id)
    {
        $cdc = Cdc::find($id);

        if (! $cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'branche_id' => 'required|exists:branches,id',
        ]);

        $cdc->update($request->all());

        return response()->json($cdc, 200);
    }

    // Supprimer un CDC
    public function destroy($id)
    {

        $cdc = Cdc::find($id);

        if (! $cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        $user = $cdc->user;

        // Supprimer d'abord le CDC
        $cdc->delete();

        // Supprimer ensuite l'utilisateur associé
        if ($user) {
            $user->delete();
        }
        return response()->json(['message' => 'CDC et son utilisateur ont été supprimés avec succès'], 200);
    }

     /**
     * Get Branche Of the cdc auth user
     */
    public function getBrancheOfAuthCdc($cdcId)
    {
        $cdc = Cdc::findOrFail($cdcId);
        $branche = $cdc->branche;
        return response()->json($branche);
    }
    
}