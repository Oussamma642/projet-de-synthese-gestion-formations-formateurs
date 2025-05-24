import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

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
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role_id: "",
    });

    // useEffects to get branches
    useEffect(() => {
        axiosClient.get("/branches").then(({ data }) => {
            setBranches(data);
            console.log("branches: ", data);
        });
    }, []);

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
                        // Initialiser la branche sélectionnée
                        if (data.branche_id) {
                            setSelectedBranch(data.branche_id);
                        }
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

        // Validation de la branche
        if (!selectedBranch) {
            setErrors({ branche_id: ["Veuillez sélectionner une branche"] });
            return;
        }

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

                // 1. Mettre à jour l'utilisateur
                await axiosClient.put(`/users/${cdcData.user.id}`, userData);

                // 2. Mettre à jour le CDC avec la nouvelle branche
                await axiosClient.put(`/cdcs/${id}`, {
                    user_id: cdcData.user.id,
                    branche_id: selectedBranch,
                });

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
                    branche_id: selectedBranch,
                });

                cdcId = cdcResponse.data.id; // Récupérer l'ID du CDC créé
                setSelectedFilieres([]);
            }

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

                    {/* Section des branches */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Branche
                            </label>
                            <select
                                value={selectedBranch}
                                onChange={(e) =>
                                    setSelectedBranch(e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">
                                    Sélectionner une branche{" "}
                                </option>

                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
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
