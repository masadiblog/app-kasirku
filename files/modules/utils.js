// document selector
function qs(selector, scope){
  return (scope || document).querySelector(selector);
};
function qsa(selector, scope){
  return (scope || document).querySelectorAll(selector);
};
// create element
function cment(x){
  return document.createElement(x);
};
// end document selector, create element

import {checkCameraActive} from './product/barcode-scanner.js';

// progress bar
function initializeProgressBar(){
  const progressBar = qs('#progress-bar');
  const progressContainer = qs('#progress-container');
  function updateProgressBar(percent){
    progressBar.style.width = percent + '%';
  };
  const states = {
    'loading': 0,
    'interactive': 50,
    'complete': 100
  };
  function handleStateChange(){
    if(document.readyState in states){
      updateProgressBar(states[document.readyState]);
    }
    if(document.readyState === 'complete'){
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 500);
    }
  };
  // Trigger on initial load
  if(document.readyState in states){
    updateProgressBar(states[document.readyState]);
  }
  // Trigger on ready state change
  document.onreadystatechange = handleStateChange;
  // Trigger on page navigation
  window.addEventListener('beforeunload', () => {
    progressContainer.style.display = 'block';
    updateProgressBar(states['loading']);
  });
  // Trigger on new page load
  window.addEventListener('pageshow', () => {
    handleStateChange();
  });
};
// end progress bar

// verify member status & count down
function verifyMemberStatus(){
  const body = qs('body');
  const start = atob(body.getAttribute('data-start')).replace('_go', '');
  const limit = atob(body.getAttribute('data-limit')).replace('_stop', '');
  let status = atob(body.getAttribute('data-status')).replace('_status', '');
  if(status === 'testing'){
    status = 'Percobaan';
  }else if(status === 'active'){
    status = 'Berlangganan';
  }else if(status === 'nonactive'){
    status = 'Selesai';
  }
  const countDownInterval = setInterval(() => {updateCountDown(limit, status, countDownInterval)}, 0);
};
// update count down
function updateCountDown(limit, status, countDownInterval){
  let now = new Date().getTime();
  let countDownDate = new Date(limit).getTime();
  let distance = countDownDate - now;
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
  let minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
  let seconds = Math.floor(distance % (1000 * 60) / 1000);
  if(distance < 0){
    clearInterval(countDownInterval);
    updateMemberStatus(status);
    distance = 0;
  }
  document.body.dataset.distance = distance.toString();
};
// apdate member status
async function updateMemberStatus(status){
  try{
    if(status === 'Percobaan' || status === 'Berlangganan' || status === 'Selesai'){
      status = 'nonactive';
    }
    const url = 'process/store/member.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({member: status})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      alertBox({message: result.message});
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end verify member status & count down

// handle before install prompt
function handleBeforeInstallPrompt(){
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    localStorage.setItem('pwaInstalled', 'false');
  });
};
// end handle before install prompt

// handle app installed
function handleAppInstalled(){
  window.addEventListener('appinstalled', (evt) => {
    localStorage.setItem('pwaInstalled', 'true');
  });
};
// end handle app installed

// register service worker
function registerServiceWorker(){
  const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isInStandaloneMode()) {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('../../sw.js').then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, (err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  } else {
    console.log('Silakan instal aplikasi!');
  }
};
// end register service worker

// initialize pwa
function initializePWA(){
  handleBeforeInstallPrompt();
  handleAppInstalled();
  registerServiceWorker();
};
// end initialize pwa

// check installation status
function checkInstallationStatus(){
  const pwaInstalled = localStorage.getItem('pwaInstalled');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if(!isStandalone){
    // munculkan animasi loading
    showLoader(null, null, 'Sedang memuat...');
    if(pwaInstalled === 'true'){
      setTimeout(() => {
        // alihkan ke halaman informasi aplikasi sudah diinstal
        window.location.href = '../../install/installed.html';
      }, 1000);
    }else{
      setTimeout(() => {
        // alihkan ke halaman informasi instal aplikasi
        window.location.href = '../../install/install.html';
      }, 2000);
    }
  }
};
// end check installation status

// show loader
function showLoader(time, title, text){
  const loaderBox = qs('#loaderBox');
  if(loaderBox === null){
    let titleValue, textValue;
    if(title === undefined && title === null){
      titleValue = '';
    }else{
      titleValue = title;
    }
    if(text === undefined && text === null){
      textValue = 'Loading...';
    }else{
      textValue = text;
    }
    const loaderBox = cment('div');
    loaderBox.setAttribute('id', 'loaderBox');
    loaderBox.classList.add('active');
    const loaderTitle = cment('div');
    loaderTitle.setAttribute('id', 'loaderTitle');
    loaderTitle.textContent = titleValue;
    loaderBox.appendChild(loaderTitle);
    const loader = cment('div');
    loader.setAttribute('id', 'loader');
    loaderBox.appendChild(loader);
    const loaderText = cment('div');
    loaderText.setAttribute('id', 'loaderText');
    loaderText.innerHTML = textValue;
    loaderBox.appendChild(loaderText);
    document.body.appendChild(loaderBox);
    if(time !== undefined && time !== null){
      setTimeout(() => {
        qs('#loaderBox').classList.remove('active');
        setTimeout(() => {
          qs('#loaderBox').remove();
        }, 1000);
      }, time);
    }
  }else{
    loaderBox.innerHTML = '';
  }
};
// hide loader
function hideLoader(time){
  const loader = qs('#loaderBox');
  if(time === undefined){
    loader.classList.remove('active');
    setTimeout(() => {
      loader.remove();
    }, 1000);
  }else{
    setTimeout(() => {
      loader.classList.remove('active');
      setTimeout(() => {
        loader.remove();
      }, 1000);
    }, time);
  }
}
// end show and hide loader

// handle error message
const error = {
  network: 'Sepertinya kedala pada jaringan, silahkan periksa jaringan Anda dan coba kembali!'
};
// end handle error message

// handle status message
const status = {
  online: 'Anda kembali online',
  offline: 'Anda sedang offline',
  success: 'success',
  failed: 'failed',
  ready: 'ready',
  not_ready: 'not ready',
  not_name: 'not match name',
  not_user: 'not match user',
  not_pass: 'not match pass',
};
// end handle status message

// handle button text
const button = {
  yes: 'Ya',
  oke: 'Oke',
  delete: 'Hapus',
  next: 'Lanjutkan',
  close: 'Tutup',
  cancel: 'Batal',
  back: 'Kembali',
  not: 'Tidak',
  out: 'Keluar',
};
// end handle button text

// speak
function speak(text){
  if('speechSynthesis' in window){
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }else{
    alert(text);
  }
};
// end speak

// format number
/*
function format_number(number){
  if(typeof number === 'number'){
    number = number.toString();
  }
  let parts = number.split('.');
  let mainPart = parts[0].replace(/[^0-9]/g, '');
  let decimalPart = parts[1] ? parts[1].replace(/[^0-9]/g, '') : '';
  let length = mainPart.length % 3;
  let subint = mainPart.substr(0, length);
  let match = mainPart.substr(length).match(/\d{3}/g);
  if(match){
    let separator = length ? '.' : '';
    subint += separator + match.join('.');
  }
  if(decimalPart !== ''){
    decimalPart = decimalPart.replace(/0+$/, '');
    if(decimalPart === ''){
      return subint;
    }else{
      return subint + ',' + decimalPart;
    }
  }
  return subint;
};
*/
function format_number(number) {
  let isNegative = false;
  
  // Cek apakah angka negatif
  if (number < 0) {
    isNegative = true;
    number = Math.abs(number);
  }
  
  if (typeof number === 'number') {
    number = number.toString();
  }

  let parts = number.split('.');
  let mainPart = parts[0].replace(/[^0-9]/g, '');
  let decimalPart = parts[1] ? parts[1].replace(/[^0-9]/g, '') : '';
  let length = mainPart.length % 3;
  let subint = mainPart.substr(0, length);
  let match = mainPart.substr(length).match(/\d{3}/g);

  if (match) {
    let separator = length ? '.' : '';
    subint += separator + match.join('.');
  }

  if (decimalPart !== '') {
    decimalPart = decimalPart.replace(/0+$/, '');
    if (decimalPart === '') {
      return isNegative ? '-' + subint : subint;
    } else {
      return isNegative ? '-' + subint + ',' + decimalPart : subint + ',' + decimalPart;
    }
  }

  return isNegative ? '-' + subint : subint;
}
// end format number

// format value
function format_value(value) {
	let number = value.replace(/[^,\d]/g, '').toString(),
  split = number.split(','),
  length = split[0].length % 3,
  subint = split[0].substr(0, length),
  match = split[0].substr(length).match(/\d{3}/gi);
  if(match){
    let separator = length ? '.' : '';
    subint += separator + match.join('.');
  }
  return subint = split[1] !== undefined ? subint + ',' + split[1] : subint;
}
// end format value

// capitalize
function capitalize(x){
  const arr = x.split(' ');
  for(let i = 0; i < arr.length; i++){
    if(!(arr[i].match(/[a-zA-Z]/))){
      arr[i] = format_value(arr[i]);
    }else{
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
  }
  return arr.join(' ');
};
// end capitalize

// notification alert
function notificationAlert(text, style, close) {
  let notificationCheck = qs('#notification_alert');
  setTimeout(() => {
    notificationCheck.classList.remove('show', style);
    setTimeout(() => {
      notificationCheck.remove();
    },250);
  },500);
  const notification = document.createElement('div');
  notification.setAttribute('id', 'notification_alert');
  setTimeout(() => {
    notification.classList.add('show', style);
  },100);
  notification.innerHTML = text;
  if(close !== true){
    setTimeout(() => {
      notification.classList.remove('show', style);
      setTimeout(() => {
        notification.remove();
      },250);
    },5000);
  }else{
    const button = document.createElement('div');
    button.setAttribute('id', 'close');
    button.textContent = '×';
    button.onclick = () => {
      notification.classList.remove('show', style);
      setTimeout(() => {
        notification.remove();
      },250);
    }
    notification.appendChild(button);
  }
  document.body.appendChild(notification);
};
// end notification alert

// alert box
let notificationQueue = [];
let isNotificationActive = false;
function alertBox(data){
  notificationQueue.push({data});
  if(!isNotificationActive){
    showNotification();
  }else{
    const exitingBox = qs('#alert_box');
    if(exitingBox){
      isNotificationActive = false;
      exitingBox.remove();
      showNotification();
    }
  }
};
function showNotification(){
  if(notificationQueue.length === 0){
    isNotificationActive = false;
    return;
  }
  isNotificationActive = true;
  let {data} = notificationQueue.shift();
  const alert_box = document.createElement('div');
  alert_box.setAttribute('id', 'alert_box');
  // munculkan alert box
  alert_box.classList.add('show');
  const box_alert = document.createElement('div');
  box_alert.setAttribute('id', 'box_alert');
  // alert title
  const title_box = document.createElement('div');
  title_box.setAttribute('id', 'title_box');
  const alert_title = document.createElement('h5');
  alert_title.setAttribute('id', 'alert_title');
  if(data.title !== undefined){
    data.title = data.title;
  }else{
    data.title = 'App KasirKu';
  }
  alert_title.textContent = data.title;
  title_box.appendChild(alert_title);
  box_alert.appendChild(title_box);
  // end alert title
  // box data
  const data_box = document.createElement('div');
  data_box.setAttribute('id', 'data_box');
  // alert subtitle
  if(data.subtitle !== undefined){
    const alert_subtitle = document.createElement('div');
    alert_subtitle.setAttribute('id', 'alert_subtitle');
    alert_subtitle.textContent = data.subtitle;
    data_box.appendChild(alert_subtitle);
  }
  // alert text
  if(data.message !== undefined){
    const alert_text = document.createElement('div');
    alert_text.setAttribute('id', 'alert_text');
    alert_text.innerHTML = data.message;
    data_box.appendChild(alert_text);
  }
  box_alert.appendChild(data_box);
  // end box data
  // alert button
  const button_box = document.createElement('div');
  button_box.setAttribute('id', 'button_box');
  // button close
  const button_close = document.createElement('button');
  button_close.setAttribute('type', 'button');
  button_close.setAttribute('id', 'button_close');
  let text_close = data.close === undefined || data.close === true ? 'Tutup' : data.close;
  button_close.textContent = text_close;
  button_close.onclick = () => {
    alert_box.classList.remove('show');
    alert_box.remove();
    isNotificationActive = false;
    showNotification();
    document.body.style.overflow = 'auto';
  }
  button_box.appendChild(button_close);
  // button execute
  if(data.execute !== undefined && data.execute.body !== undefined && data.execute.next !== undefined){
    const button_execute = document.createElement('button');
    button_execute.setAttribute('type', 'button');
    button_execute.setAttribute('id', 'button_execute');
    let text_next = data.execute.next === true ? 'Lanjutkan' : data.execute.next;
    button_execute.textContent = text_next;
    button_execute.onclick = async () => {
      if(data.execute.body.exec === undefined){
        await data.execute.body.func();
      }else{
        await data.execute.body.func(...data.execute.body.exec);
      }
      alert_box.classList.remove('show');
      alert_box.remove();
      isNotificationActive = false;
      showNotification();
      document.body.style.overflow = 'auto';
    }
    button_box.appendChild(button_execute);
  }
  box_alert.appendChild(button_box);
  // end alert button
  alert_box.appendChild(box_alert);
  document.body.appendChild(alert_box);
  alert_box.onclick = (e) => {
    if(e.target !== box_alert){
      box_alert.classList.add('scale');
    }
    setTimeout(() => box_alert.classList.remove('scale'),325);
  }
  box_alert.onclick = (e) => {
    e.stopPropagation();
  }
  document.body.style.overflow = 'hidden';
};
// end alert box

// audio
async function audioPlaying(){
  try{
    const audio = new Audio('https://kasirku.atakana.com/files/scanning.mp3');
    await audio.play();
  }catch(error){
    alertBox({
      subtitle: 'Masalah Pemutaran Audio',
      message: 'Error: ' + error.message,
    });
  }
};
// end audio

// sortir list number
function sortirListNumber(rows, cols){
  for(let i = 0; i < rows.length; i++){
    rows[i].querySelector(cols).textContent = i + 1;
  }
};
// end sortir list number

// sort date
function sortDate(x){
  let a = x.split('-'), d = a[2], m = a[1], y = a[0];
  switch(m){
    case '01': m = 'Januari'; break;
    case '02': m = 'Februari'; break;
    case '03': m = 'Maret'; break;
    case '04': m = 'April'; break;
    case '05': m = 'Mei'; break;
    case '06': m = 'Juni'; break;
    case '07': m = 'Juli'; break;
    case '08': m = 'Agustus'; break;
    case '09': m = 'September'; break;
    case '10': m = 'Oktober'; break;
    case '11': m = 'November'; break;
    case '12': m = 'Desember'; break;
  }
  return d+' '+m+' '+y;
};
// end sort date

// previous page
function previousPage(tab_back, i){
  if(checkCameraActive()){
    return;
  }
  if(window.history.length > i){
    window.history.back();
  }else{
    window.location.href = window.location.toString().split('?')[0];
  }
};
// end previous page

// spinner
function startSpinner(){
  const existing = qs('.spinner');
  if(existing){
    existing.remove();
  }
  setTimeout(() => {
    const spinner = cment('div');
    spinner.classList.add('spinner');
    document.body.appendChild(spinner);
  }, 250);
};
function stopSpinner(){
  setTimeout(() => {
    const existing = qs('.spinner');
    if(existing){
      existing.remove();
    }
  }, 1000);
};
function startSpinCam(){
  const existing = qs('.spincam');
  if(existing){
    existing.remove();
  }
  setTimeout(() => {
    const spincam = cment('div');
    spincam.classList.add('spincam');
    document.body.appendChild(spincam);
  }, 250);
};
function stopSpinCam(){
  setTimeout(() => {
    const existing = qs('.spincam');
    if(existing){
      existing.remove();
    }
  }, 1000);
};
function startSpinCamPro(){
  const existing = qs('.spincampro');
  if(existing){
    existing.remove();
  }
  setTimeout(() => {
    const spincam = cment('div');
    spincam.classList.add('spincampro');
    document.body.appendChild(spincam);
  }, 250);
};
function stopSpinCamPro(){
  setTimeout(() => {
    const existing = qs('.spincampro');
    if(existing){
      existing.remove();
    }
  }, 1000);
};
// end spinner

// start screen loader
function screenLoader(){
  const screenLoader = qs('.screen-loader');
  setTimeout(() => {
    screenLoader.classList.add('remove');
    setTimeout(() => {
      if(screenLoader){
        screenLoader.remove();
      }
    }, 500);
  }, 1000);
};
// end screen loader

// handle status online offline
const showOnline = () => notificationAlert(status.online, 'success');
const showOffline = () => notificationAlert(status.offline, 'danger');
// end handle status online offline

export {
  qs, qsa, cment, speak, initializeProgressBar,
  verifyMemberStatus, initializePWA,
  checkInstallationStatus, previousPage,
  showLoader, hideLoader, audioPlaying,
  notificationAlert, showOnline, showOffline,
  format_number, format_value, capitalize,
  alertBox, button, status, error,
  sortirListNumber, sortDate, startSpinner,
  stopSpinner, startSpinCam, stopSpinCam,
  startSpinCamPro, stopSpinCamPro, screenLoader
};