<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$id_toko = $_SESSION['id_toko'];
// jika id toio kosong
if($id_toko === 0){
  response_message('not ready', 'message', 'Akses Dibatasi!');
  exit;
}
// muat data toko
$get_store_query = "SELECT * FROM tb_toko WHERE id_toko = ?";
$get_store_params = [$id_toko];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 'i');
// jika gagal dimuat
if(!$get_store_result){
  response_message('failed', 'message', 'Data toko gagal dimuat!');
  exit;
}
// jika berhasil dimuat
$row = $get_store_result->fetch_assoc();
$store = array(
  'storeid' => $row['id_toko'],
  'name' => $row['nama_toko'],
  'whatsapp' => $row['nomor_whatsapp'],
  'address' => $row['alamat_alamat'],
  'notes' => $row['catatan_toko']
);
response_message('success', 'store', $store);
$get_store_result->free();
$con->close();
?>