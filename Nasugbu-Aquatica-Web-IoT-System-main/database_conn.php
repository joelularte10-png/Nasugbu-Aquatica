<?php

$hostname = "localhost";
$username = "root";
$password = "";
$dbname = "nasugbu_aquatica";

$conn = new mysqli($hostname, $username, $password, $dbname);


if($conn->connect_error){
    die("Connection error occured code" . $conn->connect_error);
}else{
    // echo "Connection Success";
}



?>