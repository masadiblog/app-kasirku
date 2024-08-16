import {qs, qsa, cment, speak, alertBox, button, status, error, startSpinner, stopSpinner} from './utils.js';
import {eye, eyeSlash, signout} from './icons/icon.js';
import {checkCameraActive} from './product/barcode-scanner.js';

// login
// handle form login
function handleFormLogin(form){
  const input = qsa('.row input', form);
  const button = qs('.row span', form);
  button.innerHTML = eye(20, null, '#666');
  button.onclick = () => {
    button.classList.toggle('active');
    if(input[1].getAttribute('type') === 'text'){
      input[1].setAttribute('type', 'password');
      button.innerHTML = eye(20, null, '#666');
    }else{
      input[1].setAttribute('type', 'text');
      button.innerHTML = eyeSlash(20, null);
    }
  }
  const mesalert = qs('.mesalert');
  if(mesalert){
    mesalert.onclick = (e) => {
      const rect = e.target.getBoundingClientRect(), x = e.clientX - rect.left;
      if(x > 300){
        mesalert.classList.add('hide');
      }
    }
  }
}
// handle submit form login
async function handleLogin(form){
  const input = qsa('.row input', form);
  const err = qsa('.row .err', form);
  const username = input[0];
  const password = input[1];
  const err_username = err[0];
  const err_password = err[1];
  err.forEach(err => {
    err.textContent = '';
  });
  let isValid = true;
  if(username.value === ''){
    username.focus();
    err_username.textContent = 'Masukkan username!';
    isValid = false;
  }else if(password.value === ''){
    password.focus();
    err_password.textContent = 'Masukkan password!';
    isValid = false;
  }else{
    const data = JSON.stringify({
      username: username.value,
      password: password.value
    });
    try{
      const url = 'process/admin/login.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });
      if(!response.ok){
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        window.location.href = result.direct;
      }else if(result.status === status.failed){
        alertBox({message: result.message});
      }else if(result.status === status.not_user){
        username.focus();
        err_username.textContent = result.message;
        isValid = false;
      }else if(result.status === status.not_pass){
        password.focus();
        err_password.textContent = result.message;
        isValid = false;
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
  return isValid;
};
async function accessLogin(form){
  await handleLogin(form);
};
// end login

// confirm
// handle form confirm
function handleFormConfirm(form){
  const row = qs('.row', form);
  const textValue = 'Masukkan username konfirmasi Anda.';
  handleTooltipAlert(row, textValue);
};
// handle submit form confirm
async function accessConfirm(form){
  const input = qs('.row input', form);
  const err = qs('.row .err', form);
  let isValid = true;
  if(input.value === ''){
    input.focus();
    err.textContent = 'Masukkan username konfirmasi!';
    isValid = false;
  }else{
    const data = JSON.stringify({username: input.value});
    try{
      const url = 'process/admin/confirm.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });
      if(!response.ok){
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        window.location.href = result.direct;
      }else if(result.status === status.failed){
        input.focus();
        err.textContent = result.message;
        isValid = false;
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
  return isValid;
};
// end confirm

// replace
// handle form replace
function handleFormReplace(form){
  const rows = qsa('.row', form);
  rows.forEach((row, i) => {
    let textValue;
    if(i === 0){
      textValue = 'Masukkan password Anda, pastikan acak dan unik.<br>Contoh: p4S5W0rDArN4d1';
    }else if(i === 1){
      textValue = 'Masukkan atau ulangi password yang sama';
    }
    handleTooltipAlert(row, textValue);
  });
  const input = qsa('.row input', form);
  const password = input[0];
  const confirm = input[1];
  const span = qsa('.row span', form);
  const vipass = span[0];
  const viconf = span[1];
  vipass.innerHTML = eye(20, null, '#666');
  viconf.innerHTML = eye(20, null, '#666');
  vipass.onclick = () => {
    vipass.classList.toggle('active');
    if(password.getAttribute('type') === 'text'){
      password.setAttribute('type', 'password');
      vipass.innerHTML = eye(20, null, '#666');
    }else{
      password.setAttribute('type', 'text');
      vipass.innerHTML = eyeSlash(20, null);
    }
  }
  viconf.onclick = () => {
    viconf.classList.toggle('active');
    if(confirm.getAttribute('type') === 'text'){
      confirm.setAttribute('type', 'password');
      viconf.innerHTML = eye(20, null, '#666');
    }else{
      confirm.setAttribute('type', 'text');
      viconf.innerHTML = eyeSlash(20, null);
    }
  }
};
// handle replace
async function handleReplace(form){
  const username = form.getAttribute('data-value');
  const password = qsa('.row input', form)[0];
  const confirm = qsa('.row input', form)[1];
  const err = qsa('.row .err', form);
  err.forEach(err => {
    err.textContent = '';
  });
  let isValid = true;
  if(password.value === ''){
    password.focus();
    err[0].textContent = 'Masukkan password!';
    isValid = false;
  }else if(password.value.length < 6){
    password.focus();
    err[0].textContent = 'Minimal password 6 karakter!';
    isValid = false;
  }else if(!password.value.match(/[a-z]/) || !password.value.match(/[A-Z]/) || !password.value.match(/[0-9]/)){
    password.focus();
    err[0].textContent = 'Minimal terdapat satu huruf kecil, satu huruf besar, dan satu angka!';
    isValid = false;
  }else if(confirm.value === ''){
    confirm.focus();
    err[1].textContent = 'Masukkan konfirmasi password!';
    isValid = false;
  }else if(confirm.value !== password.value){
    confirm.focus();
    err[1].textContent = 'Konfirmasi password tidak cocok!';
    isValid = false;
  }else{
    const data = JSON.stringify({
      username: username,
      password: password.value
    });
    try{
      const url = 'process/admin/replace.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });
      if(!response.ok){
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        window.location.href = result.direct;
      }else if(result.status === status.failed){
        alertBox({message: result.message});
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
};
// submit form replace
async function accessReplace(form){
  await handleReplace(form);
};
// end replace

// handle tooltip alert
function handleTooltipAlert(rows, text, label){
  const tooltipBox = cment('div');
  tooltipBox.setAttribute('id', 'tooltipBox');
  const tooltipText = cment('div');
  tooltipText.setAttribute('id', 'tooltipText');
  if(label !== undefined && label === 'label'){
    tooltipText.classList.add('label');
  }
  tooltipText.innerHTML = text;
  tooltipBox.appendChild(tooltipText);
  rows.appendChild(tooltipBox);
  const inputs = Array.from(qsa('input', rows));
  const textareas = Array.from(qsa('textarea', rows));
  const allFields = inputs.concat(textareas);
  allFields.forEach(input => {
    input.onfocus = () => {
      tooltipBox.classList.add('active');
    }
    input.onblur = () => {
      tooltipBox.classList.remove('active');
    }
  });
};
// end handle tooltip alert

// register
// handle form register
function handleFormRegister(form){
  const rows = qsa('.row', form);
  rows.forEach((row, i) => {
    let textValue;
    if(i === 0){
      textValue = 'Masukkan nama Anda<br>Contoh: Arnadi';
    }else if(i === 1){
      textValue = 'Masukkan username Anda, pastikan acak dan unik.<br>Contoh: U53rNAmEaRn4D1';
    }else if(i === 2){
      textValue = 'Masukkan password Anda, pastikan acak dan unik.<br>Contoh: p4S5W0rDArN4d1';
    }else if(i === 3){
      textValue = 'Masukkan atau ulangi password yang sama';
    }
    handleTooltipAlert(row, textValue);
  });
  const input = qsa('.row input', form);
  const password = input[2];
  const confirm = input[3];
  const span = qsa('.row span', form);
  const vipass = span[0];
  const viconf = span[1];
  vipass.innerHTML = eye(20, null, '#666');
  viconf.innerHTML = eye(20, null, '#666');
  vipass.onclick = () => {
    vipass.classList.toggle('active');
    if(password.getAttribute('type') === 'text'){
      password.setAttribute('type', 'password');
      vipass.innerHTML = eye(20, null, '#666');
    }else{
      password.setAttribute('type', 'text');
      vipass.innerHTML = eyeSlash(20, null);
    }
  }
  viconf.onclick = () => {
    viconf.classList.toggle('active');
    if(confirm.getAttribute('type') === 'text'){
      confirm.setAttribute('type', 'password');
      viconf.innerHTML = eye(20, null, '#666');
    }else{
      confirm.setAttribute('type', 'text');
      viconf.innerHTML = eyeSlash(20, null);
    }
  }
};
// handle register
async function handleRegister(form){
  const input = qsa('.row input', form);
  const err = qsa('.row .err', form);
  const name = input[0];
  const username = input[1];
  const password = input[2];
  const confirm = input[3];
  const err_name = err[0];
  const err_username = err[1];
  const err_password = err[2];
  const err_confirm = err[3];
  let isValid = true;
  if(name.value === ''){
    name.focus();
    err_name.textContent = 'Masukkan nama Anda!';
    isValid = false;
  }else if(username.value === ''){
    username.focus();
    err_username.textContent = 'Masukkan username!';
    isValid = false;
  }else if(username.value.length < 6){
    username.focus();
    err_username.textContent = 'Minimal username 6 karakter!';
    isValid = false;
  }else if(!username.value.match(/[a-z]/) || !username.value.match(/[A-Z]/) || !username.value.match(/[0-9]/)){
    username.focus();
    err_username.textContent = 'Minimal terdapat satu huruf kecil, satu huruf besar, dan satu angka!';
    isValid = false;
  }else if(password.value.length < 6){
    password.focus();
    err_password.textContent = 'Minimal password 6 karakter!';
    isValid = false;
  }else if(!password.value.match(/[a-z]/) || !password.value.match(/[A-Z]/) || !password.value.match(/[0-9]/)){
    password.focus();
    err_password.textContent = 'Minimal terdapat satu huruf kecil, satu huruf besar, dan satu angka!';
    isValid = false;
  }else if(confirm.value === ''){
    confirm.focus();
    err_confirm.textContent = 'Masukkan konfirmasi password!';
    isValid = false;
  }else if(confirm.value !== password.value){
    confirm.focus();
    err_confirm.textContent = 'Konfirmasi password tidak cocok!';
    isValid = false;
  }else{
    const data = JSON.stringify({
      name: name.value,
      username: username.value,
      password: password.value
    });
    try{
      const url = 'process/admin/register.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });
      if(!response.ok){
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        window.location.href = result.direct;
      }else if(result.status === status.failed){
        alertBox({message: result.message});
      }else if(result.status === status.not_user){
        username.focus();
        err_username.textContent = result.message;
        isValid = false;
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
  return isValid;
};
// submit form register
async function accessRegister(form){
  await handleRegister(form);
};
// end register

// add shop
// handle add shop
async function handleAddShop(form){
  const name = qs('.row input', form);
  const address = qs('.row textarea', form);
  const err = qsa('.row .err', form);
  err.forEach(err => {
    err.textContent = '';
  });
  let isValid = true;
  if(name.value === ''){
    name.focus();
    err[0].textContent = 'Masukkan nama toko Anda!';
    isValid = false;
  }else if(name.value.length > 30){
    name.focus();
    err[0].textContent = 'Maksimal nama toko 30 karakter!';
    isValid = false;
  }else if(address.value.length > 100){
    address.focus();
    err[1].textContent = 'Maksimal alamat toko 100 karakter!';
    isValid = false;
  }else{
    const data = JSON.stringify({
      name: name.value,
      address: address.value
    });
    try{
      const url = 'process/admin/new-store.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });
      if(!response.ok){
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        window.location.href = result.direct;
      }else if(result.status === status.failed){
        alertBox({message: result.message});
      }else if(result.status === status.not_name){
        name.focus();
        err[0].textContent = result.message;
        isValid = false;
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
  return isValid;
};
// submit add shop
async function accessAddShop(form){
  await handleAddShop(form);
};
// end add shop

// logout
// handle logout
async function handleLogout(...args){
  startSpinner();
  try{
    const [valid] = args;
    const response = await fetch('process/admin/logout.php',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({logout: valid})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === 'success'){
      stopSpinner();
      window.location.href = result.direct;
    }else if(result.status === 'failed'){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end handle logout
function logout(tab_logout){
  if(tab_logout !== undefined && tab_logout.textContent === '×'){
    if(checkCameraActive()){
      return;
    }
    tab_logout.innerHTML = signout(16, 16, 'white');
    qs('#tab_title').textContent = 'Dashboard';
    const viewBox = qs('#viewBox');
    viewBox.classList.remove('show');
    setTimeout(() => {
      viewBox.remove();
    }, 500);
    document.body.style.overflow = 'auto';
  }else{
    const data = [true];
    alertBox({
      title: 'Konfirmasi Logout',
      message: 'Yakin ingin keluar dari sesi saat ini?',
      close: 'Tidak',
      execute: {
        body: {
          func: handleLogout,
          exec: data
        },
        next: 'Keluar'
      }
    });
  }
};
// end logout

export {
  qs, qsa, logout, handleTooltipAlert,
  handleFormLogin, accessLogin,
  handleFormConfirm, accessConfirm,
  handleFormReplace, accessReplace,
  handleFormRegister, accessRegister,
  accessAddShop
};