<?php
require "../database_conn.php";

$credential_username = $_POST['username'];
$credential_password = $_POST['password'];
$bussiness_role = $_POST['role'];


$sql = "INSERT INTO users(`username`, `password`, `role`)VALUES('$credential_username', '$credential_password', '$bussiness_role')";
$execute = $conn->query($sql); 

?>