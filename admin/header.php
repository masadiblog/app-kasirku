<?php
session_start();
require 'con.php';
if(isset($_GET['pg']) && $_GET['pg'] === 'add-new-shop' && !isset($_SESSION['login-admin'])){
  header('Location:'.$base_url.'?pg=login');
  exit;
}
if(isset($_SESSION['nama-toko']) && $_SESSION['nama-toko'] !== null){
  header('Location:'.$base_url);
  exit;
}
if(isset($_GET['pg']) && $_GET['pg'] !== 'add-new-store'){
  if(isset($_SESSION['login-admin'])){
    header('Location:'.$base_url);
    exit;
  }
  if(isset($_GET['ms']) && isset($_GET['u']) && isset($_GET['p']) && isset($_GET['me'])){
    $mesage = base64_decode($_GET['ms']).' '.base64_decode($_GET['me']);
    $username = base64_decode($_GET['u']);
    $password = base64_decode($_GET['p']);
  }else{
    $mesage = $username = $password = '';
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#002855">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <title>Login KasirKu</title>
  <meta name="apple-mobile-web-app-title" content="Login KasirKu">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="descripton" content="Aplikasi KasirKu">
  <meta property="og:url" content="<?=$base_url;?>">
  <meta property="og:title" content="App KasirKu">
  <meta property="og:description" content="Simpan data penjualan dengan rapi di App KasirKu.">
  <meta property="og:image" content="<?=$base_url.'files/img/icon-512x512.png';?>">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="App KasirKu">
  <link rel="manifest" href="<?=$base_url.'files/js/manifest.json?v='.filemtime('files/js/manifest.json');?>">
  <link rel="icon" type="image/png" href="<?=$base_url.'files/img/icon-72x72.png';?>">
  <link rel="shortcut icon" type="image/png" href="<?=$base_url.'files/img/icon-72x72.png';?>">
  <link rel="apple-touch-icon" type="image/png" href="<?=$base_url.'files/img/icon-192x192.png';?>">
  <link rel="apple-touch-icon" sizes="512x512" href="<?=$base_url.'files/img/icon-512x512.png';?>">
  <link rel="stylesheet" href="<?=$base_url.'admin/admin.css?v='.filemtime('admin/admin.css');?>">
</head>
<body><div id="progress-container"><div id="progress-bar"></div></div>
