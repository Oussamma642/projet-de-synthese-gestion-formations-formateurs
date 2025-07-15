# Management of OFPPT trainer training

Trainer training plays a key role in improving educational quality within the OFPPT. This project aims to develop a centralized management system to optimize the planning, monitoring, and evaluation of trainer training.

## Table of Contents

- [Project Overview](#project-overview)
- [Motivation](#motivation)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [License](#license)


## Project Overview

- **Title**: Management of OFPPT trainer training
- **Team**:
- - https://github.com/Oussamma642
  -  https://github.com/AZZEDINE-RIH
  -  https://github.com/marouan-folane
  -  
- **Institution**: ISTA NTIC SYBA
- **Date**: April 1, 2025

## Motivation

A grade management system for a center that offers two‑year courses across several streams.  
Each stream includes:
- Year 1 and Year 2 modules  
- Multiple formative tests  
- A practical exam and a theoretical exam per module  
- Automated generation of end‑of‑year performance reports
  
This system streamlines data entry, grading, and results production for instructors and administrators.


## Features

- User authentication (admin)  
- CRUD for streams, modules, and student records  
- Entry forms for test scores, practical and theoretical exam grades for each student per module per stream 
- Automatic computation of module averages and overall yearly averages  
- PDF report export for individual students and entire cohorts 

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
git clone https://github.com/Oussamma642/PFE-gestion-d-un-centre-de-formation.git
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd gestion-notes

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env

# Configure database in .env file

APP_NAME="Training Center Management"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_centre_formation
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
VITE_API_BASE_URL=http://localhost:8000
```

## Usage

### Running the Application

#### Start Backend Server
```bash
# Navigate to backend directory
cd gestion-notes

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


