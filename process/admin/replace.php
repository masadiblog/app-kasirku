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
$require_fields = ['username', 'password'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
// simpan password baru
$update_password_query = "UPDATE tb_admin SET kata_sandi = ? WHERE user_admin = ?";
$update_password_params = [$password, $username];
$update_password_success = update_data($con, $update_password_query, $update_password_params, 'ss');
// jika password gagal diperbarui
if(!$update_password_success){
  response_message('failed', 'message', 'Password gagal diperbarui!');
  exit;
}
// jika password berhasil diperbarui
$direct = str_replace('process/admin/', '', $base_url).'?pg=login&ms='.trim(base64_encode('Selamat, sekarang Anda dapat login dengan username dan')).'&u='.trim(base64_encode($username),'=').'&p='.trim(base64_encode(htmlentities($data['password'])),'=').'&me='.trim(base64_encode('password baru Anda.'),'=');
response_message('success', 'direct', $direct);
$con->close();
?>