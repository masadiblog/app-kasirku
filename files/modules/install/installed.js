import {checkDeviceType} from '../check/device/type.js';
import {qs, cment, showLoader} from '../utils.js';
checkDeviceType();
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => {
    localStorage.setItem('pwaInstalled', 'false');
  }, 1000);
});
const pwaInstalled = localStorage.getItem('pwaInstalled');
if(pwaInstalled === 'false' && (!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone)){
  window.location.href = 'https://kasirku.atakana.com/install/install.html';
}
document.addEventListener('DOMContentLoaded', function(){
  function textInfo(message){
    const p1 = cment('p');
    p1.textContent = 'Selamat, App KasirKu berhasil diinstal.';
    message.appendChild(p1);
    const p2 = cment('p');
    p2.textContent = 'Untuk membukanya silakan klik tombol dibawah, atau cari aplikasi App KasirKu yang sudah terinstal didaftar aplikasi perangkat Anda.';
    message.appendChild(p2);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  let titleText;
  if(success === 'true'){
    titleText = 'App KasirKu';
    const message = qs('#message');
    message.innerHTML = '';
    textInfo(message);
  }else{
    titleText = null;
  }
  const openApp = () => {
    showLoader(2250, titleText, 'Sedang membuka aplikasi...');
    setTimeout(() => {
      window.open('https://kasirku.atakana.com/');
    }, 2500);
  };
  qs('#openApp').onclick = openApp;
});