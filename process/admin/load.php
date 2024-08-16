<?php
session_start();
require '../../con.php';
header('Content-Type: applicatioj/json');
// cek sesi
if(!isset($_SESSION['id-toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  ext;
}
// set data
$id_toko = $_SESSION['id_toko'];
// proses muat data akun
$get_account_query = "SELECT * FROM tb_admin WHERE id_toko = ?";
$get_account_params = [$id_toko];
$get_account_result = fetch_data($con, $get_account_query, $get_account_params, 'i');
// jika gagal dimuat
if(!$get_account_result){
  response_message('failed', 'message', 'Data akun gagal dimuat!');
  exit;
}
// jika berhasil
$row = $get_account_result->fetch_assoc();
$account = array(
  'name' => $row['nama'],
  'username' => $row['username'],
  'password' => $row['password']
);
response_message('success', 'account', $account);
$get_account_result->free();
$con->close();
?>