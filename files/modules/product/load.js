import {qs, qsa, cment, speak, audioPlaying, format_number, capitalize, notificationAlert, alertBox, error, status, button, startSpinner, stopSpinner} from '../utils.js';
import {pen, trash} from '../icons/icon.js';
import {showFormUpdate} from './update.js';
import {processDeleteProduct} from './delete.js';

// handle table
function handleTable(items, tableBox){
  const existingTable = qs('#tableProduct');
  if(existingTable){
    tableBox.removeChild(existingTable);
  }
  const table = cment('table');
  table.setAttribute('id', 'tableProduct');
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
  tableBody(table, items);
  tableBox.appendChild(table);
};
// end handle table

// table body
function tableBody(table, items){
  const tbody = cment('tbody')
  items.forEach((item, i) => {
    const trBody = cment('tr');
    const tdNo = cment('td');
    trBody.appendChild(tdNo);
    const tdName = cment('td');
    trBody.appendChild(tdName);
    const tdCapital = cment('td');
    trBody.appendChild(tdCapital);
    const tdPrice = cment('td');
    trBody.appendChild(tdPrice);
    const tdStock = cment('td');
    trBody.appendChild(tdStock);
    const tdEdit = cment('td');
    trBody.appendChild(tdEdit);
    const tdDelt = cment('td');
    trBody.appendChild(tdDelt);
    tdNo.setAttribute('id', 'no');
    tdName.setAttribute('id', 'name');
    tdCapital.setAttribute('id', 'capital');
    tdPrice.setAttribute('id', 'price');
    tdStock.setAttribute('id', 'stock');
    tdEdit.setAttribute('id', 'edit');
    tdDelt.setAttribute('id', 'delt');
    trBody.dataset.code = item.kode;
    tdNo.textContent = i + 1;
    tdName.textContent = capitalize(item.nama);
    tdCapital.textContent = format_number(item.modal);
    tdPrice.textContent = format_number(item.harga);
    tdStock.textContent = format_number(item.stok);
    const btnEdit = cment('span');
    btnEdit.innerHTML = pen(14, 14, 'green');
    tdEdit.appendChild(btnEdit);
    const btnDelt = cment('span');
    btnDelt.innerHTML = trash(14, 14, 'brown');
    tdDelt.appendChild(btnDelt);
    tbody.appendChild(trBody);
    tdEdit.onclick = () => {
      showFormUpdate(item.id_produk, trBody.dataset.code, tdName.textContent, tdCapital.textContent, tdPrice.textContent, tdStock.textContent, trBody);
    }
    tdDelt.onclick = () => {
      alertBox({
        title: 'Kofirmasi Hapus',
        message: `Hapus produk: ${trBody.querySelector('td:nth-child(2)').textContent}`,
        close: button.not,
        execute: {
          body: {
            func: processDeleteProduct,
            exec: [
              item.id_produk,
              item.id_toko,
              trBody
            ]
          },
          next: button.delete
        }
      });
    }
  });
  table.appendChild(tbody);
};
// end table body

// create table products
function createTableProducts(items, tableBox){
  handleTable(items, tableBox);
};
// end create table products

// handle tabel products
async function handleTableProducts(tableBox){
  try{
    const url = 'process/product/load.php';
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
      createTableProducts(result.products, tableBox);
    }else if(result.status === status.failed){
      stopSpinner();
      const table = cment('table');
      table.setAttribute('id', 'tableProduct');
      table.style.width = '100%';
      const tbody = cment('tbody');
      const tr = cment('tr');
      const td = cment('td');
      td.classList.add('p1', 'tc-brown', 'ta-center');
      td.textContent = result.message;
      tr.appendChild(td);
      tbody.appendChild(tr);
      table.appendChild(tbody);
      tableBox.appendChild(table);
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end handle tabel products

// load tabel products
async function loadTableProducts(tableBox){
  await handleTableProducts(tableBox);
};
// end load tabel products

export {loadTableProducts};