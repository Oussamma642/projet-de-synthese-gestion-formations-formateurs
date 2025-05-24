import { Link } from "react-router-dom";
import { BookOpenIcon } from "../components/ui/Icons";

export default function ParticipantItems() {
    return (
        <nav className="space-y-1">
            <Link
                to="/dashboard/participant-account"
                className="flex items-center gap-2 p-2 bg-primary/10 text-primary rounded-md"
            >
                <BookOpenIcon/>
                Mes Formations
            </Link>
        </nav>
    );
} 