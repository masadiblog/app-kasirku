<?php
session_start();
require 'con.php';
if(!isset($_SESSION['login-admin'])){
  header('Location:'.$base_url.'?pg=login');
  exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="theme-color" content="black">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Dashboard App KasirKu">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Dashboard Panduan</title>
  <meta name="descripton" content="Dashboard App KasirKu">
  <meta property="og:url" content="<?=$base_url;?>">
  <meta property="og:title" content="Dashboard App KasirKu">
  <meta property="og:description" content="Simpan data penjualan dengan rapi di App KasirKu.">
  <meta property="og:image" content="<?=$base_url.'files/img/icon-512x512.png';?>">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="App KasirKu">
  <link rel="manifest" href="<?=$base_url.'files/js/manifest.json?v='.filemtime('files/js/manifest.json');?>">
  <link rel="icon" type="image/png" href="<?=$base_url.'files/img/icon-72x72.png';?>">
  <link rel="shortcut icon" type="image/png" href="<?=$base_url.'files/img/icon-72x72.png';?>">
  <link rel="apple-touch-icon" type="image/png" href="<?=$base_url.'files/img/icon-192x192.png';?>">
  <link rel="apple-touch-icon" sizes="512x512" href="<?=$base_url.'files/img/icon-512x512.png';?>">
  <link rel="stylesheet" href="<?=$base_url.'appset/app.css?v='.filemtime('appset/app.css');?>">
</head>
<body>
