<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko']) && !isset($_SESSION['nama_admin'])){
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
$require_fields = ['nominal', 'description'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$admin = $_SESSION['nama_admin'];
$pengeluaran = str_replace('.', '', $data['nominal']);
$keterangan = $data['description'];
$tanggal = date('Y-m-d');
// proses insert data pengeluaran
$insert_expen_query = "INSERT INTO tb_pengeluaran (id_toko, admin, pengeluaran, keterangan, tanggal) VALUES(?, ?, ?, ?, ?)";
$insert_expen_params = [$id_toko, $admin, $pengeluaran, $keterangan, $tanggal];
$insert_expen_success = insert_data($con, $insert_expen_query, $insert_expen_params, 'isdss');
// jika proses insert data pengeluaran gagal
if(!$insert_expen_success){
  response_message('failed', 'message', 'Data pengeluaran gagal diproses!');
  exit;
}
// jika proses insert data pengeluaran berhasil
// muat data yang baru disimpan
$get_expen_query = "SELECT * FROM tb_pengeluaran WHERE id_toko = ? AND pengeluaran = ? ORDER BY id_pengeluaran DESC";
$get_expen_params = [$id_toko, $pengeluaran];
$get_expen_result = fetch_data($con, $get_expen_query, $get_expen_params, 'ii');
// jika muat data gagal diproses
if(!$get_expen_result){
  response_message('failed', 'message', 'Data yang baru disimpan gagal dimuat!');
  $get_expen_result->free();
  exit;
}
// jika data tidak ditemukan
if($get_expen_result->num_rows === 0){
  response_message('failed', 'message', 'Data yang baru disimpan tidak ditemukan. Coba muat ulang!');
  $get_expen_result->free();
  exit;
}
$expens = $get_expen_result->fetch_assoc();
response_message('success', 'expens', $expens);
$get_expen_result->free();
$con->close();
?>