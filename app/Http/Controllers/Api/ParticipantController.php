<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;

class ParticipantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $participants = Participant::with(['formation', 'ista', 'user', 'filiere'])->get();
            return response()->json($participants);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching participants: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        try {
            // First validate participant data
            $validated = $request->validate([
                'formation_id' => 'nullable|exists:formations,id',
                'ista_id'      => 'required|exists:istas,id',
                'filiere_id'   => 'required|exists:filieres,id',
                'name'         => 'required|string|max:255',
                'email'        => 'required|string|email|max:255|unique:users',
                'password'     => 'required|string|min:8',
            ]);

            // Begin transaction to ensure data consistency
            \DB::beginTransaction();

            // Create the user with participant role
            $participantRole = \App\Models\Role::where('name', 'formateur')->first();
            if (! $participantRole) {
                throw new \Exception('Participant role not found');
            }

            $user = \App\Models\User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role_id'  => $participantRole->id,
            ]);

            // Create the participant with the new user
            $participant = Participant::create([
                'formation_id' => $validated['formation_id'] ?? null,
                'ista_id'      => $validated['ista_id'],
                'filiere_id'   => $validated['filiere_id'],
                'user_id'      => $user->id,
            ]);

            // Commit the transaction
            \DB::commit();

            // Load relationships for response
            $participant->load(['formation', 'ista', 'user', 'filiere']);

            return response()->json($participant, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation Error:', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating participant: ' . $e->getMessage());
            return response()->json(['message' => 'Error creating participant: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Participant $participant)
    {
        $participant->load(['formation', 'ista', 'user', 'filiere']);
        return response()->json($participant);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Participant $participant)
    {
        try {
            \Log::info('Updating participant:', ['id' => $participant->id, 'data' => $request->all()]);

            // Validate participant data
            $validated = $request->validate([
                'formation_id' => 'sometimes|nullable|exists:formations,id',
                'ista_id'      => 'sometimes|exists:istas,id',
                'filiere_id'   => 'sometimes|exists:filieres,id',
                'name'         => 'sometimes|string|max:255', // Allow updating name directly
                'email'        => 'sometimes|email',          // Allow updating email directly
                'password'     => 'sometimes|nullable|min:8', // Allow updating password
            ]);

            // Update the participant record
            $participant->update([
                'ista_id'      => $validated['ista_id'] ?? $participant->ista_id,
                'filiere_id'   => $validated['filiere_id'] ?? $participant->filiere_id,
                'formation_id' => $validated['formation_id'] ?? $participant->formation_id,
            ]);

            // Also update the associated user if user data is provided
            if (isset($validated['name']) || isset($validated['email']) || isset($validated['password'])) {
                $userData = [];

                if (isset($validated['name'])) {
                    $userData['name'] = $validated['name'];
                }

                if (isset($validated['email'])) {
                    $userData['email'] = $validated['email'];
                }

                if (isset($validated['password']) && ! empty($validated['password'])) {
                    $userData['password'] = bcrypt($validated['password']);
                }

                // Update the user record directly
                if (! empty($userData) && $participant->user) {
                    \Log::info('Updating user data for participant', ['user_id' => $participant->user->id, 'data' => $userData]);
                    $participant->user->update($userData);
                }
            }

            // Reload the participant with all related data
            $participant->refresh();
            $participant->load(['formation', 'ista', 'user', 'filiere']);

            \Log::info('Participant updated successfully', ['id' => $participant->id]);
            return response()->json([
                'message'     => 'Participant mis à jour avec succès',
                'participant' => $participant,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error when updating participant', ['errors' => $e->errors()]);
            return response()->json(['message' => 'Erreur de validation', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating participant: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating participant: ' . $e->getMessage()], 500);
        }
    }

/**
 * Remove the specified resource from storage.
 */
    public function destroy(Participant $participant)
    {
        try {
            \Log::info('Deleting participant:', ['id' => $participant->id]);

            // Get the user ID before deleting the participant
            $userId = $participant->user_id;

            // Delete the participant record
            $participant->delete();

            // If there's an associated user, delete that too
            if ($userId) {
                $user = \App\Models\User::find($userId);
                if ($user) {
                    \Log::info('Deleting associated user:', ['id' => $userId]);
                    $user->delete();
                }
            }

            \Log::info('Participant deleted successfully');
            return response()->json(['message' => 'Participant supprimé avec succès']);
        } catch (\Exception $e) {
            \Log::error('Error deleting participant: ' . $e->getMessage());
            return response()->json(['message' => 'Error deleting participant: ' . $e->getMessage()], 500);
        }
    }

}