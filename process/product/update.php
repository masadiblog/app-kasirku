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
$require_fields = ['id', 'code', 'name', 'capital', 'price', 'stock'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$id_produk = $data['id'];
$kode = $data['code'];
$nama = str_replace('.', '', $data['name']);
$modal = str_replace('.', '', $data['capital']);
$harga = str_replace('.', '', $data['price']);
$stok = str_replace(',', '.', str_replace('.', '', $data['stock']));
// cek duplikat produk
$check_product_query = "SELECT * FROM tb_produk WHERE id_toko = ? AND id_produk <> ? AND nama = ?";
$check_product_params = [$id_toko, $id_produk, $nama];
$check_product_result = fetch_data($con, $check_product_query, $check_product_params, 'iis');
// jika cek duplikat produk gagal
if(!$check_product_result){
  response_message('failed', 'message', 'Pengecekan produk gagal!');
  $check_product_result->free();
  exit;
}
// jika selain data produk yang dikirim sudah ada di tabel
if($check_product_result->num_rows === 1){
  response_message('not match name', 'message', 'Produk tersedia di tabel!');
  $check_product_result->free();
  exit;
}
// jika pengecekan berhasil, maka perbarui data produk
$update_product_query = "UPDATE tb_produk SET kode = ?, nama = ?, modal = ?, harga = ?, stok = ? WHERE id_toko = ? AND id_produk = ?";
$update_product_params = [$kode, $nama, $modal, $harga, $stok, $id_toko, $id_produk];
$update_product_success = update_data($con, $update_product_query, $update_product_params, 'ssiidii');
// jika data produk gagal diperbarui
if(!$update_product_success){
  response_message('failed', 'message', 'Produk gagal diperbarui!');
  $check_product_result->free();
  exit;
}
// jika data produk berhasil diperbarui
response_message('success', 'message', 'Produk berhasil diperbarui');
$check_product_result->free();
$con->close();
?>