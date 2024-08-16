<?php
session_start();
require '../../../con.php';
require '../../../aut.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['login']) && !isset($_SESSION['id_admin']) && !isset($_SESSION['nama_admin']) && !isset($_SESSION['hak_akses'])){
  response_message('failed', 'message', 'Sesi tidak valid!');
  exit;
}
// cek akses
if($_SESSION['hak_akses'] !== 'level_1'){
  response_message('failed', 'message', 'Anda tidak memiliki izin untuk ini!');
  exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// cek error json
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek data yang dikirim
if(!isset($data['input'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid');
  exit;
}
// set data yang dikirim
$id_toko = $data['input'];
// muat data toko
$get_store_query = "SELECT * FROM tb_toko WHERE id_toko = ?";
$get_store_params = [$id_toko];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 'i');
// jika gagal dimuat
if(!$get_store_result){
  response_message('failed', 'message', 'Data gagal dimuat!');
  exit;
}
// jika data kosong
if($get_store_result->num_rows === 0){
  response_message('not ready', 'message', 'Data tidak tersedia!');
  $get_store_result->free();
  exit;
}
// jika data tersedia
// membuat token baru
$secretKey = 'shs73ydyydd6eu3he6euxuxudy3h3h37d5xch37383';
$storeid = $id_toko;
$token = generateToken($secretKey, $storeid);
$token_value = '';
$insert_token_query = "INSERT INTO tb_token (id_toko, tk_valid, tk_value) VALUES(?, ?, ?)";
$insert_token_params = [$storeid, $token, $token_value];
$insert_token_success = insert_data($con, $insert_token_query, $insert_token_params, 'iss');
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
$details = array(
  'status' => $row['start_langganan'],
  'start' => formatDate($row['tanggal_mulai']),
  'limit' => formatDate($row['tanggal_akhir']),
  'notification' => 'Status member berhasil diperbarui, klik teks untuk menyalin.',
  'copied' => 'Teks berhasil disalin, silakan kirim ke kontak WhatsApp tujuan.',
  'message' => '
*Terima kasih atas kesabaran Anda.*

Kami dengan senang hati menginformasikan bahwa fitur langganan Anda telah berhasil diaktifkan.

*Satu langkah terakhir sebelum Anda dapat sepenuhnya menikmati semua fitur yang tersedia.*

Silakan selesaikan aktivasi fitur dengan mengklik tautan verifikasi di bawah ini:

' . str_replace('process/appset/member/', '', $base_url) . 'verification/' . trim(base64_encode(base64_encode($storeid)), '=') . '

Kami menghargai kepercayaan dan kesetiaan Anda dalam menggunakan App KasirKu. Semoga dengan mendapatkan akses kesemua fitur dapat memberikan  Anda kepuasan tersendiri.

*Terima kasih atas dukungan Anda. Tetap semangat, dan semoga aktivitas Anda berjalan lancar.*

Salam hangat,

*App KasirKu*
  '
);
response_message('success', 'data', $details);
$get_store_result->free();
$con->close();
?>