import { Link } from "react-router-dom";
import { BookOpenIcon } from "../components/ui/Icons";

export default function DrItems() {
    return (
        <nav className="space-y-1">
            <Link
                to="/dashboard/dr-formations"
                className="flex items-center gap-2 p-2 bg-primary/10 text-primary rounded-md"
            >
                <BookOpenIcon/>
                Mes Formations En Tant Que Dircteur
            </Link>
        </nav>
    );
} 