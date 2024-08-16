<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['user_admin']) && !isset($_SESSION['hak_akses'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek json error
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek data yang dikirim
if(!isset($data['validation'])){
  response_message('failed', 'message', 'Data json yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$access = $_SESSION['user_admin'].$_SESSION['hak_akses'];
$validation = $data['validation'];
if($access !== $validation){
  response_message('failed', 'message', 'Kode otentikasi yang Anda masukkan salah!');
  exit;
}
response_message('success', '', '');
$con->close();
?>