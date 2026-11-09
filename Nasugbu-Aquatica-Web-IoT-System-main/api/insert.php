<?php
require "config.php";

if (($_REQUEST['key'] ?? '') !== API_KEY) {
  http_response_code(403);
  exit("Forbidden");
}

$t = isset($_REQUEST['temperature']) ? (float)$_REQUEST['temperature'] : null;
$h = isset($_REQUEST['humidity'])    ? (float)$_REQUEST['humidity']    : null;
$p = isset($_REQUEST['ph'])          ? (float)$_REQUEST['ph']          : null;

$stmt = $pdo->prepare("INSERT INTO sensor_readings (temperature, humidity, ph) VALUES (?, ?, ?)");
$stmt->execute([$t, $h, $p]);
echo "OK";