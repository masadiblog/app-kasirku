<?php
session_start();
require '../../con.php';
header('Content-Type: application/json');
// Cek sesi
if(!isset($_SESSION['id_toko'])){
    response_message('failed', 'message', 'Sesi tidak valid!');
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
// Cek error JSON
if(json_last_error() !== JSON_ERROR_NONE){
    response_message('failed', 'message', 'Data json tidak valid!');
    exit;
}
// Cek data yang dikirim
$require_fields = ['name', 'email', 'title', 'message'];
foreach($require_fields as $field){
    if(!isset($data[$field])){
        response_message('failed', 'message', 'Data yang dikirim tidak valid!');
        exit;
    }
}
// Set data yang dikirim
$to = "alamat.email@gmail.com";
$subject = $data['title'];
$name = $data['name'];
$from_email = $data['email'];
$message = $data['message'];
$headers = "From: " . $from_email . "\r\n" .
           "Reply-To: " . $from_email . "\r\n" .
           "X-Mailer: PHP/" . phpversion() . "\r\n" .
           "Content-Type: text/plain; charset=UTF-8";
$body = "Name: $name\nEmail: $from_email\nMessage: $message";
if(mail($to, $subject, $body, $headers)){
    response_message('success', 'message', 'Pesan berhasil dikirim.');
}else{
    response_message('failed', 'message', 'Pesan gagal terkirim!');
}
$con->close();
?>