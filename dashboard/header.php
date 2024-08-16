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
  <meta name="theme-color" content="#002855">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Dashboard App KasirKu">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Dashboard App KasirKu</title>
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
  <link rel="stylesheet" href="<?=$base_url.'dashboard/app.css?v='.filemtime('dashboard/app.css');?>">
</head>
<body><div id="progress-container"><div id="progress-bar"></div></div><div class="screen-loader"></div>
  <div class="toolbar">
    <div class="bar">
      <button type="button" id="tab_back" class="back"></button>
      <div id="tab_title" class="title">Dashboard</div>
      <button type="button" id="tab_logout" class="logout"></button>
    </div>
  </div>