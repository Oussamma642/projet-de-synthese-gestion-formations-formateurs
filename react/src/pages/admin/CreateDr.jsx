import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

function CreateDr() {
    const navigate = useNavigate();
    const { setNotification, notification } = useStateContext();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        region_id: "",
        role_id: "",
    });

    // Extraire les listes des regions
    useEffect(() => {
        // Charger les régions au montage du composant
        axiosClient
            .get("/regions")
            .then(({ data }) => {
                setRegions(data);
                console.log(data);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des régions:", err);
            });
    }, []);

    // Extraire le role_id
    useEffect(() => {
        axiosClient
            .get("/roles")
            .then(({ data }) => {
                const role = data.find((item) => {
                    return item.name ==="dr";
                });
                
                setFormData({
                    ...formData,
                    role_id: role.id,
                });
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des régions:", err);
            });
    }, []);

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        setErrors(null);
        setLoading(true);

        try {
            // Créer d'abord l'utilisateur
            const userResponse = await axiosClient.post("/users", {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                role_id: formData.role_id,
            });

            console.log(userResponse);

            // Ensuite créer le DR avec l'ID de l'utilisateur créé
            await axiosClient.post("/drs", {
                user_id: userResponse.data.id,
                region_id: formData.region_id,
            });

            setNotification("Directeur Régional créé avec succès");
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                password_confirmation: "",
                region_id: "",
                role_id:""
            });

               // Attend 2 secondes, puis navigue
    setTimeout(() => {
        // Optionnel : clear la notification avant de naviguer
        setNotification(null);
        navigate("/dashboard/directeurs");
      }, 500);

            // navigate("/dashboard/directeurs");
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                    Créer un Directeur Régional
                </h1>

                {errors && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                {Object.keys(errors).map((key) => (
                                    <p
                                        key={key}
                                        className="text-sm text-red-600"
                                    >
                                        {errors[key][0]}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                Nom
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700">
                                Région
                            </label>
                            <select
                                value={formData.region_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        region_id: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            >
                                <option value="">
                                    Sélectionner une région
                                </option>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password_confirmation: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/directeurs")}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Création en cours..." : "Créer"}
                        </button>
                    </div>
                </form>
                {notification && (
                    <div className="fixed top-4 right-4 max-w-md bg-green-500 text-white p-4 rounded-md shadow-md z-50 text-center">
                        {notification}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateDr;
