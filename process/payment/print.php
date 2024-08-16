<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// cek sesi
if(!isset($_SESSION['id_toko']) || !isset($_SESSION['nama_toko']) || !isset($_SESSION['alamat_toko'])){
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
if(!isset($data['invoice']) || $data['invoice'] === ''){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data yang dikirim
$id_toko = $_SESSION['id_toko'];
$nama_toko = $_SESSION['nama_toko'];
$alamat_toko = $_SESSION['alamat_toko'];
$whatsapp = $_SESSION['nomor_whatsapp'];
$nama_admin = $_SESSION['nama_admin'];
$faktur = $data['invoice'];
$catatan = $_SESSION['catatan_toko'];
// muat data transaksi dan pembayaran
// muat data transaksi
$get_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ? ORDER BY id_transaksi DESC";
$get_transaction_params = [$id_toko, $faktur];
$get_transaction_result = fetch_data($con, $get_transaction_query, $get_transaction_params, 'is');
// jika data transaksi gagal dimuat
if(!$get_transaction_result){
  response_message('failed', 'message', 'Gagal memuat data!');
  $get_transaction_result->free();
  exit;
}
// jika sata transaksi tidak ditemukan
if($get_transaction_result->num_rows === 0){
  response_message('failed', 'message', 'Data tidak ditemukan!');
  $get_transaction_result->free();
  exit;
}
// jika data transaksi berhasil dimuat
// muat data pembayaran
$get_payment_query = "SELECT * FROM tb_pembayaran WHERE id_toko = ? AND nomor_faktur = ?";
$get_payment_params = [$id_toko, $faktur];
$get_payment_result = fetch_data($con, $get_payment_query, $get_payment_params, 'is');
// jika data pembayaran gagal dimuat
if(!$get_payment_result){
  response_message('failed', 'message', 'Gagal memuat data pembayaran!');
  $get_payment_result->free();
  $get_transaction_result->free();
  exit;
}
// jika data pembayaran tidak ditemukan
if($get_payment_result->num_rows === 0){
  response_message('failed', 'message', 'Data pembayaran tidak ditemukan!');
  $get_payment_result->free();
  $get_transaction_result->free();
  exit;
}
// jika data pembayaran berhasil dimuat
$rop = $get_payment_result->fetch_assoc();
$data_print = '';
// fungsi untuk memotong teks sesuai panjang maksimum
function truncateText($text, $maxLength){
  return (strlen($text) > $maxLength) ? substr($text, 0, $maxLength) . '' : $text;
}
// fungsi untuk mengatur teks dalam format kolom
function format_line($colLeft, $colRight){
  $maxColLeft = 3;
  $maxColRight = 29;
  $colLeft = truncateText($colLeft, $maxColLeft);
  $colRight = truncateText($colRight, $maxColRight);
  return str_pad($colLeft, $maxColLeft) . str_pad($colRight, $maxColRight) . "\n";
}
function format_lines($colLeft, $colRight){
  $maxColLeft = 22;
  $maxColRight = 10;
  $colLeft = truncateText($colLeft, $maxColLeft);
  $colRight = truncateText($colRight, $maxColRight);
  return str_pad($colLeft, $maxColLeft) . str_pad($colRight, $maxColRight, ' ', STR_PAD_LEFT) . "\n";
}
function format_cashier($colLeft, $colRight){
  $maxColLeft = 7;
  $maxColRight = 25;
  $colLeft = truncateText($colLeft, $maxColLeft);
  $colRight = truncateText($colRight, $maxColRight);
  return str_pad($colLeft, $maxColLeft) . str_pad($colRight, $maxColRight, ' ', STR_PAD_LEFT) . "\n";
}
// perintah ESC/POS untuk printer thermal
$esc = chr(27);
$cutPaper = $esc . "m";
$alignCenter = $esc . "a" . chr(1);
$alignLeft = $esc . "a" . chr(0);
$textBold = $esc . "E" . chr(1);
$textNormal = $esc . "E" . chr(0);
$drawLine = str_repeat('-', 32) . "\n";
$data_print .= "\n" . $alignCenter;
$data_print .= $textBold;
$data_print .= 'Toko '.str_replace('Toko ', '',$nama_toko) . "\n";
$data_print .= $textNormal;
$data_print .= $alamat_toko . "\n";
$data_print .= $drawLine;
if($whatsapp !== ''){
  $data_print .= 'WhatsApp ' . $whatsapp . "\n";
}
$data_print .= 'Faktur ' . $faktur . "\n";
$data_print .= $rop['tanggal'] . "\n";
$data_print .= $drawLine;
$data_print .= format_cashier('Kasir', $nama_admin);
$data_print .= $drawLine;
$data_print .= $alignLeft;
$total_belanja = 0;
$total_diskon = 0;
$totit = 0;
$no = 1;
while($row = $get_transaction_result->fetch_assoc()){
  $data_print .= format_line($no, capitalize($row['nama']));
  $data_print .= format_lines('   ' . format_number($row['jumlah']) . 'x' . format_number($row['harga']), format_number($row['jumlah'] * $row['harga']));
  if($row['diskon'] !== '0.00'){
    $data_print .= format_lines('   Diskon ' . format_number($row['jumlah']) . 'x' . format_number($row['diskon']), format_number($row['jumlah'] * $row['diskon']));
    $total_diskon += $row['jumlah'] * $row['diskon'];
  }
  $no++;
  $totit += $row['jumlah'];
}
$data_print .= $drawLine;
$total_belanja = $rop['total'] + $total_diskon;
$data_print .= format_lines('Total Item  ('.format_number($totit).')', format_number($total_belanja));
if($total_diskon !== 0){
  $data_print .= format_lines('Total Diskon', format_number($total_diskon));
  $data_print .= format_lines('Total Belanja', format_number($total_belanja - $total_diskon));
}
$data_print .= format_lines('Tunai', format_number($rop['pembayaran']));
$data_print .= format_lines('Kembalian', format_number($rop['pembayaran'] - ($total_belanja - $total_diskon)));
$data_print .= $drawLine;
$data_print .= $alignCenter;
if($catatan !== ''){
  $dataCatatan = $catatan;
}else{
  $dataCatatan = 'Barang yang sudah dibeli tidak dapat dikembalikan, kecuali membawa struk atau bukti pembayaran.';
}
$data_print .= $dataCatatan . "\n";
$data_print .= $textBold;
$pattern = '/\b(terima\s?kasih|makasih)\b/i';
if(preg_match($pattern, $dataCatatan)){
   $terimaKasih = '';
}else{
  $terimaKasih = 'Terima Kasih';
}
$data_print .= $terimaKasih;
$data_print .= $cutPaper . "\n\n\n\n";
response_message('success', 'data_print', $data_print);
$get_payment_result->free();
$get_transaction_result->free();
$con->close();
?>