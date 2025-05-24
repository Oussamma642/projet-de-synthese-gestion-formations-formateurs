import React, { useEffect, Suspense, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

import { motion } from "framer-motion";
import { pageVariants } from "../styles/pageVariants";
import axiosClient from "../axios-client";
import AdminItems from "../menu/AdminItems";
import DrifCdcItems from "../menu/DrifCdcItems";
import Header from "../pages/Header";
import DrItems from "../menu/DrItems";

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen ml-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

function ProtectedRoute() {
    const navigate = useNavigate();
    const { token, user, setToken, setUser } = useStateContext();
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState("");

    // Prefetch important components
    useEffect(() => {
        const prefetchRoutes = async () => {
            try {
                // Précharger les composants des pages fréquemment utilisées
                if (
                    localStorage.getItem("acteur") === "drif" ||
                    localStorage.getItem("acteur") === "cdc"
                ) {
                    import("../pages/cdc-drif/Drafts");
                    import("../pages/cdc-drif/Redigees");
                    import("../pages/cdc-drif/Validees");
                }
            } catch (error) {
                console.error("Prefetch error:", error);
            }
        };

        prefetchRoutes();
    }, []);

    // Check authentication
    useEffect(() => {
        const storedToken = localStorage.getItem("ACCESS_TOKEN");
        if (!token && !storedToken) {
            navigate("/login");
        } else {
            setUserRole(localStorage.getItem("acteur") || "");
            setIsLoading(false);
        }
    }, [token, navigate]);

    const handleLogout = () => {
        // First clear local state and storage
        setUser({});
        setToken(null);

        // Then try to notify the server - but don't wait for it
        axiosClient
            .post("/logout")
            .then(() => {
                console.log("Logout successful on server");
            })
            .catch((error) => {
                // Ignore network errors during logout
                console.log(
                    "Logout error on server, but proceeding with client logout"
                );
            })
            .finally(() => {
                // Navigate regardless of server response
                navigate("/login");
            });
    };

    // Si la page est encore en chargement, afficher un indicateur
    if (isLoading) {
        return <LoadingFallback />;
    }

    return (
        <motion.div
            className="min-h-screen bg-background"
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            variants={pageVariants}
        >
            {/* Side Bar */}
            <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r p-4 flex flex-col">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">
                        <Link to="/dashboard">OFPPT</Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Gestion des formations
                    </p>
                </div>

                {/* Afficher le Menu selon le type d'acteur */}
                {/* {userRole === "admin" ? <AdminItems /> : <DrifCdcItems />} */}

                {userRole === "admin" ? (
                    <AdminItems />
                ) : userRole === "dr" ? (
                    <DrItems/>
                ) : (
                    <DrifCdcItems />
                )}

                {/* ----- Logout button */}
                <div className="mt-auto">
                    <button
                        className="flex items-center gap-2 p-2 w-full hover:bg-muted rounded-md"
                        onClick={handleLogout}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="ml-64 p-6"
            >
                {/* ----------- Header */}
                <Header />

                {/*--------------------------- Main Content */}
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </motion.main>
        </motion.div>
    );
}

export default ProtectedRoute;
