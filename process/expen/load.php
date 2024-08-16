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
// cek data yang dikirim
if(!isset($data['expen']) || $data['expen'] !== 'expenditure'){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$tanggal = date('Y-m-d');
// proses muat data pengeluaran berdasarkan id toko dan tanggal hari ini
$load_expen_query = "SELECT * FROM tb_pengeluaran WHERE id_toko = ? AND tanggal = ? ORDER BY id_pengeluaran DESC";
$load_expen_params = [$id_toko, $tanggal];
$load_expen_result = fetch_data($con, $load_expen_query, $load_expen_params, 'is');
// jika data pengeluaran gagal dimuat
if(!$load_expen_result){
  response_message('failed', 'message', 'Data pengeluaran gagal dimuat!');
  $load_expen_result->free();
  exit;
}
// jika data pengeluaran kosong
if($load_expen_result->num_rows === 0){
  response_message('not ready', 'message', 'Tidak ada data pengeluaran!');
  $load_expen_result->free();
  exit;
}
// muat data pengeluaran
$expens = array();
while($expen = $load_expen_result->fetch_assoc()){
  $expens[] = $expen;
}
response_message('success', 'expens', $expens);
$load_expen_result->free();
$con->close();
?>