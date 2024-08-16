<?php
session_start();
require '../../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['login-admin'])){
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
if(!isset($data['input'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$nama = "%{$data['input']}%";
// muat data toko
$get_store_query = "SELECT * FROM tb_toko WHERE nama_toko LIKE ?";
$get_store_params = [$nama];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 's');
// jika gagal dimuat
if(!$get_store_result){
  response_message('failed', 'message', 'Data gagal dimuat!');
  exit;
}
// jika tidak ditemukan
if($get_store_result->num_rows === 0){
  $stores = array(
    'key' => true,
    'message' => 'Data tidak ditemukan!'
  );
  response_message('not ready', 'data', $stores);
  $get_store_result->free();
  exit;
}
// jika tersedia
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