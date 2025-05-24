
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";


export default function Animateurs() {
  const { setNotification } = useStateContext();
  const navigate = useNavigate();

  const [animateurs, setAnimateurs] = useState([]);
  const [filteredAnimateurs, setFilteredAnimateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAnimateurs();
  }, []);

  useEffect(() => {
    const filtered = animateurs.filter((a) =>
      a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnimateurs(filtered);
  }, [searchTerm, animateurs]);

  const loadAnimateurs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/animateurs");
      setAnimateurs(data);
      setFilteredAnimateurs(data);
      setLoading(false);
    } catch (err) {
      setError("Impossible de charger les animateurs.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet animateur ?")) {
      try {
        await axiosClient.delete(`/animateurs/${id}`);
        setNotification("Animateur supprimé avec succès");
        loadAnimateurs();
      } catch (err) {
        setNotification("Erreur lors de la suppression de l'animateur");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Animateurs</h1>
        <button
          onClick={() => navigate("/dashboard/create-user/animateur")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Créer un nouveau animateur
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom..."
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAnimateurs.map((animateur) => (
              <tr key={animateur.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animateur.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animateur.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animateur.user?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animateur.user?.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => navigate(`/dashboard/animateurs/edit/${animateur.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(animateur.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



