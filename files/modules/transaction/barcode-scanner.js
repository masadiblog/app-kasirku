import {qs, cment, alertBox, startSpinCam, stopSpinCam} from '../utils.js';
import {formConPay} from '../ui.js';
import {barcode} from '../icons/icon.js';

let cameraStream = null;
let animationFrameId = null;
// stop camera
function stopCamera(scanBox, detectorBox, buttonStart, buttonStop){
  if(cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById('video');
  if(video){
    video.srcObject = null;
  }
  scanBox.classList.remove('active');
  buttonStop.classList.remove('active');
  buttonStart.classList.add('active');
  if(animationFrameId){
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  detectorBox.classList.remove('scanning');
  document.body.style.overflow = 'auto';
  qs('.contrans').classList.remove('active');
  buttonStop.removeEventListener('click', stopCameraClickHandler);
}
// starting camera
function startingCamera(scanBox, detectorBox, buttonStart, buttonStop, onBarcodeDetected) {
  function startCamera(){
    scanBox.classList.add('active');
    buttonStop.classList.add('active');
    buttonStart.classList.remove('active');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        cameraStream = stream;
        const video = document.getElementById('video');
        if(video){
          video.srcObject = stream;
          video.addEventListener('loadedmetadata', () => {
            video.play();
            animationFrameId = requestAnimationFrame(scanBarcode);
          });
          stopSpinCam();
        }
        buttonStop.addEventListener('click', stopCameraClickHandler);
      })
      .catch(err => {
        setTimeout(() => {
          scanBox.classList.remove('active');
          buttonStop.classList.remove('active');
          buttonStart.classList.add('active');
        }, 1000);
        if(err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'){
          alertBox({ message: 'Akses kamera diblokir. Silakan izinkan akses kamera di pengaturan browser (Google Chrome) Anda.' });
        }else{
          alertBox({ message: `Error accessing camera: ${err.message}` });
        }
      });
  }
  // scan barcode
  function scanBarcode(){
    const video = document.getElementById('video');
    if(video.readyState !== 4){
      animationFrameId = requestAnimationFrame(scanBarcode);
      return;
    }
    const barcodeDetector = new BarcodeDetector({ formats: ['code_128', 'ean_13', 'itf', 'qr_code'] });
    barcodeDetector.detect(video)
      .then(barcodes => {
        if(barcodes.length > 0){
          barcodes.forEach(barcode => {
            onBarcodeDetected(barcode.rawValue);
          });
          detectorBox.classList.add('scanning');
        }else{
          detectorBox.classList.remove('scanning');
        }
        animationFrameId = requestAnimationFrame(scanBarcode);
      })
      .catch(err => {
        alertBox({ message: 'Barcode detection failed: ' + err });
        detectorBox.classList.remove('scanning');
      });
  }

  function stopCameraClickHandler(){
    stopCamera(scanBox, detectorBox, buttonStart, buttonStop);
  }

  startCamera();
}

let barcodeDetectorSupported = ('BarcodeDetector' in window);

function barcodeScanner(onBarcodeDetected){
  const body = qs('body');
  //const form = qs('form#transaction');
  const scanBox = cment('div');
  scanBox.setAttribute('id', 'scanBox');
  const videoBox = cment('video');
  videoBox.setAttribute('id', 'video');
  videoBox.setAttribute('autoplay', 'true');
  scanBox.appendChild(videoBox);
  const detectorBox = cment('div');
  detectorBox.setAttribute('id', 'detectorBox');
  scanBox.appendChild(detectorBox);
  body.insertBefore(scanBox, body.firstChild);
  const buttonRow = cment('div');
  buttonRow.setAttribute('id', 'buttonRow');
  const buttonStart = cment('button');
  buttonStart.setAttribute('type', 'button');
  buttonStart.setAttribute('id', 'start');
  buttonStart.innerHTML = `Mulai Scan&nbsp; ${barcode(null, 12, 'white')}`;
  buttonRow.appendChild(buttonStart);
  buttonStart.classList.add('active');
  const buttonStop = cment('button');
  buttonStop.setAttribute('type', 'button');
  buttonStop.setAttribute('id', 'stop');
  buttonStop.innerHTML = `Hentikan Scan&nbsp; ${barcode(null, 12, 'white')}`;
  buttonRow.appendChild(buttonStop);
  const formTrans = qs('form#transaction');
  formTrans.insertBefore(buttonRow, formTrans.firstChild);
  if(!barcodeDetectorSupported){
    return;
  }
  buttonStart.onclick = () => {
    startSpinCam();
    const distance = document.body.dataset.distance;
    if(distance === '0'){
      const data = atob(qs('body').getAttribute('data-name'));
      alertBox({
        title: 'Langganan Anda Habis',
        subtitle: 'Perpanjang Langganan Sekarang!',
        message: '<p>Untuk saat ini Anda tidak dapat menggunakan fitur scan barcode.</p><p>Paket berlangganan Anda telah habis. Silakan perpanjang langganan Anda sekarang agar dapat terus menikmati semua fitur yang tersedia.</p>',
        close: 'Tidak',
        execute: {
          body: {
          func: formConPay,
          exec: [data]
        },
        next: 'Ya, Perpanjang'
        }
      });
      return;
    }
    document.body.style.overflow = 'hidden';
    qs('.contrans').classList.add('active');
    startingCamera(scanBox, detectorBox, buttonStart, buttonStop, onBarcodeDetected);
  }
}

// Check camera active
function isCameraActive(){
  return cameraStream && cameraStream.active;
}

function checkCameraActive(){
  if(isCameraActive()){
    alertBox({
      message: 'Silakan klik tombol "Hentikan Scan".',
      close: 'Oke'
    });
    return true;
  }
  return false;
}

export {barcodeScanner, checkCameraActive};