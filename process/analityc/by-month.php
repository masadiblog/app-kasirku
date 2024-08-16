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
$buta = explode('_', $data['selected']);
$bulan = $buta[0];
$tahun = $buta[1];
switch($bulan){
  case 'Januari': $bulan = '01'; break;
  case 'Februari': $bulan = '02'; break;
  case 'Maret': $bulan = '03'; break;
  case 'April': $bulan = '04'; break;
  case 'Mei': $bulan = '05'; break;
  case 'Juni': $bulan = '06'; break;
  case 'Juli': $bulan = '07'; break;
  case 'Agustus': $bulan = '08'; break;
  case 'September': $bulan = '09'; break;
  case 'Oktober': $bulan = '10'; break;
  case 'November': $bulan = '11'; break;
  case 'Desember': $bulan = '12'; break;
}
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
      DAY(t2.tanggal) = DAY(t1.tanggal) 
      AND MONTH(t2.tanggal) = MONTH(t1.tanggal)
      AND YEAR(t2.tanggal) = YEAR(t1.tanggal)
      AND t2.id_toko = t1.id_toko), 0
    ) as expen
  FROM 
    tb_transaksi t1
  WHERE 
    t1.id_toko = ? 
    AND MONTH(t1.tanggal) = ? 
    AND YEAR(t1.tanggal) = ?
  GROUP BY 
    DAY(t1.tanggal)
";
$get_transaction_params = [$id_toko, $bulan, $tahun];
$get_transaction_result = fetch_data($con, $get_transaction_query, $get_transaction_params, 'iss');
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
function getDateMonth($date){
  $timestamp = strtotime($date);
  $dayEn = date('l', $timestamp);
  $dateMonth = date('j F', $timestamp);
  $dayName = [
    'Sunday' => 'Minggu',
    'Monday' => 'Senin',
    'Tuesday' => 'Selasa',
    'Wednesday' => 'Rabu',
    'Thursday' => 'Kamis',
    'Friday' => 'Jumat',
    'Saturday' => 'Sabtu'
  ];
  $monthName = [
    'January' => 'Januari',
    'February' => 'Februari',
    'March' => 'Maret',
    'April' => 'April',
    'May' => 'Mei',
    'June' => 'Juni',
    'July' => 'Juli',
    'August' => 'Agustus',
    'September' => 'September',
    'October' => 'Oktober',
    'November' => 'November',
    'December' => 'Desember'
  ];
  list($date, $monthEn) = explode(' ', $dateMonth);
  return $dayName[$dayEn] . ', ' . $date . ' ' . $monthName[$monthEn];
}
$saleTotal = 0;
$discountTotal = 0;
$expenTotal = 0;
$profitTotal = 0;
$products = array();
while($row = $get_transaction_result->fetch_assoc()){
  $date = $row['tanggal'];
  $date = getDateMonth($date);
  $saleTotal += $row['sale'];
  $discountTotal += $row['discount'];
  $expenTotal += $row['expen'];
  $profitTotal += $row['profit'];
  $products[] = array(
    'titleTable' => 'Menampilkan semua data ' . $buta[0],
    'date' => $date,
    'name' => '',
    'price' => '',
    'sold' => '',
    'sale' => $row['sale'],
    'expen' => $row['expen'],
    'discount' => $row['discount'],
    'profit' => $row['profit'],
    'by' => 'month',
    'byMonth' => 'Tanggal',
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