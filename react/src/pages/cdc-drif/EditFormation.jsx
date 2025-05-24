import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';

export default function EditFormation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setNotification } = useStateContext();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        animateur_id: '',
        city_id: '',
        site_id: ''
    });
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [animateurs, setAnimateurs] = useState([]);
    const [cities, setCities] = useState([]);
    const [sites, setSites] = useState([]);
    const [originalFormation, setOriginalFormation] = useState(null);

    useEffect(() => {
        fetchFormation();
        fetchDropdownData();
    }, [id]);

    const fetchFormation = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/formations/${id}`);
            
            const formation = response.data;
            setOriginalFormation(formation);
            
            setFormData({
                title: formation.title || '',
                description: formation.description || '',
                start_date: formation.start_date ? formatDateForInput(formation.start_date) : '',
                end_date: formation.end_date ? formatDateForInput(formation.end_date) : '',
                animateur_id: formation.animateur?.id || '',
                city_id: formation.city?.id || '',
                site_id: formation.site?.id || ''
            });
            
            setError(null);
        } catch (err) {
            console.error('Error fetching formation:', err);
            setError('Erreur lors du chargement de la formation');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [animateursRes, citiesRes, sitesRes] = await Promise.all([
                axiosClient.get('/animateurs'),
                axiosClient.get('/cities'),
                axiosClient.get('/sites')
            ]);
            
            setAnimateurs(animateursRes.data);
            setCities(citiesRes.data);
            setSites(sitesRes.data);
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
            setError('Erreur lors du chargement des données');
        }
    };

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title.trim()) {
            errors.title = 'Le titre est requis';
        }
        
        if (!formData.description.trim()) {
            errors.description = 'La description est requise';
        }
        
        if (!formData.start_date) {
            errors.start_date = 'La date de début est requise';
        }
        
        if (!formData.end_date) {
            errors.end_date = 'La date de fin est requise';
        } else if (formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            errors.end_date = 'La date de fin doit être après la date de début';
        }
        
        if (!formData.animateur_id) {
            errors.animateur_id = 'L\'animateur est requis';
        }
        
        if (!formData.city_id) {
            errors.city_id = 'La ville est requise';
        }
        
        if (!formData.site_id) {
            errors.site_id = 'Le site est requis';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitLoading(true);
        
        try {
            await axiosClient.put(`/formations/${id}`, formData);
            
            setNotification('Formation mise à jour avec succès');
            navigate(`/dashboard/view-formation/${id}`);
        } catch (err) {
            console.error('Error updating formation:', err);
            
            if (err.response && err.response.data.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setError('Erreur lors de la mise à jour de la formation');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const canEditFormation = () => {
        if (!originalFormation) return false;
        
        // Allow editing if formation is in 'brouillon' or 'redigee' status
        return originalFormation.status === 'brouillon' || originalFormation.status === 'redigee';
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <Link 
                    to={`/dashboard/view-formation/${id}`} 
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Retour aux détails
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Modifier la formation</h1>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-6 rounded" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : !canEditFormation() ? (
                    <div className="p-6">
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
                            <p>Cette formation ne peut pas être modifiée car elle est déjà validée.</p>
                        </div>
                        <div className="mt-4 text-center">
                            <Link 
                                to={`/dashboard/view-formation/${id}`}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow inline-block"
                            >
                                Retour aux détails
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Titre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.title ? 'border-red-300' : ''
                                    }`}
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.description ? 'border-red-300' : ''
                                    }`}
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                        Date de début <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.start_date ? 'border-red-300' : ''
                                        }`}
                                    />
                                    {formErrors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                        Date de fin <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.end_date ? 'border-red-300' : ''
                                        }`}
                                    />
                                    {formErrors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="animateur_id" className="block text-sm font-medium text-gray-700">
                                    Animateur <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="animateur_id"
                                    name="animateur_id"
                                    value={formData.animateur_id}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        formErrors.animateur_id ? 'border-red-300' : ''
                                    }`}
                                >
                                    <option value="">Sélectionner un animateur</option>
                                    {animateurs.map(animateur => (
                                        <option key={animateur.id} value={animateur.id}>
                                            {animateur.user.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.animateur_id && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.animateur_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="city_id"
                                        name="city_id"
                                        value={formData.city_id}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.city_id ? 'border-red-300' : ''
                                        }`}
                                    >
                                        <option value="">Sélectionner une ville</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.id}>
                                                {city.nom}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.city_id && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.city_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="site_id" className="block text-sm font-medium text-gray-700">
                                        Site <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="site_id"
                                        name="site_id"
                                        value={formData.site_id}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            formErrors.site_id ? 'border-red-300' : ''
                                        }`}
                                    >
                                        <option value="">Sélectionner un site</option>
                                        {sites.map(site => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.site_id && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.site_id}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Link 
                                to={`/dashboard/view-formation/${id}`}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md shadow"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow flex items-center"
                            >
                                {submitLoading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 