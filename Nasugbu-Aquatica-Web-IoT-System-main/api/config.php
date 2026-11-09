<?php
$pdo = new PDO(
  "mysql:host=localhost;dbname=aquatica_db;charset=utf8mb4",
  "root", "",   // XAMPP default: user root, no password
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
const API_KEY = "aquatica123";  // change this