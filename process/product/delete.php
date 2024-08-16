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
// cek validasi data yang dikirim
$require_fields = ['idp', 'idt'];
foreach($require_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data yang dikirim
$id_produk = $data['idp'];
$id_toko = $data['idt'];
// hapus data produk
$delete_product_query = "DELETE FROM tb_produk WHERE id_produk = ? AND id_toko = ?";
$delete_product_params = [$id_produk, $id_toko];
$delete_product_success = delete_data($con, $delete_product_query, $delete_product_params, 'ii');
// jika data produk gagal dihapus
if(!$delete_product_success){
  response_message('failed', 'message', 'Produk gagal dihapus!');
  exit;
}
// jika data produk berhasil dihapus
response_message('success', 'message', 'Produk berhasil dihapus');
$con->close();
?>