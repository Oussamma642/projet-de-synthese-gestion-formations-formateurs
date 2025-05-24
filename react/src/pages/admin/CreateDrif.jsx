import React, { useState } from 'react';
import axiosClient from '../../axios-client';

function CreateDrif() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  function handleSubmit(e) {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.password_confirmation) {
      setErrors({
        password_confirmation: ["Les mots de passe ne correspondent pas"]
      });
      return;
    }

    setIsLoading(true);
    setErrors(null);
    setSuccess(false);

    // Create a copy of formData without password_confirmation
    const { password_confirmation, ...dataToSend } = formData;

    const token = localStorage.getItem('token');
    axiosClient.post("/drifs", dataToSend, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Success:", response.data);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
      });
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
      console.error("Error:", error.response || error.message);
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: ["Une erreur s'est produite. Veuillez réessayer."]
        });
      }
    });
  }

return (
    <div className="max-w-4xl mx-auto my-10 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Créer un Nouveau DRIF</h2>
        </div>

        {success && (
            <div className="mx-6 mt-4 p-3 bg-green-50 text-green-700 border-l-4 border-green-500 rounded" role="alert">
                <p>DRIF créé avec succès!</p>
                <button
                    onClick={() => window.location.href = '/dashboard/drifs'}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Aller à la liste des DRIFs
                </button>
            </div>
        )}

        {errors && (
            <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded" role="alert">
                {Object.keys(errors).map((key) => (
                    <p key={key}>{errors[key][0]}</p>
                ))}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Entrez le nom complet"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="exemple@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="0611223344"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            placeholder="••••••••"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* <div className="mt-8">
                        <div className="flex items-center">

                        </div>
                    </div> */}
                </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 text-right border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Création en cours...
                        </span>
                    ) : "Créer DRIF"}
                </button>
            </div>
        </form>
    </div>
);
}

export default CreateDrif;
