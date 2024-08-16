<?php
session_start();
require '../../con.php';
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
if(!isset($data['keys'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$search = "%{$data['keys']}%";
// muat data produk
$product_query = "SELECT * FROM tb_produk WHERE id_toko = ? AND (kode LIKE ? OR nama LIKE ?) ORDER BY id_produk ASC LIMIT 20";
$product_params = [$id_toko, $search, $search];
$product_result = fetch_data($con, $product_query, $product_params, 'iss');
// jika produk gagal dimuat
if(!$product_result){
  response_message('failed', 'message', 'Data gagal dimuat!');
  $product_result->free();
  exit;
}
// jika produk tidak tersedia
if($product_result->num_rows === 0){
  response_message('not ready', 'message', 'Produk tidak ditemukan!');
  $product_result->free();
  exit;
}
// jika data berhasil dimuat dan produk tersedia
$products = array();
while($row = $product_result->fetch_assoc()){
  $products[] = $row;
}
response_message('success', 'products', $products);
$product_result->free();
$con->close();
?>