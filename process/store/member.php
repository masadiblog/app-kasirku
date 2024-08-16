<?php
session_start();
require '../../con.php';
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
if(!isset($data['member'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$member = $data['member'];
// proses update member
$update_member_query = "UPDATE tb_toko SET status_langganan = ? WHERE id_toko = ?";
$update_member_params = [$member, $id_toko];
$update_member_success = update_data($con, $update_member_query, $update_member_params, 'si');
// jika gagal diproses
if(!$update_member_success){
  response_message('failed', 'message', 'Data gagal diproses!');
  exit;
}
// jika berhasil diproses
response_message('success', 'message', 'Masa laggangan Anda telah selesai. Silakan perpanjang masa langganan agar Anda dapat terus menikmati semua fitur yang tersedia.');
$con->close();
?>