<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
// set data
$id_toko = $_SESSION['id-toko'];
$tanggal = date('Y-m-d');
// muat total pengeluaran
$get_total_expen_query = "SELECT SUM(pengeluaran) AS total FROM tb_pengeluaran WHERE id_toko = ? AND tanggal = ?";
$get_total_expen_params = [$id_toko, $tanggal];
$get_total_expen_result = fetch_data($con, $get_total_expen_query, $get_total_expen_params, 'is');
// jika gagal dimuat
if(!$get_total_expen_result){
  response_message('failed', 'message', '0');
  $get_total_expen_result->free();
  exit;
}
// jika data kosong
if($get_total_expen_result->num_rows === 0){
  response_message('not ready', 'message', '0');
  $get_total_expen_result->free();
  exit;
}
// jika berhasil dimuat
$row = $get_total_expen_result->fetch_assoc();
$total = $row['total'];
response_message('success', 'total', $total);
$get_total_expen_result->free();
$con->close();
?>