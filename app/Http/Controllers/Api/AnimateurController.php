<?php

namespace App\Http\Controllers\Api;

use App\Models\Animateur;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AnimateurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $animateurs = Animateur::with('user')->get();
        return response()->json($animateurs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if the user is already associated with an animateur
        if (Animateur::where('user_id', $validatedData['user_id'])->exists()) {
            return response()->json(['message' => 'This user is already an animateur.'], 409);
        }

        $animateur = Animateur::create($validatedData);
        return response()->json($animateur, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $animateur = Animateur::with('user')->findOrFail($id);
        return response()->json($animateur);
    }

    /**
     * Update the specified resource in storage.
     */
      public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $animateur = Animateur::findOrFail($id);

        // Check if the user is already associated with another animateur
        if (Animateur::where('user_id', $validatedData['user_id'])->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'This user is already associated with another animateur.'], 409);
        }

        $animateur->update($validatedData);
        return response()->json($animateur);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

        $animateur = Animateur::findOrFail($id);

        if (! $animateur) {
            return response()->json(['message' => 'Animateur not found'], 404);
        }

        $user = $animateur->user;

        // Supprimer d'abord le CDC
        $animateur->delete();

        // Supprimer ensuite l'utilisateur associé
        if ($user) {
            $user->delete();
        }   

        return response()->json(['message' => 'CDC et son utilisateur ont été supprimés avec succès'], 200);

    }
}