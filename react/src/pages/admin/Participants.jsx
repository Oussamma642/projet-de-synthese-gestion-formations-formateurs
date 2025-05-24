import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import axiosClient from "../../axios-client";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Search, Plus, RefreshCw, Edit, Trash2 } from "lucide-react";

export default function Participants() {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [formations, setFormations] = useState([]);
    const [istas, setIsas] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [participantToDelete, setParticipantToDelete] = useState(null);
    const [filters, setFilters] = useState({
        name: "",
        formation: "all",
        ista: "all",
        filiere: "all",
    });

    // Fetch participants data
    useEffect(() => {
        fetchParticipants();
        fetchFormations();
        fetchIsas();
        fetchFilieres();
    }, []);

    // Apply filters whenever participants or filters change
    useEffect(() => {
        applyFilters();
    }, [participants, filters]);

    const fetchParticipants = async () => {
        try {
            console.log("Fetching participants to refresh the list...");
            const response = await axiosClient.get("/participants");
            console.log("Received participants:", response.data);
            setParticipants(response.data);
            setFilteredParticipants(response.data);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/edit-participant/${id}`);
    };

    const handleDeleteClick = (id) => {
        setParticipantToDelete(id);
        setConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (participantToDelete) {
            try {
                console.log(
                    `Attempting to delete participant with ID: ${participantToDelete}`
                );

                // First try standard DELETE request
                try {
                    await axiosClient.delete(
                        `/participants/${participantToDelete}`
                    );
                    console.log(
                        `Successfully deleted participant ${participantToDelete}`
                    );
                } catch (deleteError) {
                    console.error(
                        "DELETE method failed, trying POST with _method=DELETE",
                        deleteError
                    );

                    // Some Laravel APIs require a POST with _method=DELETE instead
                    await axiosClient.post(
                        `/participants/${participantToDelete}`,
                        {
                            _method: "DELETE",
                        }
                    );
                    console.log(
                        `Successfully deleted participant ${participantToDelete} using POST method`
                    );
                }

                // Refresh the participants list after successful deletion
                await fetchParticipants();

                // Reset states
                setConfirmDelete(false);
                setParticipantToDelete(null);
            } catch (error) {
                console.error("Error deleting participant:", error);
                alert(
                    `Erreur lors de la suppression: ${
                        error.response?.data?.message ||
                        error.message ||
                        "Une erreur est survenue"
                    }`
                );
                setConfirmDelete(false);
            }
        }
    };

    const handleCancelDelete = () => {
        setConfirmDelete(false);
        setParticipantToDelete(null);
    };

    const fetchFormations = async () => {
        try {
            const response = await axiosClient.get("/formations");
            setFormations(response.data);
        } catch (error) {
            console.error("Error fetching formations:", error);
        }
    };

    const fetchIsas = async () => {
        try {
            const response = await axiosClient.get("/istas");
            setIsas(response.data);
        } catch (error) {
            console.error("Error fetching isas:", error);
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

    const applyFilters = () => {
        let filtered = [...participants];
        console.log("Participants data:", participants); // Debug log

        // Filter by name
        if (filters.name) {
            filtered = filtered.filter((participant) =>
                participant.user?.name
                    .toLowerCase()
                    .includes(filters.name.toLowerCase())
            );
        }

        // Filter by formation
        if (filters.formation && filters.formation !== "all") {
            filtered = filtered.filter(
                (participant) =>
                    participant.formation_id === parseInt(filters.formation)
            );
        }

        // Filter by ista
        if (filters.ista && filters.ista !== "all") {
            console.log("Filtering by ISTA:", filters.ista); // Debug log
            filtered = filtered.filter((participant) => {
                console.log("Participant ISTA:", participant.ista_id); // Debug log
                return participant.ista_id === parseInt(filters.ista);
            });
        }

        // Filter by filiere
        if (filters.filiere && filters.filiere !== "all") {
            filtered = filtered.filter(
                (participant) =>
                    participant.filiere_id === parseInt(filters.filiere)
            );
        }

        setFilteredParticipants(filtered);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
    };

    const resetFilters = () => {
        setFilters({
            name: "",
            formation: "all",
            ista: "all",
            filiere: "all",
        });
    };

    return (
        <>
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-2xl font-bold">
                            Liste des Participants
                        </CardTitle>
                        <Button
                            onClick={() =>
                                navigate("/dashboard/create-user/participant")
                            }
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un participant
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par nom"
                                    value={filters.name}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    className="pl-8"
                                />
                            </div>

                            <Select
                                value={filters.formation}
                                onValueChange={(value) =>
                                    handleFilterChange("formation", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Formation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Toutes les formations
                                    </SelectItem>
                                    {formations.map((formation) => (
                                        <SelectItem
                                            key={formation.id}
                                            value={formation.id.toString()}
                                        >
                                            {formation.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.ista}
                                onValueChange={(value) =>
                                    handleFilterChange("ista", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="ISTA" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tous les ISTA
                                    </SelectItem>
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

                            <Select
                                value={filters.filiere}
                                onValueChange={(value) =>
                                    handleFilterChange("filiere", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filière" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Toutes les filières
                                    </SelectItem>
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
                        </div>

                        {/* Reset filters button */}
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="mb-4"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Réinitialiser les filtres
                            </Button>
                        </div>

                        {/* Results count */}
                        <div className="mb-4">
                            <Badge variant="secondary">
                                {filteredParticipants.length} participant(s)
                                trouvé(s)
                            </Badge>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Participant</TableHead>
                                        <TableHead>Formation</TableHead>
                                        <TableHead>ISTA</TableHead>
                                        <TableHead>Filière</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParticipants.length > 0 ? (
                                        filteredParticipants.map(
                                            (participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">
                                                        {participant.user?.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            participant
                                                                .formation
                                                                ?.title
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {participant.ista?.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            participant.filiere
                                                                ?.name
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        participant.id
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        participant.id
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-4"
                                            >
                                                Aucun participant trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">
                            Confirmation de suppression
                        </h3>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer ce participant ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancelDelete}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
