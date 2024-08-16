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
$require_fields = ['invoice', 'items'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$faktur = $data['invoice'];
$items = $data['items'];
// mulai transaksi
mysqli_begin_transaction($con);
try{
  foreach($items as $item){
    $nama = $item['item'];
    $newStock = $item['qty'];
    $update_product_query = "UPDATE tb_produk SET stok = stok + ? WHERE id_toko = ? AND nama = ?";
    $update_product_params = [$newStock, $id_toko, $nama];
    $update_product_success = update_data($con, $update_product_query, $update_product_params, 'dis');
    if(!$update_product_success){
      mysqli_rollback($con);
      response_message('failed', 'message', 'Stok produk gagal diperbarui!');
      exit;
    }
  }
  // hapus data transaksi berdasarkan id_toko dan faktur
  $delete_transaction_query = "DELETE FROM tb_transaksi WHERE id_toko = ? AND faktur = ?";
  $delete_transaction_params = [$id_toko, $faktur];
  $delete_transaction_success = delete_data($con, $delete_transaction_query, $delete_transaction_params, 'is');
  if(!$delete_transaction_success){
    response_message('failed', 'message', 'Transaksi gagal dibatalkan!');
    mysqli_rollback($con);
    exit;
  }
  // hapus data pembayran berdasarkan id_toko dan faktur
  $delete_payment_query = "DELETE FROM tb_pembayaran WHERE id_toko = ? AND faktur = ?";
  $delete_payment_params = [$id_toko, $faktur];
  $delete_payment_success = delete_data($con, $delete_payment_query, $delete_payment_params, 'is');
  if(!$delete_payment_success){
    response_message('failed', 'message', 'Data pembayaran gagal dihapus!');
    mysqli_rollback($con);
    exit;
  }
  // commit transaksi
  mysqli_commit($con);
}catch(Exception $e){
  mysqli_rollback($con);
  response_message('failed', 'message', 'Terjadi kesalahan: ' .$e->getMessage());
  exit;
}
response_message('success', 'message', 'Transaksi berhasil dibatalkan');
$con->close();
?>