<?php
session_start();
require '../../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['login']) && !isset($_SESSION['id_admin']) && !isset($_SESSION['nama_admin']) && !isset($_SESSION['hak_akses'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
// cek akses
if($_SESSION['hak_akses'] !== 'level_1'){
  response_message('failed', 'message', 'Anda tidak memiliki izin untuk ini!');
  exit;
}
// muat data toko
$get_store_query = "SELECT * FROM tb_toko";
$get_store_params = [];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, '');
// jika gagal dimuat
if(!$get_store_result){
  response_message('failed', 'message', 'Data gagal dimuat!');
  exit;
}
// jika data kosong
if($get_store_result->num_rows === 0){
  $stores = array(
    'key' => true,
    'message' => 'Data tidak ditemukan!'
  );
  response_message('not ready', 'data', $stores);
  $get_store_result->free();
  exit;
}
// jika data tersedia
$stores = array();
while($row = $get_store_result->fetch_assoc()){
  $stores[] = array(
    'list' => $row['id_toko'],
    'name' => $row['nama_toko'],
    'status' => $row['status_langganan'],
    'contact' => $row['nomor_whatsapp'],
    'start' => $row['tanggal_mulai'],
    'limit' => $row['tanggal_akhir'],
    'register' => $row['tanggal'],
  );
}
response_message('success', 'data', $stores);
$get_store_result->free();
$con->close();
?>