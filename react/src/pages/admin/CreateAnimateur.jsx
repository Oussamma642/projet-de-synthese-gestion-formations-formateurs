 import React, { useState, useEffect } from "react";
    import { useNavigate, useParams } from "react-router-dom";
    import axiosClient from "../../axios-client";
    import { useStateContext } from "../../contexts/ContextProvider";

    function CreateAnimateur() {
        const navigate = useNavigate();
        const { id } = useParams(); // Récupérer l'ID s'il est présent dans l'URL
        const isEditMode = !!id; // Mode édition si un ID est présent
        const { setNotification, notification } = useStateContext();
        const [loading, setLoading] = useState(false);
        const [loadingData, setLoadingData] = useState(isEditMode);
        const [errors, setErrors] = useState(null);
        const [animateurData, setAnimateurData] = useState(null);
        const [formData, setFormData] = useState({
            name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
            role_id: "",
        });

        // Charger les données de l'animateur en mode édition
        useEffect(() => {
            // Obtenir le role_id de animateur
            axiosClient.get("/roles").then(({ data }) => {
                const role = data.find((item) => item.name === "animateur");
                if (role) {
                    setFormData((prev) => ({ ...prev, role_id: role.id }));
                }
            }).catch(err => {
                console.error("Erreur lors du chargement des rôles:", err);
            });

            // Si mode édition, charger les données de l'animateur
            if (isEditMode) {
                axiosClient.get(`/animateurs/${id}`)
                    .then(({ data }) => {
                        setAnimateurData(data);
                        // Pré-remplir le formulaire avec les données utilisateur
                        if (data.user) {
                            setFormData({
                                name: data.user.name || "",
                                email: data.user.email || "",
                                phone: data.user.phone || "",
                                password: "", // Laisser vide pour le mode édition
                                password_confirmation: "",
                                role_id: data.user.role_id,
                            });
                        }
                        setLoadingData(false);
                    })
                    .catch(err => {
                        console.error("Erreur lors du chargement de l'animateur:", err);
                        setLoadingData(false);
                    });
            }
        }, [id, isEditMode]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setErrors(null);
            setLoading(true);

            try {
                if (isEditMode) {
                    // Mode édition
                    const userData = {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        role_id: formData.role_id,
                    };

                    // Ajouter le mot de passe seulement s'il est fourni
                    if (formData.password) {
                        userData.password = formData.password;
                        userData.password_confirmation = formData.password_confirmation;
                    }

                    // Mettre à jour l'utilisateur associé à l'animateur
                    await axiosClient.put(`/users/${animateurData.user.id}`, userData);

                    setNotification("Animateur modifié avec succès");
                    navigate("/dashboard/animateurs");
                } else {
                    // Mode création
                    // Créer l'utilisateur
                    const userResponse = await axiosClient.post("/users", {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        password_confirmation: formData.password_confirmation,
                        role_id: formData.role_id,
                    });

                    // Utilisateur créé avec succès

                    // Associer à la table `animateurs`
                    await axiosClient.post("/animateurs", {
                        user_id: userResponse.data.id,
                    });

                    // Animateur associé avec succès

                    setNotification("Animateur créé avec succès");
                    // Vider le formulaire
                    setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        password_confirmation: "",
                        role_id: "",
                    });
                    navigate("/dashboard/animateurs");
                }
            } catch (err) {
                if (err.response && err.response.data.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    console.error(`Erreur lors de la ${isEditMode ? 'modification' : 'création'} de l'animateur:`, err);
                }
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                        {isEditMode ? "Modifier l'Animateur" : "Créer un Animateur"}
                    </h1>

                    {errors && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    {Object.keys(errors).map((key) => (
                                        <p key={key} className="text-sm text-red-600">
                                            {errors[key][0]}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Téléphone
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Confirmation
                                </label>
                                <input
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password_confirmation: e.target.value })
                                    }
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                {loading ? (isEditMode ? "Modification en cours..." : "Création en cours...") : (isEditMode ? "Enregistrer" : "Créer")}
                            </button>
                        </div>
                    </form>

                    {notification && (
                        <div className="mt-6 p-4 bg-green-500 text-white rounded-md shadow">
                            {notification}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    export default CreateAnimateur;

