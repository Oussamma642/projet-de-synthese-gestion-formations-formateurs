import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

// Liste statique des filières
const STATIC_FILIERES = [
    // Filières IT
    { id: 1, name: "Développement Web", category: "IT" },
    { id: 2, name: "Intelligence Artificielle", category: "IT" },
    { id: 3, name: "Sécurité Informatique", category: "IT" },
    // Filières Économie
    { id: 4, name: "Comptabilité", category: "Économie" },
    { id: 5, name: "Finance", category: "Économie" },
    { id: 6, name: "Marketing Digital", category: "Économie" },
    // Filière Génie Civil
    { id: 7, name: "Construction BTP", category: "Génie Civil" },
];

function CreateCdc() {
    const navigate = useNavigate();
    const { id } = useParams(); // Récupérer l'ID s'il est présent dans l'URL
    const isEditMode = !!id; // Mode édition si un ID est présent
    const { setNotification, notification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [errors, setErrors] = useState(null);
    const [cdcData, setCdcData] = useState(null);
    const [selectedFilieres, setSelectedFilieres] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role_id: "",
    });

    // Charger les données du CDC en mode édition
    useEffect(() => {
        // Obtenir le role_id de CDC
        axiosClient
            .get("/roles")
            .then(({ data }) => {
                const role = data.find((item) => item.name === "cdc");
                if (role) {
                    setFormData((prev) => ({ ...prev, role_id: role.id }));
                }
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des rôles:", err);
            });

        // Si mode édition, charger les données du CDC
        if (isEditMode) {
            axiosClient
                .get(`/cdcs/${id}`)
                .then(({ data }) => {
                    setCdcData(data);
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
                .catch((err) => {
                    console.error("Erreur lors du chargement du CDC:", err);
                    setLoadingData(false);
                });
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        // setLoading(true);

        try {
            let cdcId;

            if (isEditMode) {
                // Mode édition
                const userData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role_id: formData.role_id,
                };

                if (formData.password) {
                    userData.password = formData.password;
                    userData.password_confirmation =
                        formData.password_confirmation;
                }

                await axiosClient.put(`/users/${cdcData.user.id}`, userData);
                cdcId = id; // Utiliser l'ID existant du CDC
            } else {
                // Mode création
                // 1. Créer l'utilisateur
                const userResponse = await axiosClient.post("/users", {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                    role_id: formData.role_id,
                });

                // 2. Créer le CDC
                const cdcResponse = await axiosClient.post("/cdcs", {
                    user_id: userResponse.data.id,
                });

                cdcId = cdcResponse.data.id; // Récupérer l'ID du CDC créé
            }

            const flrs = [];

            // 3. Créer les filières pour ce CDC
            for (const filiereId of selectedFilieres) {
                const filiereData = STATIC_FILIERES.find(
                    (f) => f.id === filiereId
                );
                flrs.push(filiereData.name);
            }

            await axiosClient.post("/filieres", {
                names: flrs,
                cdc_id: cdcId,
            });

            setNotification(
                `CDC ${isEditMode ? "modifié" : "créé"} avec succès`
            );
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                password_confirmation: "",
                role_id: "",
            });
            setSelectedFilieres([]);
            navigate("/dashboard/cdcs");
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error(
                    `Erreur lors de la ${
                        isEditMode ? "modification" : "création"
                    } du CDC:`,
                    err
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFiliereChange = (filiereId) => {
        // console.log(selectedFilieres);
        setSelectedFilieres((prev) => {
            if (prev.includes(filiereId)) {
                return prev.filter((id) => id !== filiereId);
            } else {
                return [...prev, filiereId];
            }
        });
    };

    // Grouper les filières par catégorie
    const groupedFilieres = STATIC_FILIERES.reduce((acc, filiere) => {
        if (!acc[filiere.category]) {
            acc[filiere.category] = [];
        }
        acc[filiere.category].push(filiere);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                    {isEditMode ? "Modifier le CDC" : "Créer un CDC"}
                </h1>

                {errors && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                        <div className="flex">
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
                        <div>
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
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
                                    setFormData({
                                        ...formData,
                                        password_confirmation: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                    </div>

                    {/* Section des filières */}
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Filières
                        </h3>
                        {Object.entries(groupedFilieres).map(
                            ([category, filieres]) => (
                                <div key={category} className="mb-6">
                                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                                        {category}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {filieres.map((filiere) => (
                                            <div
                                                key={filiere.id}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`filiere-${filiere.id}`}
                                                    checked={selectedFilieres.includes(
                                                        filiere.id
                                                    )}
                                                    onChange={() =>
                                                        handleFiliereChange(
                                                            filiere.id
                                                        )
                                                    }
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`filiere-${filiere.id}`}
                                                    className="ml-2 block text-sm text-gray-900"
                                                >
                                                    {filiere.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {loading
                                ? isEditMode
                                    ? "Modification en cours..."
                                    : "Création en cours..."
                                : isEditMode
                                ? "Enregistrer"
                                : "Créer"}
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

export default CreateCdc;
