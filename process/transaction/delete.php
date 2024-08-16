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
$require_fields = ['idtrans', 'invoice', 'name', 'qty'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// tangkap data yang dikirim
$id_toko = $_SESSION['id_toko'];
$id_transaksi = $data['idtrans'];
$faktur = $data['invoice'];
$nama = str_replace('.', '', $data['name']);
$jumlah = str_replace(',', '.', str_replace('.', '', $data['qty']));
// prose hapus item transaksi
$delete_transaction_query = "DELETE FROM tb_transaksi WHERE id_transaksi = ? AND id_toko = ? AND faktur = ? AND nama = ?";
$delete_transaction_params = [$id_transaksi, $id_toko, $faktur, $nama];
$delete_transaction_success = delete_data($con, $delete_transaction_query, $delete_transaction_params, 'iiss');
// jika item transaksi gagal dihapus
if(!$delete_transaction_success){
  response_message('failed', 'message', 'Item gagal dihapus!');
  exit;
}
// jika item transaksi berhasil dihapus
// maka cek data transaksi bedasarkan id toko dan faktur
$check_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND faktur = ?";
$check_transaction_params = [$id_toko, $faktur];
$check_transaction_result = fetch_data($con, $check_transaction_query, $check_transaction_params, 'is');
// jika pengecekan data transaksi gagal diproses
if(!$check_transaction_result){
  response_message('failed', 'message', 'Pengecekan data transaksi gagal diproses!');
  $check_transaction_result->free();
  exit;
}
// jika pengecekan data transaksi berhasil diproses
// dan jika data transaksi kosong
if($check_transaction_result->num_rows === 0){
  // lanjukan dengan penghapusan data pembayaran bedasarkan id toko dan  faktur
  $delete_payment_query = "DELETE FROM tb_pembayaran WHERE id_toko = ? AND nomor_faktur = ?";
  $delete_payment_params = [$id_toko, $faktur];
  $delete_payment_success = delete_data($con, $delete_payment_query, $delete_payment_params, 'is');
  // jika data pembayaran gagal dihapus
  if(!$delete_payment_success){
    response_message('failed', 'message', 'Data pembayaran gagal dihapus!');
    $check_transaction_result->free();
    exit;
  }
  $check_transaction_result->free();
}

// cek dan muat data produk berdasarkan id toko dan nama
$check_product_query = "SELECT stok FROM tb_produk WHERE id_toko = ? AND nama = ?";
$check_product_params = [$id_toko, $nama];
$check_product_result = fetch_data($con, $check_product_query, $check_product_params, 'is');
// jika produk yang dimaksud kosong
if($check_product_result->num_rows === 0){
  response_message('failed', 'message', 'Gagal memuat data produk!');
  $check_product_result->free();
  exit;
}
// jika produk yang dimaksud tersedia
$row = $check_product_result->fetch_assoc();
$newStock = $row['stok'] + $jumlah;
// perbarui data stok produk
$update_product_query = "UPDATE tb_produk SET stok = ? WHERE id_toko = ? AND nama = ?";
$update_product_params = [$newStock, $id_toko, $nama];
$update_product_success = update_data($con, $update_product_query, $update_product_params, 'dis');
// jika data stok produk gagal diperbarui
if(!$update_product_success){
  response_message('failed', 'message', 'Gagal memperbarui stok produk!');
  $check_product_result->free();
  $check_transaction_result->free();
  exit;
}
// dan jika data stok produk berhasil diperbarui, maka jalankan perintah berikut
$transaction_query = "SELECT SUM((harga * jumlah) - (diskon * jumlah)) AS total_setelah_diskon, SUM(harga * jumlah) AS total_sebelum_diskon FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ?";
$transaction_params = [$id_toko, $faktur];
$transaction_result = fetch_data($con, $transaction_query, $transaction_params, 'is');
$row = $transaction_result->fetch_assoc();
$total_setelah_diskon = $row['total_setelah_diskon'];
$total_sebelum_diskon = $row['total_sebelum_diskon'];
response_message('success', 'message', ['Item berhasil dihapus', $total_setelah_diskon, $total_sebelum_diskon]);
$transaction_result->free();
$check_product_result->free();
$check_transaction_result->free();
$con->close();
?>