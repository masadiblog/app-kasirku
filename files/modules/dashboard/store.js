import {qs, qsa, cment, alertBox, error, status, button, startSpinner, stopSpinner} from '../utils.js';
import {handleTooltipAlert} from '../aut.js';

// form  data store
function formDataStore(viewBox, data){
  const existingForm = qs('#formDataStore');
  if(existingForm){
    viewBox.removeChild(existingForm);
  }
  const form = cment('form');
  form.setAttribute('id', 'formDataStore');
  form.classList.add('mt2');
  
  // name store
  const rowName = cment('div');
  rowName.classList.add('row', 'mb2');
  const labelName = cment('label');
  labelName.textContent = 'Nama Toko';
  rowName.appendChild(labelName);
  const inputName = cment('input');
  inputName.type = 'text';
  inputName.maxLength = 30;
  inputName.placeholder = 'Nama Toko';
  inputName.value = data.name;
  rowName.appendChild(inputName);
  form.appendChild(rowName);
  
  // whatsapp
  const rowWhatsApp = cment('div');
  rowWhatsApp.classList.add('row', 'mb2');
  const labelWhatsApp = cment('label');
  labelWhatsApp.textContent = 'WhatsApp Toko';
  rowWhatsApp.appendChild(labelWhatsApp);
  const inputWhatsApp = cment('input');
  inputWhatsApp.type = 'text';
  inputWhatsApp.maxLength = 12;
  inputWhatsApp.placeholder = 'Nomor WhatsApp';
  inputWhatsApp.value = data.whatsapp;
  rowWhatsApp.appendChild(inputWhatsApp);
  form.appendChild(rowWhatsApp);
  
  // address
  const rowAddress = cment('div');
  rowAddress.classList.add('row', 'mb2');
  const labelAddress = cment('label');
  labelAddress.textContent = 'Alamat Toko';
  rowAddress.appendChild(labelAddress);
  const inputAddress = cment('textarea');
  inputAddress.rows = 3;
  inputAddress.maxLength = 100;
  inputAddress.placeholder = 'Alamat lengkap toko Anda';
  inputAddress.value = data.address;
  rowAddress.appendChild(inputAddress);
  form.appendChild(rowAddress);
  
  // notes
  const rowNotes = cment('div');
  rowNotes.classList.add('row', 'mb2');
  const labelNotes = cment('label');
  labelNotes.textContent = 'Catatan Toko';
  rowNotes.appendChild(labelNotes);
  const inputNotes = cment('textarea');
  inputNotes.rows = 3;
  inputNotes.maxLength = 100;
  inputNotes.placeholder = 'Catatan toko, akan dipakai pada bagian bawah struk';
  inputNotes.value = data.notes;
  rowNotes.appendChild(inputNotes);
  form.appendChild(rowNotes);
  
  // button
  const rowButtons = cment('div');
  rowButtons.classList.add('row', 'ta-right');
  const buttonReset = cment('button');
  buttonReset.type = 'reset';
  buttonReset.classList.add('mr1');
  buttonReset.textContent = 'Reset';
  rowButtons.appendChild(buttonReset);
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.textContent = 'Simpan';
  rowButtons.appendChild(buttonSubmit);
  form.appendChild(rowButtons);
  
  viewBox.appendChild(form);
  
  inputName.oninput = () => {
    inputName.classList.remove('failed');
    if(inputName.value.length > 30){
      inputName.classList.add('failed');
    }
  }
  inputWhatsApp.oninput = () => {
    inputWhatsApp.classList.remove('failed');
    if(inputWhatsApp.value.length > 12){
      inputWhatsApp.classList.add('failed');
    }
  }
  inputAddress.oninput = () => {
    inputAddress.classList.remove('failed');
    if(inputAddress.value.length > 100){
      inputAddress.classList.add('failed');
    }
  }
  inputNotes.oninput = () => {
    inputNotes.classList.remove('failed');
    if(inputNotes.value.length > 100){
      inputNotes.classList.add('failed');
    }
  }
  
  form.onsubmit = (e) => {
    e.preventDefault();
    inputName.classList.remove('failed');
    if(inputName.value === ''){
      inputName.focus();
      inputName.classList.add('failed');
      return;
    }else{
      const dataValue = {
        name: inputName.value,
        whatsapp: inputWhatsApp.value,
        address: inputAddress.value,
        notes: inputNotes.value,
      }
      updateFormStore(dataValue);
    }
  }
  
  const rows = qsa('#formDataStore .row');
  rows.forEach((row, i) => {
    let textValue;
    if(i === 0){
      textValue = 'Maksimal 30 karakter.<br>Contoh: Toko Beras Adi Rawa Buaya.';
    }else if(i === 1){
      textValue = 'Maksimal 12 karakter.<br>Contoh: 081285242366';
    }else if(i === 2){
      textValue = 'Maksimal 100 karakter.<br>Contoh: Nama jalan, nomor bangunan, RT, RW, Kecamatan, Kabupaten, Provinsi.';
    }else if(i === 3){
      textValue = 'Maksimal 100 karakter.<br>Contoh: Barang yang sudah dibeli tidak dapat dikembalikan, kecuali membawa struk atau bukti pembayaran.';
    }
    handleTooltipAlert(row, textValue, 'label');
  });
};
// end form data store

// update form store
async function updateFormStore(data){
  startSpinner();
  try{
    const url = 'process/store/update.php';
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
      alertBox({message: result.message, close: button.oke});
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end update form store

// get data store
async function getDataStore(viewBox){
  startSpinner();
  try{
    const url = 'process/store/load.php';
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
      formDataStore(viewBox, result.store);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }else if(result.status === status.not_ready){
      stopSpinner();
      viewBox.innerHTML = '';
      const rescont = cment('div');
      rescont.style.padding = 3 + 'rem ' + 0;
      rescont.classList.add('ta-center');
      rescont.textContent = result.message;
      viewBox.appendChild(rescont);
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end get data store

// load data store
async function loadDataStore(viewBox){
  await getDataStore(viewBox);
};
// end load data store

export {loadDataStore};