import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";

const ParticipantAccount = () => {
  const { user } = useStateContext();
  const [participantInfo, setParticipantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipantInfo = async () => {
      try {
        setLoading(true);
        // Fetch the participant's data including relations
        const response = await axiosClient.get(`/participants?user_id=${user.id}`);
        
        if (response.data && response.data.length > 0) {
          setParticipantInfo(response.data[0]); // Get the first participant record
        } else {
          setError("Aucune information de participant trouvée pour ce compte.");
        }
      } catch (error) {
        console.error("Error fetching participant info:", error);
        setError("Impossible de récupérer les informations du participant.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchParticipantInfo();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h3 className="text-xl font-semibold text-red-600">Erreur</h3>
          <p className="mt-2 text-gray-700">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // If participant info is not available yet, show a placeholder
  if (!participantInfo) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>Vos informations personnelles ne sont pas encore disponibles.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Extract participant info for cleaner rendering
  const { user: userInfo, formation, ista, filiere } = participantInfo;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-gray-600">Informations personnelles et détails de formation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Vos données de compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Nom</h4>
                <p className="font-medium">{userInfo?.name || "Non spécifié"}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p>{userInfo?.email || "Non spécifié"}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                <Badge>{"Participant"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formation Details Card */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Détails de formation</CardTitle>
              <CardDescription>Informations sur votre parcours de formation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Formation actuelle</h4>
                <p className="font-medium">{formation?.title || "Non assigné"}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">ISTA</h4>
                <p>{ista?.name || "Non assigné"}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Filière</h4>
                <p>{filiere?.name || "Non assigné"}</p>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Localisation</h4>
                <p>{ista?.city?.name || "Ville non disponible"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Formations List Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Mes formations</CardTitle>
              <CardDescription>
                Liste des formations auxquelles vous êtes inscrit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formation ? (
                <div className="border rounded-md p-4">
                  <div className="font-medium text-lg">{formation.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formation.description || "Aucune description disponible"}
                  </div>
                  <div className="flex items-center mt-3">
                    <span className="text-sm">
                      {formation.start_date || "Date non définie"} - {formation.end_date || "Date non définie"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParticipantAccount;