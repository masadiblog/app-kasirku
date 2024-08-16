import {qs, qsa, cment, speak, audioPlaying, format_number, format_value, capitalize, notificationAlert, alertBox, error, status, button, sortirListNumber, startSpinner, stopSpinner} from '../utils.js';
import {pen, trash} from '../icons/icon.js';
import {showFormUpdate} from './update.js';
import {processDeleteProduct} from './delete.js';

// handle form input product
function handleFormInputProduct(form){
  const input = qsa('.row input', form);
  const inputCode = input[0];
  const inputName = input[1];
  const inputCapital = input[2];
  const inputPrice = input[3];
  const inputStock = input[4];
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
};
// end handle form input product

// result input product
function resultInputProduct(product){
  const tableBox = qs('#tableBox');
  const table = qs('#tableProduct');
  const thead = qs('thead', table);
  const tbody = qs('tbody', table);
  const tabdata = qsa('tr td', tbody);
  if(!thead){
    const thead = cment('thead');
    const trHead = cment('tr');
    // th number
    const thNumber = cment('th');
    thNumber.textContent = 'No';
    trHead.appendChild(thNumber);
    // th name
    const thName = cment('th');
    thName.textContent = 'Produk';
    trHead.appendChild(thName);
    // th capital
    const thCapital = cment('th');
    thCapital.textContent = 'Modal';
    trHead.appendChild(thCapital);
    // th price
    const thPrice = cment('th');
    thPrice.textContent = 'Harga';
    trHead.appendChild(thPrice);
    // th stock
    const thStock = cment('th');
    thStock.textContent = 'Stok';
    trHead.appendChild(thStock);
    // th action
    const thAction = cment('th');
    thAction.colSpan = 2;
    thAction.textContent = 'Aksi';
    trHead.appendChild(thAction);
    
    thead.appendChild(trHead);
    table.appendChild(thead);
  }
  if(tabdata.length === 1){
    tbody.innerHTML = '';
  }
  const newRow = tbody.insertRow(0);
  const number = newRow.insertCell(0);
  const name = newRow.insertCell(1);
  const capital = newRow.insertCell(2);
  const price = newRow.insertCell(3);
  const stock = newRow.insertCell(4);
  const edit = newRow.insertCell(5);
  const delt = newRow.insertCell(6);
  number.classList.add('ta-center');
  name.classList.add('ta-left');
  capital.classList.add('ta-right');
  price.classList.add('ta-right');
  stock.classList.add('ta-center');
  edit.classList.add('ta-center');
  delt.classList.add('ta-center');
  newRow.dataset.code = product.code;
  number.textContent = 1;
  name.textContent = capitalize(product.name);
  capital.textContent = format_number(product.capital);
  price.textContent = format_number(product.price);
  stock.textContent = format_number(product.stock);
  edit.classList.add('edit');
  const spanEdit = document.createElement('span');
  spanEdit.innerHTML = pen(14, 14, 'green');
  edit.appendChild(spanEdit);
  delt.classList.add('hapus');
  const spanDelt = document.createElement('span');
  spanDelt.innerHTML = trash(14, 14, 'brown');
  delt.appendChild(spanDelt);
  edit.onclick = () => {
    const id = product.id_produk;
    const code = newRow.dataset.code;
    const name = newRow.querySelector('td:nth-child(2)').textContent;
    const capital = newRow.querySelector('td:nth-child(3)').textContent;
    const price = newRow.querySelector('td:nth-child(4)').textContent;
    const stock = newRow.querySelector('td:nth-child(5)').textContent;
    showFormUpdate(id, code, name, capital, price, stock, newRow);
  }
  delt.onclick = () => {
    alertBox({
      title: 'Kofirmasi Hapus',
      message: 'Hapus produk: ' + newRow.querySelector('td:nth-child(2)').textContent,
      close: 'Batal',
      execute: {
        body: {
          func: processDeleteProduct,
          exec: [
            product.id_produk,
            product.id_toko,
            newRow
          ]
        },
        next: 'Hapus'
      }
    });
  }
  sortirListNumber(qsa('#tableProduct tbody tr'), 'td');
};
// end result input product

// process input product
async function processInputProduct(dataInput, form){
  startSpinner();
  try{
    const inputCode = qs('input#code', form);
    const inputName = qs('input#name', form);
    const inputCapital = qs('input#capital', form);
    const inputPrice = qs('input#price', form);
    const inputStock = qs('input#stock', form);
      const url = 'process/product/input.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataInput)
      });
      if(!response.ok){
        stopSpinner();
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        stopSpinner();
        resultInputProduct(result.product);
        audioPlaying();
        inputName.focus();
        inputCode.value = '';
        inputName.value = '';
        inputCapital.value = '';
        inputPrice.value = '';
        inputStock.value = '';
      }else if(result.status === status.not_name){
        stopSpinner();
        inputName.classList.add('failed');
        alertBox({message: result.message});
      }else if(result.status === status.failed){
        stopSpinner();
        alertBox({message: result.message});
      }
    }catch(error){
      stopSpinner();
      alertBox({message: 'Error: ' + error.message});
    }
};
// end process input product

export {handleFormInputProduct, processInputProduct};