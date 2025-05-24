import React, { useState, useEffect, useCallback } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import axiosClient from '../../axios-client';
import PageLoading from '../../components/ui/PageLoading';

export default function Profile() {
    const { user } = useStateContext();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        bio: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [formError, setFormError] = useState({});
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Charger les données du profil avec retry en cas d'échec
    const fetchProfileData = useCallback(async () => {
        if (retryCount >= maxRetries) {
            setError(`Impossible de charger vos données de profil après ${maxRetries} tentatives.`);
            setLoading(false);
            
            // Utiliser les données de l'utilisateur actuel comme fallback
            if (user) {
                setProfile({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    position: user.role === 'drif' ? 'Délégué Régional à l\'Ingénierie de Formation' : 
                              user.role === 'cdc' ? 'Chef de Centre' : user.role || '',
                    bio: 'Informations non disponibles. Veuillez les mettre à jour.',
                    role: user.role
                });
                
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    position: user.role === 'drif' ? 'Délégué Régional à l\'Ingénierie de Formation' : 
                              user.role === 'cdc' ? 'Chef de Centre' : user.role || '',
                    bio: '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
            return;
        }

        setLoading(true);
        setError(null);

        // Définir un timeout pour la requête
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('La requête a pris trop de temps');
            setRetryCount(prev => prev + 1);
            fetchProfileData();
        }, 8000); // 8 secondes timeout

        try {
            console.log('Fetching profile data, attempt:', retryCount + 1);
            const response = await axiosClient.get('/profile', {
                signal: controller.signal,
                timeout: 6000 // 6 secondes timeout axios
            });
            
            clearTimeout(timeoutId);
            
            if (response.data) {
                console.log('Profile data received:', response.data);
                setProfile(response.data);
                // Préremplir le formulaire avec les données existantes
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    position: response.data.position || '',
                    bio: response.data.bio || '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                setRetryCount(0); // Réinitialiser le compteur en cas de succès
            } else {
                console.error('Invalid or empty profile data received');
                throw new Error('Format de réponse invalide');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Error fetching profile:', err.message);
            setRetryCount(prev => prev + 1);
            
            // Si nous avons atteint le nombre maximal de tentatives, utiliser les données de l'utilisateur actuel
            if (retryCount >= maxRetries - 1 && user) {
                setProfile({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    position: user.role === 'drif' ? 'Délégué Régional à l\'Ingénierie de Formation' : 
                              user.role === 'cdc' ? 'Chef de Centre' : user.role || '',
                    bio: 'Informations non disponibles. Veuillez les mettre à jour.',
                    role: user.role
                });
                
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    position: user.role === 'drif' ? 'Délégué Régional à l\'Ingénierie de Formation' : 
                              user.role === 'cdc' ? 'Chef de Centre' : user.role || '',
                    bio: '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                
                setError('Données limitées chargées depuis la session. Certaines informations peuvent manquer.');
            } else {
                // Sinon, réessayer après un délai
                setTimeout(() => {
                    if (retryCount < maxRetries) {
                        fetchProfileData();
                    }
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount, user, maxRetries]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEditMode = () => {
        setEditMode(prev => !prev);
        setFormError({});
        setUpdateSuccess(false);
        setPasswordSuccess(false);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name) errors.name = 'Le nom est requis';
        if (!formData.email) errors.email = 'L\'email est requis';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format d\'email invalide';
        
        if (formData.new_password) {
            if (!formData.current_password) errors.current_password = 'Mot de passe actuel requis';
            if (formData.new_password.length < 8) errors.new_password = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
            if (formData.new_password !== formData.confirm_password) errors.confirm_password = 'Les mots de passe ne correspondent pas';
        }
        
        setFormError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError(null);
        setUpdateSuccess(false);
        setPasswordSuccess(false);
        
        try {
            const profileData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                bio: formData.bio
            };
            
            const response = await axiosClient.put('/profile', profileData);
            console.log('Profile updated:', response.data);
            
            // Mettre à jour les données affichées
            setProfile(prev => ({
                ...prev,
                ...profileData
            }));
            
            setUpdateSuccess(true);
            
            // Si un changement de mot de passe est demandé
            if (formData.new_password) {
                const passwordData = {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                    confirm_password: formData.confirm_password
                };
                
                try {
                    await axiosClient.put('/profile/password', passwordData);
                    setPasswordSuccess(true);
                    
                    // Réinitialiser les champs de mot de passe
                    setFormData(prev => ({
                        ...prev,
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                    }));
                } catch (pwdErr) {
                    console.error('Error updating password:', pwdErr);
                    setError('Erreur lors de la mise à jour du mot de passe. Vérifiez votre mot de passe actuel.');
                    setFormError(prev => ({
                        ...prev,
                        current_password: 'Mot de passe incorrect'
                    }));
                }
            }
            
            // Quitter le mode édition après un court délai
            setTimeout(() => {
                if (!error) {
                    setEditMode(false);
                }
            }, 1500);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Erreur lors de la mise à jour du profil');
            
            if (err.response?.data?.errors) {
                setFormError(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return <PageLoading />;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-blue-500 text-white flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Mon Profil</h1>
                    <button 
                        onClick={toggleEditMode}
                        className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50"
                    >
                        {editMode ? 'Annuler' : 'Modifier'}
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
                        <p className="font-medium">Problème de connexion</p>
                        <p>{error}</p>
                        <div className="mt-3 flex items-center">
                            <button 
                                onClick={() => {
                                    setRetryCount(0);
                                    fetchProfileData();
                                }}
                                className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-md flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Réessayer
                            </button>
                            <p className="ml-3 text-sm text-red-600">
                                {profile ? "Un profil partiel a été chargé depuis votre session. Vous pouvez l'utiliser ou réessayer." : ""}
                            </p>
                        </div>
                    </div>
                )}

                {updateSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4 rounded">
                        <p>Profil mis à jour avec succès!</p>
                    </div>
                )}

                {passwordSuccess && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4 rounded">
                        <p>Mot de passe mis à jour avec succès!</p>
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne gauche: Avatar et infos de base */}
                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="bg-gray-200 rounded-full h-32 w-32 flex items-center justify-center overflow-hidden mb-4 border-4 border-blue-100">
                                    {profile?.image ? (
                                        <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-5xl text-gray-400">{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold">{profile?.name || "Nom non disponible"}</h2>
                                <p className="text-gray-500 mb-2">{profile?.position || "Poste non spécifié"}</p>
                                
                                {/* Role Badge */}
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    profile?.role === 'drif' ? 'bg-blue-100 text-blue-800' : 
                                    profile?.role === 'cdc' ? 'bg-green-100 text-green-800' :
                                    profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    profile?.role === 'animateur' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {profile?.role === 'drif' ? 'Délégué Régional (DRIF)' : 
                                     profile?.role === 'cdc' ? 'Chef de Centre (CDC)' :
                                     profile?.role === 'admin' ? 'Administrateur' :
                                     profile?.role === 'animateur' ? 'Formateur Animateur' :
                                     profile?.role || 'Utilisateur'}
                                </div>
                            </div>
                            
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Coordonnées
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{profile?.email || "Email non disponible"}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{profile?.phone || "Téléphone non spécifié"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Activité et Statistiques
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Formations créées</p>
                                                <p className="text-lg font-bold text-blue-700">{profile?.stats?.created || 0}</p>
                                            </div>
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Formations validées</p>
                                                <p className="text-lg font-bold text-green-700">{profile?.stats?.validated || 0}</p>
                                            </div>
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {profile?.role === 'drif' && (
                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500">Regions couvertes</p>
                                                    <p className="text-lg font-bold text-purple-700">{profile?.stats?.regions || 1}</p>
                                                </div>
                                                <div className="p-2 bg-purple-100 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {profile?.role === 'cdc' && (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500">Centres gérés</p>
                                                    <p className="text-lg font-bold text-orange-700">{profile?.stats?.centers || 1}</p>
                                                </div>
                                                <div className="p-2 bg-orange-100 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Dernière activité</p>
                                                <p className="text-sm font-medium text-yellow-700">
                                                    {profile?.stats?.lastActive ? new Date(profile.stats.lastActive).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-yellow-100 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Colonne droite: Informations détaillées / Formulaire d'édition */}
                        <div className="lg:col-span-2">
                            {!editMode ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-3 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            À propos
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-gray-600">
                                                {profile?.bio || "Aucune information biographique disponible."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium mb-3 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Informations professionnelles
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-500">Nom complet</span>
                                                    <span className="font-medium text-gray-800">{profile?.name || "Non spécifié"}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-500">Email professionnel</span>
                                                    <span className="font-medium text-gray-800">{profile?.email || "Non spécifié"}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-500">Téléphone</span>
                                                    <span className="font-medium text-gray-800">{profile?.phone || "Non spécifié"}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-500">Fonction</span>
                                                    <span className="font-medium text-gray-800">{profile?.position || "Non spécifié"}</span>
                                                </div>
                                                
                                                {profile?.institution && (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-500">Institution</span>
                                                        <span className="font-medium text-gray-800">{profile.institution}</span>
                                                    </div>
                                                )}
                                                
                                                {profile?.department && (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-500">Département</span>
                                                        <span className="font-medium text-gray-800">{profile.department}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium mb-3 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Sécurité
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">Mot de passe</p>
                                                    <p className="text-sm text-gray-500">Dernière modification: {profile?.passwordLastChanged ? new Date(profile.passwordLastChanged).toLocaleDateString('fr-FR') : 'Inconnue'}</p>
                                                </div>
                                                <button 
                                                    onClick={toggleEditMode}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                                >
                                                    Modifier
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md ${formError.name ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formError.name && <p className="text-red-500 text-xs mt-1">{formError.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md ${formError.email ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formError.email && <p className="text-red-500 text-xs mt-1">{formError.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                                            <input
                                                type="text"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        ></textarea>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium mb-3">Changer de mot de passe</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                                <input
                                                    type="password"
                                                    name="current_password"
                                                    value={formData.current_password}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border rounded-md ${formError.current_password ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                {formError.current_password && <p className="text-red-500 text-xs mt-1">{formError.current_password}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                                <input
                                                    type="password"
                                                    name="new_password"
                                                    value={formData.new_password}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border rounded-md ${formError.new_password ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                {formError.new_password && <p className="text-red-500 text-xs mt-1">{formError.new_password}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                                <input
                                                    type="password"
                                                    name="confirm_password"
                                                    value={formData.confirm_password}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-3 py-2 border rounded-md ${formError.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                {formError.confirm_password && <p className="text-red-500 text-xs mt-1">{formError.confirm_password}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                                                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="inline-block animate-spin mr-2">⟳</span>
                                                    Enregistrement...
                                                </>
                                            ) : 'Enregistrer les modifications'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 