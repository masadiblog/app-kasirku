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
$require_fields = ['expen', 'description', 'dataId'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$id_pengeluaran = $data['dataId'];
$pengeluaran = str_replace('.', '', $data['expen']);
$keterangan = $data['description'];
// proses update data pengeluaran
$update_expen_query = "UPDATE tb_pengeluaran SET pengeluaran = ?, keterangan = ? WHERE id_pengeluaran = ? AND id_toko = ?";
$update_expen_params = [$pengeluaran, $keterangan, $id_pengeluaran, $id_toko];
$update_expen_success = update_data($con, $update_expen_query, $update_expen_params, 'dsii');
// jika proses update data pengeluaran gagal
if(!$update_expen_success){
  response_message('failed', 'message', 'Data pengeluaran gagal diperbarui!');
  exit;
}
// jika proses update data pengeluaran berhasil
response_message('success', 'message', 'Data pengeluaran berhasil diperbarui.');
$con->free();
?>