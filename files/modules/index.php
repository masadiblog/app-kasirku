<?php
session_start();
require '../../con.php';
function cleanUrl($url){
  return filter_var($url, FILTER_SANITIZE_URL);
}
$base_url_cleaned = cleanUrl($base_url);
$path = 'files/modules/';
if(!isset($_SESSION['id-toko'])){
  $direct = str_replace($path, '', $base_url_cleaned).'?pg=login';
}else{
  $direct = str_replace($path, '', $base_url_cleaned);
}
header('Location:'.$direct);
exit;
?>