<?php
session_start();
require '../../con.php';
$data = json_decode(file_get_contents('php://input'), true);
// cek error json
if(json_last_error() !== JSON_ERROR_NONE){
  response_message('failed', 'message', 'Data json tidak valid!');
  exit;
}
// cek validasi data yang dikirim
if(!isset($data['username'])){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
$username = $data['username'];
// cek username
$check_username_query = "SELECT * FROM tb_admin WHERE username = ?";
$check_username_params = [$username];
$check_username_result = fetch_data($con, $check_username_query, $check_username_params, 's');
// jika pengecekan gagal dilakukan
if(!$check_username_result){
  response_message('failed', 'message', 'Validasi username gagal!');
  $check_username_result->free();
  exit;
}
// jika username tidak cocok
if($check_username_result->num_rows === 0){
  response_message('failed', 'message', 'Username tidak cocok!');
  $check_username_result->free();
  exit;
}
// jika username cocok
$direct = str_replace('process/admin/', '', $base_url).'?pg=replace&us='.trim(base64_encode($username));
response_message('success', 'direct', $direct);
$check_username_result->free();
$con->close();
?>