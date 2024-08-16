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
if(!isset($data['key'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$search = "%{$data['key']}%";
// proses pencarian produk
$search_product_query = "SELECT * FROM tb_produk WHERE id_toko = ? AND (kode LIKE ? OR nama LIKE ?) ORDER BY id_produk DESC LIMIT 20";
$search_product_params = [$id_toko, $search, $search];
$search_product_result = fetch_data($con, $search_product_query, $search_product_params, 'iss');
// jika proses pencarian produk gagal
if(!$search_product_result){
  response_message('failed', 'message', 'Pencarian produk gagal diproses. Resfresh halaman dan coba kembali!');
  $search_product_result->free();
  exit;
}
// jika pencarian produk gagal ditemukan
if($search_product_result->num_rows === 0){
  response_message('not ready', 'message', 'Produk tidak ditemukan!');
  $search_product_result->free();
  exit;
}
// jika pencarian produk berhasil ditemukan
$products = array();
while($row = $search_product_result->fetch_assoc()){
  $products[] = $row;
}
response_message('success', 'products', $products);
$search_product_result->free();
$con->close();
?>