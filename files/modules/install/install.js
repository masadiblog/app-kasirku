import {checkDeviceType} from '../check/device/type.js';
import {qs, showLoader} from '../utils.js';
checkDeviceType();
let deferredPrompt;
function handleAppInstall(){
  showLoader(2500, 'Mohon Tunggu', 'Sedang memuat aplikasi...');
  if(deferredPrompt){
    setTimeout(() => {
      deferredPrompt.prompt();
    }, 2500);
    deferredPrompt.userChoice.then((choiceResult) => {
      if(choiceResult.outcome === 'accepted'){
        localStorage.setItem('pwaInstalled', 'true');
      }else{
        localStorage.setItem('pwaInstalled', 'false');
      }
      deferredPrompt = null;
    });
  }
}
// Menangani event `beforeinstallprompt`
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => {
    localStorage.setItem('pwaInstalled', 'false');
  }, 1000);
});
// Menyimpan status setelah instalasi
window.addEventListener('appinstalled', (evt) => {
  localStorage.setItem('pwaInstalled', 'true');
  // Muncul via browser saat aplikasi diinstal
  showLoader(null, 'App KasirKu', 'Sedang diinstal... <span id="countDown">12</span>');
  const countDown = qs('#countDown');
  if(countDown){
    let countDownTime = countDown.textContent;
    let countDownInterval = setInterval(() => {
      let countDownValue = countDownTime--;
      if(countDownTime < 0){
        clearInterval(countDownInterval);
        setTimeout(() => {
          window.location.href = 'https://kasirku.atakana.com/install/installed.html?success=true'
        }, 100);
      }
      countDown.innerHTML = countDownValue;
    }, 1000);
  }
});
document.addEventListener('DOMContentLoaded', function(){
  // Memeriksa status instalasi pada setiap load
  const pwaInstalled = localStorage.getItem('pwaInstalled');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if(isStandalone){
    // Jangan tampilkan pesan apapun jika diakses melalui aplikasi yang diinstal
    return;
  }
  if(pwaInstalled === 'true' && (!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone)){
    // Muncul via browser setelah aplikasi diinstal
    setTimeout(() => {
      window.location.href = 'https://kasirku.atakana.com/install/installed.html';
    }, 1000);
  }else{
    // Muncul via browser sebelum aplikasi diinstal
    qs('#installButton').onclick = handleAppInstall;
  }
});