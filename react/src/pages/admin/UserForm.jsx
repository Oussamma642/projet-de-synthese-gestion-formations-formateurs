
import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
// import { Card } from "../../components/ui/card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"


const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -5 }
  }
  

const roles = [
    {
        id: "cdc",
        label: "Responsable CDC",
        description: "Proposez et coordonnez les plans de formation",
    },
    {
        id: "animateur",
        label: "Formateur Animateur",
        description: "Animez des sessions et gérez les contenus",
    },
    {
        id: "drif",
        label: "Responsable DR (DRIF)",
        description: "Publiez les sessions dans votre région",
    },
    {
        id: "dr",
        label: "Directeur Régional",
        description: "Suivez les formations dans votre institution",
    },
    {
        id: "participant",
        label: "Formateur Participant",
        description: "Inscrivez-vous et suivez des formations",
    },
    // {
    //     id: "admin",
    //     label: "Admin",
    //     description:
    //         "Résponsable pour la Création des comptes et de la maintenance",
    // },
];

export default function UserForm() {

      const navigate = useNavigate()
    
      const handleRoleSelect = async (roleId) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800))
          // Navigate to user login page with the selected role
          navigate(`/dashboard/create-user/${roleId}`)
        } catch (error) {
          console.error("Login error:", error)
          alert("Erreur de connexion. Veuillez réessayer.")
        }
      }
    

    return (
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl font-bold">Créer un nouvel utilisateur</h1>
                <p className="mt-2 text-muted-foreground">
                    Sélectionnez L'utilisateur à créer
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {roles.map((role, index) => (
                    <motion.div
                        key={role.id}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        variants={cardVariants}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleRoleSelect(role.id)}
                        className="bg-white dark:bg-gray-800"
                    >
                        <Card className="h-full cursor-pointer border-2 hover:border-primary transition-colors">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {role.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base dark:text-gray-300">
                                    {role.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="mt-8 text-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Vous n'avez pas de compte ? <Link to="/register" className="text-primary hover:underline">S'inscrire</Link> */}
            </motion.div>
        </div>

    );
}
