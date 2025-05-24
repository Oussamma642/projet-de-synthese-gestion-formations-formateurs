<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dr;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DrController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Récupérer l'ID du rôle DR
        $drRole = Role::where('name', 'dr')->first();

        if (! $drRole) {
            return response()->json(['message' => 'Rôle DR non trouvé'], 404);
        }

        // Récupérer les DRs avec les relations user et region
        // Filtrer pour ne prendre que les utilisateurs avec le rôle DR
        $drs = Dr::with(['user', 'region'])
            ->whereHas('user', function ($query) use ($drRole) {
                $query->where('role_id', $drRole->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($drs, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'region_id' => 'required|exists:regions,id',
        ]);

        $dr = Dr::create($request->all());
        return response()->json($dr->load(['user', 'region']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dr = Dr::with(['user', 'region'])->findOrFail($id);
        return response()->json($dr, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'user_id'   => 'exists:users,id',
            'region_id' => 'exists:regions,id',
        ]);

        $dr = Dr::findOrFail($id);
        $dr->update($request->all());
        return response()->json($dr->load(['user', 'region']), 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dr   = Dr::with('user')->findOrFail($id);
        $user = $dr->user;

        // Supprimer le DR
        $dr->delete();

        // Supprimer l'utilisateur associé
        if ($user) {
            $user->delete();
        }

        return response()->json(null, 204);
    }

    /**
     * Routes to get the dr that belongs to the auth user.
     */
    public function getDrOfAuthUser()
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        $dr = $user->dr()->with(['region'])->first();

        if (! $dr) {
            return response()->json(['message' => 'Aucun DR trouvé pour cet utilisateur'], 404);
        }

        return response()->json($dr, 200);
    }
}