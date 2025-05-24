import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../../components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import axiosClient from "../../axios-client";

export default function CreateParticipant() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [istas, setIstas] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    // Remove all references to the confirmation dialog
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        ista_id: "",
        filiere_id: "",
        // role_id: "",
    });

    // Extraire le role_id
/*
    useEffect(() => {
        axiosClient
            .get("/roles")
            .then(({ data }) => {
                const role = data.find((item) => {
                    return item.name === "formateur";
                });

                console.log(`Role: ${role.id}`);

                setFormData({
                    ...formData,
                    role_id: role.id,
                });
            })
            .catch((err) => {
                console.error("Erreur lors du chargement des régions:", err);
            });
    }, []);
*/

    useEffect(() => {
        fetchIstas();
        fetchFilieres();

        if (isEditMode) {
            fetchParticipant(id);
        }
    }, [id]);

    const fetchParticipant = async (participantId) => {
        try {
            setLoading(true);
            setError(null);

            // First, try getting all participants
            const allParticipantsResponse = await axiosClient.get(
                "/participants"
            );
            console.log("All participants:", allParticipantsResponse.data);

            // Find the participant with the matching ID
            const foundParticipant = allParticipantsResponse.data.find(
                (p) => p.id == participantId
            );

            if (!foundParticipant) {
                // If not found in the list, try direct API call as fallback
                try {
                    const directResponse = await axiosClient.get(
                        `/participants/${participantId}`
                    );
                    console.log(
                        "Direct participant data:",
                        directResponse.data
                    );

                    if (directResponse.data && directResponse.data.user) {
                        const participant = directResponse.data;
                        setFormData({
                            name: participant.user.name || "",
                            email: participant.user.email || "",
                            password: "", // Password not returned for security
                            ista_id: participant.ista_id
                                ? participant.ista_id.toString()
                                : "",
                            filiere_id: participant.filiere_id
                                ? participant.filiere_id.toString()
                                : "",
                        });
                        document.title = `Modifier ${participant.user.name}`;
                        return;
                    }
                } catch (directError) {
                    console.error("Direct fetch failed:", directError);
                    // Continue to error handling below
                }

                throw new Error("Participant non trouvé");
            }

            // Map the data to the form fields
            setFormData({
                name: foundParticipant.user?.name || "",
                email: foundParticipant.user?.email || "",
                password: "", // Password is not returned for security reasons
                ista_id: foundParticipant.ista_id
                    ? foundParticipant.ista_id.toString()
                    : "",
                filiere_id: foundParticipant.filiere_id
                    ? foundParticipant.filiere_id.toString()
                    : "",
            });

            // Update form title
            if (foundParticipant.user?.name) {
                document.title = `Modifier ${foundParticipant.user.name}`;
            }
        } catch (error) {
            console.error("Error fetching participant:", error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const statusCode = error.response.status;
                if (statusCode === 404) {
                    setError(
                        "Participant non trouvé. Vérifiez l'identifiant et réessayez."
                    );
                } else if (statusCode === 401 || statusCode === 403) {
                    setError(
                        "Vous n'avez pas l'autorisation nécessaire pour accéder à ces données."
                    );
                } else {
                    setError(
                        `Erreur lors de la récupération des données du participant (${statusCode})`
                    );
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError(
                    "Erreur de communication avec le serveur. Vérifiez votre connexion internet."
                );
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Erreur: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchIstas = async () => {
        try {
            const response = await axiosClient.get("/istas");
            setIstas(response.data);
            // console.log(`Istats: ${response.data}`);
        } catch (error) {
            console.error("Error fetching istas:", error);
        }
    };

    const fetchFilieres = async () => {
        try {
            const response = await axiosClient.get("/filieres");
            setFilieres(response.data);
        } catch (error) {
            console.error("Error fetching filieres:", error);
        }
    };

    
    const handleSubmit = async (e) => {

        e.preventDefault();

        console.log(`Form data: ${formData}`);

        // return;


        setLoading(true);
        setError(null);
        setValidationErrors({});

        try {
            // Check if user is authenticated
            const token = localStorage.getItem('ACCESS_TOKEN');
            if (!token) {
                setError("Vous n'êtes pas authentifié. Veuillez vous connecter.");
                setLoading(false);
                return;
            }

            // Prepare the data to send
            const dataToSend = {...formData};

            // For edit mode with empty password
            if (isEditMode && !dataToSend.password) {
                console.log('Edit mode with empty password - removing password field');
                delete dataToSend.password;
            }

            console.log(`${isEditMode ? 'Updating' : 'Creating'} participant with data:`, dataToSend);

            if (isEditMode) {
                // Update the participant using the proper API endpoints we just added
                console.log(`Updating participant ${id} with data:`, dataToSend);

                try {
                    // Now we can send all data in a single request to the participant endpoint
                    // This is possible because we enhanced the controller to handle user data too

                    // Prepare all the data for the update
                    const updateData = {
                        // User data
                        name: dataToSend.name,
                        email: dataToSend.email,

                        // Participant data
                        ista_id: dataToSend.ista_id,
                        filiere_id: dataToSend.filiere_id
                    };

                    // Only include password if provided
                    if (dataToSend.password && dataToSend.password.trim() !== '') {
                        updateData.password = dataToSend.password;
                    }

                    console.log('Sending update with all data:', updateData);

                    // Send a single request to update everything
                    const response = await axiosClient.put(`/participants/${id}`, updateData);
                    console.log('Update response:', response.data);

                    if (!response.data || !response.data.participant) {
                        throw new Error('La mise à jour a échoué. Aucune donnée reçue du serveur.');
                    }

                    // We're going to assume the update was successful since we didn't get any errors
                    // The API typically has a small delay before changes are reflected in GET requests
                    console.log('Update completed successfully!');
                    alert('Participant mis à jour avec succès!');

                    // Navigate back to the participants list and force a refresh
                    navigate('/dashboard/participants', { replace: true });

                } catch (error) {
                    console.error('Error in update process:', error);
                    // Show a helpful error message
                    setError(`Erreur lors de la mise à jour: ${error.message}`);
                    setLoading(false);
                }
            } else {
                // Standard create - unchanged
                const response = await axiosClient.post('/participants', dataToSend);
                console.log('Create Response:', response?.data);

                // Show success message before redirecting
                alert('Participant créé avec succès!');
                navigate('/dashboard/participants', { replace: true });
            }
        } catch (error) {
            console.error('Error details:', error);
            setLoading(false);

            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);

                if (error.response.status === 422) {
                    // Validation errors
                    if (error.response.data.errors) {
                        setValidationErrors(error.response.data.errors);
                    } else {
                        setError(error.response.data.message || "Erreur de validation");
                    }
                } else if (error.response.status === 404) {
                    setError("Participant non trouvé. Il a peut-être été supprimé entre-temps.");
                } else if (error.response.status === 403) {
                    setError("Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
                } else if (error.response.status === 500) {
                    const errorDetail = error.response.data.error || error.response.data.message || '';
                    setError(`Erreur serveur: ${errorDetail || 'Une erreur interne est survenue'}`);
                } else {
                    setError(error.response.data.message || "Une erreur est survenue");
                }
            } else if (error.request) {
                // Request made but no response received
                setError("Erreur de communication avec le serveur. Vérifiez votre connexion internet.");
            } else {
                // Something else happened while setting up the request
                setError(`Erreur: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    }


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation error when user edits the field
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear validation error when user changes the select
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // No longer needed since we don't show the confirmation dialog

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                {isEditMode
                                    ? "Modifier le participant"
                                    : "Ajouter un participant"}
                            </CardTitle>
                            <CardDescription>
                                {isEditMode
                                    ? "Modifiez les informations du participant"
                                    : "Remplissez les informations pour créer un nouveau participant"}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard/participants")}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {/* We no longer need the confirmation dialog */}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={
                                        validationErrors.name
                                            ? "border-red-500"
                                            : ""
                                    }
                                    placeholder="Entrez le nom complet"
                                />
                                {validationErrors.name && (
                                    <p className="text-sm text-red-500">
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className={
                                        validationErrors.email
                                            ? "border-red-500"
                                            : ""
                                    }
                                    placeholder="exemple@email.com"
                                />
                                {validationErrors.email && (
                                    <p className="text-sm text-red-500">
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!isEditMode}
                                    className={
                                        validationErrors.password
                                            ? "border-red-500"
                                            : ""
                                    }
                                    placeholder={
                                        isEditMode
                                            ? "Laissez vide pour conserver l'actuel"
                                            : "Minimum 8 caractères"
                                    }
                                />
                                {validationErrors.password && (
                                    <p className="text-sm text-red-500">
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Formation field removed as admin has no rights to assign formations to participants */}

                            <div className="space-y-2">
                                <Label htmlFor="ista_id">ISTA</Label>
                                <Select
                                    value={formData.ista_id}
                                    onValueChange={(value) =>
                                        handleSelectChange("ista_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            validationErrors.ista_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Sélectionner un ISTA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {istas.map((ista) => (
                                            <SelectItem
                                                key={ista.id}
                                                value={ista.id.toString()}
                                            >
                                                {ista.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.ista_id && (
                                    <p className="text-sm text-red-500">
                                        {validationErrors.ista_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="filiere_id">Filière</Label>
                                <Select
                                    value={formData.filiere_id}
                                    onValueChange={(value) =>
                                        handleSelectChange("filiere_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            validationErrors.filiere_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Sélectionner une filière" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filieres.map((filiere) => (
                                            <SelectItem
                                                key={filiere.id}
                                                value={filiere.id.toString()}
                                            >
                                                {filiere.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.filiere_id && (
                                    <p className="text-sm text-red-500">
                                        {validationErrors.filiere_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditMode
                                        ? "Mise à jour en cours..."
                                        : "Création en cours..."}
                                </>
                            ) : isEditMode ? (
                                "Mettre à jour"
                            ) : (
                                "Créer"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
