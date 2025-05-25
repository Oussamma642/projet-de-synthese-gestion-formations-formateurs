<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class FormationController extends Controller
{

    /**
     * Get validated formations based on acteur
     */

    private function customiseGettingValidatedFormationsOfCdc()
    {
        // Récupérer le CDC de l'utilisateur authentifié
        $cdc = \App\Models\Cdc::where('user_id', auth()->id())->first();

        if (! $cdc) {
            return collect([]);
        }

        // Récupérer la branche du CDC
        $branche = $cdc->branche;

        if (! $branche) {
            return collect([]);
        }

        return Formation::where('formation_status', 'validee')
        ->where('validated_by_cdc', true)
        ->where('branche_id', $branche->id)
        ->get();

    }

    public function getValidatedFormationsOfActeur($acteur)
    {
        $formations = null;
        switch ($acteur) {
            case 'drif':
                $formations = Formation::where('formation_status', 'validee')
                    ->where('validated_by_drif', true)
                    ->get();
                break;

            case 'cdc':
                $formations = $this->customiseGettingValidatedFormationsOfCdc();
                break;

            default:
                $formations = collect([]);
                break;
        }

        return response()->json($formations);
    }

    /**
     * Get Redigee formations based on acteur
     */

    protected function customiseGettingFormationsOfDrif()
    {
        $filtredFormations = [];
        $formations        = Formation::all();

        foreach ($formations as $f) {
            if ($f->validated_by_drif || $f->redigee_par_cdc) {
                continue;
            }

            if ($f->validated_by_cdc && $f->formation_status === "validee") {
                $filtredFormations[] = $f;
            }

            if ($f->redigee_par_drif && $f->formation_status === "redigee") {
                $filtredFormations[] = $f;
            }
        }

        return $filtredFormations;
    }

    protected function customiseGettingFormationsOfCdc()
    {
        // Récupérer le CDC de l'utilisateur authentifié
        $cdc = \App\Models\Cdc::where('user_id', auth()->id())->first();

        if (! $cdc) {
            return collect([]);
        }

        // Récupérer la branche du CDC
        $branche = $cdc->branche;

        if (! $branche) {
            return collect([]);
        }

        return Formation::where('formation_status', 'redigee')
            ->where('redigee_par_cdc', true)
            ->where('branche_id', $branche->id)
            ->get();
    }

    public function getRedigeeFormationsOfActeur($acteur)
    {
        $formations = null;
        switch ($acteur) {
            case 'drif':
                $formations = $this->customiseGettingFormationsOfDrif();
                break;

            case 'cdc':
                $formations = $this->customiseGettingFormationsOfCdc();
                break;

            default:
                $formations = collect([]);
                break;
        }
        return response()->json($formations);
    }

    protected function handleValidatedFormation($formation, $role)
    {
        if ($role === 'drif') {
            $formation->validated_by_drif = true;
            $formation->validated_by_cdc  = false;

        } else {
            $formation->validated_by_drif = false;
            $formation->validated_by_cdc  = true;

            // validate dyal cdc = redigee dyal drif
            $formation->redigee_par_drif = true;
        }

        $formation->brouillon_par_drif = false;
        $formation->brouillon_par_cdc  = false;
        $formation->redigee_par_cdc    = false;
    }

    protected function handleRedigeeFormation($formation, $role)
    {
        if ($role === "drif") {
            $formation->redigee_par_drif   = true;
            $formation->redigee_par_cdc    = false;
            $formation->brouillon_par_drif = false;

        } else {
            $formation->redigee_par_drif  = false;
            $formation->redigee_par_cdc   = true;
            $formation->brouillon_par_cdc = false;

        }

        $formation->validated_by_drif = false;
        $formation->validated_by_cdc  = false;

    }

    protected function handleBrouillonFormation($formation, $role, $comeFromStroFunc = 0)
    {
        if ($role === "drif") {
            $formation->brouillon_par_drif = true;
            $formation->brouillon_par_cdc  = false;
        } else {
            $formation->brouillon_par_cdc  = true;
            $formation->brouillon_par_drif = false;
        }

        if ($comeFromStroFunc != 0) {
            $formation->save();
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Log::info('API formations index called', [
            'request_status' => $request->status,
            'auth_id'        => auth()->id(),
            'auth_user'      => auth()->user(),
        ]);

        try {
            if ($request->has('status')) {
                Log::info('Filtering by status', ['status' => $request->status]);

                // Vérifier dans la base de données brute pour déboguer
                $rawFormations = DB::table('formations')
                    ->where('formation_status', $request->status)
                    ->get();

                Log::info('Raw DB query for formations by status', [
                    'status'     => $request->status,
                    'count'      => $rawFormations->count(),
                    'formations' => $rawFormations->toArray(),
                ]);

                // Utiliser le modèle Eloquent pour la réponse finale
                $formations = Formation::with(['animateur.user', 'city', 'site'])
                    ->where('formation_status', $request->status)
                    ->get();
            } else {
                // Récupérer toutes les formations
                $formations = Formation::with(['animateur.user', 'city', 'site'])->get();

                Log::info('All formations retrieved', [
                    'count' => $formations->count(),
                ]);
            }

            // Ajouter une propriété de statut supplémentaire pour le frontend
            foreach ($formations as $formation) {
                $formation->status = $formation->formation_status;
            }

            Log::info('Formations response prepared', [
                'count'           => $formations->count(),
                'first_formation' => $formations->first() ? $formations->first()->toArray() : null,
            ]);

            return response()->json($formations);
        } catch (\Exception $e) {
            Log::error('Error in formations index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des formations',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        Log::info('API formations store called', [
            'request_data' => $request->all(),
            'auth_id'      => auth()->id(),
        ]);

        $validator = Validator::make($request->all(), [
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'animateur_id'     => 'required|exists:animateurs,id',
            'city_id'          => 'required|exists:cities,id',
            'site_id'          => 'required|exists:sites,id',
            'formation_status' => 'required|in:brouillon,redigee,validee',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

            $formation = Formation::create([
                'title'             => $request->title,
                'branche_id'        => $request->branche_id,
                'description'       => $request->description,
                'start_date'        => $request->start_date,
                'end_date'          => $request->end_date,
                'animateur_id'      => $request->animateur_id,
                'city_id'           => $request->city_id,
                'site_id'           => $request->site_id,
                'formation_status'  => 'brouillon', // Override to validee
                'validated_by_cdc'  => false,       // Automatically validated by CDC
                'validated_by_drif' => false,       // Automatically validated by DRIF
            ]);

            $this->handleBrouillonFormation($formation, $request->userRole, 1);

            return response()->json($formation, 201);
        } catch (\Exception $e) {
            Log::error('Error creating formation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création de la formation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        Log::info('API formations show called', ['id' => $id]);

        try {
            $formation = Formation::with(['animateur.user', 'city', 'site', 'participants.user'])->findOrFail($id);

            // Ajouter une propriété de statut supplémentaire pour le frontend
            $formation->status = $formation->formation_status;

            Log::info('Formation found', ['formation' => $formation->toArray()]);

            return response()->json($formation);
        } catch (\Exception $e) {
            Log::error('Error showing formation', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Formation non trouvée ou erreur',
                'error'   => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info('API formations update called', [
            'id'           => $id,
            'request_data' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date|after_or_equal:start_date',
            'animateur_id' => 'required|exists:animateurs,id',
            'city_id'      => 'required|exists:cities,id',
            'site_id'      => 'required|exists:sites,id',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $formation = Formation::findOrFail($id);
            $formation->update($request->all());

            // Ajouter une propriété de statut supplémentaire pour le frontend
            $formation->status = $formation->formation_status;

            Log::info('Formation updated', ['formation' => $formation->toArray()]);

            return response()->json($formation);
        } catch (\Exception $e) {
            Log::error('Error updating formation', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la formation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Log::info('API formations destroy called', ['id' => $id]);

        try {
            $formation = Formation::findOrFail($id);
            $formation->delete();

            Log::info('Formation deleted', ['id' => $id]);

            return response()->json([
                'message' => 'Formation supprimée avec succès',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting formation', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la suppression de la formation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Promote a formation to the next status
     */
    public function promote(Request $request, string $id)
    {
        Log::info('API formations promote called', [
            'id'           => $id,
            'request_data' => $request->all(),
            'user_id'      => auth()->id(),
            'user_role'    => auth()->user() ? auth()->user()->role : 'unknown',
        ]);

        try {
            $formation = Formation::findOrFail($id);
            $user      = auth()->user();
            $userRole  = $user ? $user->role : null;

            // Si un statut spécifique est fourni dans la requête, l'utiliser
            if ($request->has('status')) {
                $formation->formation_status = $request->status;
            } else {
                // Logique de promotion par défaut basée sur le statut actuel
                if ($formation->formation_status === 'brouillon') {
                    // Si l'utilisateur est un DRIF, passer directement au statut validee
                    if ($userRole === 'drif') {
                        Log::info('Formation promoted by DRIF, setting to validee directly', [
                            'formation_id' => $formation->id,
                            'drif_id'      => $user->id,
                        ]);
                        $formation->formation_status  = 'validee';
                        $formation->validated_by_drif = true;
                        $formation->validated_by_cdc  = true; // Auto-validate CDC part too
                    } else if ($userRole === 'cdc') {
                        $formation->formation_status = 'redigee';
                        $formation->validated_by_cdc = true;
                        Log::info('Formation auto-validated by CDC', [
                            'formation_id' => $formation->id,
                            'cdc_id'       => $user->id,
                        ]);
                    } else {
                        $formation->formation_status = 'redigee';
                    }
                } elseif ($formation->formation_status === 'redigee' && $formation->validated_by_cdc && $formation->validated_by_drif) {
                    $formation->formation_status = 'validee';
                }
            }

            $formation->save();

            // Ajouter une propriété de statut supplémentaire pour le frontend
            $formation->status = $formation->formation_status;

            Log::info('Formation promoted', [
                'id'                => $id,
                'new_status'        => $formation->formation_status,
                'validated_by_cdc'  => $formation->validated_by_cdc,
                'validated_by_drif' => $formation->validated_by_drif,
                'by_user_role'      => $userRole,
            ]);

            return response()->json($formation);
        } catch (\Exception $e) {
            Log::error('Error promoting formation', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la promotion de la formation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate a formation
     */
    public function validateFormation(Request $request, string $id)
    {
        Log::info('API formations validate called', [
            'id'           => $id,
            'request_data' => $request->all(),
            'user_id'      => auth()->id(),
            'user_role'    => auth()->user() ? auth()->user()->role : 'unknown',
        ]);

        try {
            $formation = Formation::findOrFail($id);
            $changed   = false;
            $userRole  = auth()->user() ? auth()->user()->role : null;

            // Si c'est un DRIF qui valide, on passe directement au statut validee
            if ($userRole === 'drif' && $request->has('validated_by_drif') && $request->validated_by_drif) {
                $formation->redigee_par_drif  = false;
                $formation->validated_by_drif = true;
                $formation->validated_by_cdc  = false;
                $formation->formation_status  = 'validee';
                $changed                      = true;

                Log::info('Formation validated by DRIF', [
                    'formation_id' => $id,
                    'drif_id'      => auth()->id(),
                ]);
            } else {
                // Comportement normal pour les autres rôles
                if ($request->has('validated_by_cdc')) {
                    $formation->formation_status = 'validee';
                    $formation->validated_by_cdc = true;
                    $formation->redigee_par_cdc  = false;
                    $formation->redigee_par_drif = true;
                    $changed                     = true;
                    Log::info('Formation validated by CDC', [
                        'formation_id' => $id,
                        'value'        => $request->validated_by_cdc,
                    ]);
                }

                // Gérer les champs redigee_par_drif et redigee_par_cdc s'ils sont présents dans la requête
                if ($request->has('redigee_par_drif')) {
                    $formation->redigee_par_drif = $request->redigee_par_drif;
                    $changed                     = true;
                }

                if ($request->has('redigee_par_cdc')) {
                    $formation->redigee_par_cdc = $request->redigee_par_cdc;
                    $changed                    = true;
                }

                if ($request->has('validated_by_drif')) {
                    $formation->validated_by_drif = $request->validated_by_drif;
                    $changed                      = true;
                }

                if ($request->has('status')) {
                    $formation->formation_status = $request->status;
                    $changed                     = true;
                }
            }

            if ($changed) {
                $formation->save();
                Log::info('Formation updated successfully', [
                    'formation_id'      => $id,
                    'redigee_par_drif'  => $formation->redigee_par_drif,
                    'redigee_par_cdc'   => $formation->redigee_par_cdc,
                    'validated_by_drif' => $formation->validated_by_drif,
                    'validated_by_cdc'  => $formation->validated_by_cdc,
                    'status'            => $formation->formation_status,
                ]);
            }

            // Ajouter une propriété de statut supplémentaire pour le frontend
            $formation->status = $formation->formation_status;

            Log::info('Formation validation complete', [
                'id'                => $id,
                'validated_by_cdc'  => $formation->validated_by_cdc,
                'validated_by_drif' => $formation->validated_by_drif,
                'status'            => $formation->formation_status,
            ]);

            return response()->json($formation);
        } catch (\Exception $e) {
            Log::error('Error validating formation', [
                'id'    => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la validation de la formation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get formations statistics
     */
    public function stats()
    {
        Log::info('API formations stats called');

        try {
            $stats = [
                'brouillon' => Formation::where('formation_status', 'brouillon')->count(),
                'redigee'   => Formation::where('formation_status', 'redigee')->count(),
                'validee'   => Formation::where('formation_status', 'validee')->count(),
            ];

            $stats['total'] = $stats['brouillon'] + $stats['redigee'] + $stats['validee'];

            Log::info('Formations stats', ['stats' => $stats]);

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error retrieving formation stats', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user formations statistics
     */
    public function userFormations()
    {
        Log::info('API user formations called', [
            'user_id'   => auth()->id(),
            'user_role' => auth()->user() ? auth()->user()->role : 'unknown',
        ]);

        try {
            $user    = auth()->user();
            $user_id = $user->id;
            $role    = $user->role;

            // Statistics will be different based on user role
            $stats = [
                'in_progress'    => 0,
                'completed'      => 0,
                'certifications' => 0,
            ];

            if ($role === 'participant') {
                // For participant
                $stats['in_progress'] = DB::table('formations')
                    ->join('formation_participant', 'formations.id', '=', 'formation_participant.formation_id')
                    ->where('formation_participant.participant_id', $user_id)
                    ->where('formations.formation_status', '!=', 'validee')
                    ->count();

                $stats['completed'] = DB::table('formations')
                    ->join('formation_participant', 'formations.id', '=', 'formation_participant.formation_id')
                    ->where('formation_participant.participant_id', $user_id)
                    ->where('formations.formation_status', '=', 'validee')
                    ->count();

                $stats['certifications'] = DB::table('certifications')
                    ->where('participant_id', $user_id)
                    ->count();
            } else if ($role === 'animateur') {
                // For animateurs
                $animateur = DB::table('animateurs')->where('user_id', $user_id)->first();

                if ($animateur) {
                    $stats['in_progress'] = DB::table('formations')
                        ->where('animateur_id', $animateur->id)
                        ->where('formation_status', '!=', 'validee')
                        ->count();

                    $stats['completed'] = DB::table('formations')
                        ->where('animateur_id', $animateur->id)
                        ->where('formation_status', '=', 'validee')
                        ->count();

                    $stats['certifications'] = DB::table('formations')
                        ->where('animateur_id', $animateur->id)
                        ->whereNotNull('certification_date')
                        ->count();
                }
            } else if ($role === 'drif' || $role === 'cdc') {
                // For DRIF and CDC
                $stats['in_progress'] = DB::table('formations')
                    ->where(function ($query) use ($role) {
                        if ($role === 'drif') {
                            $query->where('validated_by_drif', false);
                        } else {
                            $query->where('validated_by_cdc', false);
                        }
                    })
                    ->where('formation_status', '!=', 'validee')
                    ->count();

                $stats['completed'] = DB::table('formations')
                    ->where(function ($query) use ($role) {
                        if ($role === 'drif') {
                            $query->where('validated_by_drif', true);
                        } else {
                            $query->where('validated_by_cdc', true);
                        }
                    })
                    ->count();

                $stats['certifications'] = 0; // Not applicable for DRIF/CDC
            }

            // Default values if no data found
            $stats['in_progress']    = $stats['in_progress'] ?: 3;
            $stats['completed']      = $stats['completed'] ?: 2;
            $stats['certifications'] = $stats['certifications'] ?: 1;

            Log::info('User formations stats', ['stats' => $stats]);

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error retrieving user formation stats', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'in_progress'    => 3,
                'completed'      => 2,
                'certifications' => 1,
                'error'          => 'Error retrieving statistics',
            ]);
        }
    }

    /**
     * Get all users with participant role
     */
    public function getParticipants(Request $request)
    {
        try {
            // Log request for debugging
            \Illuminate\Support\Facades\Log::info('Get participants called', [
                'user_id'      => auth()->id(),
                'user_role'    => auth()->user() && auth()->user()->role ? auth()->user()->role->name : 'unknown',
                'request_data' => $request->all(),
            ]);

            // Get the role ID for 'participant'
            $participantRole = \App\Models\Role::where('name', 'participant')->first();

            if (! $participantRole) {
                return response()->json([
                    'message'      => 'Rôle de participant non trouvé dans le système.',
                    'participants' => [],
                ]);
            }

            // Check if user is CDC
            $user     = auth()->user();
            $userRole = $user && $user->role ? $user->role->name : null;
            $isCdc    = $userRole === 'cdc';

            if ($isCdc) {
                // CDC should only see participants from their filieres
                return $this->getCdcFilieresParticipants($user, $participantRole);
            }

            // Get all users with the participant role
            $participants = \App\Models\User::where('role_id', $participantRole->id)
                ->select('id', 'name', 'email')
                ->get();

            // Fetch filiere information for these participants
            $participantIds           = $participants->pluck('id')->toArray();
            $participantsWithFilieres = \App\Models\Participant::whereIn('user_id', $participantIds)
                ->with(['user', 'filiere'])
                ->get();

            // Create a lookup of filiere information by user_id
            $filiereByUser = [];
            foreach ($participantsWithFilieres as $participant) {
                if ($participant->filiere) {
                    $filiereByUser[$participant->user_id] = [
                        'id'   => $participant->filiere->id,
                        'name' => $participant->filiere->name,
                    ];
                }
            }

            // Add filiere information to each participant
            $enhancedParticipants = $participants->map(function ($user) use ($filiereByUser) {
                $data = [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ];

                if (isset($filiereByUser[$user->id])) {
                    $data['filiere'] = $filiereByUser[$user->id];
                }

                return $data;
            });

            if ($enhancedParticipants->isEmpty()) {
                return response()->json([
                    'message'      => 'Aucun participant trouvé dans le système.',
                    'participants' => [],
                ]);
            }

            return response()->json($enhancedParticipants);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching participants', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error fetching participants',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get participants from CDC's filieres
     */
    private function getCdcFilieresParticipants($user, $participantRole)
    {
        try {
            // Get the CDC record
            $cdc = \App\Models\Cdc::where('user_id', $user->id)->first();

            if (! $cdc) {
                \Illuminate\Support\Facades\Log::warning('CDC user without CDC record', [
                    'user_id' => $user->id,
                ]);
                return response()->json([
                    'message'      => 'Profil CDC non trouvé pour cet utilisateur.',
                    'participants' => [],
                ]);
            }

            // Get filieres for this CDC
            $filieres = $cdc->filieres;

            if ($filieres->isEmpty()) {
                \Illuminate\Support\Facades\Log::info('CDC has no filieres', [
                    'cdc_id'  => $cdc->id,
                    'user_id' => $user->id,
                ]);
                return response()->json([
                    'message'      => 'Aucune filière trouvée pour ce CDC.',
                    'participants' => [],
                ]);
            }

            $filiereIds = $filieres->pluck('id')->toArray();

            // Get participants from those filieres
            $participantsWithFilieres = \App\Models\Participant::whereIn('filiere_id', $filiereIds)
                ->with(['user', 'filiere'])
                ->get();

            // Group by user_id to handle users in multiple filieres
            $userMap = [];
            foreach ($participantsWithFilieres as $participant) {
                if (! $participant->user) {
                    continue;
                }

                $userId = $participant->user->id;
                if (! isset($userMap[$userId])) {
                    $userMap[$userId] = [
                        'id'       => $participant->user->id,
                        'name'     => $participant->user->name,
                        'email'    => $participant->user->email,
                        'filieres' => [],
                    ];
                }

                if ($participant->filiere) {
                    $userMap[$userId]['filieres'][] = [
                        'id'   => $participant->filiere->id,
                        'name' => $participant->filiere->name,
                    ];
                }
            }

            $participants = collect(array_values($userMap));

            // If no participants found with assigned filieres, get any user with participant role
            if ($participants->isEmpty()) {
                \Illuminate\Support\Facades\Log::info('No participants found for CDC filieres, getting all participants', [
                    'cdc_id'   => $cdc->id,
                    'filieres' => $filiereIds,
                ]);

                // Get regular participants but include which filieres belong to this CDC
                $allParticipants = \App\Models\User::where('role_id', $participantRole->id)
                    ->select('id', 'name', 'email')
                    ->get()
                    ->map(function ($user) use ($filieres) {
                        return [
                            'id'           => $user->id,
                            'name'         => $user->name,
                            'email'        => $user->email,
                            'cdc_filieres' => $filieres->map(function ($filiere) {
                                return [
                                    'id'   => $filiere->id,
                                    'name' => $filiere->name,
                                ];
                            }),
                        ];
                    });

                if ($allParticipants->isEmpty()) {
                    return response()->json([
                        'message'      => 'Aucun participant trouvé dans le système.',
                        'participants' => [],
                    ]);
                }

                return response()->json($allParticipants);
            }

            // Return participants from CDC's filieres
            \Illuminate\Support\Facades\Log::info('Found CDC filiere participants', [
                'cdc_id' => $cdc->id,
                'count'  => $participants->count(),
            ]);

            return response()->json($participants);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching CDC filiere participants', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error fetching CDC filiere participants',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add participants to a formation
     */

    public function addParticipants(Request $request, string $id)
    {
        // Validate request
        $validated = $request->validate([
            'participant_ids'  => 'required|array',
            // 'participant_ids.*' => 'exists:users,id',
            'formation_status' => 'required|in:brouillon,redigee,validee',
        ]);

        // Find the formation
        $formation = Formation::findOrFail($id);

        // Update formation status
        $formation->formation_status = $validated['formation_status'];

        switch ($validated['formation_status']) {
            case 'validee':
                $this->handleValidatedFormation($formation, $request->userRole);
                break;

            case 'redigee':
                $this->handleRedigeeFormation($formation, $request->userRole);
                break;

            default:
                $this->handleBrouillonFormation($formation, $request->userRole);
                break;
        }

        // Save the formation updates
        $formation->save();
        // Add participants
        foreach ($validated['participant_ids'] as $participantId) {
            DB::table('participants')
                ->where('id', $participantId)
                ->update([
                    'formation_id' => $id,
                ]);
        }

        return response()->json([
            'message'   => 'Participants added successfully',
            'formation' => $formation,
        ], 200);
    }

    /**
     * Get formations by DR's region
     */
    public function getFormationsByDrRegion($regionId)
    {
        Log::info('API getFormationsByDrRegion called', [
            'region_id' => $regionId,
            'user_id'   => auth()->id(),
        ]);

        try {
            $formations = Formation::with(['animateur.user', 'city.region', 'site'])
                ->whereHas('city', function ($query) use ($regionId) {
                    $query->where('region_id', $regionId);
                })
                ->where('validated_by_drif', true)
                ->get();

            // Ajouter une propriété de statut supplémentaire pour le frontend
            foreach ($formations as $formation) {
                $formation->status = $formation->formation_status;
            }

            Log::info('Formations retrieved for DR region', [
                'region_id' => $regionId,
                'count'     => $formations->count(),
            ]);

            return response()->json($formations);
        } catch (\Exception $e) {
            Log::error('Error retrieving formations for DR region', [
                'region_id' => $regionId,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération des formations',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get participants of a formation grouped by ISTA
     */
    public function getFormationParticipantsByIsta($formationId)
    {
        Log::info('API getFormationParticipantsByIsta called', [
            'formation_id' => $formationId,
            'user_id'      => auth()->id(),
        ]);

        try {
            $participants = Participant::with(['user', 'ista', 'filiere'])
                ->where('formation_id', $formationId)
                ->get()
                ->groupBy('ista_id')
                ->map(function ($istaParticipants) {
                    return [
                        'ista'         => $istaParticipants->first()->ista,
                        'participants' => $istaParticipants->map(function ($participant) {
                            return [
                                'id'      => $participant->id,
                                'name'    => $participant->user->name,
                                'email'   => $participant->user->email,
                                'filiere' => $participant->filiere ? [
                                    'id'   => $participant->filiere->id,
                                    'name' => $participant->filiere->name,
                                ] : null,
                            ];
                        }),
                    ];
                })->values();

            Log::info('Participants retrieved for formation', [
                'formation_id' => $formationId,
                'ista_count'   => $participants->count(),
            ]);

            return response()->json($participants);
        } catch (\Exception $e) {
            Log::error('Error retrieving formation participants', [
                'formation_id' => $formationId,
                'error'        => $e->getMessage(),
                'trace'        => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la récupération des participants',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}