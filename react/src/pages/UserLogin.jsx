import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function UserLogin() {
    const { acteur } = useParams();

    
    const { setUser, setToken } = useStateContext();
    const [errors, setErrors] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: acteur
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors(null);
        
        console.log("Tentative de connexion avec:", {
            email: formData.email,
            role: acteur
        });
        
        // Check if role is valid
        if (!acteur) {
            setErrors({
                role: ["Veuillez sélectionner un rôle pour vous connecter"]
            });
            setIsLoading(false);
            return;
        }
        
        // Make login request
        axiosClient
            .post("/login", formData)
            .then(({ data }) => {
                setIsLoading(false);
                
                // Check if we have the user data and token
                if (!data.user || !data.token) {
                    console.error("Réponse de connexion invalide:", data);
                    setErrors({
                        email: ["La réponse du serveur est invalide. Veuillez réessayer."]
                    });
                    return;
                }
                
                // Ensure user data includes the role
                const userData = {
                    ...data.user,
                    role: data.user.role || acteur
                };
                
                console.log("Connexion réussie, données utilisateur:", userData);
                
                // Store user with role in context
                setUser(userData);
                
                // Store token
                setToken(data.token);
                
                // Store role in localStorage for persistence
                localStorage.setItem("acteur", userData.role);
                localStorage.setItem("username", userData.name);
                
                // Redirect to dashboard
                navigate(`/dashboard`);
            })
            .catch((err) => {
                setIsLoading(false);
                console.error("Erreur de connexion:", err);
                
                // Handle different error responses
                if (err.response) {
                    const { status, data } = err.response;
                    console.log(`Erreur de serveur ${status}:`, data);
                    
                    if (status === 422 && data.errors) {
                        setErrors(data.errors);
                    } else if (data.message) {
                        setErrors({
                            email: [data.message]
                        });
                    } else {
                        setErrors({
                            email: [`Erreur ${status}: Veuillez vérifier vos informations`]
                        });
                    }
                } else if (err.request) {
                    console.error("Aucune réponse reçue:", err.request);
                    setErrors({
                        email: ["Pas de réponse du serveur. Vérifiez votre connexion internet."]
                    });
                } else {
                    setErrors({
                        email: ["Une erreur est survenue lors de la connexion. Veuillez réessayer."]
                    });
                }
            });
    };

    return (
        <motion.div
            className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <Link
                to="/login"
                className="absolute top-4 left-4 flex items-center text-primary hover:underline"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Retour à la sélection du rôle
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Connexion
                    </CardTitle>
                    <CardDescription className="text-center">
                        Connectez-vous en tant que {acteur || "utilisateur"}
                        {acteur && ` (${acteur.toLocaleUpperCase()})`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ---------------------------- For displaying errors */}
                        {errors && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="font-medium">Erreur de connexion</p>
                                </div>
                                {Object.keys(errors).map((key) => (
                                    <p
                                        key={key}
                                        className="text-sm"
                                    >
                                        {errors[key][0]}
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="votre@email.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors && errors.email ? "border-red-500 focus:ring-red-500" : ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Link
                                    to="#"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Mot de passe oublié?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={errors && errors.password ? "border-red-500 focus:ring-red-500" : ""}
                                required
                            />
                        </div>
                        
                        {/* Helper message for testing */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md text-xs">
                                <p className="font-medium mb-1">Mode développement</p>
                                <p>Si vous avez des problèmes de connexion, vérifiez que le backend est bien en cours d'exécution et que les informations d'identification sont correctes.</p>
                                <p className="mt-1">Test: drif@test.com / password</p>
                            </div>
                        )}
                        
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion en cours...
                                    </div>
                                )
                                : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    {/* <div className="text-center text-sm text-muted-foreground">
            Vous n'avez pas de compte?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </div> */}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
