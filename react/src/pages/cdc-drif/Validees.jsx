import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../axios-client';
import PageLoading from '../../components/ui/PageLoading';

export default function Validees() {
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFormations();
    }, []);

    const fetchFormations = async () => {
        setLoading(true);
        setError(null);

        // API => `formations/validee/${acteur}`


        try {
            console.log('Fetching formations with status: validee');
            const response = await axiosClient.get(`/formations/validee/${localStorage.getItem("acteur")}`);
            console.log('API Response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                console.log('Validées trouvées:', response.data.length);
                setFormations(response.data);
            } else {
                console.error('Invalid response format:', response);
                setError('Format de réponse invalide du serveur');
            }
        } catch (err) {
            console.error('Error fetching formations:', err);
            setError('Erreur lors du chargement des formations. Détails: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Formations validées</h1>
                <Link to="/dashboard/create-formation">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                        Créer une formation
                    </button>
                </Link>
            </div>

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
                        {searchTerm ? "Aucune formation ne correspond à votre recherche." : "Aucune formation validée n'est disponible."}
                    </p>
                    <Link to="/dashboard/redigees">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                            Voir les formations rédigées
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
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Validée</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatDate(formation.start_date)} - {formatDate(formation.end_date)}
                                </p>
                            </div>
                            <div className="p-5">
                                <p className="text-gray-600 line-clamp-3 mb-4">{formation.description}</p>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
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
                                
                                <div className="mt-4 flex items-center text-gray-500 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    Validée par DRIF et CDC
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                                <Link to={`/dashboard/view-formation/${formation.id}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
                                    Voir les détails
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
