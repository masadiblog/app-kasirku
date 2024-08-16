<?php
session_start();
require '../con.php';
require '../aut.php';
$storeid = base64_decode(base64_decode($_GET['storeid'])) ?? '';
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <meta name="theme-color" content="#002855">
  <title>Aktivasi Fitur</title>
  <meta name="description" content="Silakan login dan konfirmasi aktivasi fitur aplikasi Anda.">
  <style>
    *{
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      font-size: 14px;
    }
    body{
      font-family: Sans-Serif;
    }
    .wrapper{
      position: relative;
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
    }
    header{
      background-color: #002855;
      padding: 1rem;
      text-align: center;
    }
    header .title h1{
      color: white;
      font-size: 1.5em;
      font-family: Georgia;
    }
    .container{
      background-color: white;
      position: absolute;
      top: 55px;
      left: 50%;
      width: 100%;
      min-height: 75.5vh;
      transform: translateX(-50%);
      padding: 5rem 1rem 1rem;
      text-align: center;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .container p{
      font-size: 18px;
      line-height: 1.75rem;
      margin-bottom: 1.75rem;
    }
    .container p:nth-last-child(2){
      margin-bottom: 5rem;
    }
    .container strong{
      font-size: 18px;
    }
    .container a{
      text-decoration: none;
      color: rgb(61,186,239);
      font-size: 18px;
    }
    .container a button{
      background-color: rgba(0,40,85,.75);
      color: white;
      padding: 7px 30px;
      border-radius: 10px;
      border-color: rgba(0,40,85,.75);
    }
    footer{
      position: fixed;
      min-height: 60px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      max-width: 480px;
      width: 100%;
      background-color: transparent;
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    footer button{
      background-color: #002855;
      color: white;
      width: 300px;
      max-width: 300px;
      margin: auto;
      height: 40px;
      border-color: #002855;
      border-style: solid;
      font-size: 1.15em;
      border-radius: 6px;
    }
  </style>
</head>
<body>
<?php
if(!isset($_SESSION['id-toko'])){
?>
  <div class="wrapper">
    <div class="container">
      <p>Silakan Login, kemudian setelah login Anda kembali ke halaman ini.</p>
      <p>Setelah login, buka kembali pesan dari App KasirKu di WhatsApp Anda, dan klik pada tautan atau link "Konfirmasi Aktivasi Fitur".</p>
      <p><strong>Terima Kasih | App KasirKu</strong></p>
      <a href="<?=str_replace('feature/', '', $base_url).'?pg=login';?>"><button type="button">Login</button></a>
    </div>
  </div>
<?php
  exit;
}
$get_store_query = "SELECT nama, member, tanggal_aktif, batas_aktif FROM tb_toko WHERE id_toko = ?";
$get_store_params = [$storeid];
$get_store_result = fetch_data($con, $get_store_query, $get_store_params, 'i');
$row = $get_store_result->fetch_assoc();
// cek validasi akses pengguna
$checkAccess = $row['nama'];
if($_SESSION['nama-toko'] !== $checkAccess){
?>
  <div class="wrapper">
    <div class="container">
      <p>Akses diblokir!<br>Anda mencoba untuk mengakses halaman ini tanpa izin. Silakan kembali.</p>
      <a href="<?=str_replace('feature/', '', $base_url);?>"><button type="button">Kembali</button></a>
    </div>
  </div>
<?php
  exit;
}
// membuat token baru
$secretKey = 'AppKasirKuT0k3NvEr1Fic4t10nMeMb3R5T4tVs';
$get_token_query = "SELECT token_valid FROM tb_token WHERE id_toko = ? ORDER BY id_token DESC";
$get_token_params = [$storeid];
$get_token_result = fetch_data($con, $get_token_query, $get_token_params, 'i');
if($get_token_result->num_rows === 0){
  header('Location: ' . str_replace('featur/', '', $base_url));
  exit;
}
$roto = $get_token_result->fetch_assoc();
$token = $roto['token_valid'];
// verifikasi token (contoh penggunaan)
if(!isTokenValid($storeid, $token, $secretKey, $con)){
?>
  <div class="wrapper">
    <div class="container">
      <p>Token tidak valid, sudah kedaluwarsa, atau sudah pernah digunakan sebelumnya. Silakan kembali.</p>
      <a href="<?=str_replace('feature/', '', $base_url);?>"><button type="button">Kembali</button></a>
    </div>
  </div>
<?php
  exit;
}
$get_store_result->free();
$con->close();
?>
  <div class="wrapper">
    <header>
      <div class="title">
        <h1>Konfirmasi Berhasil</h1>
      </div>
    </header>
    <div class="container">
      <p>Selamat, masa langganan Anda telah berhasil diperpanjang.</p>
      <p>Kini semua fitur Anda telah diaktifkan sepenuhnya.</p>
      <p>Sekarang Anda dapat kembali mengakses semua fitur yang tersedia seperti biasanya.</p>
      <p>Tetap semangat, sukses selalu,  dan selamat beraktifitas kembali.</p>
      <p><strong>Terima Kasih | App KasirKu</strong></p>
    </div>
    <footer>
      <button type="button" id="backToHomePage" data-href="<?=$base_url;?>">Buka Kasir</button>
    </footer>
  </div>
  <script>
    const backToHomePage = document.querySelector('#backToHomePage');
    backToHomePage.onclick = () => {
      window.location.href = backToHomePage.getAttribute('data-href').replace(/feature\//gi, '');
    }
  </script>
</body>
</html>