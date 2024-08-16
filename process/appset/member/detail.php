<?php
session_start();
require '../../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek data yang dikirim
if(!isset($data['input'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$input = $data['input'];
// ambil data toko
$get_store_query = "SELECT * FROM tb_toko WHERE id_toko = ?";
$get_store_params = [$input];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 's');
// jika data gagal diambil
if(!$get_store_result){
  response_message('failed', 'message', 'Data gagal dimuat! '.$input);
  exit;
}
// jika data tidak ditemukan
if($get_store_result->num_rows === 0){
  $notReady = array(
    'key' => '0',
    'message' => 'Data tidak ditemukan!'
  );
  response_message('not ready', 'data', $notReady);
  $get_store_result->free();
  exit;
}
function formatDate($date){
  if($date === ''){
    return $b = '';
  }
  $a = explode('-', $date);
  $b = $a[2];
  $c = $a[1];
  $d = $a[0];
  switch($c){
    case '01': $c = 'Januari'; break;
    case '02': $c = 'Februari'; break;
    case '03': $c = 'Maret'; break;
    case '04': $c = 'April'; break;
    case '05': $c = 'Mei'; break;
    case '06': $c = 'Juni'; break;
    case '07': $c = 'Juli'; break;
    case '08': $c = 'Agustus'; break;
    case '09': $c = 'September'; break;
    case '10': $c = 'Oktober'; break;
    case '11': $c = 'November'; break;
    case '12': $c = 'Desember'; break;
    return $c;
  }
  return $b . ' ' . $c . ' ' . $d;
}
$row = $get_store_result->fetch_assoc();
$rows = array(
  'key' => '1',
  'list' => $row['id_toko'],
  'name' => 'Toko ' . str_replace('Toko ', '', $row['nama_toko']),
  'status' => $row['status_langganan'],
  'contact' => $row['nomor_whatsapp'],
  'address' => $row['alamat_toko'],
  'start' => formatDate($row['tanggal_mulai']),
  'limit' => formatDate($row['tanngal_akhir']),
  'register' => formatDate($row['tanggal']),
);
response_message('success', 'data', $rows);
$get_store_result->free();
$con->close();
?>