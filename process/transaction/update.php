<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
//cek sesi
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
$require_fields = ['idtrans', 'invoice', 'code', 'name', 'price', 'qty', 'discount', 'SQty'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$id_transaksi = $data['idtrans'];
$faktur = $data['invoice'];
$kode = $data['code'];
$nama = str_replace('.', '', $data['name']);
$harga = str_replace('.', '', $data['price']);
$jumlah = str_replace(',', '.', str_replace('.', '', $data['qty']));
$diskon = str_replace(',', '.', str_replace('.', '', $data['discount']));
$SQty = str_replace(',', '.', str_replace('.', '', $data['SQty']));
// muat id produk dan stok
$product_query = "SELECT id_produk, stok FROM tb_produk WHERE id_toko = ? AND nama = ?";
$product_params = [$id_toko, $nama];
$product_result = fetch_data($con, $product_query, $product_params, 'is');
// jika proses muat id produk dan stok gagal
if(!$product_result){
  response_message('failed', 'message', 'Gagal memuat stok produk!');
  $product_result->free();
  exit;
}
// jika id produk dan stok tidak tersedia
if($product_result->num_rows === 0){
  response_message('failed', 'message', 'Gagal mendapatkan stok produk!');
  $product_result->free();
  exit;
}
// jika id produk dan stok tersedia

// maka set data id produk dan stok
$row = $product_result->fetch_assoc();
$id_produk = $row['id_produk'];
$stok = $row['stok'] + $SQty;
// cek ketersedian stok produk sebelum memproses data transaksi
// jika ketersedian stok tidak mencukupi
if($jumlah > $stok){
  response_message('failed', 'message', '<span style="color:maroon;font-weight:500">Stok tidak mencukupi!!!</span><br><br>Permintaan: &nbsp; <b>'.$SQty.' : '.$jumlah.'</b><br>Stok tersedia: &nbsp; <b>'.$stok.'</b>');
  $product_result->free();
  exit;
}
// dan jika stok mencukupi, maka proses perintah berikut
// perbarui data item transaksi
$update_transaction_query = "UPDATE tb_transaksi SET harga = ?, jumlah = ?, diskon = ? WHERE id_transaksi = ? AND id_toko = ? AND nomor_faktur = ? AND nama = ?";
$update_transaction_params = [$harga, $jumlah, $diskon, $id_transaksi, $id_toko, $faktur, $nama];
$update_transaction_success = update_data($con, $update_transaction_query, $update_transaction_params, 'dddiiss');
// jika data item transaksi gagal diperbarui
if(!$update_transaction_query){
  response_message('failed', 'message', 'Item transaksi gagal diperbarui!');
  $product_result->free();
  exit;
}
// jika data item transaksi berhasil diperbarui
$newStock = $stok - $jumlah;
// perbarui data stok produk
$updtate_product_query = "UPDATE tb_produk SET stok = ? WHERE id_produk = ? AND id_toko = ? AND nama = ?";
$updtate_product_params = [$newStock, $id_produk, $id_toko, $nama];
$updtate_product_success = update_data($con, $updtate_product_query, $updtate_product_params, 'diis');
// jika data stok produk gagal diperbarui
if(!$updtate_product_success){
  response_message('failed', 'message', 'Stok gagal diperbarui!');
  $product_result->free();
  exit;
}
// jika data stok produk berhasil diperbarui
// ambil data total harga sebelum dan setelah diskon
$transaction_query = "SELECT SUM((harga * jumlah) - (diskon * jumlah)) AS total_setelah_diskon, SUM(harga * jumlah) AS total_sebelum_diskon FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ?";
$transaction_params = [$id_toko, $faktur];
$transaction_result = fetch_data($con, $transaction_query, $transaction_params, 'is');
// jika gagal memproses data total harga sebelum dan setelah diskon
if(!$transaction_result){
  response_message('failed', 'message', 'Total harga gagal dimuat!');
  $transaction_result->free();
  $product_result->free();
  exit;
}
// jika berhasil memproses data total harga sebelum dan setelah diskon
$row = $transaction_result->fetch_assoc();
$total_setelah_diskon = $row['total_setelah_diskon'];
$total_sebelum_diskon = $row['total_sebelum_diskon'];
response_message('success', 'message', ['Item berhasil diperbarui.', $total_setelah_diskon, $total_sebelum_diskon]);
$transaction_result->free();
$product_result->free();
$con->close();
?>