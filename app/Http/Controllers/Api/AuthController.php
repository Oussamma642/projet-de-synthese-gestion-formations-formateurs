<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
/*
    public function login(LoginRequest $request)
    {
        Log::info('Login attempt', [
            'email' => $request->email,
            'role' => $request->role
        ]);

        $credentials = $request->validated();

        // Find role ID
        $roleId = Role::where('name', $credentials['role'])->value('id');

        if (!$roleId) {
            Log::error('Invalid role provided', ['role' => $credentials['role']]);
            return response()->json([
                'message' => 'Rôle invalide',
            ], 400);
        }

        Log::info('Searching for user', [
            'email' => $credentials['email'],
            'role_id' => $roleId
        ]);

        // Try to find user with email first, for better error messages
        $userExists = User::where('email', $credentials['email'])->exists();

        if (!$userExists) {
            Log::error('User not found with email', ['email' => $credentials['email']]);
            return response()->json([
                'message' => 'Utilisateur avec cet email n\'existe pas',
            ], 401);
        }

        // Now check password and role
        $user = User::where('email', $credentials['email'])
            ->where('password', $credentials['password'])
            ->where('role_id', $roleId)
            ->first();

        if (!$user) {
            $userWithEmail = User::where('email', $credentials['email'])->first();

            if ($userWithEmail->role_id != $roleId) {
                Log::error('User exists but with wrong role', [
                    'email' => $credentials['email'],
                    'expected_role' => $credentials['role'],
                    'actual_role_id' => $userWithEmail->role_id
                ]);
                return response()->json([
                    'message' => 'Le rôle sélectionné ne correspond pas à ce compte',
                ], 401);
            } else {
                Log::error('Invalid password for user', ['email' => $credentials['email']]);
                return response()->json([
                    'message' => 'Mot de passe incorrect',
                ], 401);
            }
        }

        // Generate API token
        $token = $user->createToken('main')->plainTextToken;

        // Add role information directly to user object
        $role = Role::find($user->role_id);
        $user->role = $role ? $role->name : 'unknown';

        Log::info('Login successful', [
            'user_id' => $user->id,
            'role' => $user->role
        ]);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 200);
    }
*/

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        // Retrieve role ID from the roles table
        $roleId = Role::where('name', $credentials['role'])->value('id');

        if (! $roleId) {
            return response()->json([
                'message' => 'Invalid role provided',
            ], 400);
        }

        // Find the user with the given email and role
        $user = User::where('email', $credentials['email'])
            ->where('role_id', $roleId)
            ->first();

        // If no user is found or password does not match, return an error response
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Provided email, password, or role is incorrect',
            ], 401);
        }

        // Generate API token
        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }

    /**
     * Get the authenticated user's profile
     */
    public function getProfile(Request $request)
    {
        Log::info('Profile request received');
        try {
            $user = $request->user();

            if (! $user) {
                Log::error('No authenticated user found for profile request');
                return response()->json(['message' => 'User not authenticated'], 401);
            }

            Log::info('User profile retrieved', ['user_id' => $user->id]);

            // Get role information
            $role     = Role::find($user->role_id);
            $roleName = $role ? $role->name : 'unknown';

            // Add additional profile information
            $profileData = [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone ?? '',
                'position'   => ($roleName === 'drif') ? 'Délégué Régional à l\'Ingénierie de Formation' :
                (($roleName === 'cdc') ? 'Chef de Centre' : $roleName),
                'bio'        => $user->bio ?? 'Aucune biographie disponible',
                'role'       => $roleName,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            return response()->json($profileData);
        } catch (\Exception $e) {
            Log::error('Error retrieving profile', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error retrieving profile',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the authenticated user's profile
     */
    public function updateProfile(Request $request)
    {
        Log::info('Profile update request received', ['data' => $request->except(['current_password', 'new_password', 'confirm_password'])]);

        try {
            $user = $request->user();

            if (! $user) {
                Log::error('No authenticated user found for profile update request');
                return response()->json(['message' => 'User not authenticated'], 401);
            }

            $validatedData = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|max:255|unique:users,email,' . $user->id,
                'phone'    => 'nullable|string|max:20',
                'position' => 'nullable|string|max:255',
                'bio'      => 'nullable|string',
            ]);

            // Update user data
            $user->update($validatedData);

            Log::info('User profile updated', ['user_id' => $user->id]);

            // Get role information
            $role     = Role::find($user->role_id);
            $roleName = $role ? $role->name : 'unknown';

            // Return updated profile
            $profileData = [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone ?? '',
                'position'   => $validatedData['position'] ?? (($roleName === 'drif') ? 'Délégué Régional à l\'Ingénierie de Formation' :
                    (($roleName === 'cdc') ? 'Chef de Centre' : $roleName)),
                'bio'        => $user->bio ?? 'Aucune biographie disponible',
                'role'       => $roleName,
                'updated_at' => $user->updated_at,
            ];

            return response()->json($profileData);
        } catch (\Exception $e) {
            Log::error('Error updating profile', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error updating profile',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the authenticated user's password
     */
    public function updatePassword(Request $request)
    {
        Log::info('Password update request received');

        try {
            $user = $request->user();

            if (! $user) {
                Log::error('No authenticated user found for password update request');
                return response()->json(['message' => 'User not authenticated'], 401);
            }

            $validatedData = $request->validate([
                'current_password'          => 'required|string',
                'new_password'              => 'required|string|min:8|confirmed',
                'new_password_confirmation' => 'required|string|min:8',
            ]);

            // Check current password
            if ($user->password !== $validatedData['current_password']) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                    'errors'  => ['current_password' => ['Le mot de passe actuel est incorrect']],
                ], 422);
            }

            // Update password
            $user->password = $validatedData['new_password'];
            $user->save();

            Log::info('User password updated', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Password updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating password', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error updating password',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}