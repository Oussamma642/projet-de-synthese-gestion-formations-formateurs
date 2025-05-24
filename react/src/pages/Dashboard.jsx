import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";
import axiosClient from "../axios-client";
import { useStateContext } from '../contexts/ContextProvider';
import PageLoading from '../components/ui/PageLoading';

// Page transition variants
const pageVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: { duration: 0.5 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 },
    },
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useStateContext();
    const [searchParams] = useSearchParams();
    
    // Get role from context, localStorage or fallback to search params
    const userRole = user?.role || localStorage.getItem('acteur') || searchParams.get("role") || "user";
    
    const [activeTab, setActiveTab] = useState("actifs");
    const [filterState, setFilterState] = useState({
        centre: "all",
        formation: "all",
        formateur: "all",
    });
    
    // Add DRIF dashboard stats at the component level
    // Add dashboard stats states
    const [drifStats, setDrifStats] = useState({
        drafts: 0,
        redigees: 0,
        validees: 0,
        total: 0
    });
    
    const [userStats, setUserStats] = useState({
        inProgress: 0,
        completed: 0,
        certifications: 0
    });

    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        newRegistrations: 0,
        formateurs: 0,
        recentUsers: []
    });

    const [directionStats, setDirectionStats] = useState({
        centers: 0,
        activeFormations: 0,
        recentCenters: []
    });
    
    // Add loading state to know when data is being fetched
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Log the user and role information for debugging
        console.log('Dashboard - User from context:', user);
        console.log('Dashboard - Role from localStorage:', localStorage.getItem('acteur'));
        console.log('Dashboard - Using role:', userRole);
    }, [user, userRole]);

    // Fetch user formations data
    const fetchUserFormations = async () => {
        setIsLoading(true);
        try {
            // Fetch the user's formation data
            const response = await axiosClient.get('/user/formations');
            if (response.data) {
                setUserStats({
                    inProgress: response.data.in_progress,
                    completed: response.data.completed,
                    certifications: response.data.certifications
                });
                console.log('User formations loaded:', response.data);
            }
        } catch (error) {
            console.error('Error fetching user formations:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Add effect for fetching all stats at the component level
    useEffect(() => {
        setIsLoading(true);
        
        // Fetch appropriate stats based on role
        // eslint-disable-next-line default-case
        switch(userRole) {
            case 'admin':
                fetchAdminStats();
                break;
            case 'drif':
            case 'cdc':
                fetchDrifStats();
                break;
            case 'animateur':
            case 'participant':
                fetchUserFormations();
                break;
        }

        // Fetch user formations data for all roles
        fetchUserFormations();
    }, [userRole]);

    // Fetch admin-specific stats
    const fetchAdminStats = async () => {
        try {
            console.log('Fetching admin stats...');
            const response = await axiosClient.get('/admin/stats');
            console.log('Admin stats response:', response.data);
            
            if (response.data) {
                const stats = {
                    totalUsers: response.data.totalUsers,
                    newRegistrations: response.data.newRegistrations,
                    formateurs: response.data.formateurs,
                    recentUsers: response.data.recentUsers
                };
                console.log('Setting admin stats:', stats);
                setAdminStats(stats);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
        }
    };

    // Fetch DRIF/CDC-specific stats
    const fetchDrifStats = async () => {
        try {
            const response = await axiosClient.get('/formations/stats');
            if (response.data) {
                setDrifStats({
                    drafts: response.data.brouillon,
                    redigees: response.data.redigee,
                    validees: response.data.validee,
                    total: response.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching DRIF stats:', error);
        }

        try {
            const centersResponse = await axiosClient.get('/centres/stats');
            if (centersResponse.data) {
                setDirectionStats({
                    centers: centersResponse.data.centers,
                    activeFormations: centersResponse.data.activeFormations,
                    recentCenters: centersResponse.data.recentCenters
                });
            }
        } catch (error) {
            console.error('Error fetching centers stats:', error);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilterState((prev) => ({
            ...prev,
            [filterType]: value,
        }));
    };

    // Définir les cartes de statut des formations pour les utilisateurs DRIF et CDC
    const formationStatusCards = [
        {
            title: 'Brouillons',
            count: drifStats.drafts,
            description: 'Formations en cours de création',
            link: '/dashboard/drafts',
            color: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-700',
            iconColor: 'text-yellow-500',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            title: 'Rédigées',
            count: drifStats.redigees,
            description: 'Formations finalisées en attente de validation',
            link: '/dashboard/redigees',
            color: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-500',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            title: 'Validées',
            count: drifStats.validees,
            description: 'Formations complètement validées',
            link: '/dashboard/validees',
            color: 'bg-green-50 border-green-200',
            textColor: 'text-green-700',
            iconColor: 'text-green-500',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    const welcomeMessage = () => {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
        
        // Get role-specific greeting
        const roleGreeting = (() => {
            const role = userRole || localStorage.getItem('acteur');
            switch(role) {
                case 'drif':
                    return 'DRIF';
                case 'cdc':
                    return 'CDC';
                case 'animateur':
                    return 'Formateur';
                case 'participant':
                    return 'Participant';
                case 'admin':
                    return 'Administrateur';
                default:
                    return '';
            }
        })();
        
        return `${timeGreeting}${roleGreeting ? ' ' + roleGreeting : ''}`;
    };

    // Admin Dashboard
    const renderAdminDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div
                variants={itemVariants}
                className="flex justify-between items-center"
            >
                <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
                <Link to="/users/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 py-2">
                    Ajouter un utilisateur
                </Link>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Nouvelles Inscriptions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{adminStats.newRegistrations}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Formateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{adminStats.formateurs}</p>
                            <table>
                                <tbody>
                                    {adminStats.recentUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className="border-t"
                                        >
                                            <td className="p-2">{user.name}</td>
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{user.role_name}</td>
                                            <td className="p-2">Actif</td>
                                            <td className="p-2">
                                                <Link to={`/users/${user.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 py-2">
                                                    Voir
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="bg-card rounded-lg p-4 border"
            >
                <h3 className="text-xl font-semibold mb-4">
                    Liste des utilisateurs récents
                </h3>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {adminStats.recentUsers.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Aucun utilisateur récent trouvé
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="p-2">Nom</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2">Rôle</th>
                                            <th className="p-2">Statut</th>
                                            <th className="p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminStats.recentUsers.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="border-t"
                                            >
                                                <td className="p-2">{user.name}</td>
                                                <td className="p-2">{user.email}</td>
                                                <td className="p-2">{user.role_name}</td>
                                                <td className="p-2">Actif</td>
                                                <td className="p-2">
                                                    <Link to={`/users/${user.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 py-2">
                                                        Voir
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    // Direction Régionale Dashboard
    const renderDirectionRegionaleDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div
                variants={itemVariants}
                className="flex justify-between items-center"
            >
                <h2 className="text-2xl font-bold">
                    Gestion des
                     Centres de Formation
                </h2>
                <Link to="/centers/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 py-2">
                    Ajouter un centre
                </Link>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Centres de Formation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{directionStats.centers}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Formations Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{directionStats.activeFormations}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Stagiaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">2,154</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="bg-card rounded-lg p-4 border"
            >
                <h3 className="text-xl font-semibold mb-4">
                    Performance par Centre
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Centre de Formation Casablanca</span>
                            <span>92%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <Progress value={92} />
                        </motion.div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Centre de Formation Rabat</span>
                            <span>87%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                        >
                            <Progress value={87} />
                        </motion.div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Centre de Formation Tanger</span>
                            <span>78%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                        >
                            <Progress value={78} />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    // CDC Dashboard
    const renderCDCDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold">CDC Dashboard</h2>
                <p className="text-muted-foreground">
                    Développement et amélioration des modules de formation
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Modules Actifs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold">28</span>
                                <span className="ml-2 text-xs text-green-500">
                                    +3 nouveaux modules ce mois-ci
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Formateurs Associés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold">42</span>
                                <span className="ml-2 text-xs text-green-500">
                                    +5 nouvelles collaborations
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Evaluations Reçues
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold">156</span>
                                <span className="ml-2 text-xs text-green-500">
                                    +24 cette semaine
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Satisfaction Moyenne
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-baseline">
                                <span className="text-2xl font-bold">
                                    4.7/5
                                </span>
                                <span className="ml-2 text-xs text-green-500">
                                    +0.2 par rapport au trimestre précédent
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Modules and Evaluations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Modules de Formation */}
                <motion.div
                    variants={itemVariants}
                    className="bg-card rounded-lg p-6 border"
                >
                    <h3 className="text-xl font-semibold mb-2">
                        Modules de Formation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Aperçu des modules développés par votre centre
                    </p>

                    <div className="flex space-x-2 mb-4 border-b">
                        <button
                            className={`pb-2 text-sm font-medium ${
                                activeTab === "actifs"
                                    ? "border-b-2 border-primary"
                                    : ""
                            }`}
                            onClick={() => setActiveTab("actifs")}
                        >
                            Actifs
                        </button>
                        <button
                            className={`pb-2 text-sm font-medium ${
                                activeTab === "developpement"
                                    ? "border-b-2 border-primary"
                                    : ""
                            }`}
                            onClick={() => setActiveTab("developpement")}
                        >
                            En Développement
                        </button>
                        <button
                            className={`pb-2 text-sm font-medium ${
                                activeTab === "revision"
                                    ? "border-b-2 border-primary"
                                    : ""
                            }`}
                            onClick={() => setActiveTab("revision")}
                        >
                            En Révision
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-background p-4 rounded border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">
                                        Développement Web Frontend
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        8 formateurs dans 6 centres
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star, index) => (
                                        <svg
                                            key={index}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill={index < 4 ? "gold" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="mr-1"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                    <span className="text-xs ml-1">4.8/5</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background p-4 rounded border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">
                                        Bases de Données SQL
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        6 formateurs dans 4 centres
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star, index) => (
                                        <svg
                                            key={index}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill={index < 4 ? "gold" : "none"}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="mr-1"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    ))}
                                    <span className="text-xs ml-1">4.5/5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Evaluations Récentes */}
                <motion.div
                    variants={itemVariants}
                    className="bg-card rounded-lg p-6 border"
                >
                    <h3 className="text-xl font-semibold mb-2">
                        Évaluations Récentes
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Retours des formateurs et participants sur vos modules
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 border rounded bg-background">
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                                <div>
                                    <p className="font-medium">Emma Thompson</p>
                                    <p className="text-xs text-muted-foreground">
                                        Aujourd'hui
                                    </p>
                                </div>
                                <div className="ml-auto text-xs bg-muted px-2 py-1 rounded">
                                    Formateur
                                </div>
                            </div>
                            <p className="text-sm mb-2">
                                Module: Développement Web Frontend
                            </p>
                            <div className="flex mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="gold"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="mr-1"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm">
                                Excellent module avec des exercices pratiques
                                très pertinents.
                            </p>
                        </div>

                        <div className="p-4 border rounded bg-background">
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                                <div>
                                    <p className="font-medium">Michael Chen</p>
                                    <p className="text-xs text-muted-foreground">
                                        Hier
                                    </p>
                                </div>
                                <div className="ml-auto text-xs bg-muted px-2 py-1 rounded">
                                    Formateur
                                </div>
                            </div>
                            <p className="text-sm mb-2">
                                Module: Bases de Données SQL
                            </p>
                            <div className="flex mb-1">
                                {[1, 2, 3, 4].map((star) => (
                                    <svg
                                        key={star}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="gold"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="mr-1"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="mr-1"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <p className="text-sm">
                                Bon contenu, mais pourrait inclure plus
                                d'exercices pratiques.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    // Animateur Dashboard
    const renderAnimateurDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div
                variants={itemVariants}
                className="flex justify-between items-center"
            >
                <h2 className="text-2xl font-bold">Mes Formations</h2>
                <Button>Ajouter un module</Button>
            </motion.div>
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Formations Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">4</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Stagiaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">86</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Évaluations à faire</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">12</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="bg-card rounded-lg p-4 border"
            >
                <h3 className="text-xl font-semibold mb-4">
                    Progression des Formations
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Développement Web Frontend</span>
                            <span>68%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </motion.div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>JavaScript Avancé</span>
                            <span>42%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                        >
                            <Progress value={42} />
                        </motion.div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span>Bases de Données</span>
                            <span>85%</span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                        >
                            <Progress value={85} />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    // User Dashboard
    const renderUserDashboard = () => {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex justify-between items-center"
                >
                    <h2 className="text-2xl font-bold">
                        Mon Parcours de Formation
                    </h2>
                    <Button>Voir toutes les formations</Button>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Formations en cours
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-600">{userStats.inProgress}</p>
                                <p className="text-sm text-gray-500 mt-1">Formations actives</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Formations terminées
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">{userStats.completed}</p>
                                <p className="text-sm text-gray-500 mt-1">Formations complétées</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Certifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-purple-600">{userStats.certifications}</p>
                                <p className="text-sm text-gray-500 mt-1">Certificats obtenus</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
                >
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Progression de mes formations
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Développement Web</span>
                                <span className="font-medium text-blue-600">75%</span>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </motion.div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Début: 10 Jan 2023</span>
                                <span>Fin prévue: 15 Juin 2023</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Design UI/UX</span>
                                <span className="font-medium text-blue-600">45%</span>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                            >
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </motion.div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Début: 5 Mar 2023</span>
                                <span>Fin prévue: 20 Juil 2023</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Gestion de Projet</span>
                                <span className="font-medium text-blue-600">20%</span>
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            >
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                            </motion.div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Début: 12 Avr 2023</span>
                                <span>Fin prévue: 30 Sep 2023</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Formations recommandées
                        </h3>
                        <Link to="/dashboard/all-formations" className="text-blue-600 hover:underline text-sm">
                            Voir tout
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h4 className="font-medium text-lg">React Avancé</h4>
                            <p className="text-sm text-gray-600 mb-2">Apprenez les concepts avancés de React, Redux et GraphQL</p>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="flex items-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    8 semaines
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    120 participants
                                </span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h4 className="font-medium text-lg">DevOps et CI/CD</h4>
                            <p className="text-sm text-gray-600 mb-2">Maîtrisez les pratiques DevOps et l'intégration continue</p>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="flex items-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    10 semaines
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    85 participants
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // DRIF Dashboard
    const renderDrifDashboard = () => {
        // Get the username from context, localStorage or default
        const storedUserData = localStorage.getItem('USER_DATA');
        const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
        const username = user?.name || (parsedUserData?.name) || localStorage.getItem('username') || 'Utilisateur';
        
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <motion.div variants={itemVariants} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{welcomeMessage()}, {username}</h1>
                    </div>
                    <p className="text-gray-600">
                        Bienvenue dans votre tableau de bord DRIF. Gérez ici vos formations et les validations.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Vue d'ensemble des formations</h2>
                    {drifStats.total === 0 ? (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-500 mb-4">Aucune formation trouvée dans le système.</p>
                            <Link to="/dashboard/create-formation">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
                                    Créer une formation
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="bg-indigo-50 border border-indigo-200 rounded-lg p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800">Total</p>
                                        <p className="text-3xl font-bold text-indigo-700">{drifStats.total}</p>
                                    </div>
                                    <div className="p-3 rounded-full bg-indigo-500 bg-opacity-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2M7 7h10" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>

                            <Link to="/dashboard/drafts">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Brouillons</p>
                                            <p className="text-3xl font-bold text-yellow-700">{drifStats.drafts}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>

                            <Link to="/dashboard/redigees">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="bg-green-50 border border-green-200 rounded-lg p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Rédigées</p>
                                            <p className="text-3xl font-bold text-green-700">{drifStats.redigees}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>

                            <Link to="/dashboard/validees">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Validées</p>
                                            <p className="text-3xl font-bold text-blue-700">{drifStats.validees}</p>
                                        </div>
                                        <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Transition des formations</h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between flex-wrap gap-4">
                                <Link to="/dashboard/drafts" className="flex-1 min-w-[200px]">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-medium">Brouillons</h3>
                                        <p className="text-sm text-gray-500 mt-1">Formations en cours de création</p>
                                        <p className="text-lg font-bold text-yellow-700 mt-2">{drifStats.drafts}</p>
                                    </motion.div>
                                </Link>

                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>

                                <Link to="/dashboard/redigees" className="flex-1 min-w-[200px]">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-3 rounded-full bg-green-100 text-green-500 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-medium">Rédigées</h3>
                                        <p className="text-sm text-gray-500 mt-1">Formations à valider</p>
                                        <p className="text-lg font-bold text-green-700 mt-2">{drifStats.redigees}</p>
                                    </motion.div>
                                </Link>

                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>

                                <Link to="/dashboard/validees" className="flex-1 min-w-[200px]">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-500 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h3 className="font-medium">Validées</h3>
                                        <p className="text-sm text-gray-500 mt-1">Formations complètes</p>
                                        <p className="text-lg font-bold text-blue-700 mt-2">{drifStats.validees}</p>
                                    </motion.div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <Link to="/dashboard/create-formation">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-medium">Créer une formation</h3>
                                            <p className="text-sm text-gray-500">Commencer une nouvelle formation</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                            
                            <Link to="/dashboard/profile">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-medium">Mon profil</h3>
                                            <p className="text-sm text-gray-500">Gérer vos informations personnelles</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                            
                            <Link to="/dashboard/redigees">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="border border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-medium">Valider formations</h3>
                                            <p className="text-sm text-gray-500">Gérer les validations en attente</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    const renderDashboard = () => {
        switch (userRole) {
            case "admin":
                return renderAdminDashboard();
            case "dr":
                return renderDirectionRegionaleDashboard();
            case "cdc":
                return renderCDCDashboard();
            case "formateur":
                return renderAnimateurDashboard();
            case "drif":
                return renderDrifDashboard();
            default:
                return renderUserDashboard();
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-background py-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <div className="container mx-auto py-8 px-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">Chargement des données en cours...</p>
                        </div>
                    </div>
                ) : (
                    renderDashboard()
                )}
            </div>
        </motion.div>
    );
}
