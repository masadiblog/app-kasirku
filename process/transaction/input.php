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
// cek access input
if(!isset($data['access'])){
  response_message('failed', 'message', 'Akses tidak valid!');
  exit;
}
// cek izin duplikasi data
if(!isset($data['check'])){
  response_message('failed', 'message', 'Data tidak valid!');
  exit;
}
$id_toko = $_SESSION['id_toko'];
// jika access input diset
if($data['access'] === 'auto'){
  $require_fields = ['invoice', 'code'];
  foreach($require_fields as $field){
    if(!isset($data[$field])){
      response_message('failed', 'message', 'Data yang dikirim tidak valid!');
      exit;
    }
  }
  $faktur = $data['invoice'];
  $kode = $data['code'];
  // cek izin duplikasi data
  if($data['check'] === false){
    $check_transaction_query1 = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ? AND kode = ?";
    $check_transaction_params1 = [$id_toko, $faktur, $kode];
    $check_transaction_result1 = fetch_data($con, $check_transaction_query1, $check_transaction_params1, 'iss');
    // jika pengecekan item produk di tabel transaksi gagal
    if(!$check_transaction_result1){
      response_message('failed', 'message', 'Data gagal diproses!');
      exit;
    }
    // jika item produk sudah ada di tabel
    if($check_transaction_result1->num_rows > 0){
      response_message('ready', 'message', 'Item sudah ada di tabel!');
      $check_transaction_result1->free();
      exit;
    }
  }
  // muat data produk berdasarkan id toko dan kode
  $product_query = "SELECT * FROM tb_produk WHERE id_toko = ? AND kode = ?";
  $product_params = [$id_toko, $kode];
  $product_result = fetch_data($con, $product_query, $product_params, 'is');
  // jika data produk gagal dimuat
  if(!$product_result){
    response_message('failed', 'message', 'Data produk gagal dimuat!');
    $product_result->free();
    exit;
  }
  // jika data produk kosong
  if($product_result->num_rows === 0){
    response_message('failed', 'message', 'Produk tidak ditemukan!');
    $product_result->free();
    exit;
  }
  // dan jika data produk tersedia, set data
  $row = $product_result->fetch_assoc();
  $nama = $row['nama'];
  $harga = $row['harga'];
  $jumlah = 1;
  $diskon = 0;
  $modal = $row['modal'];
  $stok = $row['stok'];
  $product_result->free();
}else if($data['access'] === 'manual'){
  $require_fields = ['invoice', 'code', 'name', 'price', 'qty', 'discount', 'capital', 'stock'];
  foreach($require_fields as $field){
    if(!isset($data[$field])){
      response_message('failed', 'message', 'Data yang dikirim tidak valid!');
      exit;
    }
  }
  // set data yang dikirim
  $faktur = $data['invoice'];
  $kode = $data['code'];
  $nama = str_replace('.', '', $data['name']);
  $harga = str_replace(',', '.', str_replace('.', '', $data['price']));
  $jumlah = str_replace(',', '.', str_replace('.', '', $data['qty']));
  $diskon = str_replace(',', '.', str_replace('.', '', $data['discount']));
  if($diskon === ''){
    $diskon = 0;
  }
  $modal = $data['capital'];
  $stok = $data['stock'];
}else{
  response_message('failed', 'message', 'Akses tidak valid!');
  exit;
}
$tanggal = date('Y-m-d');
// cek ketersedian stok produk sebelum memproses data transaksi
// jika ketersedian stok tidak mencukupi
if($jumlah > $stok){
  response_message('failed', 'message', '<span style="color:maroon;font-weight:500">Stok tidak mencukupi!!!</span><br><br>Permintaan: &nbsp; <b>'.format_number($jumlah).'</b><br>Stok tersedia: &nbsp; <b>'.format_number($stok).'</b>');
  exit;
}
// dan jika stok mencukupi, maka proses perintah berikut
// cek izin duplikasi data
if($data['check'] === false){
  // cek duplikat item produk di tabel transaksi berdasarkan id toko, faktur, dan nama
  $check_transaction_query = "SELECT * FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ? AND nama = ?";
  $check_transaction_params = [$id_toko, $faktur, $nama];
  $check_transaction_result = fetch_data($con, $check_transaction_query, $check_transaction_params, 'iss');
  // jika pengecekan item produk di tabel transaksi gagal
  if(!$check_transaction_result){
    response_message('failed', 'message', 'Data gagal diproses!');
    exit;
  }
  // jika item produk sudah ada di tabel
  if($check_transaction_result->num_rows > 0){
    response_message('ready', 'message', 'Item sudah ada di tabel!');
    $check_transaction_result->free();
    exit;
  }
}
// jika item transaksi belum ada di tabel
// maka tambahkan item produk ke tabel transaksi
$insert_transaction_query = "INSERT INTO tb_transaksi (id_toko, nomor_faktur, kode, nama, modal, harga, jumlah, diskon, tanggal) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
$insert_transaction_params = [$id_toko, $faktur, $kode, $nama, $modal, $harga, $jumlah, $diskon, $tanggal];
$insert_transaction_success = insert_data($con, $insert_transaction_query, $insert_transaction_params, 'isssdddds');
// jika item produk gagal ditambahkan ke tabel transaksi
if(!$insert_transaction_success){
  response_message('ready', 'message', 'Item gagal ditambahkan, coba lagi!');
  if(isset($check_transaction_result)){
    $check_transaction_result->free();
  }
  exit;
}
// jika item produk berhasil ditambahkan ke tabel transaksi
// maka perbarui data stok di tabel produk berdasarkan id_toko dan nama
$newStock = $stok - $jumlah;
$update_product__query = "UPDATE tb_produk SET stok = ? WHERE id_toko = ? AND nama = ?";
$update_product__params = [$newStock, $id_toko, $nama];
$update_product__success = update_data($con, $update_product__query, $update_product__params, 'dis');
// jika data stok produk gagal diperbarui
if(!$update_product__success){
  response_message('failed', 'message', 'Stok produk gagal diperbarui!');
  if(isset($check_transaction_result)){
    $check_transaction_result->free();
  }
  exit;
}
// jika data stok produk berhasil diperbarui, jalankan perintah berikut
$id_transaction_query = "SELECT id_transaksi FROM tb_transaksi WHERE id_toko = ? AND nomor_faktur = ? AND nama = ?";
$id_transaction_params = [$id_toko, $faktur, $nama];
$id_transaction_result = fetch_data($con, $id_transaction_query, $id_transaction_params, 'iss');
$rowid = $id_transaction_result->fetch_assoc();
$idtrans = $rowid['id_transaksi'];
$product = array(
  'idtrans' => $idtrans,
  'invoice' => $faktur,
  'code' => $kode,
  'name' => $nama,
  'price' => $harga,
  'qty' => $jumlah,
  'discount' => $diskon,
  'array_cache' => array(
    'id_toko' => $id_toko,
    'nama' => $nama,
    'stok' => $newStock
  ),
  'access' => $data['access']
);
response_message('success', 'product', $product);
$id_transaction_result->free();
if(isset($check_transaction_result)){
  $check_transaction_result->free();
}
$con->close();
?>