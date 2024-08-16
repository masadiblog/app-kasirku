import {qs, qsa, cment, speak, audioPlaying, format_number, format_value, capitalize, notificationAlert, alertBox, error, status, button, startSpinner, stopSpinner} from '../utils.js';

// proses pembaruan data produk
async function processUpdateProduct(data){
  startSpinner();
  try{
    const url = 'process/product/update.php';
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
      data.form.remove();
      data.box.classList.remove('show');
      data.box.remove();
      alertBox({message: result.message});
      data.rowel.dataset.code = data.code;
      data.rowel.querySelector('td:nth-child(2)').textContent = data.name;
      data.rowel.querySelector('td:nth-child(3)').textContent = data.capital;
      data.rowel.querySelector('td:nth-child(4)').textContent = data.price;
      data.rowel.querySelector('td:nth-child(5)').textContent = data.stock;
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }else if(result.status === status.not_name){
      stopSpinner();
      let input_name = qsa('#form-edit .row .col input')[1];
      input_name.focus();
      input_name.classList.add('failed');
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end proses pembaruan data produk

// form edit produk
function showFormUpdate(id, code, name, capital, price, stock, rowel){
  document.body.style.overflow = 'hidden'
  const box = cment('div');
  box.setAttribute('id', 'boxFormEditItem');
  box.classList.add('show');
  const form_edit = cment('form');
  form_edit.setAttribute('id', 'formEditItem');
  const title = cment('h5');
  title.textContent = 'Perbarui Data Produk';
  form_edit.appendChild(title);
  // row kode nama
  const rowCodeName = cment('div');
  rowCodeName.classList.add('row', 'mb1');
  const colCodeName = cment('div');
  colCodeName.classList.add('col');
  // input kode
  const divCode = cment('div');
  divCode.style.width = 43+'%';
  const labelCode = cment('label');
  labelCode.textContent = 'Kode';
  divCode.appendChild(labelCode);
  const inputCode = cment('input');
  inputCode.value = code;
  divCode.appendChild(inputCode);
  colCodeName.appendChild(divCode);
  // input nama
  const divName = cment('div');
  const labelName = cment('label');
  labelName.textContent = 'Nama';
  divName.appendChild(labelName);
  const inputName = cment('input');
  inputName.value = name;
  divName.appendChild(inputName);
  colCodeName.appendChild(divName);
  rowCodeName.appendChild(colCodeName);
  form_edit.appendChild(rowCodeName);
  // row modal harga stok
  const rowCapitalPriceStock = cment('div');
  rowCapitalPriceStock.classList.add('row', 'mb2');
  const colCapitalPriceStock = cment('div');
  colCapitalPriceStock.classList.add('col');
  // input modal
  const divCapital = cment('div');
  const labelCapital = cment('label');
  labelCapital.textContent = 'Modal';
  divCapital.appendChild(labelCapital);
  const inputCapital = cment('input');
  inputCapital.value = capital;
  divCapital.appendChild(inputCapital);
  colCapitalPriceStock.appendChild(divCapital);
  // input harga
  const divPrice = cment('div');
  const labelPrice = cment('label');
  labelPrice.textContent = 'Harga';
  divPrice.appendChild(labelPrice);
  const inputPrice = cment('input');
  inputPrice.value = price;
  divPrice.appendChild(inputPrice);
  colCapitalPriceStock.appendChild(divPrice);
  // input stok
  const divStock = cment('div');
  divStock.classList.add('w-45per');
  const labelStock = cment('label');
  labelStock.textContent = 'Stok';
  divStock.appendChild(labelStock);
  const inputStock = cment('input');
  inputStock.value = stock;
  divStock.appendChild(inputStock);
  colCapitalPriceStock.appendChild(divStock);
  rowCapitalPriceStock.appendChild(colCapitalPriceStock);
  form_edit.appendChild(rowCapitalPriceStock);
  // button
  const rowButton = cment('div');
  rowButton.classList.add('row', 'mb1', 'ta-right');
  // button cancel
  const buttonCancel = cment('button');
  buttonCancel.setAttribute('type', 'button');
  buttonCancel.textContent = 'Batal';
  rowButton.appendChild(buttonCancel);
  // button submit
  const buttonSubmit = cment('button');
  buttonSubmit.classList.add('ml1');
  buttonSubmit.setAttribute('type', 'submit');
  buttonSubmit.textContent = 'Simpan';
  rowButton.appendChild(buttonSubmit);
  form_edit.appendChild(rowButton);
  box.appendChild(form_edit);
  document.body.appendChild(box);
  inputCapital.onfocus = () => {
    if(inputCapital.value === '0'){
      inputCapital.value = '';
    }
  }
  inputCapital.onblur = () => {
    if(inputCapital.value === ''){
      inputCapital.value = '0';
    }
  }
  inputStock.onfocus = () => {
    if(inputStock.value === '0'){
      inputStock.value = '';
    }
  }
  inputStock.onblur = () => {
    if(inputStock.value === ''){
      inputStock.value = '0';
    }
  }
  inputCode.oninput = () => {
    if(inputCode.value.length > 14){
      inputCode.value = inputCode.value.substr(0, 14);
    }
    inputCode.value = inputCode.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  inputName.oninput = () => {
    if(inputName.value.length > 30){
      inputName.value = inputName.value.substr(0, 30);
    }
    inputName.value = capitalize(inputName.value);
  }
  inputCapital.oninput = () => {
    if(inputCapital.value.length > 10){
      inputCapital.value = inputCapital.value.substr(0, 10);
    }
    inputCapital.value = format_value(inputCapital.value);
  }
  inputPrice.oninput = () => {
    if(inputPrice.value.length > 10){
      inputPrice.value = inputPrice.value.substr(0, 10);
    }
    inputPrice.value = format_value(inputPrice.value);
  }
  inputStock.oninput = () => {
    if(inputStock.value.length > 10){
      inputStock.value = inputStock.value.substr(0, 10);
    }
    inputStock.value = format_value(inputStock.value);
  }
  // submit form update produk
  let isValid = true;
  form_edit.onsubmit = async (e) => {
    e.preventDefault();
    inputName.classList.remove('failed');
    inputPrice.classList.remove('failed');
    if(inputName.value === ''){
      inputName.focus();
      inputName.classList.add('failed');
      isValid = false;
    }else if(inputPrice.value === ''){
      inputPrice.focus();
      inputPrice.classList.add('failed');
      isValid = false;
    }else{
      const data = {
        id: id,
        code: inputCode.value,
        name: inputName.value,
        capital: inputCapital.value,
        price: inputPrice.value,
        stock: inputStock.value,
        form: form_edit,
        box: box,
        rowel: rowel
      };
      await processUpdateProduct(data);
      }
    return isValid;
  }
  buttonCancel.onclick = () => {
    inputCode.value = '';
    inputName.value = '';
    inputCapital.value = '';
    inputPrice.value = '';
    inputStock.value = '';
    inputName.classList.remove('failed');
    inputPrice.classList.remove('failed');
    form_edit.remove();
    box.classList.remove('show');
    box.remove();
    document.body.style.overflow = 'auto';
  }
  box.onclick = (e) => {
    if(e.target !== form_edit){
      form_edit.classList.add('scale');
    }
    setTimeout(() => form_edit.classList.remove('scale'), 325);
  }
  form_edit.onclick = (e) => {
    e.stopPropagation();
  }
};
// end form edit produk

export {showFormUpdate};