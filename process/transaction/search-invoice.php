<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko'])){
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
if(!isset($data['invoice'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$faktur = "%{$data['invoice']}%";
// cari transaksi berdasarkan nomor faktur
$search_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur LIKE ?";
$search_transaction_params = [$id_toko, $faktur];
$search_transaction_result = fetch_data($con, $search_transaction_query, $search_transaction_params, 'is');
// jika pencarian transaksi gagal diproses
if(!$search_transaction_result){
  response_message('failed', 'message', 'Data transaksi gagal diproses!');
  $search_transaction_result->free();
  exit;
}
// jika data transaksi tidak ditemukan
if($search_transaction_result->num_rows === 0){
  response_message('not ready', 'message', 'Transaksi tidak ditemukan!');
  $search_transaction_result->free();
  exit;
}
// jika data transaksi ditemukan, maka muat data pembayaran
$get_payment_query = "SELECT * FROM tb_pembayaran WHERE id_toko = ? AND nomor_faktur LIKE ?";
$get_payment_params = [$id_toko, $faktur];
$get_payment_result = fetch_data($con, $get_payment_query, $get_payment_params, 'is');
// jika data pembayaran gagal dimuat
if(!$get_payment_result){
  response_message('failed', 'message', 'Data pembayaran gagal dimuat!');
  $get_payment_result->free();
  $search_transaction_result->free();
  exit;
}
// jika data pembayaran tidak ditemukan
if($get_payment_result->num_rows === 0){
  response_message('failed', 'message', 'Data pembayaran tidak ditemukan!');
  $get_payment_result->free();
  $search_transaction_result->free();
  exit;
}
// jika data pembayaran ditemukan, muat datanya
$payment = $get_payment_result->fetch_assoc();
$items = array();
while($item = $search_transaction_result->fetch_assoc()){
  $items[] = $item;
}
response_message('success', 'items', [$payment, $items]);
$search_transaction_result->free();
$con->close();
?>