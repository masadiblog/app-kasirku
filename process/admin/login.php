<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(isset($_SESSION['id-toko']) || isset($_SESSION['id-admin'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek error json
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek data yang dikirim
$require_fields = ['user_admin', 'kata_sandi'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$username = $data['user_admin'];
$password = $data['kata_sandi'];
$check_admin_query = "SELECT * FROM tb_admin WHERE user_admin = ?";
$check_admin_params = [$username];
$check_admin_result = fetch_data($con, $check_admin_query, $check_admin_params, 's');
// jika pengecekan username gagal
if(!$check_admin_result){
  response_message('failed', 'message', 'Pengecekan gagal diproses!');
  exit;
}
// jika username kosong
if($check_admin_result->num_rows === 0){
  response_message('not match user', 'message', 'Username salah!');
  $check_admin_result->free();
  exit;
}
// jika username ditemukan
$row_admin = $check_admin_result->fetch_assoc();
// jika password salah
if(!password_verify($password, $row_admin['password'])){
  response_message('not match pass', 'message', 'Password salah!');
  $check_admin_result->free();
  exit;
}
// jika username dan password ditemukan
$idtoko = $row_admin['id_toko'];
$toko_query = "SELECT * FROM tb_toko WHERE id_toko = ?";
$toko_params = [$idtoko];
$toko_result = fetch_data($con, $toko_query, $toko_params, 'i');
// dan jika data toko berhasil diproses
if($toko_result->num_rows > 0){
  $row_toko = $toko_result->fetch_assoc();
  $_SESSION['nama_toko'] = $row_toko['nama_toko'];
  $_SESSION['alamat_toko'] = $row_toko['alamat_toko'];
  $_SESSION['status_langganan'] = $row_toko['status_langganan'];
  $_SESSION['nomor_whatsapp'] = $row_toko['nomor_whatsapp'];
  $_SESSION['catatan_toko'] = $row_toko['catatan_toko'];
  $_SESSION['tanggal_mulai'] = $row_toko['tanggal_aktif'];
  $_SESSION['tanggal_akhir'] = $row_toko['batas_aktif'];
  $toko_result->free();
}else{
  $_SESSION['nama_toko'] = null;
  $_SESSION['alamat_toko'] = null;
  $_SESSION['status_langganan'] = null;
  $_SESSION['nomor_whatsapp'] = null;
  $_SESSION['catatan_toko'] = null;
  $_SESSION['tanggal_mulai'] = null;
  $_SESSION['tanggal_akhir'] = null;
}
$_SESSION['login'] = true;
$_SESSION['id_admin'] = $row_admin['id_admin'];
$_SESSION['id_toko'] = $row_admin['id_toko'];
$_SESSION['nama_admin'] = $row_admin['nama_admin'];
$_SESSION['user_admin'] = $row_admin['user_admin'];
$_SESSION['hak_akses'] = $row_admin['hak_akses'];
$direct = str_replace('process/admin/', '', $base_url);
response_message('success', 'direct', $direct);
$check_admin_result->free();
$con->close();
?>