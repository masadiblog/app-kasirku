import {
  qs, qsa, cment, speak, audioPlaying,
  format_number, format_value, capitalize,
  notificationAlert, alertBox, error,
  status, button, sortirListNumber,
  startSpinner, stopSpinner
} from '../utils.js';
import {
  calculateTotalTransaction, tabHeader,
  formEditItemTransaction,
  processDeleteTransaction,
  resultProductList, resetFormTransaction
} from '../ui.js';
import {pen, trash} from '../icons/icon.js';

// input transaction
// result insert to table list
function insertToTableList(tableBox, product){
  const tbody = qs('table tbody', tableBox);
  const data = qsa('table tbody tr td', tableBox);
  if(data.length === 1){
    const data = ['No', 'Item', 'Harga', 'Qty', 'Diskon', 'Aksi'];
    const table = qs('#table-transaction table');
    tabHeader(table, data);
    tbody.innerHTML = '';
  }
  const newRow = tbody.insertRow(0);
  const number = newRow.insertCell(0);
  const name = newRow.insertCell(1);
  const price = newRow.insertCell(2);
  const qty = newRow.insertCell(3);
  const discount = newRow.insertCell(4);
  const edit = newRow.insertCell(5);
  const delt = newRow.insertCell(6);
  price.setAttribute('id', 'tdPrice');
  qty.setAttribute('id', 'tdQty');
  discount.setAttribute('id', 'tdDiscount');
  number.textContent = 1;
  name.textContent = capitalize(product.name);
  price.textContent = format_number(product.price);
  qty.textContent = format_number(product.qty);
  discount.textContent = format_number(product.discount);
  edit.classList.add('edit');
  const buttonEdit = cment('span');
  buttonEdit.innerHTML = `${pen(null, null, 'green')}`;
  edit.appendChild(buttonEdit);
  delt.classList.add('hapus');
  const buttonDelt = cment('span');
  buttonDelt.innerHTML = `${trash(null, null, 'brown')}`;
  delt.appendChild(buttonDelt);
  edit.onclick = () => {
    const data = {
      idtrans: product.idtrans,
      invoice: product.invoice,
      code: product.code,
      name: name.textContent,
      price: price.textContent,
      qty: qty.textContent,
      discount: discount.textContent
    };
    formEditItemTransaction(data, newRow);
  }
  delt.onclick = () => {
    const data = {
      idtrans: product.idtrans,
      invoice: product.invoice,
      name: name.textContent,
      qty: qty.textContent
    };
    alertBox({
      title: 'Kofirmasi Hapus',
      subtitle: 'Detail Item',
      message: `
        Nama: ${name.textContent}<br>
        Harga: ${price.textContent}<br>
        Jumlah: ${qty.textContent}<br>
        Diskon: ${discount.textContent}<br><br>
        Yakin ingin menghapus item ini?
      `,
      close: 'Tidak',
      execute: {
        body: {
          func: processDeleteTransaction,
          exec: [data, newRow]
        },
        next: 'Hapus'
      }
    });
  }
  sortirListNumber(qsa('tr', tbody), 'td');
  calculateTotalTransaction(qsa('tr', tbody));
};
// load auto input with scanning
async function loadAutoInputTransaction(invoice, code, checkbox){
  const data = {
    invoice: invoice,
    code: code,
    check: checkbox,
    access: 'auto'
  };
  try{
    const url = 'process/transaction/input.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      insertToTableList(qs('#table-transaction'), result.product);
      audioPlaying();
    }else if(result.status === status.ready){
      alertBox({message: result.message});
    }else if(result.status === status.not_ready){
      alertBox({message: result.message});
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// product list on input name
let cache = new Map();
async function autoLoadProductList(input, invoice, transbar){
  startSpinner();
  const key = input.value;
  if(!invoice.textContent.match(/[0-9]/)){
    transbar.classList.add('failed');
    input.value = ''; input.blur();
    alertBox({message: 'Silakan klik transaksi baru!', close: 'Oke'});
    return;
  }else if(key === ' '){
    input.value = key.substr(0, 0);
    return;
  }else if(key.trim() === ''){
    stopSpinner();
    resultProductList([]);
    input.classList.remove('failed');
    return;
  }else{
    // set cache
    if(cache.has(key)){
      stopSpinner();
      resultProductList(cache.get(key));
      input.classList.remove('failed');
      return;
    }
    try{
      const url = 'process/transaction/load-product-list.php';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({keys: key})
      });
      if(!response.ok){
        stopSpinner();
        alertBox({message: error.network});
        return;
      }
      const result = await response.json();
      if(result.status === status.success){
        stopSpinner();
        cache.set(key, result.products); // simpan hasil ke cache
        resultProductList(result.products);
        input.classList.remove('failed');
      }else if(result.status === status.not_ready){
        stopSpinner();
        resultProductList([]);
        input.classList.add('failed');
      }else if(result.status === status.failed){
        stopSpinner();
        alertBox({message: result.message});
      }
    }catch(error){
      stopSpinner();
      alertBox({message: 'Error: ' + error.message});
    }
  }
};
// debounce
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};
// update cache stock product
function updateCache(productList){
  if(!Array.isArray(productList)){
    alertBox({message: 'Masalah saat pembaruan data stok, silakan muat ulang!'});
    return;
  }
  productList.forEach(product => {
    const {id_toko, nama, stok} = product.array_cache;
    cache.forEach((cachedProducts, key) => {
      const updatedProducts = cachedProducts.map(p => 
        p.id_toko === id_toko && p.nama === nama ? { ...p, stok: stok } : p
      );
      cache.set(key, updatedProducts);
    });
  });
};
// process manual input transaction
async function processManualInputTransaction(item, form){
  startSpinner();
  const data = {
    check: item.check,
    code: item.code,
    name: item.name,
    price: item.price,
    qty: item.qty,
    discount: item.discount,
    capital: item.capital,
    stock: item.stock,
    invoice: item.invoice,
    access: 'manual'
  };
  try{
    const url = 'process/transaction/input.php';
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
      const form = qs('form#transaction');
      const name = qs('input#nama', form);
      const code = qs('input#kode', form);
      const price = qs('input#harga', form);
      const qty = qs('input#jumlah', form);
      const discount = qs('input#diskon', form);
      name.placeholder = 'Input Nama atau Kode';
      code.placeholder = '00000';
      price.placeholder = '000.00';
      qty.placeholder = '000';
      discount.placeholder = '000.00';
      if(result.product && result.product.array_cache){
        updateCache([result.product]);
      }
      insertToTableList(qs('#table-transaction'), result.product);
      resetFormTransaction(qs('form#transaction'), result.product.access);
      audioPlaying();
    }else if(result.status === status.ready){
      stopSpinner();
      alertBox({message: result.message});
      const form = qs('form#transaction');
      const code = qs('input#kode', form);
      const name = qs('input#nama', form);
      const price = qs('input#harga', form);
      const qty = qs('input#jumlah', form);
      const discount = qs('input#diskon', form);
      name.focus();
      name.classList.add('failed');
      qty.setAttribute('readonly', '');
      discount.setAttribute('readonly', '');
      code.value = name.value = price.value = qty.value = discount.value = '';
      form.removeAttribute('data-modal');
      form.removeAttribute('data-stok');
      form.removeAttribute('data-nofak');
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// manual input with from submit
async function loadManualInputTransaction(form, invoice, transbar){
  if(!invoice.textContent.match(/[0-9]/)){
    transbar.classList.add('failed');
    return;
  }
  const checkbox = qs('input#checkbox', form);
  const code = qs('input#kode', form);
  const name = qs('input#nama', form);
  const price = qs('input#harga', form);
  const qty = qs('input#jumlah', form);
  const discount = qs('input#diskon', form);
  const dataModal = form.getAttribute('data-modal');
  const dataStock = form.getAttribute('data-stok');
  const dataNofak = form.getAttribute('data-nofak');
  let isValid = true;
  if(name.value === ''){
    name.focus();
    name.classList.add('failed');
    isValid = false;
  }else if(price.value === ''){
    price.focus();
    price.classList.add('failed');
    isValid = false;
  }else if(qty.value === ''){
    qty.focus();
    qty.classList.add('failed');
    isValid = false;
  }else{
    const data = {
      check: checkbox.checked,
      code: code.value,
      name: name.value,
      price: price.value,
      qty: qty.value,
      discount: discount.value,
      capital: dataModal,
      stock: dataStock,
      invoice: dataNofak
    };
    await processManualInputTransaction(data, form);
  }
  return isValid;
};

export {
  loadAutoInputTransaction,
  autoLoadProductList, debounce,
  loadManualInputTransaction
};