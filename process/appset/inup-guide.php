<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi id
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
$require_fields = ['title', 'guide'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$key_value = '16sbdy27172bxhd7w72w';
$judul = $data['title'];
$panduan = str_replace("\n", '<br>', str_replace('<p>', '', str_replace('</p>', '', $data['guide'])));
// cek data tabel panduan
$check_guide_query = "SELECT * FROM tb_panduan WHERE key_value = ?";
$check_guide_params = [$key_value];
$check_guide_result = fetch_data($con, $check_guide_query, $check_guide_params, 's');
// jika tabel panduan gagal dicek
if(!$check_guide_result){
  response_message('failed', 'message', 'Pengecekan gagal diproses!');
  exit;
}
// jika pengecekan berhasil
// dan jika tabel sudah ada data maka perbarui
if($check_guide_result->num_rows === 1){
  $update_guide_query = "UPDATE tb_panduan SET judul_panduan = ?, teks_panduan = ?, tanggal_update = ?";
  $update_guide_params = [$judul, $panduan, $full_date];
  $update_guide_success = update_data($con, $update_guide_query, $update_guide_params, 'sss');
  // jika data panduan gagal diperbarui
  if(!$update_guide_success){
    response_message('failed', 'message', 'Data panduan gagal diperbarui!');
    $check_guide_result->free();
    exit;
  }
  // jika data panduan berhasil diperbarui
  response_message('success', 'message', 'Data panduan berhasil diperbarui!');
}else{
  // dan jika tabel masih kosong maka tambahkan data
  $insert_guide_query = "INSERT INTO tb_panduan (key_value, judul_panduan, teks_panduan, tanggal_terbit, tanggal_update) VALUES(?, ?, ?, ?, ?)";
  $insert_guide_params = [$key_value, $judul, $panduan, $full_date, ''];
  $insert_guide_success = insert_data($con, $insert_guide_query, $insert_guide_params, 'sssss');
  // jika data panduan gagal ditambahkan
  if(!$insert_guide_success){
    response_message('failed', 'message', 'Data panduan gagal disimpan!');
    $check_guide_result->free();
    exit;
  }
  // jika data panduan berhasil ditambahkan
  response_message('success', 'message', 'Data panduan berhasil disimpan!');
}
$check_guide_result->free();
$con->close();
?>