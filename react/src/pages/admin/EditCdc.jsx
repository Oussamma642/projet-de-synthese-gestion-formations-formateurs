import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";

export default function EditCdc() {
  const { id } = useParams(); // Récupère l'ID du CDC depuis l'URL
  const navigate = useNavigate();

  const [cdc, setCdc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCdc = async () => {
      try {
        const { data } = await axiosClient.get(`/cdcs/${id}`);
        setCdc(data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger les informations du CDC.");
        setLoading(false);
      }
    };

    fetchCdc();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/cdcs/${id}`, cdc);
      navigate("/dashboard/cdcs"); // Redirige vers la liste des CDCs après la mise à jour
    } catch (err) {
      setError("Erreur lors de la mise à jour du CDC.");
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
      <h1 className="text-2xl font-bold mb-4">Modifier CDC</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nom</label>
          <input
            type="text"
            value={cdc.user?.name || ""}
            onChange={(e) =>
              setCdc({ ...cdc, user: { ...cdc.user, name: e.target.value } })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={cdc.user?.email || ""}
            onChange={(e) =>
              setCdc({ ...cdc, user: { ...cdc.user, email: e.target.value } })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Téléphone</label>
          <input
            type="text"
            value={cdc.user?.phone || ""}
            onChange={(e) =>
              setCdc({ ...cdc, user: { ...cdc.user, phone: e.target.value } })
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
