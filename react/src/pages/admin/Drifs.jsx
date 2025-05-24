import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axios-client";

export default function Drifs() {
  const [drifs, setDrifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drifToDelete, setDrifToDelete] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchDrifs();
  }, []);

  const fetchDrifs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get("/drifs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDrifs(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching drifs:", err);
      setError("Erreur lors du chargement des DRIFs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDrifs = drifs.filter((drif) =>
    drif.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drif.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drif.user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDeleteDialog = (drif) => {
    setDrifToDelete(drif);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDrifToDelete(null);
  };

  const confirmDelete = async () => {
    if (!drifToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/drifs/${drifToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setDrifs(drifs.filter(drif => drif.id !== drifToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      console.error("Error deleting DRIF:", err);
      setError("Erreur lors de la suppression du DRIF");
    }
  };

  const openEditDialog = (drif) => {
    setEditFormData({
      id: drif.id,
      name: drif.user.name,
      email: drif.user.email,
      phone: drif.user.phone || "",
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditFormData({
      id: null,
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
      };
      
      if (editFormData.password) {
        payload.password = editFormData.password;
      }
      
      await axiosClient.put(`/drifs/${editFormData.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      fetchDrifs(); // Refresh the list
      closeEditDialog();
    } catch (err) {
      console.error("Error updating DRIF:", err);
      setError("Erreur lors de la mise à jour du DRIF");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des DRIFs</h1>
        <Link to="/dashboard/create-user/drif">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Ajouter un DRIF
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border rounded p-2 w-full max-w-sm"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left w-[100px]">ID</th>
                <th className="py-2 px-4 border-b text-left">Nom</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Téléphone</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrifs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Aucun DRIF trouvé
                  </td>
                </tr>
              ) : (
                filteredDrifs.map((drif) => (
                  <tr key={drif.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{drif.id}</td>
                    <td className="py-2 px-4 border-b font-medium">{drif.user.name}</td>
                    <td className="py-2 px-4 border-b">{drif.user.email}</td>
                    <td className="py-2 px-4 border-b">{drif.user.phone || "-"}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                          onClick={() => openEditDialog(drif)}
                        >
                          Modifier
                        </button>
                        <button 
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
                          onClick={() => openDeleteDialog(drif)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer ce DRIF ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                onClick={closeDeleteDialog}
              >
                Annuler
              </button>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={confirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Modifier le DRIF</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium">Nom</label>
                  <input
                    id="name"
                    name="name"
                    className="border rounded p-2 w-full"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="border rounded p-2 w-full"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-sm font-medium">Téléphone</label>
                  <input
                    id="phone"
                    name="phone"
                    className="border rounded p-2 w-full"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Mot de passe (laisser vide pour ne pas changer)
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="border rounded p-2 w-full"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                  onClick={closeEditDialog}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
