<?php

// Récupérer les informations de connexion à partir du fichier .env
$env = file_get_contents(__DIR__ . '/.env');
preg_match('/DB_HOST=(.*)/', $env, $matches);
$host = trim($matches[1]);
preg_match('/DB_DATABASE=(.*)/', $env, $matches);
$database = trim($matches[1]);
preg_match('/DB_USERNAME=(.*)/', $env, $matches);
$username = trim($matches[1]);
preg_match('/DB_PASSWORD=(.*)/', $env, $matches);
$password = trim($matches[1]);

// Connexion à la base de données
$mysqli = new mysqli($host, $username, $password, $database);

// Vérification de la connexion
if ($mysqli->connect_error) {
    die('Erreur de connexion (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

// Date actuelle pour created_at et updated_at
$now = date('Y-m-d H:i:s');

// Requête d'insertion
$query = "INSERT INTO formations (
            title, 
            description, 
            start_date, 
            end_date, 
            animateur_id, 
            city_id, 
            site_id, 
            formation_status, 
            validated_by_cdc, 
            validated_by_drif, 
            created_at, 
            updated_at
          ) VALUES (
            'Formation Laravel',
            'Une formation complète sur le framework Laravel',
            '2025-05-01',
            '2025-05-15',
            1,
            1,
            1,
            'brouillon',
            0,
            0,
            '$now',
            '$now'
          )";

// Exécution de la requête
if ($mysqli->query($query) === TRUE) {
    echo "Formation insérée avec succès. ID: " . $mysqli->insert_id . "\n";
} else {
    echo "Erreur: " . $mysqli->error . "\n";
}

// Fermeture de la connexion
$mysqli->close(); 