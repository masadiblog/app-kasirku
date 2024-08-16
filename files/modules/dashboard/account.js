import {qs, qsa, cment, capitalize, alertBox, error, status, button, startSpinner, stopSpinner} from '../utils.js';
import {handleTooltipAlert} from '../aut.js';
import {eye, eyeSlash} from '../icons/icon.js';

// update form account
async function updateFormStore(data){
  startSpinner();
  try{
    const url = 'process/admin/update.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      alertBox({message: result.message});
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(errro){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end update form account

// form data account
function formDataAccount(viewBox, data){
  const existingForm = qs('#formDataAccount');
  if(existingForm){
    viewBox.removeChild(existingForm);
  }
  const form = cment('form');
  form.setAttribute('id', 'formDataAccount');
  form.classList.add('mt2');
  // name
  const rowName = cment('div');
  rowName.classList.add('row', 'mb2');
  const labelName = cment('label');
  labelName.textContent = 'Nama';
  rowName.appendChild(labelName);
  const inputName = cment('input');
  inputName.type = 'text';
  inputName.maxLength = 20;
  inputName.placeholder = 'Masukkan Nama Anda';
  inputName.value = data.name;
  rowName.appendChild(inputName);
  form.appendChild(rowName);
  // username
  const rowUsername = cment('div');
  rowUsername.classList.add('row', 'mb2');
  const labelUsername = cment('label');
  labelUsername.textContent = 'Username';
  rowUsername.appendChild(labelUsername);
  const inputUsername = cment('input');
  inputUsername.type = 'text';
  inputUsername.maxLength = 20;
  inputUsername.placeholder = 'Masukkan Username Anda';
  inputUsername.value = data.username;
  rowUsername.appendChild(inputUsername);
  form.appendChild(rowUsername);
  // password
  const rowPassword = cment('div');
  rowPassword.classList.add('row', 'mb2');
  const labelPassword = cment('label');
  labelPassword.textContent = 'Password';
  rowPassword.appendChild(labelPassword);
  const showPass = cment('span');
  showPass.setAttribute('id', '#showPass');
  showPass.innerHTML = eye(20, null, '#666');
  rowPassword.appendChild(showPass);
  const inputPassword = cment('input');
  inputPassword.type = 'password';
  inputPassword.placeholder = 'Masukkan Password Anda';
  inputPassword.dataset.password = data.password;
  rowPassword.appendChild(inputPassword);
  form.appendChild(rowPassword);
  // confirmation
  const rowConfirm = cment('div');
  rowConfirm.classList.add('row', 'mb2');
  const labelConfirm = cment('label');
  labelConfirm.textContent = 'Konfirmasi';
  rowConfirm.appendChild(labelConfirm);
  const showConPass = cment('span');
  showConPass.setAttribute('id', '#showConPass');
  showConPass.innerHTML = eye(20, null, '#666');
  rowConfirm.appendChild(showConPass);
  const inputConfirm = cment('input');
  inputConfirm.type = 'password';
  inputConfirm.placeholder = 'Masukkan Konfirmasi Password';
  rowConfirm.appendChild(inputConfirm);
  form.appendChild(rowConfirm);
  // buttons
  const rowButtons = cment('div');
  rowButtons.classList.add('row', 'ta-right');
  const buttonReset = cment('button');
  buttonReset.classList.add('mr1');
  buttonReset.type = 'reset';
  buttonReset.textContent = 'Reset';
  rowButtons.appendChild(buttonReset);
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.textContent = 'Simpan';
  rowButtons.appendChild(buttonSubmit);
  form.appendChild(rowButtons);
  viewBox.appendChild(form);
  // show hide password
  showPass.onclick = () => {
    if(inputPassword.type === 'password'){
      inputPassword.type = 'text';
      showPass.innerHTML = eyeSlash(20, null);
    }else if(inputPassword.type === 'text'){
      inputPassword.type = 'password';
      showPass.innerHTML = eye(20, null, '#666');
    }
  }
  // show hide confirmation password
  showConPass.onclick = () => {
    if(inputConfirm.type === 'password'){
      inputConfirm.type = 'text';
      showConPass.innerHTML = eyeSlash(20, null);
    }else if(inputConfirm.type === 'text'){
      inputConfirm.type = 'password';
      showConPass.innerHTML = eye(20, null, '#666');
    }
  }
  // on input name
  inputName.oninput = () => {
    inputName.value = capitalize(inputName.value);
    inputName.classList.remove('failed');
    if(inputName.value.length > 20){
      inputName.classList.add('failed');
    }
  }
  // on input username
  inputUsername.oninput = () => {
    inputUsername.classList.remove('failed');
    if(inputUsername.value.length > 20){
      inputUsername.classList.add('failed');
    }
  }
  // submit form
  form.onsubmit = (e) => {
    e.preventDefault();
    inputName.classList.remove('failed');
    inputUsername.classList.remove('failed');
    inputPassword.classList.remove('failed');
    inputConfirm.classList.remove('failed');
    if(inputName.value === ''){
      inputName.focus();
      inputName.classList.add('failed');
      return;
    }else if(inputUsername.value === ''){
      inputUsername.focus();
      inputUsername.classList.add('failed');
      return;
    }else if(inputPassword.value !== '' && inputPassword.value.length < 6){
      inputPassword.focus();
      inputPassword.classList.add('failed');
      return;
    }else if(inputPassword.value !== '' && !inputPassword.value.match(/[a-z]/) || inputPassword.value !== '' && !inputPassword.value.match(/[A-Z]/) || inputPassword.value !== '' && !inputPassword.value.match(/[0-9]/)){
      inputPassword.focus();
      inputPassword.classList.add('failed');
      return;
    }else if(inputPassword.value !== '' && inputPassword.value !== inputConfirm.value){
      inputConfirm.focus();
      inputConfirm.classList.add('failed');
      return;
    }else{
      let passValue;
      if(inputPassword.value === ''){
        passValue = inputPassword.dataset.password + '_hashing';
      }else{
        passValue = inputPassword.value;
      }
      const dataValue = {
        name: inputName.value,
        username: inputUsername.value,
        password: passValue
      };
      updateFormStore(dataValue);
    }
  }
  
  const rows = qsa('#formDataAccount .row');
  rows.forEach((row, i) => {
    let textValue;
    if(i === 0){
      textValue = 'Masukkan nama Anda.<br>Contoh: Arnadi';
    }else if(i === 1){
      textValue = 'Username: Kombinasi huruf (besar, kecil) dan angka.<br>Contoh: u53RAN4d!88';
    }else if(i === 2){
      textValue = 'Password: Minimal password 6 karakter, kombinasi huruf (besar, kecil) dan angka.<br>Contoh: p4SSw0rD4rN4d123';
    }else if(i === 3){
      textValue = 'Masukkan konfirmasi password.<br>Ulangi password yang sama sekali lagi.';
    }
    handleTooltipAlert(row, textValue, 'label');
  });
};
// end form data account

// get data account
async function getDataAccount(viewBox){
  startSpinner();
  try{
    const url = 'process/admin/load.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      formDataAccount(viewBox, result.account);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end get data account

// load data account
async function loadDataAccount(viewBox){
  await getDataAccount(viewBox);
};
// end load data account

export {loadDataAccount};