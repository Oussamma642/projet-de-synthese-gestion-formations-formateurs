import React from "react";
import { Link } from "react-router-dom";
import { CreateIcon, UserIcon } from "../components/ui/Icons";

function AdminItems() {

    const adminItems = ["participants", "animateurs", "cdcs", "drifs", "directeurs"];
    return (
        <nav className="space-y-1">
            <Link
                to="/dashboard"
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
            >
                <UserIcon/>
                Tableau de bord
            </Link>
            <Link
                to="/dashboard/create-user"
                className="flex items-center gap-2 p-2 bg-primary/10 text-primary rounded-md"
            >
                <CreateIcon/>
                Créer un nouvel utilisateur
            </Link>

            {adminItems.map((item, indx) => (
                <Link
                    to={`/dashboard/${item}`}
                    key={indx}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                >
                    <UserIcon/>
                    {item}
                </Link>
            ))}
        </nav>
    );
}

export default AdminItems;
