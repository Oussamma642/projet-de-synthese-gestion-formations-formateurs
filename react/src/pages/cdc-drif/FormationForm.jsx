import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import PageLoading from "../../components/ui/PageLoading";
import { useStateContext } from "../../contexts/ContextProvider";

export default function FormationForm() {
    const navigate = useNavigate();
    const { user } = useStateContext();
    const isDrif =
        user?.role === "drif" || localStorage.getItem("acteur") === "drif";

    // Track current step (1 or 2)
    const [currentStep, setCurrentStep] = useState(1);

    // Track the formation ID after creation (used in step 2)
    const [formationId, setFormationId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        animateur_id: "",
        city_id: "",
        site_id: "",
        formation_status: "brouillon",
    });

    // State for step 2 - participants selection
    const [participants, setParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [status, setStatus] = useState(isDrif ? "validee" : "brouillon");

    // Separate loading states for better UX
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Initial data
    const [animateurs, setAnimateurs] = useState([]);
    const [cities, setCities] = useState([]);
    const [sites, setSites] = useState([]);

    // State pour tous les sites
    const [allSites, setAllSites] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);

    const [cdcInfos, setCdcInfos] = useState({});
    const [filieresOfCdc, setFiliereOfCdc] = useState([]);

    // State pour les participants
    const [allParticipants, setAllParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);

    // fetches sites
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await axiosClient.get("/sites");
                setAllSites(response.data);
                setFilteredSites(response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des sites:",
                    error
                );
                setError("Impossible de charger les sites");
            }
        };

        fetchSites();
    }, []);

    // useEffect to fetch cdc infos based on the authenticated user
    useEffect(() => {
        const fetchCdcOfTheAuthUser = async () => {
            try {
                const response = await axiosClient.get(
                    `/cdcs/auth-user/${user.id}`
                );
                setCdcInfos(response.data);
                console.log(
                    `cdc info while drif who is auth: ${response.data}`
                );
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des filières:",
                    error
                );
                setError("Impossible de charger les filières du CDC");
            }
        };

        fetchCdcOfTheAuthUser();
    }, [user.id]);

    // useEffect to fetch filieres of the authenticated cdc
    useEffect(() => {
        if (cdcInfos === null) return;

        const fetchFilieresOfCdc = async () => {
            try {
                const response = await axiosClient.get(
                    `/filieres/cdc/${cdcInfos[0].id}`
                );
                setFiliereOfCdc(response.data);
                console.log(`filieres of this cdc: `, response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des filières:",
                    error
                );
                setError("Impossible de charger les filières du CDC");
            }
        };

        if (cdcInfos[0]?.id) {
            fetchFilieresOfCdc();
        }
    }, [cdcInfos]);

    // useEffect to fetch participants and filter their filieres are in the filieres of the authenticated CDC
    useEffect(() => {
        const filterParticipantsBasedOnIDsFilieres = (participants) => {
            // Si c'est un DRIF, retourner tous les participants
            if (isDrif) {
                return participants;
            }

            // Pour les CDC, filtrer par leurs filières
            const cdcFiliereIds = filieresOfCdc.map((filiere) => filiere.id);
            console.log("IDs des filières du CDC:", cdcFiliereIds);

            return participants.filter((participant) => {
                if (
                    participant.filiere &&
                    cdcFiliereIds.includes(participant.filiere.id)
                ) {
                    return true;
                }

                if (participant.filieres && participant.filieres.length > 0) {
                    return participant.filieres.some((filiere) =>
                        cdcFiliereIds.includes(filiere.id)
                    );
                }

                return false;
            });
        };

        const fetchParticipants = async () => {
            try {
                const response = await axiosClient.get(`/participants`);
                console.log("Participants avant filtrage:", response.data);
                setAllParticipants(response.data);

                // Si c'est un DRIF ou si nous n'avons pas d'infos CDC
                if (isDrif || cdcInfos === null) {
                    setFilteredParticipants(response.data);
                    return;
                }

                // Filtrer les participants pour les CDC
                const filtered = filterParticipantsBasedOnIDsFilieres(
                    response.data
                );
                console.log("Participants après filtrage:", filtered);
                setFilteredParticipants(filtered);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des participants:",
                    error
                );
                setError("Impossible de charger les participants");
            }
        };

        // Récupérer les participants si nous sommes un DRIF ou si nous avons les filières du CDC
        if (isDrif || filieresOfCdc.length > 0) {
            fetchParticipants();
        }
    }, [filieresOfCdc, isDrif]);

    // Fetch initial data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingData(true);
            setError(null);

            try {
                const [animateursResponse, citiesResponse, sitesResponse] =
                    await Promise.all([
                        axiosClient.get("/animateurs"),
                        axiosClient.get("/cities"),
                        axiosClient.get("/sites"),
                    ]);

                setAnimateurs(animateursResponse.data);
                setCities(citiesResponse.data);
                setSites(sitesResponse.data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError(
                    "Erreur lors du chargement des données initiales. Veuillez réessayer."
                );
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch participants when moving to step 2
    useEffect(() => {
        if (currentStep === 2) {
            const fetchParticipants = async () => {
                setIsLoadingData(true);
                setError(null);

                try {
                    const response = await axiosClient.get("/participants");

                    // Check if we got a message from the backend (no participants)
                    if (response.data.message) {
                        console.warn(response.data.message);
                        setParticipants([]);
                        // Don't set error, just show empty state
                    } else {
                        setParticipants(response.data);
                    }
                } catch (err) {
                    console.error("Error fetching participants:", err);
                    setError(
                        "Erreur lors du chargement des participants. Veuillez réessayer."
                    );
                } finally {
                    setIsLoadingData(false);
                }
            };

            fetchParticipants();
        }
    }, [currentStep]);

    // Handle form input changes
    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            console.log(`${name}: ${value}`);
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                // Réinitialiser le site_id si la ville change
                ...(name === "city_id" && { site_id: "" }),
            }));

            // Si la ville change, filtrer les sites correspondants
            if (name === "city_id") {
                if (value) {
                    const sitesForCity = allSites.filter(
                        (site) => site.city_id === parseInt(value)
                    );
                    setFilteredSites(sitesForCity);
                } else {
                    setFilteredSites(allSites);
                }
            }
        },
        [allSites]
    );

    // Handle checkbox changes for participants
    const handleParticipantToggle = (participantId) => {
        setSelectedParticipants((prev) => {
            if (prev.includes(participantId)) {
                return prev.filter((id) => id !== participantId);
            } else {
                return [...prev, participantId];
            }
        });
    };

    // Handle form submission for step 1
    const handleStep1Submit = async (e) => {
        e.preventDefault();

        console.log("Form data being submitted:", formData);

        // Form validation
        if (
            !formData.title ||
            !formData.description ||
            !formData.start_date ||
            !formData.end_date ||
            !formData.animateur_id ||
            !formData.city_id ||
            !formData.site_id
        ) {
            setError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axiosClient.post("/formations", {
                ...formData,
                userRole: localStorage.getItem("acteur"), // Assurons-nous que le statut est toujours défini
            });

            // Save the formation ID for step 2
            setFormationId(response.data.id);

            // Move to step 2
            setCurrentStep(2);
            setIsSubmitting(false);
        } catch (err) {
            console.error("Error creating formation:", err);
            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Erreur lors de la création de la formation. Veuillez réessayer."
            );
            setIsSubmitting(false);
        }
    };

    // Handle form submission for step 2
    const handleStep2Submit = async (e) => {
        if (e) e.preventDefault(); // Allow calling directly for retry

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axiosClient.post(
                `/formations/${formationId}/participants`,
                {
                    participant_ids: selectedParticipants,
                    formation_status: status,
                    userRole: localStorage.getItem("acteur"), // Assurons-nous que le statut est toujours défini
                }
            );

            setSuccess(true);

            // Show different messages based on status
            if (status === "validee") {
                setSuccess(
                    "Formation créée et validée! Redirection vers les formations validées..."
                );
                setTimeout(() => {
                    navigate("/dashboard/validees");
                }, 2000);
            } else if (status === "redigee") {
                setSuccess(
                    "Formation créée et rédigée! Redirection vers les formations rédigées..."
                );
                setTimeout(() => {
                    navigate("/dashboard/redigees");
                }, 2000);
            } else {
                setSuccess("Formation créée avec succès! Redirection...");
                setTimeout(() => {
                    navigate("/dashboard/drafts");
                }, 1500);
            }
        } catch (err) {
            console.error("Error adding participants:", err);
            // Log more detailed error information
            console.error("Error details:", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
            });

            // Set a more detailed error message
            setError(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Erreur lors de l'ajout des participants. Veuillez réessayer."
            );
            setIsSubmitting(false);
        }
    };

    // Memoize options to prevent unnecessary rerenders
    const animateurOptions = useMemo(
        () =>
            animateurs.map((animateur) => (
                <option key={animateur.id} value={animateur.id}>
                    {animateur.user?.name || `Animateur #${animateur.id}`}
                </option>
            )),
        [animateurs]
    );

    const cityOptions = useMemo(
        () =>
            cities.map((city) => (
                <option key={city.id} value={city.id}>
                    {city.nom}
                </option>
            )),
        [cities]
    );

    const siteOptions = useMemo(
        () =>
            sites.map((site) => (
                <option key={site.id} value={site.id}>
                    {site.name}
                </option>
            )),
        [sites]
    );

    // Show loading state while fetching initial data
    if (isLoadingData) {
        return <PageLoading />;
    }

    // Render Step 1 - Basic Formation Information
    const renderStep1 = () => (
        <>
            <h1 className="text-2xl font-bold mb-6">
                Créer une nouvelle formation - Étape 1
            </h1>

            {isDrif && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded">
                    <p className="font-medium">Information DRIF</p>
                    <p>
                        En tant que DRIF, vos formations seront automatiquement
                        validées et placées directement dans la section
                        "Formations validées" sans nécessiter de validation
                        supplémentaire.
                    </p>
                </div>
            )}

            {error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
                    role="alert"
                >
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Animateur
                        </label>
                        <select
                            name="animateur_id"
                            value={formData.animateur_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="">Sélectionner un animateur</option>
                            {animateurOptions}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de début *
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de fin *
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ville
                        </label>
                        <select
                            name="city_id"
                            value={formData.city_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="">Sélectionner une ville</option>
                            {cityOptions}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site
                        </label>
                        <select
                            name="site_id"
                            value={formData.site_id}
                            onChange={handleChange}
                            disabled={!formData.city_id}
                            className={`w-full px-3 py-2 border rounded-md ${
                                !formData.city_id
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <option value="">Sélectionner un site</option>
                            {formData.city_id ? (
                                filteredSites.map((site) => (
                                    <option key={site.id} value={site.id}>
                                        {site.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    Veuillez d'abord sélectionner une ville
                                </option>
                            )}
                        </select>
                        {!formData.city_id && (
                            <p className="mt-1 text-sm text-gray-500">
                                Veuillez sélectionner une ville avant de choisir
                                un site
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        // onClick={() => setCurrentStep(2)}
                        disabled={isSubmitting}
                        // onClick={()=>setCurrentStep(2)}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                            isSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-blue-700"
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="inline-block animate-spin mr-2">
                                    ⟳
                                </span>
                                Enregistrement...
                            </>
                        ) : (
                            "Continuer à l'étape 2"
                        )}
                    </button>
                </div>
            </form>
        </>
    );

    // Render Step 2 - Participants Selection
    const renderStep2 = () => (
        <>
            <h1 className="text-2xl font-bold mb-6">
                Créer une nouvelle formation - Étape 2
            </h1>

            {error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
                    role="alert"
                >
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
                    role="alert"
                >
                    <p>{success}</p>
                </div>
            )}

            <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* Statut de la formation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Statut de la formation
                    </label>
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="status-redigee"
                                name="status"
                                value="redigee"
                                checked={status === "redigee"}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="status-redigee" className="text-sm">
                                Rédigée
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="status-validee"
                                name="status"
                                value="validee"
                                checked={status === "validee"}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="status-validee" className="text-sm">
                                Validée
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sélection des participants */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Participants
                    </label>

                    {/* Select des filières */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filieres
                        </label>
                        <select
                            className={`w-full px-3 py-2 border rounded-md ${
                                isDrif ? "bg-gray-100 cursor-not-allowed" : ""
                            }`}
                            onChange={(e) => {
                                if (isDrif) return; // Ne rien faire si c'est un DRIF

                                const selectedFiliereId = e.target.value;
                                if (selectedFiliereId) {
                                    const filtered = allParticipants.filter(
                                        (participant) => {
                                            if (
                                                participant.filiere &&
                                                participant.filiere.id ===
                                                    parseInt(selectedFiliereId)
                                            ) {
                                                return true;
                                            }
                                            if (
                                                participant.filieres &&
                                                participant.filieres.some(
                                                    (f) =>
                                                        f.id ===
                                                        parseInt(
                                                            selectedFiliereId
                                                        )
                                                )
                                            ) {
                                                return true;
                                            }
                                            return false;
                                        }
                                    );
                                    setFilteredParticipants(filtered);
                                } else {
                                    setFilteredParticipants(allParticipants);
                                }
                            }}
                            disabled={isDrif}
                        >
                            <option value="">Toutes les filières</option>
                            {!isDrif &&
                                filieresOfCdc.map((filiere) => (
                                    <option key={filiere.id} value={filiere.id}>
                                        {filiere.name}
                                    </option>
                                ))}
                        </select>
                        {isDrif && (
                            <p className="mt-1 text-sm text-gray-500">
                                En tant que DRIF, vous pouvez voir tous les
                                participants de toutes les filières
                            </p>
                        )}
                    </div>

                    {/* Liste des participants */}
                    {filteredParticipants.length === 0 ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <p className="text-sm text-yellow-700">
                                Aucun participant disponible dans cette filière.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredParticipants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center border p-3 rounded bg-white"
                                >
                                    <input
                                        type="checkbox"
                                        id={`participant-${participant.id}`}
                                        checked={selectedParticipants.includes(
                                            participant.id
                                        )}
                                        onChange={() =>
                                            handleParticipantToggle(
                                                participant.id
                                            )
                                        }
                                        className="mr-3"
                                    />
                                    <label
                                        htmlFor={`participant-${participant.id}`}
                                        className="flex flex-col"
                                    >
                                        <span className="font-medium">
                                            {participant.user.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {participant.email}
                                        </span>
                                        <span className="text-xs text-blue-600 mt-1">
                                            {participant.filiere
                                                ? participant.filiere.name
                                                : participant.filieres
                                                ? participant.filieres
                                                      .map((f) => f.name)
                                                      .join(", ")
                                                : "Sans filière"}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedParticipants.length > 0 && (
                        <p className="mt-4 text-sm text-gray-600">
                            {selectedParticipants.length} participant
                            {selectedParticipants.length > 1 ? "s" : ""}{" "}
                            sélectionné
                            {selectedParticipants.length > 1 ? "s" : ""}
                        </p>
                    )}
                </div>

                {/* Boutons de navigation */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Retour à l'étape 1
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                            isSubmitting
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-blue-700"
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="inline-block animate-spin mr-2">
                                    ⟳
                                </span>
                                Finalisation...
                            </>
                        ) : (
                            "Finaliser la formation"
                        )}
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            {/* Progress steps indicator */}
            <div className="mb-8">
                <div className="flex items-center">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            currentStep >= 1
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        1
                    </div>
                    <div
                        className={`flex-1 h-1 mx-2 ${
                            currentStep >= 2 ? "bg-blue-500" : "bg-gray-200"
                        }`}
                    ></div>
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            currentStep >= 2
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs">Information de base</span>
                    <span className="text-xs">Participants et statut</span>
                </div>
            </div>

            {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
    );
}
