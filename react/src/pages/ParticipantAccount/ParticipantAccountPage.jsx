import React, { useEffect, useState } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import axiosClient from '../../axios-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Loader2 } from 'lucide-react';

const ParticipantAccountPage = () => {
  const { user } = useStateContext();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipantFormations = async () => {
      try {
        setLoading(true);
        // Fetch the current user's participant record
        const response = await axiosClient.get(`/participants?user_id=${user.id}`);
        
        if (response.data && response.data.length > 0) {
          setFormations(response.data);
        } else {
          setError("Aucune formation trouvée pour votre compte.");
        }
      } catch (err) {
        console.error("Error fetching participant formations:", err);
        setError("Une erreur est survenue lors de la récupération de vos formations.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchParticipantFormations();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mes Formations</CardTitle>
          <CardDescription>
            Liste des formations auxquelles vous êtes inscrit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement de vos formations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : formations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Vous n'êtes inscrit à aucune formation pour le moment.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formation</TableHead>
                    <TableHead>ISTA</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formations.map((formation) => (
                    <TableRow key={formation.id}>
                      <TableCell className="font-medium">{formation.formation?.title || 'Non spécifié'}</TableCell>
                      <TableCell>{formation.ista?.name || 'Non spécifié'}</TableCell>
                      <TableCell>{formation.filiere?.name || 'Non spécifié'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Inscrit</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantAccountPage; 