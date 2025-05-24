<?php

namespace App\Http\Controllers\Api;

use App\Models\Cdc;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Filiere;


class CdcController extends Controller
{
    // Récupérer tous les CDCs
    public function index()
    {
        $cdcs = Cdc::with('user')->get();
        return response()->json($cdcs, 200);
    }

    // Créer un nouveau CDC
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $cdc = Cdc::create($request->all());

        return response()->json($cdc, 201);
    }

    // Afficher un CDC spécifique
    public function show($id)
    {
        $cdc = Cdc::with('user')->find($id);

        if (!$cdc) {
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
        

        if (!$cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        return response()->json($cdc, 200);
    }

    // Mettre à jour un CDC
    public function update(Request $request, $id)
    {
        $cdc = Cdc::find($id);

        if (!$cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $cdc->update($request->all());

        return response()->json($cdc, 200);
    }

    // Supprimer un CDC
    public function destroy($id)
    {
        $cdc = Cdc::find($id);

        if (!$cdc) {
            return response()->json(['message' => 'CDC not found'], 404);
        }

        $cdc->delete();

        return response()->json(['message' => 'CDC deleted successfully'], 200);
    }
}