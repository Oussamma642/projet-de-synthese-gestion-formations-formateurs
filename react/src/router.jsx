import { AnimatePresence } from "framer-motion";
import React, { lazy, Suspense } from "react";
import {
    BrowserRouter as AnimatedRoutes,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";
import "./styles/globals.css";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./layouts/ProtectedRoute";
import DrFormations from "./pages/drs/DrFormations";

// Lazy load components for better performance
const Login = lazy(() => import("./pages/Login"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));

// Admin pages
const Cdcs = lazy(() => import("./pages/admin/Cdcs"));
const Animateurs = lazy(() => import("./pages/admin/Animateurs"));
const Drifs = lazy(() => import("./pages/admin/Drifs"));
const Participants = lazy(() => import("./pages/admin/Participants"));
const UserForm = lazy(() => import("./pages/admin/UserForm"));
const Drs = lazy(() => import("./pages/admin/Drs"));
const CreateCdc = lazy(() => import("./pages/admin/CreateCdc"));
const RedirectToUserSpecForm = lazy(() => import("./pages/admin/RedirectToUserSpecForm"));
const CreateDrif = lazy(() => import("./pages/admin/CreateDrif"));
const CreateParticipant = lazy(() => import("./pages/admin/CreateParticipant"));
const CreateDr = lazy(() => import("./pages/admin/CreateDr"));
const CreateAnimateur = lazy(() => import("./pages/admin/CreateAnimateur"));
const EditAnimateur = lazy(() => import("./pages/admin/EditAnimateur")); // Importez le composant d'édition
const EditCdc = lazy(() => import("./pages/admin/EditCdc")); // Importez le composant d'édition

// CDC/DRIF pages - preload these for better UX
const Drafts = lazy(() => import("./pages/cdc-drif/Drafts"));
const Redigees = lazy(() => import("./pages/cdc-drif/Redigees"));
const Validees = lazy(() => import("./pages/cdc-drif/Validees"));
const FormationForm = lazy(() => import("./pages/cdc-drif/FormationForm"));
const ViewFormation = lazy(() => import("./pages/cdc-drif/ViewFormation"));
const EditFormation = lazy(() => import("./pages/cdc-drif/EditFormation"));

// DRIF profile
const DrifProfile = lazy(() => import("./pages/drif/Profile"));

// Loading fallback
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

const MyAppRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
                <Routes location={location} key={location.pathname}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />

                    {/* Authentication Routes (Parent: "/auth") */}
                    <Route path="/" element={<AuthLayout />}>
                        <Route path="login" element={<Login />} />
                        <Route path="login/:acteur" element={<UserLogin />} />
                    </Route>

                    {/* Protected Routes (Parent: "/dashboard") */}
                    <Route path="/dashboard" element={<ProtectedRoute />}>
                        <Route index element={<Dashboard />} />

                        {/* Directeur Path to show formations */}
                        <Route path="dr-formations" element={<DrFormations/>} />

                        {/* Admin Routes */}
                        <Route path="create-user" element={<UserForm />} />
                        <Route path="/dashboard/create-user/:acteur" element={<RedirectToUserSpecForm/>} />
                        <Route path="/dashboard/create-user/cdc" element={<CreateCdc/>} />
                        <Route path="/dashboard/create-user/drif" element={<CreateDrif/>} />
                        <Route path="/dashboard/create-user/participant" element={<CreateParticipant/>} />
                        <Route path="/dashboard/create-user/dr" element={<CreateDr/>} />
                        <Route path="/dashboard/create-user/animateur" element={<CreateAnimateur/>} />

                        <Route path="cdcs" element={<Cdcs />} />
                        <Route path="animateurs" element={<Animateurs />} />

<Route path="animateurs/edit/:id" element={<CreateAnimateur />} />
<Route path="edit-cdc/:id" element={<CreateCdc />} />

________
                        <Route path="drifs" element={<Drifs />} />

                        <Route path="participants" element={<Participants />} />

<Route path="/dashboard/edit-participant/:id" element={<CreateParticipant />} />
<Route path="/dashboard/create-user/participant" element={<CreateParticipant />} />
                        <Route path="directeurs" element={<Drs />} />

                        {/* DRIF Routes */}
                        <Route path="profile" element={<DrifProfile />} />

                        {/* CDC/DRIF Routes */}
                        <Route path="drafts" element={<Drafts />} />
                        <Route path="redigees" element={<Redigees />} />
                        <Route path="validees" element={<Validees />} />
                        <Route path="create-formation" element={<FormationForm/>}/>
                        <Route path="view-formation/:id" element={<ViewFormation />} />
                        <Route path="edit-formation/:id" element={<EditFormation />} />
                    </Route>
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
}

export default MyAppRoutes;
