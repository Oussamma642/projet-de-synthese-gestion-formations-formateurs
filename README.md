# Management of OFPPT trainer training

Trainer training plays a key role in improving educational quality within the OFPPT. 
This project aims to develop a centralized management system to optimize the planning, monitoring, and evaluation of trainer training.

## Table of Contents

- [Project Overview](#project-overview)
- [Motivation](#motivation)
- [Actors and Roles](#Actors)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [License](#license)


## Project Overview

- **Title**: Management of OFPPT trainer training
- **Team**:
  - https://github.com/Oussamma642
  -  https://github.com/AZZEDINE-RIH
  -  https://github.com/marouan-folane
  -  
- **Institution**: ISTA NTIC SYBA
- **Date**: January 1, 2025

## Motivation

Implement an integrated management solution to plan, monitor, and evaluate trainer training, while centralizing data on their progress and associated logistics.
  

## Actors
- CDC Manager: Proposes and coordinates training plans.
- Training Manager (DRIF): Validates and schedules sessions.
- DR Manager (Directeur Régional) : Reviews training plans and absences.
- Participating Trainer (Participant): Monitors training sessions and provides feedback.
- Facilitator Trainer (Formateur): Manages absences and enhances content.
- System Administrator (Admin): Ensures system maintenance and security.

## Tech Stack
- **Backend:** Laravel 10 (PHP 8.1+)  
- **Frontend:** React 18 + Tailwind CSS  
- **Database:** MySQL  
- **Tools:**  
  - Git & GitHub for version control  
  - Postman for API testing  
- **Environment:**  
  - PHP 8.1 or later  
  - Node.js 18+ & npm 9+  
  - Composer 2+  


## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Oussamma642/projet-de-synthese-gestion-formations-formateurs.git
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd gestion-formations-formateurs

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Configure database in .env file

APP_NAME=gestion-formations-formateurs
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_formations_formateurs
DB_USERNAME=root
DB_PASSWORD=

# Run database migrations
php artisan migrate
```

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd react

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure API base URL
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Usage

### Running the Application

#### Start Backend Server
```bash
# Navigate to backend directory
cd gestion-formations-formateurs

# Start Laravel development server
php artisan serve
# Server will run on http://localhost:8000
```

#### Start Frontend Development Server
```bash
# Navigate to frontend directory
cd react

# Start React development server
npm start
# Server will run on http://localhost:3000
```
## License

This project is licensed under the MIT License 


