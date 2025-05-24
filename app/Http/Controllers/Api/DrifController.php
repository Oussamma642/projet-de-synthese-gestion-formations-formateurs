<?php

namespace App\Http\Controllers\Api;

use App\Models\Drif;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class DrifController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $drifs = Drif::with('user')->get();
        return response()->json($drifs);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "password" => "required|string|min:4",
            "phone" => "required|string|max:20",
        ]);
        
        $id = Role::where('name', 'drif')->value('id');

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => $request->password, 
            "phone" => $request->phone,
            "role_id" => $id, 
        ]);
        
        $drif = Drif::create([
            "user_id" => $user->id,
        ]);
        
        return response()->json([
            "message" => "Drif créé avec succès",
            "drif" => $drif->load('user')
        ], 201);    
    }
    

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $drif = Drif::with('user')->findOrFail($id);
        return response()->json($drif);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $drif = Drif::findOrFail($id);
        $user = User::findOrFail($drif->user_id);
        
        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email,".$user->id,
            "phone" => "required|string|max:20",
        ]);
        
        $user->update([
            "name" => $request->name,
            "email" => $request->email,
            "phone" => $request->phone,
        ]);
        
        if ($request->filled('password')) {
            $request->validate([
                "password" => "string|min:4",
            ]);
            
            $user->update([
                "password" => Hash::make($request->password)
            ]);
        }
        
        return response()->json([
            "message" => "Drif mis à jour avec succès",
            "drif" => $drif->load('user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $drif = Drif::findOrFail($id);
        $user_id = $drif->user_id;
        
        $drif->delete();
        User::destroy($user_id);
        
        return response()->json([
            "message" => "Drif supprimé avec succès"
        ]);
    }
} 