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
$require_fields = ['name', 'whatsapp', 'address', 'notes'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$nama = $data['name'];
$whatsapp = $data['whatsapp'];
$alamat = $data['address'];
$catatan = $data['notes'];
// proses perbarui data toko
$update_store_query = "UPDATE tb_toko SET nama_toko = ?, nomor_whatsapp = ?, alamat_toko = ?, catatan_toko = ? WHERE id_toko = ?";
$update_store_params = [$nama, $whatsapp, $alamat, $catatan, $id_toko];
$update_store_success = update_data($con, $update_store_query, $update_store_params, 'ssssi');
// jika data gagal diperbarui
if(!$update_store_success){
  response_message('failed', 'message', 'Data toko gagal diperbarui!');
  exit;
}
// jika proses berhasil
$_SESSION['nama_toko'] = $nama;
$_SESSION['alamat_toko'] = $alamat;
$_SESSION['nomor_whatsapp'] = $whatsapp;
$_SESSION['catatan_toko'] = $catatan;
response_message('success', 'message', 'Data toko berhasil diperbarui.');
$con->close();
?>