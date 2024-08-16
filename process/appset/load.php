<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['nama_admin'])){
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
if(!isset($data['data']) || $data['data'] !== 'guide'){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// proses muat data panduan
$key = 'js6wgeyx6c6d82';
$load_guide_query = "SELECT * FROM tb_panduan WHERE key_value = ?";
$load_guide_params = [$key];
$load_guide_result = fetch_data($con, $load_guide_query, $load_guide_params, 's');
// jika proses muat data panduan gagal
if(!$load_guide_result){
  response_message('failed', 'message', 'Data panduan gagal dimuat!');
  exit;
}
// jika data panduan kosong
if($load_guide_result->num_rows === 0){
  $guide = array(
    'title' => '',
    'description' => '',
    'message' => 'Belum ada data panduan!'
  );
  response_message('not ready', 'guide', $guide);
  $load_guide_result->free();
  exit;
}
// jika data panduan tersedia
$row = $load_guide_result->fetch_assoc();
$guide = array(
  'title' => $row['judul_panduan'],
  'description' => $row['teks_panduan'],
  'post' => $row['tanggal_terbit'],
  'update' => $row['tanggal_update']
);
response_message('success', 'guide', $guide);
$con->close();
?>