# OFPPT Formation

Une plateforme de gestion des formations pour les formateurs de l'OFPPT.

## Fonctionnalités

- Authentification (connexion/inscription)
- Tableau de bord personnalisé
- Gestion des formations
- Suivi de progression
- Interface adaptative (responsive)

## Technologies utilisées

- Next.js 14
- React 18
- Tailwind CSS
- Framer Motion
- Radix UI

## Prérequis

- Node.js 18.17 ou supérieur
- npm ou yarn

## Installation

1. Clonez le dépôt :
```bash
git clone [url-du-repo]
cd ofppt-formation
```

2. Installez les dépendances :
```bash
npm install
# ou
yarn install
```

3. Lancez le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
ofppt-formation/
├── app/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── ui/
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── progress.jsx
│       └── select.jsx
├── lib/
│   └── utils.js
├── public/
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Crée une version de production
- `npm run start` : Lance le serveur de production
- `npm run lint` : Vérifie le code avec ESLint

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 