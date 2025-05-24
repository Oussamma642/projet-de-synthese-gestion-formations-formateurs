import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";

export default function Redigees() {
    const { user } = useStateContext();
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
    const [formationToValidate, setFormationToValidate] = useState(null);
    const navigate = useNavigate();

    // Helper function to get user role - ensures we always have a role
    const getUserRole = () => {
        // First check the user object
        if (user && user.role) {
            return user.role;
        }

        // Then try localStorage as a backup
        const storedRole = localStorage.getItem("acteur");
        if (storedRole) {
            return storedRole;
        }

        // Default fallback
        return "unknown";
    };

    useEffect(() => {
        fetchFormations();
    }, []);

    const fetchFormations = async () => {
        // API => `formations/redigee/${acteur}`
        /* 
            if acteur == drif
            => get formations redigee par drif
            => get formation validee par cdc
            `formations/redigee/${localstorage.getItem(acteur)}`
        */
        setLoading(true);
        try {
            console.log("Fetching formations with status: redigee");
            const response = await axiosClient.get(
                `/formations/redigee/${localStorage.getItem("acteur")}`
            );
            console.log("Formations fetched:", response.data);
            setFormations(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching formations:", err);
            setError("Erreur lors du chargement des formations");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredFormations = formations.filter(
        (formation) =>
            formation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formation.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            formation.animateur?.user?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            formation.city?.nom
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const openValidateDialog = (formation) => {
        setFormationToValidate(formation);
        setIsValidateDialogOpen(true);
    };

    const closeValidateDialog = () => {
        setIsValidateDialogOpen(false);
        setFormationToValidate(null);
    };

    const confirmValidate = async () => {
        if (!formationToValidate) return;

        try {
            const userRole = getUserRole();
            console.log(
                `Validating formation ${formationToValidate.id} as ${userRole}`
            );

            // Determine what validation fields to update
            const isValidatedByDrif = userRole === "drif";
            const isValidatedByCdc = userRole === "cdc";

            // Check if this will complete the validation
            // DRIF can now fully validate without CDC validation
            const willBeFullyValidated =
                isValidatedByDrif ||
                (isValidatedByCdc && formationToValidate.validated_by_drif);

            // Prepare the validation payload
            const payload = {
                validated_by_drif: isValidatedByDrif
                    ? true
                    : formationToValidate.validated_by_drif,
                validated_by_cdc: isValidatedByCdc
                    ? true
                    : formationToValidate.validated_by_cdc,
                redigee_par_drif: isValidatedByDrif
                    ? false
                    : formationToValidate.redigee_par_drif,
                redigee_par_cdc: isValidatedByCdc
                    ? false
                    : formationToValidate.redigee_par_cdc,
            };

            // If this will complete the validation, update status to 'validee'
            if (willBeFullyValidated) {
                payload.status = "validee";
            }

            console.log("Sending validation payload:", payload);

            const response = await axiosClient.patch(
                `/formations/${formationToValidate.id}/validate`,
                payload
            );
            console.log("Validation response:", response.data);

            // Update or remove the formation in the list based on its new status
            if (willBeFullyValidated) {
                // Remove the formation from the redigees list as it's now validee
                setFormations(
                    formations.filter((f) => f.id !== formationToValidate.id)
                );

                // Show success message
                const message = isValidatedByDrif
                    ? "Formation validée par DRIF et marquée comme validée !"
                    : "Formation complètement validée !";

                setSuccessMessage(message);

                // Clear success message after a delay
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 5000);
            } else {
                // Just update the formation in the list
                setFormations(
                    formations.map((f) =>
                        f.id === formationToValidate.id
                            ? { ...f, ...response.data }
                            : f
                    )
                );

                // Show success message
                setSuccessMessage(
                    `Formation validée par ${
                        isValidatedByDrif ? "DRIF" : "CDC"
                    }`
                );

                // Clear success message after a delay
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 5000);
            }

            // Close the dialog
            // closeValidateDialog();
            // anywhere in your component or event handler
            // window.location.reload();
            navigate('/dashboard/validees');
        } catch (err) {
            console.error("Error validating formation:", err);
            setError(
                `Erreur lors de la validation: ${
                    err.response?.data?.message || err.message
                }`
            );

            // Clear error message after a delay
            setTimeout(() => {
                setError(null);
            }, 5000);

            // Close the dialog
            closeValidateDialog();
        }
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("fr-FR", options);
    };

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Formations rédigées</h1>
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            />
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
                        {searchTerm
                            ? "Aucune formation ne correspond à votre recherche."
                            : "Aucune formation rédigée n'est disponible."}
                    </p>
                    <Link to="/dashboard/drafts">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                            Voir les brouillons
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFormations.map((formation) => (
                        <div
                            key={formation.id}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                                        {formation.title}
                                    </h2>
                                    <div className="flex space-x-1">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                formation.validated_by_cdc
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            CDC{" "}
                                            {formation.validated_by_cdc
                                                ? "✓"
                                                : "⏳"}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                formation.validated_by_drif
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            DRIF{" "}
                                            {formation.validated_by_drif
                                                ? "✓"
                                                : "⏳"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-500">
                                        {formatDate(formation.start_date)} -{" "}
                                        {formatDate(formation.end_date)}
                                    </p>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Statut:{" "}
                                        {formation.formation_status ||
                                            formation.status ||
                                            "redigee"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-gray-600 line-clamp-3 mb-4">
                                    {formation.description}
                                </p>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {formation.city?.nom || "Lieu non spécifié"}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    {formation.animateur?.user?.name ||
                                        "Animateur non spécifié"}
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                                <Link
                                    to={`/dashboard/view-formation/${formation.id}`}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                                >
                                    Voir
                                </Link>
                                {((user.role === "drif" &&
                                    !formation.validated_by_drif) ||
                                    (user.role === "cdc" &&
                                        !formation.validated_by_cdc)) && (
                                    <button
                                        className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                                        onClick={() =>
                                            openValidateDialog(formation)
                                        }
                                    >
                                        Valider
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Validate Confirmation Dialog */}
            {isValidateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">
                            Confirmer la validation
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Êtes-vous sûr de vouloir valider la formation "
                            {formationToValidate?.title}"?
                        </p>

                        <div className="bg-blue-50 p-3 rounded-md mb-4">
                            <h4 className="font-medium text-blue-700 mb-1">
                                Statut actuel:
                            </h4>
                            <div className="flex gap-2 mb-2">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        formationToValidate?.validated_by_cdc
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    CDC:{" "}
                                    {formationToValidate?.validated_by_cdc
                                        ? "Validé ✓"
                                        : "En attente ⏳"}
                                </span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        formationToValidate?.validated_by_drif
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    DRIF:{" "}
                                    {formationToValidate?.validated_by_drif
                                        ? "Validé ✓"
                                        : "En attente ⏳"}
                                </span>
                            </div>

                            <h4 className="font-medium text-blue-700 mb-1">
                                Information sur le processus:
                            </h4>
                            <p className="text-sm text-blue-600">
                                {getUserRole() === "drif"
                                    ? "En tant que DRIF, votre validation marquera cette formation comme validée et approuvée sans nécessiter de validation supplémentaire."
                                    : "En tant que CDC, votre validation marque cette formation comme approuvée par le CDC. Elle nécessitera également la validation du DRIF avant d'être complètement validée."}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                {formationToValidate?.validated_by_drif &&
                                getUserRole() === "cdc"
                                    ? "Cette formation a déjà été validée par le DRIF. Votre validation finalisera le processus."
                                    : getUserRole() === "drif"
                                    ? "La validation par le DRIF est suffisante pour approuver complètement une formation."
                                    : "La formation nécessite la validation du DRIF pour être complètement validée."}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                                onClick={closeValidateDialog}
                            >
                                Annuler
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                                onClick={confirmValidate}
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
