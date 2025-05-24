import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';

export default function ViewFormation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useStateContext();
    const [formation, setFormation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [canValidate, setCanValidate] = useState(false);
    const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchFormation();
    }, [id]);

    useEffect(() => {
        if (formation && user) {
            const isUserDrif = user.role === 'drif';
            const isUserCdc = user.role === 'cdc';
            
            setCanValidate(
                (isUserDrif && !formation.validated_by_drif && formation.status === 'redigee') ||
                (isUserCdc && !formation.validated_by_cdc && formation.status === 'redigee')
            );
        }
    }, [formation, user]);

    const fetchFormation = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/formations/${id}`);
            setFormation(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching formation details:', err);
            setError('Erreur lors du chargement des détails de la formation');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosClient.delete(`/formations/${id}`);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error deleting formation:', err);
            setError('Erreur lors de la suppression de la formation');
        }
    };

    const handleValidate = async () => {
        setLoading(true);
        try {
            const userRole = user?.role || localStorage.getItem('acteur');
            console.log('Validating formation as', userRole);
            
            // Determine what validation fields to update
            const isValidatedByDrif = userRole === 'drif';
            const isValidatedByCdc = userRole === 'cdc';
            
            // Check if this will complete the validation
            // DRIF can now fully validate without CDC validation
            const willBeFullyValidated = 
                isValidatedByDrif || 
                (isValidatedByCdc && formation.validated_by_drif);
            
            // Prepare the validation payload
            const payload = {
                validated_by_drif: isValidatedByDrif ? true : formation.validated_by_drif,
                validated_by_cdc: isValidatedByCdc ? true : formation.validated_by_cdc
            };
            
            // If this will complete the validation, update status to 'validee'
            if (willBeFullyValidated) {
                payload.status = 'validee';
            }
            
            console.log('Sending validation payload:', payload);
            
            const response = await axiosClient.patch(`/formations/${id}/validate`, payload);
            console.log('Validation response:', response.data);
            
            // Update the formation with the response data
            setFormation(response.data);
            
            // Show appropriate message
            if (willBeFullyValidated) {
                showMessage(isValidatedByDrif ? 'Formation validée par DRIF et marquée comme validée !' : 'Formation complètement validée !', 'success');
                // Redirect to validees after a delay if fully validated
                setTimeout(() => {
                    navigate('/dashboard/validees');
                }, 2000);
            } else {
                showMessage(`Formation validée par ${isValidatedByDrif ? 'DRIF' : 'CDC'}`, 'success');
            }
            
            // Close dialog
            setIsValidateDialogOpen(false);
        } catch (err) {
            console.error('Error validating formation:', err);
            showMessage(`Erreur lors de la validation: ${err.response?.data?.message || err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'brouillon':
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Brouillon</span>;
            case 'redigee':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Rédigée</span>;
            case 'validee':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Validée</span>;
            default:
                return null;
        }
    };

    // Show a message (success or error) and auto-clear it after 5 seconds
    const showMessage = (message, type = 'success') => {
        if (type === 'error') {
            setError(message);
            // Clear error message after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        } else {
            setSuccessMessage(message);
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Retour au tableau de bord
                </Link>
                <div className="flex space-x-2">
                    {formation && formation.status !== 'validee' && (
                        <button 
                            onClick={() => setConfirmDelete(true)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md shadow"
                        >
                            Supprimer
                        </button>
                    )}
                    {formation && (
                        <Link to={`/dashboard/edit-formation/${id}`}>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                                Modifier
                            </button>
                        </Link>
                    )}
                    {canValidate && (
                        <button 
                            onClick={() => setIsValidateDialogOpen(true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow"
                        >
                            Valider
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p>{error}</p>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                    <p>{successMessage}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : formation ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl font-bold text-gray-800">{formation.title}</h1>
                            <div className="flex space-x-2">
                                {getStatusBadge(formation.status)}
                                {formation.status === 'redigee' && (
                                    <>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${formation.validated_by_cdc ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            CDC {formation.validated_by_cdc ? '✓' : '⏳'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${formation.validated_by_drif ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            DRIF {formation.validated_by_drif ? '✓' : '⏳'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Détails de la formation</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                        <p className="mt-1 text-gray-800 whitespace-pre-line">{formation.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
                                            <p className="mt-1 text-gray-800">{formatDate(formation.start_date)}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Date de fin</h3>
                                            <p className="mt-1 text-gray-800">{formatDate(formation.end_date)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-4">Intervenants et lieu</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Animateur</h3>
                                        <p className="mt-1 text-gray-800">{formation.animateur?.user?.name || 'Non spécifié'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Ville</h3>
                                            <p className="mt-1 text-gray-800">{formation.city?.nom || 'Non spécifié'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Site</h3>
                                            <p className="mt-1 text-gray-800">{formation.site?.name || 'Non spécifié'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Participants</h2>
                            {formation.participants && formation.participants.length > 0 ? (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <ul className="divide-y divide-gray-200">
                                        {formation.participants.map(participant => (
                                            <li key={participant.id} className="py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            {participant.user?.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{participant.user?.name}</p>
                                                        <p className="text-sm text-gray-500">{participant.user?.email}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-gray-500">Aucun participant inscrit pour le moment.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <div>
                                <span>Créée le {formatDate(formation.created_at)}</span>
                                {formation.updated_at !== formation.created_at && (
                                    <span className="ml-4">Dernière modification le {formatDate(formation.updated_at)}</span>
                                )}
                            </div>
                            <div>
                                Référence: #{formation.id}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">Formation non trouvée.</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-4">
                            Êtes-vous sûr de vouloir supprimer la formation "{formation?.title}"? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button 
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                                onClick={handleDelete}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Validate Confirmation Dialog */}
            {isValidateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Confirmer la validation</h3>
                        <p className="text-gray-600 mb-4">
                            Êtes-vous sûr de vouloir valider la formation "{formation?.title}"?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button 
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                                onClick={() => setIsValidateDialogOpen(false)}
                            >
                                Annuler
                            </button>
                            <button 
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                                onClick={handleValidate}
                            >
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 