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
if(!isset($data['access']) && $data['access'] !== 'transaction'){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// muat data faktur transaksi terbaru hari ini berdasarkan id toko dan tanggal
$id_toko = $_SESSION['id_toko'];
$tanggal = date('Y-m-d');
$invoice_transaction_query = "SELECT nomor_faktur FROM tb_transaksi WHERE id_toko = ? AND tanggal = ? ORDER BY id_transaksi DESC LIMIT 1";
$invoice_transaction_params = [$id_toko, $tanggal];
$invoice_transaction_result = fetch_data($con, $invoice_transaction_query, $invoice_transaction_params, 'is');
// jika faktur transaksi gagal dimuat
if(!$invoice_transaction_result){
  response_message('failed', 'message', 'Gagal memuat faktur!');
  $invoice_transaction_result->free();
  exit;
}
// jika faktur hari ini belum ada
if($invoice_transaction_result->num_rows === 0){
  response_message('not ready', 'message', 'Belum ada transaksi hari ini!');
  $invoice_transaction_result->free();
  exit;
}
// muat transaksi hari ini berdasarkan id toko dan faktur
$row = $invoice_transaction_result->fetch_assoc();
$faktur = $row['faktur'];
$load_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ? ORDER BY id_transaksi DESC";
$load_transaction_params = [$id_toko, $faktur];
$load_transaction_result = fetch_data($con, $load_transaction_query, $load_transaction_params, 'is');
// jika data transaksi gagal dimuat
if(!$load_transaction_result){
  response_message('failed', 'message', 'Data transaksi gagal dimuat!');
  $load_transaction_result->free();
  $invoice_transaction_result->free();
  exit;
}
// jika data transaksi tidak tersedia
if($load_transaction_result->num_rows === 0){
  response_message('failed', 'message', 'Belum ada transaksi yang dilakukan hari ini!');
  $load_transaction_result->free();
  $invoice_transaction_result->free();
  exit;
}
// jika data transaksi hari ini tersedia, maka muat data transaksi dan pembayaran
$get_payment_query = "SELECT pembayaran FROM tb_pembayaran WHERE id_toko = ? AND nomor_faktur = ?";
$get_payment_params = [$id_toko, $faktur];
$get_payment_result = fetch_data($con, $get_payment_query, $get_payment_params, 'is');
$payment = '';
if($get_payment_result->num_rows === 1){
  $rowpay = $get_payment_result->fetch_assoc();
  $payment = $rowpay['pembayaran'];
}
$transactions = array();
while($transaction = $load_transaction_result->fetch_assoc()){
  $transactions[] = $transaction;
}
response_message('success', 'transactions', [$transactions, $payment]);
$get_payment_result->free();
$load_transaction_result->free();
$invoice_transaction_result->free();
$con->close();
?>