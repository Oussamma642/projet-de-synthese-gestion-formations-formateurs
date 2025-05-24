export default function Header() {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold">
                    Bienvenue,{" "}
                    {sessionStorage.getItem("acteur")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Voici votre tableau de bord
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
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
                        className="text-muted-foreground"
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                        3
                    </span>
                </div>

                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
            </div>
        </div>
    );
}
