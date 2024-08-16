<?php
session_start();
require '../../con.php';
header('Content-Type: apllication/json');
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
// cek data yang dikirim
$requier_fields = ['request', 'selected'];
foreach($requier_fields as $field){
  if(!isset($data[$field])){
    response_message('failed', 'message', 'Data yang dikirim tidak valid!');
    exit;
  }
}
// set data
$id_toko = $_SESSION['id-toko'];
$tahun = $data['selected'];
// ambil data
$get_transaction_query = "
  SELECT 
    t1.tanggal, 
    SUM(t1.jumlah * t1.harga) as sale, 
    SUM(t1.jumlah * t1.diskon) as discount, 
    SUM(((t1.jumlah * t1.harga) - (t1.jumlah * t1.modal)) - (t1.jumlah * t1.diskon)) as profit,
    COALESCE(
      (SELECT SUM(t2.pengeluaran) 
      FROM tb_pengeluaran t2 
      WHERE 
      MONTH(t2.tanggal) = MONTH(t1.tanggal) 
      AND YEAR(t2.tanggal) = YEAR(t1.tanggal)
      AND t2.id_toko = t1.id_toko), 0
    ) as expen
  FROM 
    tb_transaksi t1
  WHERE 
    t1.id_toko = ? 
    AND YEAR(t1.tanggal) = ?
  GROUP BY 
    MONTH(t1.tanggal)
";
$get_transaction_params = [$id_toko, $tahun];
$get_transaction_result = fetch_data($con, $get_transaction_query, $get_transaction_params, 'is');
// jika gaga memuat data
if(!$get_transaction_result){
  response_message('failed', 'message', 'Gagal memuat data!');
  exit;
}
// jika data tidak ditemukan
if($get_transaction_result->num_rows === 0){
  $products = array(
    'status' => 'not ready',
    'message' => 'Data tidak ditemukan!',
  );
  response_message('not ready', 'products', $products);
  $get_transaction_result->free();
  exit;
}
// jika data ditemukan
$saleTotal = 0;
$discountTotal = 0;
$expenTotal = 0;
$profitTotal = 0;
$products = array();
while($row = $get_transaction_result->fetch_assoc()){
  $date = explode('-', $row['tanggal']);
  $date = $date[1];
  switch($date){
    case '01': $date = 'Januari'; break;
    case '02': $date = 'Februari'; break;
    case '03': $date = 'Maret'; break;
    case '04': $date = 'April'; break;
    case '05': $date = 'Mei'; break;
    case '06': $date = 'Juni'; break;
    case '07': $date = 'Juli'; break;
    case '08': $date = 'Agustus'; break;
    case '09': $date = 'September'; break;
    case '10': $date = 'Oktober'; break;
    case '11': $date = 'November'; break;
    case '12': $date = 'Desember'; break;
  }
  $saleTotal += $row['sale'];
  $discountTotal += $row['discount'];
  $expenTotal = $row['expen'];
  $profitTotal += $row['profit'];
  $products[] = array(
    'titleTable' => 'Menampilkan semua data penjualan',
    'date' => $date,
    'name' => '',
    'price' => '',
    'sold' => '',
    'sale' => $row['sale'],
    'expen' => $row['expen'],
    'discount' => $row['discount'],
    'profit' => $row['profit'],
    'by' => 'year',
    'byYear' => 'Bulan',
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