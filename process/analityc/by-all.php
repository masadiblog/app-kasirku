<?php
session_start();
require '../../con.php';
header('Content-Type: apllication/json');
// cek sesi
if(!isset($_SESSION['id-toko'])){
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
if(!isset($data['request']) && $data['request'] === true){
  response_message('failed', 'message', 'Data yang dikirim tidak valid!');
  exit;
}
// set data
$id_toko = $_SESSION['id_toko'];
// ambil data
$get_transaction_query = "
  SELECT 
    YEAR(t1.tanggal) as year, 
    SUM(t1.jumlah * t1.harga) as sale, 
    SUM(t1.jumlah * t1.diskon) as discount, 
    SUM(((t1.jumlah * t1.harga) - (t1.jumlah * t1.modal)) - (t1.jumlah * t1.diskon)) as profit,
    COALESCE(
      (SELECT SUM(t2.pengeluaran) 
      FROM tb_pengeluaran t2 
      WHERE YEAR(t2.tanggal) = YEAR(t1.tanggal) 
      AND t2.id_toko = t1.id_toko), 0
    ) as expen
  FROM 
    tb_transaksi t1
  WHERE 
    t1.id_toko = ?
  GROUP BY 
    YEAR(t1.tanggal)
";
$get_transaction_params = [$id_toko];
$get_transaction_result = fetch_data($con, $get_transaction_query, $get_transaction_params, 'i');
// jika gaga memuat data
if(!$get_transaction_result){
  response_message('failed', 'message', 'Gagal memuat data!');
  exit;
}
// jika data tidak ditemukan
if($get_transaction_result->num_rows === 0){
  $products = array(
    'status' => 'not ready',
    'message' => 'Data tidak ditemukan!'
  );
  response_message('not ready', 'products', $products);
  $get_transaction_result->free();
  exit;
}
// jika data transaksi ditemukan
$saleTotal = 0;
$discountTotal = 0;
$expenTotal = 0;
$profitTotal = 0;
$products = array();
while($row = $get_transaction_result->fetch_assoc()){
  $saleTotal += $row['sale'];
  $discountTotal += $row['discount'];
  $expenTotal += $row['expen'];
  $profitTotal += $row['profit'];
  $products[] = array(
    'titleTable' => 'Menampilkan semua data penjualan',
    'date' => $row['year'],
    'name' => '',
    'price' => '',
    'sold' => '',
    'sale' => $row['sale'],
    'expen' => $row['expen'],
    'discount' => $row['discount'],
    'profit' => $row['profit'],
    'by' => 'all',
    'byAll' => 'Tahun',
  );
}
$dataTotal = array(
  'saleTotal' => $saleTotal,
  'discountTotal' => $discountTotal,
  'expenTotal' => $expenTotal,
  'profitTotal' => $profitTotal
);
response_message('success', 'products', [$products, $dataTotal]);
$get_transaction_result->free();
$con->close();
?>