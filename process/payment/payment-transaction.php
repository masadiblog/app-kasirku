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
$require_fields = ['invoice', 'payment', 'total'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data session
$idtoko = $_SESSION['id$toko'];
$toko = $_SESSION['nama_toko'];
$admin = $_SESSION['nama_admin'];
// tangkap data yang dikirim
$faktur = $data['invoice'];
$pembayaran = str_replace('.', '', $data['payment']);
$total = str_replace('.', '', $data['total']);
$tanggal = $date_now.' '.$month_now.' '.$year_now.' '.$time_now;
// cek pembayaran yang diinput sudah ada atau belum
// jika belum ada maka tambahkan, dan jika belum ada perbarui data
$check_payment_query = "SELECT * FROM tb_pembayaran WHERE id_toko = ? AND nomor_faktur = ?";
$check_payment_params = [$idtoko, $faktur];
$check_payment_result = fetch_data($con, $check_payment_query, $check_payment_params, 'is');
// jika belum ada tambahkan data pembayaran
if(!$check_payment_result || $check_payment_result->num_rows === 0){
  // tambahkan data pembayaran
  $insert_payment_query = "INSERT INTO tb_pembayaran (id_toko, nama_toko, nama_admin, nomor_faktur, pembayaran, total, tanggal) VALUES(?, ?, ?, ?, ?, ?, ?)";
  $insert_payment_params = [$idtoko, $toko, $admin, $faktur, $pembayaran, $total, $tanggal];
  $insert_payment_success = insert_data($con, $insert_payment_query, $insert_payment_params, 'isssiis');
  // jika pembayaran gagal ditambahkan
  if(!$insert_payment_success){
    response_message('failed', 'message', 'Pembayaran gagal diproses!');
    $check_payment_result->free();
    exit;
  }
  // jika pembayaran berhasil ditambahkan
  response_message('success', 'message', 'Pembayaran berhasil!');
}else{
  // jika sudah ada perbarui data pembayaran
  $update_payment_query = "UPDATE tb_pembayaran SET pembayaran = ?, total = ? , tanggal = ? WHERE id_toko = ? AND nomor_faktur = ?";
  $update_payment_params = [$pembayaran, $total, $tanggal, $idtoko, $faktur];
  $update_payment_success = update_data($con, $update_payment_query, $update_payment_params, 'iisis');
  // jika pembayaran gagal diperbarui
  if(!$update_payment_success){
    response_message('failed', 'message', 'Pembayaran gagal diperbarui!');
    $check_payment_result->free();
    exit;
  }
  // jika pembayaran berhasil diperbarui
  response_message('success', 'message', 'Pembayaran berhasil diperbarui!');
}
$check_payment_result->free();
$con->close();
?>