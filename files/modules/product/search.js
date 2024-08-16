import {qs, qsa, cment, speak, audioPlaying, format_number, capitalize, notificationAlert, alertBox, error, status, button, sortirListNumber, startSpinner, stopSpinner} from '../utils.js';
import {pen, trash} from '../icons/icon.js';
import {showFormUpdate} from './update.js';
import {processDeleteProduct} from './delete.js';

// search product
let cache = new Map();
// handle search product
async function handleSearchProducts(key){
  startSpinner();
  let isValid = true;
  const input = qs('input#search');
  if(key === ' '){
    input.value = input.value.substr(0, 0);
    isValid = false;
  }else{
    stopSpinner();
    const tableRows = qs('#tableProduct tbody');
    tableRows.innerHTML = '';
    // set cache
    if(cache.has(key)){
      stopSpinner();
      handleResultProducts(cache.get(key));
      return;
    }
    try{
      const url = 'process/product/search.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({key: key})
      });
      if(!response.ok){
        stopSpinner();
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        stopSpinner();
        tableRows.innerHTML = '';
        cache.set(key, result.products); // simpan hasil ke cache
        handleResultProducts(result.products);
      }else if(result.status === status.not_ready){
        stopSpinner();
        const row = tableRows.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.style.textAlign = 'center';
        cell.style.textTransform = 'none';
        cell.style.color = 'maroon';
        cell.textContent = result.message;
      }else if(result.status === status.failed){
        stopSpinner();
        alertBox({message: result.message});
      }
    }catch(error){
      stopSpinner();
      alertBox({message: 'Error: ' + error.message});
      input.blur();
    }
  }
  return isValid;
};
// handle result product
function handleResultProducts(products){
  const tableBox = qs('#tableProduct');
  if(!tableBox){
    const tableBox = qs('#tableBox');
    const tbody = cment('tbody');
    tableBox.appendChild(tbody);
  }
  const tbody = qs('#tableProduct tbody');
  products.forEach((product, i) => {
    const newRow = tbody.insertRow();
    const number = newRow.insertCell(0);
    const name = newRow.insertCell(1);
    const capital = newRow.insertCell(2);
    const price = newRow.insertCell(3);
    const stock = newRow.insertCell(4);
    const edit = newRow.insertCell(5);
    const delt = newRow.insertCell(6);
    newRow.dataset.id = product.id_produk;
    number.textContent = i + 1;
    name.textContent = capitalize(product.nama);
    capital.textContent = format_number(product.modal);
    price.textContent = format_number(product.harga);
    stock.textContent = format_number(product.stok.replace(/\,/g, '.'));
    edit.classList.add('edit');
    const spanEdit = document.createElement('span');
    spanEdit.innerHTML = pen(14, 14, 'green');
    edit.appendChild(spanEdit);
    edit.onclick = () => {
      const id = product.id_produk;
      const code = product.kode;
      const name = newRow.querySelector('td:nth-child(2)').textContent;
      const capital = newRow.querySelector('td:nth-child(3)').textContent;
      const price = newRow.querySelector('td:nth-child(4)').textContent;
      const stock = newRow.querySelector('td:nth-child(5)').textContent;
      showFormUpdate(id, code, name, capital, price, stock, newRow);
    }
    delt.classList.add('hapus');
    const spanDelt = document.createElement('span');
    spanDelt.innerHTML = trash(14, 14, 'brown');
    delt.appendChild(spanDelt);
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
  });
};
// debounce
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};
// submit search product
async function searchProducts(key){
  await handleSearchProducts(key);
};
// end search product

export {searchProducts, debounce};