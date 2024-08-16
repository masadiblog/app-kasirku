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
if(!isset($data['data'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$id_pengeluaran = $data['data'];
// proses hapus data pengeluaran
$delete_expen_query = "DELETE FROM tb_pengeluaran WHERE id_pengeluaran = ? AND id_toko = ?";
$delete_expen_params = [$id_pengeluaran, $id_toko];
$delete_expen_success = delete_data($con, $delete_expen_query, $delete_expen_params, 'ii');
// jika proses hapus data pengeluaran gagal
if(!$delete_expen_success){
  response_message('failed', 'message', 'Data pengeluaran gagal dihapus!');
  exit;
}
// jika berhasil
response_message('success', 'message', 'Data pengeluaran berhasil dihapus.');
$con->close();
?>