<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['login-admin'])){
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
$require_fileds = ['name', 'address'];
foreach($require_fileds as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
  }
}
// set data
$nama = $data['name'];
$alamat = $data['address'];
$tanggal = date('Y-m-d');
$member = 'testing';// testing, none_active, active
$whatsapp = '';
$catatan = '';
$tanggal_aktif = date('Y-m-d');
$batas_aktif = date('Y-m-d', strtotime('+1 month', strtotime($tanggal_aktif)));
// cek ketersediaan toko
$check_store_query = "SELECT nama_toko FROM tb_toko WHERE nama_toko = ?";
$check_store_params = [$nama];
$check_store_result = fetch_data($con, $check_store_query, $check_store_params, 's');
// jika pengecekan gagal diproses
if(!$check_store_result){
  response_message('not match name', 'message', 'Pengecekan gagal diproses!');
  exit;
}
// jika nama toko sudah ada
if($check_store_result->num_rows > 0){
  response_message('not match name', 'message', 'Nama toko ini sudah digunakan!');
  $check_store_result->free();
  exit;
}
// jika nama toko belum ada, maka tambahkan
$insert_store_query = "INSERT tb_toko (nama_toko, alamat_toko, tanggal, status_langganan, nomor_whatsapp, catatan_toko, tanggal_mulai, tanggal_akhir) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
$insert_store_params = [$nama, $alamat, $tanggal, $member, $whatsapp, $catatan, $tanggal_aktif, $batas_aktif];
$insert_store_success = insert_data($con, $insert_store_query, $insert_store_params, 'ssssssss');
// jika toko gagal ditambahkan
if(!$insert_store_success){
  response_message('failed', 'message', 'Data toko gagal disimpan, coba lagi!');
  $check_store_result->free();
  exit;
}
// jika toko berhasil ditambahkan
// muat data toko
$get_store_query = "SELECT * FROM tb_toko WHERE nama_toko = ?";
$get_store_params = [$nama];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 's');
// jika data toko gagal dimuat
if(!$get_store_result){
  response_message('failed', 'message', 'Data toko gagal dimuat!');
  $check_store_result->free();
  exit;
}
// jika data toko tidak ditemukan
if($get_store_result->num_rows === 0){
  response_message('failed', 'message', 'Data toko tidak ditemukan!');
  $get_store_result->free();
  $check_store_result->free();
  exit;
}
// jika data toko berhasil dimuat
// perbarui data admin
$row = $get_store_result->fetch_assoc();
$id_toko = $row['id_toko'];
$id_admin = $_SESSION['id_admin'];
$username = $_SESSION['user_admin'];
$update_admin_query = "UPDATE tb_admin SET id_toko = ? WHERE id_admin = ? AND user_admin = ?";
$update_admin_params = [$id_toko, $id_admin, $username];
$update_admin_success = update_data($con, $update_admin_query, $update_admin_params, 'iis');
// jika data admin gagal diperbarui
if(!$update_admin_success){
  response_message('failed', 'message', 'Data admin gagal diperbarui!');
  $get_store_result->free();
  $check_store_result->free();
  exit;
}
//jika data admin berhasil diperbarui
// set sesi
$_SESSION['id_toko'] = $row['id_toko'];
$_SESSION['nama_toko'] = $row['nama_toko'];
$_SESSION['alamat_toko'] = $row['alamat_toko'];
$_SESSION['status_langganan'] = $row['status_langganan'];
$_SESSION['nomor_whatsapp'] = $row['nomor_whatsapp'];
$_SESSION['tanggal_mulai'] = $row['tanggal_mulai'];
$_SESSION['tanggal_akhir'] = $row['tanggal_akhir'];
$direct = str_replace('process/admin/', '', $base_url);
response_message('success', 'direct', $direct);
$get_store_result->free();
$check_store_result->free();
$con->close();
?>