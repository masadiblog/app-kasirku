import {
  qs, qsa, cment, speak,
  audioPlaying, format_number,
  capitalize, notificationAlert,
  alertBox, error, status, button,
  sortirListNumber, startSpinner,
  stopSpinner
} from '../utils.js';
import {
  calculateTotalTransaction,
  tabHeader, displayNotFound,
  formEditItemTransaction,
  processDeleteTransaction
} from '../ui.js';
import {pen, trash} from '../icons/icon.js';

// load data table transaction
function loadDataTableTransaction(tbody, item, i){
  const rows = cment('tr');
  rows.dataset.id = item.id_transaksi;
  const tdNo = cment('td');
  tdNo.textContent = i + 1;
  rows.appendChild(tdNo);
  const tdName = cment('td');
  tdName.textContent = capitalize(item.nama);
  rows.appendChild(tdName);
  const tdPrice = cment('td');
  tdPrice.setAttribute('id', 'tdPrice');
  tdPrice.textContent = format_number(item.harga);
  rows.appendChild(tdPrice);
  const tdQty = cment('td');
  tdQty.setAttribute('id', 'tdQty');
  tdQty.textContent = format_number(item.jumlah);
  rows.appendChild(tdQty);
  const tdDiscount = cment('td');
  tdDiscount.setAttribute('id', 'tdDiscount');
  tdDiscount.textContent = format_number(item.diskon);
  rows.appendChild(tdDiscount);
  const tdEdit = cment('td');
  tdEdit.classList.add('edit');
  const buttonEdit = cment('span');
  buttonEdit.innerHTML = `${pen(null, null, 'green')}`;
  tdEdit.appendChild(buttonEdit);
  rows.appendChild(tdEdit);
  const tdDelt = cment('td');
  tdDelt.classList.add('hapus');
  const buttonDelt = cment('span');
  buttonDelt.innerHTML = `${trash(null, null, 'brown')}`;
  tdDelt.appendChild(buttonDelt);
  rows.appendChild(tdDelt);
  tbody.appendChild(rows);
  tdEdit.onclick = () => {
    const data = {
      idtrans: item.id_transaksi,
      invoice: item.faktur,
      code: item.kode,
      name: tdName.textContent,
      price: tdPrice.textContent,
      qty: tdQty.textContent,
      discount: tdDiscount.textContent
    };
    formEditItemTransaction(data, rows);
  }
  tdDelt.onclick = () => {
    const data = {
      idtrans: item.id_transaksi,
      invoice: item.faktur,
      name: tdName.textContent,
      qty: tdQty.textContent
    };
    alertBox({
      title: 'Kofirmasi Hapus',
      subtitle: 'Detail Item',
      message: `
        Nama: ${tdName.textContent}<br>
        Harga: ${tdPrice.textContent}<br>
        Jumlah: ${tdQty.textContent}<br>
        Diskon: ${tdDiscount.textContent}<br><br>
        Yakin ingin menghapus item ini?
      `,
      close: 'Tidak',
      execute: {
        body: {
          func: processDeleteTransaction,
          exec: [data, rows]
        },
        next: 'Hapus'
      }
    });
  }
};
// end load data table transaction

// display transaction
function displayTransactions(tableBox, transactions){
  const data = ['No', 'Item', 'Harga', 'Qty', 'Diskon', 'Aksi'];
  const tabtrans = cment('div');
  tabtrans.classList.add('tabtrans');
  const table = cment('table');
  tabHeader(table, data);
  const tbody = cment('tbody');
  if(transactions.length > 0){
    transactions.forEach((item, i) => {
      loadDataTableTransaction(tbody, item, i);
    });
  }
  table.appendChild(tbody);
  tabtrans.appendChild(table);
  tableBox.appendChild(tabtrans);
  calculateTotalTransaction(qsa('table tbody tr', tabtrans));
};
// end display transaction

// load transaction
async function loadTransactions(tableBox, invoice){
  startSpinner();
  try{
    const url = 'process/transaction/load.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({access: 'transaction'})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      qs('#inputBayar').value = format_number(result.transactions[1]);
      invoice.textContent = result.transactions[0][0].faktur;
      displayTransactions(tableBox, result.transactions[0]);
    }else if(result.status === status.not_ready){
      stopSpinner();
      displayNotFound(tableBox, result.message);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end load transaction

export {loadTransactions};