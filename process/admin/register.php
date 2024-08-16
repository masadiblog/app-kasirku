<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(isset($_SESSION['id-toko'])){
  $id_toko = $_SESSION['id-toko'];
}else{
  $id_toko = 0;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek json erro
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek data yang dikirim
$require_fields = ['name', 'username', 'password'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
  }
}
// set data yang dikirim
$nama = $data['name'];
$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$tanggal = date('Y-m-d');
// cek data admin
$check_admin_query = "SELECT * FROM tb_admin";
$check_admin_params = [];
$check_admin_result = fetch_data($con, $check_admin_query, $check_admin_params, '');
// jika data admin gagal dicek
if(!$check_admin_result){
  response_message('failed', 'message', 'Pengecekan data admin gagal!');
  exit;
}
// dan jika berhasil dicek
if($check_admin_result->num_rows === 0){
  $level = 'level_1';
}else{
  $level = 'level_2';
}
// cek username
$check_username_query = "SELECT * FROM tb_admin WHERE user_admin = ?";
$check_username_params = [$username];
$check_username_result = fetch_data($con, $check_username_query, $check_username_params, 's');
// jika username gagal dicek
if(!$check_username_result){
  response_message('failed', 'message', 'Pengecekan username gagal diproses!');
  $check_admin_result->free();
  exit;
}
// jika terdapat username yang sama
if($check_username_result->num_rows > 0){
  response_message('not match user', 'message', 'Username tidak tersedia!');
  $check_username_result->free();
  $check_admin_result->free();
  exit;
}
// jika username belum ada
// maka simpan data admin
$insert_admin_query = "INSERT INTO tb_admin (id_toko, nama_admin, user_admin, kata_sandi, hak_akses, tanggal) VALUES(?, ?, ?, ?, ?, ?)";
$insert_admin_params = [$id_toko, $nama, $username, $password, $level, $tanggal];
$insert_admin_success = insert_data($con, $insert_admin_query, $insert_admin_params, 'isssss');
// jika data admin gagal disimpan
if(!$insert_admin_success){
  response_message('failed', 'message', 'Akun gagal disimpan, coba lagi!');
  $check_username_result->free();
  $check_admin_result->free();
  exit;
}
$direct = str_replace('process/admin/', '', $base_url).'?pg=login';
response_message('success', 'direct', $direct);
$check_username_result->free();
$check_admin_result->free();
$con->close();
?>