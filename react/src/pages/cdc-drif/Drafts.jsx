import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';
import PageLoading from '../../components/ui/PageLoading';

export default function Drafts() {
    const { user } = useStateContext();
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, formationId: null });
    const [promoteDialog, setPromoteDialog] = useState({ open: false, formationId: null });
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryTimeout = 5000; // 5 secondes entre chaque tentative

    // Fonction de chargement des formations avec timeout et retry
    const fetchFormations = useCallback(async () => {
        if (retryCount >= maxRetries) {
            setError(`Impossible de charger les formations après ${maxRetries} tentatives. Veuillez vérifier votre connexion et rafraîchir la page.`);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Définir un timeout pour la requête
        const timeoutId = setTimeout(() => {
            console.error('La requête a pris trop de temps');
            setRetryCount(prev => prev + 1);
            fetchFormations();
        }, 10000); // 10 secondes timeout

        try {
            console.log('Fetching draft formations, attempt:', retryCount + 1);
            const response = await axiosClient.get('/formations?status=brouillon', {
                timeout: 8000 // 8 secondes timeout axios
            });
            
            clearTimeout(timeoutId);
            
            if (response.data && Array.isArray(response.data)) {
                console.log('Drafts found:', response.data.length);
                setFormations(response.data);
                setRetryCount(0); // Réinitialiser le compteur en cas de succès
            } else {
                console.error('Invalid response format:', response);
                setError('Format de réponse invalide du serveur');
                setRetryCount(prev => prev + 1);
                
                // Fallback data si nécessaire après plusieurs échecs
                if (retryCount >= maxRetries - 1) {
                    setFormations([]);
                }
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Error fetching draft formations:', err);
            setError(`Erreur lors du chargement des formations: ${err.message}`);
            
            // Réessayer après un délai
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
                if (retryCount < maxRetries) {
                    fetchFormations();
                }
            }, retryTimeout);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        fetchFormations();
    }, [fetchFormations]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openDeleteDialog = (formationId) => {
        setDeleteDialog({ open: true, formationId });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({ open: false, formationId: null });
    };

    const openPromoteDialog = (formationId) => {
        setPromoteDialog({ open: true, formationId });
    };

    const closePromoteDialog = () => {
        setPromoteDialog({ open: false, formationId: null });
    };

    const confirmDelete = async () => {
        const formationId = deleteDialog.formationId;
        closeDeleteDialog();
        setLoading(true);

        try {
            await axiosClient.delete(`/formations/${formationId}`);
            setFormations(prevFormations => prevFormations.filter(formation => formation.id !== formationId));
        } catch (err) {
            console.error('Error deleting formation:', err);
            setError('Erreur lors de la suppression de la formation');
        } finally {
            setLoading(false);
        }
    };

    const confirmPromote = async () => {
        console.log('Starting formation promotion');
        const formationId = promoteDialog.formationId;
        closePromoteDialog();
        setLoading(true);

        try {
            const userRole = localStorage.getItem('acteur');
            console.log('User role:', userRole);
            
            // Use patch instead of put to match the backend route
            const response = await axiosClient.patch(`/formations/${formationId}/promote`);
            console.log('Formation promoted response:', response.data);
            
            setFormations(prevFormations => prevFormations.filter(formation => formation.id !== formationId));
            
            // Message spécifique au rôle
            if (userRole === 'drif') {
                // DRIF auto-validates formations completely
                alert('En tant que DRIF, la formation a été complètement validée et déplacée dans les formations validées.');
            } else if (userRole === 'cdc') {
                alert('La formation est validée par vous (CDC) et requiert maintenant une validation du DRIF.');
            } else {
                alert('La formation a été finalisée avec succès.');
            }
        } catch (err) {
            console.error('Error promoting formation:', err);
            setError(`Erreur lors de la finalisation de la formation: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredFormations = formations.filter(formation => 
        formation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.animateur?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formation.city?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'Date non spécifiée';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('fr-FR', options);
        } catch (err) {
            console.error('Error formatting date:', dateString, err);
            return 'Date invalide';
        }
    };

    // Fonction pour obtenir le statut à afficher, en vérifiant les deux champs possibles
    const getDisplayStatus = (formation) => {
        return formation.status || formation.formation_status || 'inconnu';
    };

    return (
        <div className="container mx-auto py-6 px-4">
            <h1 className="text-2xl font-bold mb-6">Formations en brouillon</h1>

            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            ) : filteredFormations.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-4">
                        {searchTerm ? "Aucune formation ne correspond à votre recherche." : "Aucune formation en brouillon n'est disponible."}
                    </p>
                    <Link to="/dashboard/create-formation">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                            Créer une formation
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFormations.map(formation => (
                        <div key={formation.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-5 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-lg font-semibold text-gray-800 truncate">{formation.title}</h2>
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Brouillon</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatDate(formation.start_date)} - {formatDate(formation.end_date)}
                                </p>
                            </div>
                            <div className="p-5">
                                <p className="text-gray-600 line-clamp-3 mb-4">{formation.description}</p>
                                <div className="flex items-center text-gray-500 text-sm mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {formation.city?.nom || 'Lieu non spécifié'}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {formation.animateur?.user?.name || 'Animateur non spécifié'}
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                                <Link to={`/dashboard/edit-formation/${formation.id}`} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm">
                                    Modifier
                                </Link>
                                <button
                                    onClick={() => openPromoteDialog(formation.id)}
                                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                                >
                                    Finaliser
                                </button>
                                <button
                                    onClick={() => openDeleteDialog(formation.id)}
                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteDialog}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Promote Confirmation Dialog */}
            {promoteDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirmer la finalisation</h3>
                        <p className="mb-4">
                            Êtes-vous sûr de vouloir finaliser cette formation ?
                        </p>
                        {localStorage.getItem('acteur') === 'drif' && (
                            <p className="mb-4 text-sm bg-blue-50 p-2 rounded">
                                En tant que DRIF, la formation sera automatiquement validée et placée directement dans la section formations validées.
                            </p>
                        )}
                        {localStorage.getItem('acteur') === 'cdc' && (
                            <p className="mb-4 text-sm bg-blue-50 p-2 rounded">
                                En tant que CDC, la formation sera automatiquement validée par vous, et nécessitera la validation d'un DRIF.
                            </p>
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closePromoteDialog}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmPromote}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                            >
                                Finaliser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}   
