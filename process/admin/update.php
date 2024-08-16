<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id-toko']) && !isset($_SESSION['id-admin'])){
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
$require_fileds = ['name', 'username', 'password'];
foreach($require_fileds as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_admin = $_SESSION['id_admin'];
$id_toko = $_SESSION['id_toko'];
$nama = $data['name'];
$username = $data['username'];
$setPass = $data['password'];
if(preg_match('/_hashing/', $setPass)){
  $xpass = explode('_hashing', $setPass);
  $password = $xpass[0];
}else{
  $password = password_hash($setPass, PASSWORD_DEFAULT);
}
// cek duplikasi username
$check_username_query = "SELECT user_admin FROM tb_admin WHERE id_admin <> ? AND user_admin = ?";
$check_username_params = [$id_admin, $username];
$check_username_result = fetch_data($con, $check_username_query, $check_username_params, 'is');
// jika pengecekan gagal diproses
if(!$check_username_result){
  response_message('failed', 'message', 'Pengecekan username gagal diproses!');
  exit;
}
// jika username sudah ada
if($check_username_result->num_rows === 1){
  response_message('failed', 'message', 'Username tidak tersedia!');
  $check_username_result->free();
  exit;
}
// jika username belum ada
// maka proses update data akun
$update_account_query = "UPDATE tb_admin SET nama_admin = ?, user_admin = ?, kata_sandi = ? WHERE id_toko = ?";
$update_account_params = [$nama, $username, $password, $id_toko];
$update_account_success = update_data($con, $update_account_query, $update_account_params, 'sssi');
// jika proses update gagal
if(!$update_account_success){
  response_message('failed', 'message', 'Akun Anda gagal diperbarui!');
  $check_username_result->free();
  exit;
}
// jika proses berhasil
$_SESSION['nama_admin'] = $nama;
$_SESSION['user_admin'] = $username;
response_message('success', 'message', 'Akun Anda berhasil diperbarui.');
$check_username_result->free();
$con->close();
?>