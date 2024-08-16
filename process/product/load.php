<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
// cek error json
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
$idtoko = $_SESSION['id_toko'];
// muat data produk
$product_query = "SELECT * FROM tb_produk WHERE id_toko = ? ORDER BY id_produk DESC LIMIT 20";
$product_params = [$idtoko];
$product_result = fetch_data($con, $product_query, $product_params, 'i');
// jika data produk gagal dimuat
if(!$product_result){
  response_message('failed', 'message', 'Produk gagal dimuat!');
  $product_result->free();
  exit;
}
// jika data produk kosong
if($product_result->num_rows === 0){
  response_message('failed', 'message', 'Belum ada produk!');
  $product_result->free();
  exit;
}
// jika produk tersedia
$products = array();
while($row = $product_result->fetch_assoc()){
  $products[] = $row;
}
response_message('success', 'products', $products);
$product_result->free();
$con->close();
?>