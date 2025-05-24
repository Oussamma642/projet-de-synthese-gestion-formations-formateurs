import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import ThemeToggle from '../components/ThemeToggle'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Home() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="flex min-h-screen flex-col bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="font-bold text-lg">OFPPT Formation</span>
          </motion.div>
          <motion.nav 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline">Se connecter</Button>
            </Link>
          </motion.nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1">
        <motion.div 
          variants={containerVariants}
          className="container flex flex-col items-center justify-center space-y-8 py-12 text-center md:py-24"
        >
          <motion.div 
            variants={itemVariants}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              La formation professionnelle à portée de main
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Accédez à vos formations en ligne, suivez votre progression, et développez vos compétences professionnelles avec l'OFPPT.
            </p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/login">
              <Button size="lg">Commencer maintenant</Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40">
        <div className="container py-12 md:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div 
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">Formations Diversifiées</h3>
              <p className="text-center text-muted-foreground">
                Accédez à un large éventail de formations adaptées aux besoins du marché du travail.
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">Suivi Personnalisé</h3>
              <p className="text-center text-muted-foreground">
                Suivez votre progression et recevez des retours personnalisés sur vos apprentissages.
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">Certification Reconnue</h3>
              <p className="text-center text-muted-foreground">
                Obtenez des certifications reconnues pour valoriser vos compétences professionnelles.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 OFPPT. Tous droits réservés.
          </p>
        </div>
      </footer>
    </motion.div>
  )
} 