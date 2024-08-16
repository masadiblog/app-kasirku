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
// cek validasi data yang dikirim
$require_fields = ['tanggal', 'sorlab'];
foreach($require_fields as $filed){
  if(!isset($data[$filed])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
  }
}
// set data yang dikirim
$idtoko = $_SESSION['id_toko'];
if($data['tanggal'] === 'default'){
  $tanggal = date('Y-m-d');
  $sorlab = 'Hari ini, '.$date_now.' '.$month_now.' '.date('Y');
}else{
  $tanggal = $data['tanggal'];
  $sorlab = $data['sorlab'];
}
// muat data transaksi hari ini
$get_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND tanggal = ? ORDER BY id_transaksi DESC";
$get_transaction_params = [$idtoko, $tanggal];
$get_transaction_result = fetch_data($con, $get_transaction_query, $get_transaction_params, 'is');
// jika data transaksi gagal dimuat
if(!$get_transaction_result){
  response_message('failed', 'message', 'Data transaksi gagal dimuat!');
  $get_transaction_result->free();
  exit;
}
// jika data transaksi berhasil dimuat
$data_transaction = array();
if($get_transaction_result->num_rows === 0){
  $data_transaction[] = '
    <tr>
      <td colspan="6" style="color:maroon;text-transform:none;text-align:center">Data transaksi tidak ditemukan!</td>
    </tr>
  ';
}else{
  while($row = $get_transaction_result->fetch_assoc()){
    $nama = htmlspecialchars($row['nama']);
    $harga = htmlspecialchars($row['harga']);
    $jumlah = htmlspecialchars($row['jumlah']);
    $diskon = htmlspecialchars($row['diskon']);
    $laba = ($jumlah * $harga) - ($jumlah * htmlspecialchars($row['modal'])) - ($jumlah * $diskon);
    $data_transaction[] = '
      <tr>
        <td colspan="2">'.$nama.'</td>
        <td>'.format_number($harga).'</td>
        <td>'.format_number($jumlah).'</td>
        <td>'.format_number($diskon).'</td>
        <td>'.format_number($laba).'</td>
      </tr>
    ';
  }
}
response_message('success', 'data_transaction', [$data_transaction, $sorlab, $get_transaction_result->num_rows]);
$get_transaction_result->free();
$con->close();
?>