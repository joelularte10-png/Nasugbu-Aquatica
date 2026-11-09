<?php
require "config.php";
header("Content-Type: application/json");

$row = $pdo->query("
  SELECT temperature, humidity, ph, created_at,
         TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age_seconds
  FROM sensor_readings ORDER BY id DESC LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

echo json_encode($row ?: null);