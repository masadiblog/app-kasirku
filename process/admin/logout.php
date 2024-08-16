<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id-toko']) || !isset($_SESSION['id-admin'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek error json
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek validasi data yang dikirim
if(!isset($data['logout']) && $data['logout'] !== true){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// hapus semua sesi
$_SESSION['login'] = '';
$_SESSION['id_admin'] = '';
$_SESSION['id_toko'] = '';
$_SESSION['nama_toko'] = '';
$_SESSION['alamat$toko'] = '';
$_SESSION['nama$admin'] = '';
$_SESSION['user_admin'] = '';
$_SESSION['catatan_toko'] = '';
$_SESSION['hak_akses'] = '';
$_SESSION['nomor_whatsapp'] = '';
$_SESSION['status_langganan'] = '';
unset($_SESSION['login']);
unset($_SESSION['id_admin']);
unset($_SESSION['id_toko']);
unset($_SESSION['nama_toko']);
unset($_SESSION['alamat_toko']);
unset($_SESSION['nama_admin']);
unset($_SESSION['user_admin']);
unset($_SESSION['nama_toko']);
unset($_SESSION['hak_akses']);
unset($_SESSION['nomor_whatsapp']);
unset($_SESSION['status_langganan']);
session_unset();
session_destroy();
// direct ke halaman login
$direct = str_replace('process/admin/', '', $base_url).'?pg=login';
response_message('success', 'direct', $direct);
$con->close();
?>