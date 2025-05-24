import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";

export default function EditAnimateur() {
  const { id } = useParams(); // Récupère l'ID de l'animateur depuis l'URL
  const navigate = useNavigate();

  const [animateur, setAnimateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimateur = async () => {
      try {
        const { data } = await axiosClient.get(`/animateurs/${id}`);
        setAnimateur(data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger les informations de l'animateur.");
        setLoading(false);
      }
    };

    fetchAnimateur();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/animateurs/${id}`, animateur);
      navigate("/dashboard/animateurs"); // Redirige vers la liste des animateurs après la mise à jour
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'animateur.");
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Modifier Animateur</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nom</label>
          <input
            type="text"
            value={animateur.user?.name || ""}
            onChange={(e) =>
              setAnimateur({ ...animateur, user: { ...animateur.user, name: e.target.value } })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={animateur.user?.email || ""}
            onChange={(e) =>
              setAnimateur({ ...animateur, user: { ...animateur.user, email: e.target.value } })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Téléphone</label>
          <input
            type="text"
            value={animateur.user?.phone || ""}
            onChange={(e) =>
              setAnimateur({ ...animateur, user: { ...animateur.user, phone: e.target.value } })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
