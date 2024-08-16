<?php
session_start();
require '../../con.php';
// cek sesi
if(!isset($_SESSION['id_toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek json error
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// validasi data yang dikirim
$require_fields = ['code', 'name', 'capital', 'price', 'stock'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$idtoko = $_SESSION['id_toko'];
$kode = $data['code'];
$nama = str_replace('.', '', $data['name']);
$modal = str_replace('.', '', $data['capital']);
$harga = str_replace('.', '', $data['price']);
$stok = str_replace(',', '.', str_replace('.', '', $data['stock']));
$tanggal = date('Y-m-d');
// cek produk sudah pernah diinput atau belum
$check_product_query = "SELECT * FROM tb_produk WHERE id_toko = ? AND nama = ?";
$check_product_params = [$idtoko, $nama];
$check_product_result = fetch_data($con, $check_product_query, $check_product_params, 'is');
// jika produk gagal dicek
if(!$check_product_result){
  response_message('failed', 'message', 'Gagal saat pengecekan data produk!');
  $check_product_result->free();
  exit;
}
// jika produk sudah pernah diinput
if($check_product_result->num_rows === 1){
  response_message('not match name', 'message', 'Produk sudah ada di tabel!');
  $check_product_result->free();
  exit;
}
// jika produk belum pernah diinput, maka tambahkan ke tabel
$insert_product_query = "INSERT INTO tb_produk (id_toko, kode, nama, modal, harga, stok, tanggal) VALUES(?, ?, ?, ?, ?, ?, ?)";
$insert_product_params = [$idtoko, $kode, $nama, $modal, $harga, $stok, $tanggal];
$insert_product_success = insert_data($con, $insert_product_query, $insert_product_params, 'issiids');
// jika produk gagal ditambahkan ke tabel
if(!$insert_product_success){
  response_message('failed', 'message', 'Produk gagal dita ke tabel!');
  $check_product_result->free();
  exit;
}
// ambil data id produk
$product_query = "SELECT id_produk FROM tb_produk WHERE id_toko = ? AND nama = ?";
$product_params = [$idtoko, $nama];
$product_result = fetch_data($con, $product_query, $product_params, 'is');
// jika data id produk gagal diambil
if(!$product_result || $product_result->num_rows === 0){
  response_message('failed', 'message', 'Gagal memuat data produk, coba muat ulang halaman!');
  $product_result->free();
  exit;
}
// jika data id produk berhasil diambil
$row = $product_result->fetch_assoc();
$product = array(
  'id_produk' => $row['id_produk'],
  'id_toko' => $idtoko,
  'code' => $kode,
  'name' => $nama,
  'capital' => $modal == '' ? 0 : $modal,
  'price' => $harga,
  'stock' => $stok == '' ? 0 : $stok
);
// jika produk berhasil ditambahkan ke tabel
response_message('success', 'product', $product);
$check_product_result->free();
$con->close();
?>