import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DrFormations() {
    const [regionId, setRegionId] = useState("");
    const { user } = useStateContext();
    const navigate = useNavigate();
    const [dr, setDr] = useState(null);
    const [error, setError] = useState(null);
    const [formations, setFormations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const formationRef = useRef(null);

    useEffect(() => {
        const fetchDrBelongsToTheAuthUser = async () => {
            try {
                const response = await axiosClient.get(`/drs/user/${user.id}`);
                if (response.data) {
                    setDr(response.data);
                    setRegionId(response.data.region_id);
                    // Une fois que nous avons l'ID de la région, nous pouvons récupérer les formations
                    await fetchFormationsByRegion(response.data.region_id);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des données du DR:",
                    error
                );
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            navigate("/login");
                            break;
                        case 404:
                            setError("Aucun DR trouvé pour cet utilisateur");
                            break;
                        default:
                            setError(
                                "Une erreur est survenue lors de la récupération des données"
                            );
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchFormationsByRegion = async (regionId) => {
            try {
                const response = await axiosClient.get(
                    `/formations/dr-region/${regionId}`
                );
                console.log("Formations reçues:", response.data);
                setFormations(response.data);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des formations:",
                    error
                );
                setError("Erreur lors de la récupération des formations");
            }
        };

        if (user?.id) {
            fetchDrBelongsToTheAuthUser();
        }
    }, [user?.id, navigate]);

    const fetchParticipants = async (formationId) => {
        setLoadingParticipants(true);
        try {
            const response = await axiosClient.get(
                `/formations/${formationId}/participants-by-ista`
            );
            setParticipants(response.data);
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des participants:",
                error
            );
            setError("Erreur lors de la récupération des participants");
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleShowParticipants = (formation) => {
        if (selectedFormation?.id === formation.id) {
            setSelectedFormation(null);
            setParticipants([]);
        } else {
            setSelectedFormation(formation);
            fetchParticipants(formation.id);
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        const options = { day: "numeric", month: "long", year: "numeric" };
        return new Date(dateString).toLocaleDateString("fr-FR", options);
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let badgeClass =
            "inline-block px-3 py-1 text-sm font-medium rounded-full ";

        if (status?.toLowerCase().includes("ouvert")) {
            badgeClass += "bg-green-100 text-green-800";
        } else if (status?.toLowerCase().includes("complet")) {
            badgeClass += "bg-red-100 text-red-800";
        } else if (status?.toLowerCase().includes("attente")) {
            badgeClass += "bg-yellow-100 text-yellow-800";
        } else {
            badgeClass += "bg-gray-100 text-gray-800";
        }

        return <span className={badgeClass}>{status}</span>;
    };

    const generatePDF = async (formation) => {
        try {
            // Récupérer les participants si ce n'est pas déjà fait
            if (
                !participants.length ||
                selectedFormation?.id !== formation.id
            ) {
                await fetchParticipants(formation.id);
            }

            console.log("Formation pour PDF:", formation);
            console.log("Site de la formation:", formation.site);
            console.log("Participants:", participants);

            // Créer un nouveau PDF
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;

            // Fonction pour ajouter du texte avec style et gestion du retour à la ligne
            const addText = (
                text,
                x,
                y,
                fontSize = 12,
                isBold = false,
                maxWidth = pageWidth - 2 * margin
            ) => {
                pdf.setFontSize(fontSize);
                pdf.setFont("helvetica", isBold ? "bold" : "normal");

                // Diviser le texte en lignes qui tiennent dans la largeur maximale
                const lines = pdf.splitTextToSize(text, maxWidth);

                // Ajouter chaque ligne
                lines.forEach((line, index) => {
                    pdf.text(line, x, y + index * (fontSize * 0.35));
                });

                // Retourner la hauteur totale utilisée
                return lines.length * (fontSize * 0.35);
            };

            // Page 1: Informations de la formation
            let yOffset = margin;

            // Titre
            const titleHeight = addText(
                formation.title,
                margin,
                yOffset,
                20,
                true
            );
            yOffset += titleHeight + 10;

            // Description
            const descriptionHeight = addText(
                formation.description,
                margin,
                yOffset,
                12,
                false
            );
            yOffset += descriptionHeight + 15;

            // Informations détaillées
            const lineHeight = 10;

            // Fonction pour ajouter une ligne d'information
            const addInfoLine = (label, value) => {
                const text = `${label}: ${value}`;
                const height = addText(text, margin, yOffset, 12, false);
                yOffset += height + 5;
            };

            addInfoLine("Date de début", formatDate(formation.start_date));
            addInfoLine("Date de fin", formatDate(formation.end_date));
            addInfoLine("Lieu", formation.city?.nom || "N/A");
            addInfoLine("Site", formation.site?.name || "N/A");
            addInfoLine("Animateur", formation.animateur?.user?.name || "N/A");
            addInfoLine("Statut", formation.status);

            // Pages suivantes: Participants par ISTA
            if (participants && participants.length > 0) {
                participants.forEach((istaGroup, index) => {
                    pdf.addPage();
                    yOffset = margin;

                    // En-tête de l'ISTA
                    const istaTitleHeight = addText(
                        istaGroup.ista.name,
                        margin,
                        yOffset,
                        16,
                        true
                    );
                    yOffset += istaTitleHeight + 5;

                    const participantCountHeight = addText(
                        `${istaGroup.participants.length} participant(s)`,
                        margin,
                        yOffset,
                        12,
                        false
                    );
                    yOffset += participantCountHeight + 10;

                    // Liste des participants
                    istaGroup.participants.forEach((participant, pIndex) => {
                        // Vérifier si on doit ajouter une nouvelle page
                        if (yOffset > pageHeight - margin) {
                            pdf.addPage();
                            yOffset = margin;
                        }

                        // Nom du participant
                        const nameHeight = addText(
                            `${pIndex + 1}. ${participant.name}`,
                            margin,
                            yOffset,
                            12,
                            true
                        );
                        yOffset += nameHeight + 5;

                        // Email
                        const emailHeight = addText(
                            `   Email: ${participant.email}`,
                            margin,
                            yOffset,
                            12,
                            false
                        );
                        yOffset += emailHeight + 5;

                        // Filière
                        if (participant.filiere) {
                            const filiereHeight = addText(
                                `   Filière: ${participant.filiere.name}`,
                                margin,
                                yOffset,
                                12,
                                false
                            );
                            yOffset += filiereHeight + 5;
                        }

                        yOffset += 5; // Espacement supplémentaire entre les participants
                    });
                });
            } else {
                // Si aucun participant, ajouter une page avec un message
                pdf.addPage();
                yOffset = margin;
                addText(
                    "Aucun participant inscrit à cette formation",
                    margin,
                    yOffset,
                    14,
                    true
                );
            }

            // Sauvegarder le PDF
            pdf.save(`formation_${formation.title.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            setError("Une erreur est survenue lors de la génération du PDF");
        }
    };

    const handlePrint = async (formation) => {
        try {
            await generatePDF(formation);
        } catch (error) {
            console.error("Erreur lors de l'export PDF:", error);
            setError("Une erreur est survenue lors de l'export PDF");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mx-auto max-w-4xl mt-8">
                <div className="flex">
                    <svg
                        className="h-5 w-5 text-red-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 print:px-0 print:py-2">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 print:pb-2">
                <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">
                    Formations de votre région
                </h1>
            </div>

            {formations.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-lg text-gray-600">
                        Aucune formation trouvée pour votre région
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {formations.map((formation) => (
                        <div
                            key={formation.id}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 print:shadow-none print:border-gray-300"
                        >
                            <div className="p-5 print:p-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-800 mb-2 print:text-lg">
                                            {formation.title}
                                        </h2>
                                        <p className="text-gray-600">
                                            {formation.description}
                                        </p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() =>
                                                handleShowParticipants(
                                                    formation
                                                )
                                            }
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                            <span>
                                                {selectedFormation?.id ===
                                                formation.id
                                                    ? "Masquer les participants"
                                                    : "Voir les participants"}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handlePrint(formation)
                                            }
                                            className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            <span>Exporter PDF</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:break-after-page">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Date de début:
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    formation.start_date
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Date de fin:
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(formation.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
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
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Lieu:
                                            </p>
                                            <p className="font-medium">
                                                {formation.city?.nom || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Site:
                                            </p>
                                            <p className="font-medium">
                                                {formation.site?.name || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
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
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Animateur:
                                            </p>
                                            <p className="font-medium">
                                                {formation.animateur?.user
                                                    ?.name || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <svg
                                            className="w-4 h-4 text-gray-500 mr-2 mt-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">
                                                Statut:
                                            </p>
                                            <StatusBadge
                                                status={formation.status}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedFormation?.id === formation.id && (
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Participants par ISTA
                                        </h3>
                                        {loadingParticipants ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : participants.length > 0 ? (
                                            <div className="space-y-6">
                                                {participants.map(
                                                    (istaGroup) => (
                                                        <div
                                                            key={
                                                                istaGroup.ista
                                                                    .id
                                                            }
                                                            className="bg-gray-50 rounded-lg p-4 print:break-after-page"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-lg font-semibold text-gray-800">
                                                                    {
                                                                        istaGroup
                                                                            .ista
                                                                            .name
                                                                    }
                                                                </h4>
                                                                <span className="text-sm text-gray-500">
                                                                    {
                                                                        istaGroup
                                                                            .participants
                                                                            .length
                                                                    }{" "}
                                                                    participant(s)
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {istaGroup.participants.map(
                                                                    (
                                                                        participant
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                participant.id
                                                                            }
                                                                            className="bg-white rounded-md p-3 shadow-sm"
                                                                        >
                                                                            <p className="font-medium text-gray-800">
                                                                                {
                                                                                    participant.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-sm text-gray-600">
                                                                                {
                                                                                    participant.email
                                                                                }
                                                                            </p>
                                                                            {participant.filiere && (
                                                                                <p className="text-sm text-gray-500 mt-1">
                                                                                    Filière:{" "}
                                                                                    {
                                                                                        participant
                                                                                            .filiere
                                                                                            .name
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">
                                                Aucun participant inscrit à
                                                cette formation
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DrFormations;
