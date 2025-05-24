<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use App\Models\Ista;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function stats()
    {
        // Get total number of users
        $totalUsers = User::count();

        // Get new registrations in the last 30 days
        $newRegistrations = User::where('created_at', '>=', now()->subDays(30))->count();

        // Get formateurs count
        $formateurs      = Role::where('name', 'animateur')->first();
        $formateursCount = $formateurs ? $formateurs->users()->count() : 0;

        // Get recent users (last 10 users)
        $recentUsers = User::with('role')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'role'       => $user->role->name,
                    'created_at' => $user->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'totalUsers'       => $totalUsers,
            'newRegistrations' => $newRegistrations,
            'formateurs'       => $formateursCount,
            'recentUsers'      => $recentUsers,
        ]);
    }

    // ISTA methods
    public function getIstas()
    {
        $istas = Ista::all();
        return response()->json($istas);
    }

    public function createIsta(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $ista = App\Models\Ista::create($validated);
        return response()->json($ista, 201);
    }

    public function getIsta($id)
    {
        $ista = Ista::findOrFail($id);
        return response()->json($ista);
    }

    public function updateIsta(Request $request, $id)
    {
        $ista      = Ista::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $ista->update($validated);
        return response()->json($ista);
    }

    public function deleteIsta($id)
    {
        $ista = Ista::findOrFail($id);
        $ista->delete();
        return response()->json(null, 204);
    }

    // Filière methods
    public function getFilieres()
    {

        $filieres = Filiere::query()
        ->selectRaw('MIN(id) AS id, name')
        ->groupBy('name')
        ->get();

        return response()->json($filieres);
        // return response()->json(Filiere::select('name')->distinct()->get());
        // return response()->json(Filiere::all());
    }

    public function createFiliere(Request $request)
    {
        // $validated = $request->validate([
        //     'name' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        // ]);

        $filieres = $request->names;
        $flrs     = [];
        foreach ($filieres as $filiere) {
            $flrs[] = Filiere::create([
                'name'   => $filiere,
                'cdc_id' => $request->cdc_id,
            ]);
        }

        // $filiere = App\Models\Filiere::create($validated);
        return response()->json($flrs, 201);
    }

    public function getFiliere($id)
    {
        $filiere = Filiere::findOrFail($id);
        return response()->json($filiere);
    }

    public function updateFiliere(Request $request, $id)
    {
        $filiere   = Filiere::findOrFail($id);
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $filiere->update($validated);
        return response()->json($filiere);
    }

    public function deleteFiliere($id)
    {
        $filiere = Filiere::findOrFail($id);
        $filiere->delete();
        return response()->json(null, 204);
    }
}