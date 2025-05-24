<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnimateurController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CdcController;
use App\Http\Controllers\Api\DrController;
use App\Http\Controllers\Api\DrifController;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('/drifs', DrifController::class);

    // Formation routes
    Route::apiResource('/formations', FormationController::class);
    Route::patch('/formations/{id}/promote', [FormationController::class, 'promote']);
    Route::patch('/formations/{id}/validate', [FormationController::class, 'validateFormation']);
    Route::post('/formations/{id}/participants', [FormationController::class, 'addParticipants']);
    Route::get('/formations/stats', [FormationController::class, 'stats']);
    Route::get('/formations/{id}/participants-by-ista', [FormationController::class, 'getFormationParticipantsByIsta']);
    // Get validated formations based on acteur
    Route::get('/formations/validee/{acteur}', [FormationController::class, 'getValidatedFormationsOfActeur']);
    // Get Redigee formations based on acteur
    Route::get('/formations/redigee/{acteur}', [FormationController::class, 'getRedigeeFormationsOfActeur']);
    Route::get('/formations/dr-region/{regionId}', [FormationController::class, 'getFormationsByDrRegion']);

    // User routes
    Route::get('/user/formations', [FormationController::class, 'userFormations']);
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);

    // ISTA routes
    Route::get('/istas', [AdminController::class, 'getIstas']);
    Route::post('/istas', [AdminController::class, 'createIsta']);
    Route::get('/istas/{id}', [AdminController::class, 'getIsta']);
    Route::put('/istas/{id}', [AdminController::class, 'updateIsta']);
    Route::delete('/istas/{id}', [AdminController::class, 'deleteIsta']);

    // Filière routes
    Route::get('/filieres', [AdminController::class, 'getFilieres']);
    Route::get('/filieres/cdc/{id}', [CdcController::class, 'getFilieresOfCdc']);

    Route::post('/filieres', [AdminController::class, 'createFiliere']);
    Route::get('/filieres/{id}', [AdminController::class, 'getFiliere']);
    Route::put('/filieres/{id}', [AdminController::class, 'updateFiliere']);
    Route::delete('/filieres/{id}', [AdminController::class, 'deleteFiliere']);

    // Autres routes pour les ressources utilisées dans les formulaires de formation
    Route::get('/animateurs', function () {
        return response()->json(App\Models\Animateur::with('user')->get());
    });

    // Participant routes
    Route::apiResource('/participants', ParticipantController::class);

    Route::get('/cities', function () {
        return response()->json(App\Models\City::all());
    });

    Route::get('/sites', function () {
        return response()->json(App\Models\Site::all());
    });

    Route::get('/roles', function () {
        return response()->json(App\Models\Role::all());
    });

    // User and DR routes
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/drs', DrController::class);
    // Routes to get the dr that belongs to the auth user;
    Route::get('/drs/user/{id}', [DrController::class, 'getDrOfAuthUser']);

    // Admin stats
    Route::get('/admin/stats', [AdminController::class, 'stats']);

    // Region routes
    Route::apiResource('/regions', RegionController::class);

    // Debug route
    Route::get('/debug-participants', function () {
        try {
            $participants = App\Models\Participant::all();
            return [
                'count'        => $participants->count(),
                'data'         => $participants,
                'tables_exist' => [
                    'formations' => Schema::hasTable('formations'),
                    'istas'      => Schema::hasTable('istas'),
                    'users'      => Schema::hasTable('users'),
                    'filieres'   => Schema::hasTable('filieres'),
                ],
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    });

    Route::put('/participants/{participant}', [ParticipantController::class, 'update']);
    Route::patch('/participants/{participant}', [ParticipantController::class, 'update']);
    Route::delete('/participants/{participant}', [ParticipantController::class, 'destroy']);

    // Animateur and CDC routes
    Route::apiResource('/animateurs', AnimateurController::class);
    Route::apiResource('/cdcs', CdcController::class);
    Route::get('/cdcs/auth-user/{userId}', [CdcController::class, 'getCdcOfAuthUser']);
    Route::put('/cdcs/{id}/filieres', [CdcController::class, 'updateFilieres']);
});

// Authentication route
Route::post('/login', [AuthController::class, 'login']);