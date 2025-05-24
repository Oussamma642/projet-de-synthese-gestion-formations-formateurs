import { Link, useLocation } from "react-router-dom";
import {
    CreateIcon,
    DraftsIcon,
    ValidatedIcon,
    WrittenIcon,
    ProfileIcon,
} from "../components/ui/Icons";

export default function DrifCdcItems() {
    const location = useLocation();

    // Menu items avec traductions françaises
    const menuItems = [
        {
            path: "/dashboard",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            label: "Tableau de bord",
            description: "Aperçu général",
        },
        {
            path: "/dashboard/profile",
            icon: <ProfileIcon />,
            label: "Mon Profil",
            description: "Gérer vos informations personnelles",
        },
        {
            path: "/dashboard/create-formation",
            icon: <CreateIcon />,
            label: "Créer une formation",
            description: "Ajouter une nouvelle formation",
        },
        {
            path: "/dashboard/drafts",
            icon: <DraftsIcon />,
            label: "Brouillons",
            description: "Formations en cours de rédaction",
        },
        {
            path: "/dashboard/redigees",
            icon: <WrittenIcon />,
            label: "Rédigées",
            description: "Formations finalisées à valider",
        },
        {
            path: "/dashboard/validees",
            icon: <ValidatedIcon />,
            label: "Validées",
            description: "Formations complètement validées",
        },
    ];

    return (
        <nav className="space-y-2">
            {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={index}
                        to={item.path}
                        className={`
                            flex flex-col p-3 rounded-md transition-all duration-200
                            ${
                                isActive
                                    ? "bg-primary/15 text-primary"
                                    : "hover:bg-muted"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-7 mt-1">
                            {item.description}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
