import {table, outdent, book, gear, signout, printing} from './icons/icon.js';
import {qs, qsa, cment, speak, audioPlaying, format_number, format_value, capitalize, notificationAlert, alertBox, error, status, button, sortirListNumber, sortDate, startSpinner, stopSpinner} from './utils.js';
import {submitExpenData, getExpenData} from './expen/expen.js';
import {getGuideData} from './guide/guide.js';
import {logout, handleTooltipAlert} from './aut.js';
import {isConnected, connectToPrinter, processConnectToPrinter, printDataToPrinter} from './transaction/print.js';

// get total expenditure
async function getTotalExpenditure(){
  try{
    const url = 'process/expen/get-total.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      return format_number(result.total);
    }else if(result.status === status.not_ready){
      return result.message;
    }else if(result.status === status.failed){
      return result.message;
    }else{
      return '0';
    }
  }catch(error){
    return '0';
  }
};
// end get total expenditure

// calculate total transaction
function calculateTotalTransaction(data){
  if(data.length > 0){
    let price = 0;
    let discount = 0;
    let total = 0;
    data.forEach((item, i) => {
      const itemQty = qsa('td:nth-child(4)')[i].textContent.replace(/\./g, '',).replace(/\,/g, '.');
      const itemPrice = qsa('td:nth-child(3)')[i].textContent.replace(/\./g, '').replace(/\,/g, '.');
      const itemDiscount = qsa('td:nth-child(5)')[i].textContent.replace(/\./g, '').replace(/\,/g, '.');
      price += itemPrice * itemQty;
      discount += itemDiscount * itemQty;
    });
    total = price - discount;
    const tabTrans = qs('#table-transaction');
    const divTotal = qs('#divTotal', tabTrans);
    const normalPrice = qs('#normalPrice', tabTrans);
    divTotal.textContent = format_number(total);
    normalPrice.textContent = '××××××××××';
    if(price !== total){
      qs('#table-transaction #normalPrice').innerHTML = 'Normal:&nbsp;<b>' + format_number(price) + '</b>';
    }
  }else{
    qs('#table-transaction #normalPrice').innerHTML = '××××××××××';
  }
};
// end calculate total transaction

// result invoice transaction
function resultInvoiceTransaction(result){
  const payme = result[0];
  const items = result[1];
  document.body.style.overflow = 'hidden';
  const itransCover = cment('div');
  itransCover.setAttribute('id', 'itransCover');
  const itransClose = cment('span');
  itransClose.setAttribute('id', 'itransClose');
  itransClose.innerHTML = '&times;';
  itransCover.appendChild(itransClose);
  const itransBox = cment('div');
  itransBox.setAttribute('id', 'itransBox');
  const itransData = cment('div');
  itransData.setAttribute('id', 'itransData');
  // header
  const itransHeader = cment('div');
  itransHeader.setAttribute('id', 'itransHeader');
  const itransDate = cment('div');
  itransDate.setAttribute('id', 'itransDate');
  itransDate.textContent = payme.tanggal;
  itransHeader.appendChild(itransDate);
  const itransInvoice = cment('div');
  itransInvoice.setAttribute('id', 'itransInvoice');
  itransInvoice.textContent = payme.faktur;
  itransHeader.appendChild(itransInvoice);
  const itransCashier = cment('div');
  itransCashier.setAttribute('id', 'itransCashier');
  const colCashier = cment('div');
  colCashier.classList.add('col');
  const cashierLeft = cment('div');
  cashierLeft.textContent = 'Kasir';
  colCashier.appendChild(cashierLeft);
  const cashierRight = cment('div');
  cashierRight.textContent = payme.admin;
  colCashier.appendChild(cashierRight);
  itransCashier.appendChild(colCashier);
  itransHeader.appendChild(itransCashier);
  itransData.appendChild(itransHeader);
  // items looping
  const itransItems = cment('div');
  itransItems.setAttribute('id', 'itransItems');
  let total_item = 0, total_price = 0, total_discount = 0;
  items.forEach(item => {
    const rowsItem = cment('div');
    rowsItem.classList.add('row');
    const colItem = cment('div');
    colItem.classList.add('col');
    const itemLeft = cment('div');
    itemLeft.innerHTML = `${capitalize(item.nama)}<br>${format_number(item.jumlah)} × ${format_number(item.harga)}`;
    colItem.appendChild(itemLeft);
    const itemRight = cment('div');
    itemRight.textContent = format_number(item.jumlah * item.harga);
    colItem.appendChild(itemRight);
    rowsItem.appendChild(colItem);
    const colDiscount = cment('div');
    colDiscount.classList.add('col');
    const discountLeft = cment('div');
    discountLeft.textContent = `Diskon ${format_number(item.jumlah)} × ${format_number(item.diskon)}`;
    colDiscount.appendChild(discountLeft);
    const discountRight = cment('div');
    discountRight.textContent = format_number(item.jumlah * item.diskon);
    colDiscount.appendChild(discountRight);
    rowsItem.appendChild(colDiscount);
    itransItems.appendChild(rowsItem);
    total_item += parseFloat(item.jumlah);
    total_price += parseFloat(item.jumlah) * parseFloat(item.harga);
    total_discount += parseFloat(item.jumlah) * parseFloat(item.diskon);
  });
  itransData.appendChild(itransItems);
  // footer
  const itransFooter = cment('div');
  itransFooter.setAttribute('id', 'itransFooter');
  const rowFooter = cment('div');
  rowFooter.classList.add('row');
  
  const colTotalItem = cment('div');
  colTotalItem.classList.add('col');
  const totalItemFooterLeft = cment('div');
  totalItemFooterLeft.textContent = `Total Item ${total_item.toString().replace(/\./g, ',')}`;
  colTotalItem.appendChild(totalItemFooterLeft);
  const totalItemFooterRight = cment('div');
  totalItemFooterRight.textContent = format_number(total_price);
  colTotalItem.appendChild(totalItemFooterRight);
  rowFooter.appendChild(colTotalItem);
  
  const colTotalDiscount = cment('div');
  colTotalDiscount.classList.add('col');
  const totalDiscountLeft = cment('div');
  totalDiscountLeft.textContent = 'Total Diskon';
  colTotalDiscount.appendChild(totalDiscountLeft);
  const totalDiscountRight = cment('div');
  totalDiscountRight.textContent = format_number(total_discount);
  colTotalDiscount.appendChild(totalDiscountRight);
  rowFooter.appendChild(colTotalDiscount);
  
  const colTotalSale = cment('div');
  colTotalSale.classList.add('col');
  const totalSaleLeft = cment('div');
  totalSaleLeft.textContent = `Total Belanja `;
  colTotalSale.appendChild(totalSaleLeft);
  const totalSaleRight = cment('div');
  totalSaleRight.textContent = format_number(payme.total);
  colTotalSale.appendChild(totalSaleRight);
  rowFooter.appendChild(colTotalSale);
  
  const colTotalCash = cment('div');
  colTotalCash.classList.add('col');
  const totalCashLeft = cment('div');
  totalCashLeft.textContent = 'Tunai';
  colTotalCash.appendChild(totalCashLeft);
  const totalCashRight = cment('div');
  totalCashRight.textContent = format_number(payme.pembayaran);
  colTotalCash.appendChild(totalCashRight);
  rowFooter.appendChild(colTotalCash);
  
  const colTotalReturn = cment('div');
  colTotalReturn.classList.add('col');
  const totalReturnLeft = cment('div');
  totalReturnLeft.textContent = 'Kembalian';
  colTotalReturn.appendChild(totalReturnLeft);
  const totalReturnRight = cment('div');
  totalReturnRight.textContent = format_number(payme.pembayaran - payme.total);
  colTotalReturn.appendChild(totalReturnRight);
  rowFooter.appendChild(colTotalReturn);
  
  itransFooter.appendChild(rowFooter);
  itransData.appendChild(itransFooter);
  itransBox.appendChild(itransData);
  itransCover.appendChild(itransBox);
  document.body.appendChild(itransCover);
  itransCover.classList.add('active');
  itransClose.onclick = () => {
    itransCover.classList.remove('active');
    setTimeout(() => {
      itransCover.remove();
    }, 500);
    document.body.style.overflow = 'auto';
  }
};
// end result invoice transaction

// search invoice transaction
async function searchInvoiceTransaction(invoice, searchBox){
  try{
    const url = 'process/transaction/search-invoice.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({invoice: invoice.value})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      resultInvoiceTransaction(result.items);
      invoice.value = '';
      searchBox.classList.remove('active');
    }else if(result.status === status.not_ready){
     alertBox({message: result.message});
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end search invoice transaction

// table header
function tabHeader(table, data){
  if(data.length > 0){
    const thead = cment('thead');
    const tr = cment('tr');
    data.forEach((text, i) => {
      const th = cment('th');
      if(text === 'Aksi'){
        th.colSpan = 2;
      }
      th.textContent = text;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }else{
    qs('thead').remove();
  }
};
// end table header

// display not found
function displayNotFound(tableBox, message){
  const existingTable = qs('table', tableBox);
  if(existingTable){
    existingTable.remove();
  }
  const tabtrans = cment('div');
  tabtrans.classList.add('tabtrans');
  const table = cment('table');
  const tbody = cment('tbody');
  const tr = cment('tr');
  const td = cment('td');
  td.colSpan = 7;
  td.classList.add('failed');
  td.innerHTML = message;
  tr.appendChild(td);
  tbody.appendChild(tr);
  table.appendChild(tbody);
  tabtrans.appendChild(table);
  tableBox.appendChild(tabtrans);
};
// end display not found

// table message
function tableMessage(tableBox, message){
  const existingTable = qs('table', tableBox);
  if(existingTable){
    existingTable.remove();
  }
  const tabtrans = cment('div');
  tabtrans.classList.add('tabtrans');
  const table = cment('table');
  const tbody = cment('tbody');
  const tr = cment('tr');
  const td = cment('td');
  td.colSpan = 7;
  td.classList.add('failed');
  td.innerHTML = message;
  tr.appendChild(td);
  tbody.appendChild(tr);
  table.appendChild(tbody);
  tabtrans.appendChild(table);
  tableBox.appendChild(tabtrans);
};
// end table message

// create form edit transaksi
function formEditItemTransaction(data, rowel){
  document.body.style.overflow = 'hidden';
  const tabTrans = qs('#table-transaction');
  const existingForm = qs('.boxFormEdit');
  if(existingForm){
    existingForm.remove();
  }
  const boxFormEdit = cment('div');
  boxFormEdit.classList.add('boxFormEdit');
  const formEdit = cment('form');
  formEdit.setAttribute('id', 'formEdit');
  const title = cment('h5');
  title.textContent = 'Perbarui Item Transaksi';
  formEdit.appendChild(title);
  const rowData = cment('div');
  rowData.classList.add('row');
  const titleItem = cment('p');
  titleItem.textContent = 'Item: ' + capitalize(data.name);
  formEdit.appendChild(titleItem);
  const colData = cment('div');
  colData.classList.add('col');
  const divPrice = cment('div');
  const labelPrice = cment('label');
  labelPrice.textContent = 'Harga';
  divPrice.appendChild(labelPrice);
  const inputPrice = cment('input');
  inputPrice.setAttribute('id', 'inputPrice');
  inputPrice.setAttribute('readonly','');
  inputPrice.value = data.price;
  divPrice.appendChild(inputPrice);
  colData.appendChild(divPrice);
  const divQty = cment('div');
  const labelQty = cment('label');
  labelQty.textContent = 'Qyt';
  divQty.appendChild(labelQty);
  const inputQty = cment('input');
  inputQty.setAttribute('id', 'inputQty');
  inputQty.value = data.qty;
  inputQty.oninput = () => {
    inputQty.value = format_value(inputQty.value);
  }
  divQty.appendChild(inputQty);
  colData.appendChild(divQty);
  const divDiscount = cment('div');
  const labelDiscount = cment('label');
  labelDiscount.textContent = 'Diskon';
  divDiscount.appendChild(labelDiscount);
  const inputDiscount = cment('input');
  inputDiscount.setAttribute('id', 'inputDiscount');
  inputDiscount.value = data.discount;
  inputDiscount.onfocus = () => inputDiscount.value = data.discount === '0' ? '' : data.discount;
  inputDiscount.oninput = () => inputDiscount.value = format_value(inputDiscount.value);
  divDiscount.appendChild(inputDiscount);
  colData.appendChild(divDiscount);
  rowData.appendChild(colData);
  formEdit.appendChild(rowData);
  const rowButton = cment('div');
  rowButton.classList.add('row');
  const buttonCancel = cment('button');
  buttonCancel.setAttribute('type', 'button');
  buttonCancel.textContent = 'Batal';
  buttonCancel.onclick = () => {
    const existingForm = qs('.boxFormEdit');
    if(existingForm){
      existingForm.remove();
    }
    document.body.style.overflow = 'auto';
  }
  rowButton.appendChild(buttonCancel);
  formEdit.appendChild(rowButton);
  const buttonSubmit = cment('button');
  buttonSubmit.setAttribute('type', 'submit');
  buttonSubmit.textContent = 'Simpan';
  rowButton.appendChild(buttonSubmit);
  formEdit.onsubmit = async (e) => {
    e.preventDefault();
    inputDiscount.value = inputDiscount.value.trim() === '' ? '0'  : inputDiscount.value;
    const dataValue = {
      idtrans: data.idtrans,
      idto: data.idto,
      invoice: data.invoice,
      code: data.code,
      name: data.name,
      price: data.price,
      SQty: data.qty,
      qty: inputQty.value,
      discount: inputDiscount.value
    }
    await processUpdateTransaction(dataValue, rowel);
  }
  boxFormEdit.appendChild(formEdit);
  tabTrans.appendChild(boxFormEdit);
  boxFormEdit.onclick = (e) => {
    if(e.target !== formEdit){
      formEdit.classList.add('scale');
    }
    setTimeout(() => formEdit.classList.remove('scale'),325);
  }
  formEdit.onclick = (e) => {
    e.stopPropagation();
  }
};
// end create form edit transaksi

// reset form transaction
function resetFormTransaction(form, access){
  const name = qs('input#nama', form);
  const checkbox = qs('input#checkbox', form);
  const code = qs('input#kode', form);
  const price = qs('input#harga', form);
  const qty = qs('input#jumlah', form);
  const discount = qs('input#diskon', form);
  if(access !== undefined && access === 'manual'){
    name.focus();
  }else{
    name.blur();
  }
  name.value = code.value = price.value = qty.value = discount.value = '';
  name.classList.remove('failed');
  code.classList.remove('failed');
  price.classList.remove('failed');
  qty.classList.remove('failed');
  price.setAttribute('readonly', '');
  qty.setAttribute('readonly', '');
  discount.setAttribute('readonly', '')
  form.removeAttribute('data-modal');
  form.removeAttribute('data-stok');
  form.removeAttribute('data-nofak');
};
// end reset form transaction

// result product list
function resultProductList(products){
  const listBox = qs('#listBox');
  listBox.innerHTML = '';
  document.body.style.overflow = 'auto';
  if(products.length > 0){
    document.body.style.overflow = 'hidden';
    listBox.classList.add('show');
    const list = cment('ul');
    const close = cment('span');
    close.setAttribute('id', 'close');
    close.innerHTML = '&times;';
    list.appendChild(close);
    products.forEach((product, i) => {
      const item = cment('li');
      item.textContent = capitalize(product.nama);
      list.appendChild(item);
      item.onclick = () => {
        const form = qs('form#transaction');
        const code = qs('input#kode', form);
        const name = qs('input#nama', form);
        const price = qs('input#harga', form);
        const qty = qs('input#jumlah', form);
        const invoice = qs('.transbar .nofak').textContent;
        code.value = product.kode;
        name.value = capitalize(product.nama);
        price.placeholder = format_number(product.harga);
        price.value = format_number(product.harga);
        form.dataset.modal = product.modal;
        form.dataset.stok = product.stok;
        form.dataset.nofak = invoice;
        qty.focus();
        price.removeAttribute('readonly');
        qty.removeAttribute('readonly');
        closeListBox();
      }
    });
    close.onclick = () => {
      closeListBox();
      resetFormTransaction(qs('form#transaction'));
    }
    // close list box
    function closeListBox(){
      listBox.classList.remove('show');
      listBox.removeChild(list);
      listBox.innerHTML = '';
      document.body.style.overflow = 'auto';
    }
    listBox.appendChild(list);
  }
};
// end result product list

// payment process
async function paymentProcess(data, checkbox){
  startSpinner();
  try{
    const url = 'process/payment/payment-transaction.php';
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
      document.body.style.overflow = 'auto';
      qs('#inputBayar').value = format_number(data.payment);
      const existingForm = qs('#boxFormPayment');
      if(existingForm){
        existingForm.remove();
      }
      const tabHarga = qsa('#tdPrice');
      const tabJumlah = qsa('#tdQty');
      let totalHarga = 0;
      tabHarga.forEach((harga, i) => {
        totalHarga += harga.textContent.replace(/\./g, '') * tabJumlah[i].textContent.replace(/\,/g, '.');
      });
      const subtotal = totalHarga;
      const paydisc = totalHarga - data.total;
      const payrest = data.payment - data.total;
      let payment_data = '';
      if(paydisc !== 0){
        payment_data += `
          Subtotal Rp ${format_number(subtotal)}<br>
          Diskon Rp ${format_number(paydisc)}<br>
        `;
      }
      payment_data += `
        Total Rp ${format_number(data.total)}<br>
        Tunai Rp ${format_number(data.payment)}<br>
        Kembali Rp <b style="font-size:1.25em">${format_number(payrest)}</b>`;
      if(checkbox === true){
        stopSpinner();
        if(!isConnected){
          const serviceUUID = localStorage.getItem('serviceUUID');
          const characterUUID = localStorage.getItem('characterUUID');
          if(serviceUUID !== null && characterUUID !== null){
            processConnectToPrinter(serviceUUID, characterUUID);
          }else{
            connectToPrinter();
          }
          return;
        }
        transactionPrint(data.invoice);
      }
      alertBox({
        title: 'Pembayaran Berhasil',
        subtitle: 'Detail Pembayaran',
        message: payment_data,
        close: 'Oke'
      });
      stopSpinner();
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end payment process

// payment form
function paymentForm(data){
  document.body.style.overflow = 'hidden';
  const tabKasir = qs('#table-transaction');
  const boxFormPayment = cment('div');
  boxFormPayment.setAttribute('id', 'boxFormPayment');
  const formPayment = cment('form');
  formPayment.setAttribute('id', 'formPayment');
  const titleForm = cment('h5');
  titleForm.textContent = 'Proses Pembayaran';
  formPayment.appendChild(titleForm);
  const rowInput = cment('div');
  rowInput.classList.add('row');
  const colInput = cment('div');
  colInput.classList.add('col');
  const divInputTotal = cment('div');
  const labelInputTotal = cment('label');
  labelInputTotal.textContent = 'Total Transaksi';
  divInputTotal.appendChild(labelInputTotal);
  const inputTotal = cment('input');
  inputTotal.setAttribute('readonly', '');
  inputTotal.value = data.total;
  divInputTotal.appendChild(inputTotal);
  colInput.appendChild(divInputTotal);
  const divInputPayment = cment('div');
  const labelInputPayment = cment('label');
  labelInputPayment.textContent = 'Tunai';
  divInputPayment.appendChild(labelInputPayment);
  const inputPayment = cment('input');
  inputPayment.setAttribute('placeholder', 'Masukkan Nominal');
  inputPayment.setAttribute('id', 'payment');
  inputPayment.value = qs('#inputBayar').value;
  inputPayment.oninput = () => {
    inputPayment.value = format_value(inputPayment.value);
  }
  divInputPayment.appendChild(inputPayment);
  colInput.appendChild(divInputPayment);
  rowInput.appendChild(colInput);
  formPayment.appendChild(rowInput);
  const rowButton = cment('div');
  rowButton.classList.add('row');
  const colButton = cment('div');
  colButton.classList.add('col');
  const divPrint = cment('div');
  divPrint.setAttribute('id', 'divPrint');
  const inputPrint = cment('input');
  inputPrint.setAttribute('type', 'checkbox');
  // verification member status
  const distance = document.body.dataset.distance;
  if(distance === '0'){
    inputPrint.checked = false;
  }else{
    inputPrint.checked = true;
  }
  inputPrint.setAttribute('id', 'inputPrint');
  divPrint.appendChild(inputPrint);
  const labelPrint = cment('label');
  labelPrint.setAttribute('for', 'inputPrint');
  labelPrint.innerHTML = `Cetak Struk '${printing(18, 18, '#555')}`;
  divPrint.appendChild(labelPrint);
  colButton.appendChild(divPrint);
  const divButton = cment('div');
  const buttonCancel = cment('button');
  buttonCancel.classList.add('me-1');
  buttonCancel.setAttribute('type', 'button');
  buttonCancel.textContent = 'Batal';
  buttonCancel.onclick = () => {
    if(boxFormPayment){
      boxFormPayment.remove();
    }
    document.body.style.overflow = 'auto';
  }
  divButton.appendChild(buttonCancel);
  const buttonSubmit = cment('button');
  buttonSubmit.setAttribute('type', 'submit');
  buttonSubmit.textContent = 'Proses';
  divButton.appendChild(buttonSubmit);
  colButton.appendChild(divButton);
  rowButton.appendChild(colButton);
  formPayment.appendChild(rowButton);
  inputPrint.onchange = () => {
    // verification member status
    if(distance === '0'){
      inputPrint.checked = false;
      const data = atob(qs('body').getAttribute('data-name'));
      alertBox({
        title: 'Langganan Anda Habis',
        subtitle: 'Perpanjang Langganan Sekarang!',
        message: '<p>Untuk saat ini Anda hanya dapat melakukan proses pembayaran tanpa cetak struk.</p><p>Paket berlangganan Anda telah habis. Silakan perpanjang langganan Anda sekarang agar dapat terus menikmati semua fitur yang tersedia.</p>',
        close: 'Tidak',
        execute: {
          body: {
            func: formConPay,
            exec: [data]
          },
          next: 'Ya, Perpanjang'
        }
      });
    }
  }
  formPayment.onsubmit = async (e) => {
    e.preventDefault();
    const inputTotalValue = Number(inputTotal.value.replace(/\./g, ''));
    const inputPaymentValue = Number(inputPayment.value.replace(/\./g, ''));
    if(inputPayment.value == '' || inputPaymentValue < (inputTotalValue)){
      inputPayment.focus();
      return false;
    }else{
      const dataValue = {
        invoice: data.invoice,
        payment: inputPaymentValue,
        total: inputTotalValue
      }
      await paymentProcess(dataValue, inputPrint.checked);
    }
  }
  boxFormPayment.appendChild(formPayment);
  tabKasir.appendChild(boxFormPayment);
};
// end payment form



function printHTML(){
  const h1 = cment('h1');
  h1.style.textAlign = 'center';
  h1.textContent = 'Print Data To Printer';
  document.body.appendChild(h1);
}

// transaction print
async function transactionPrint(data){
  try{
    const url = 'process/payment/print.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({invoice: data})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      await printDataToPrinter(result.data_print);
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end transaction print

// create invoice
function createInvoice(){
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
function printInvoice(...args){
  const [invoice, formTrans, transbar] = args;
  const invo = createInvoice().split('');
  let txt = '';
  function addChar(i){
    if(i < invo.length){
      txt += invo[i];
      invoice.textContent = txt;
      setTimeout(() => addChar(i + 1), 25);
    }
  }
  const code = qs('input#kode', formTrans);
  const name = qs('input#nama', formTrans);
  const price = qs('input#harga', formTrans);
  const qty = qs('input#jumlah', formTrans);
  const discount = qs('input#diskon', formTrans);
  name.focus();
  code.value = name.value = price.value = qty.value = discount.value = '';
  formTrans.removeAttribute('data-modal');
  formTrans.removeAttribute('data-stok');
  formTrans.removeAttribute('data-nofak');
  code.classList.remove('failed');
  name.classList.remove('failed');
  transbar.classList.remove('failed');
  qs('#divTotal').textContent = 0;
  qs('#inputBayar').value = '';
  qs('#normalPrice').innerHTML = '××××××××××';
  audioPlaying();
  addChar(0);
  tableMessage(qs('#table-transaction'), 'Scan atau input transaksi baru!');
};
function getInvoice(invoice, formTrans, transbar){
  alertBox({
    title: 'Transaksi Baru',
    message: 'Ingin membuat transaksi baru?',
    close: 'Tidak',
    execute: {
      body: {
        func: printInvoice,
        exec: [invoice, formTrans, transbar]
      },
      next: 'Ya, Buatkan'
    }
  });
};
// end create invoice

// update item transaction
async function processUpdateTransaction(data, rowel){
  startSpinner();
  try{
    const url = 'process/transaction/update.php';
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
      const resultMessage = result.message[0];
      const totalHarga = result.message[1];
      alertBox({message: resultMessage});
      rowel.querySelector('#tdQty').textContent = data.qty;
      rowel.querySelector('#tdDiscount').textContent = data.discount;
      const existingForm = qs('.boxFormEdit');
      if(existingForm){
        existingForm.remove();
      }
      calculateTotalTransaction(qsa('table tbody tr', qs('#table-transaction')));
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end update item transaction

// delete item transaction
async function processDeleteTransaction(data, rowel){
  startSpinner();
  try{
    const url = 'process/transaction/delete.php';
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
      rowel.remove();
      alertBox({message: result.message[0]});
      if(result.message[1] !== null){
        qs('#divTotal').textContent = format_number(result.message[1]);
        calculateTotalTransaction(qsa('table tbody tr', qs('#table-transaction')));
        sortirListNumber(qsa('#table-transaction table tbody tr'), 'td');
      }
      const rows = qsa('#table-transaction table tbody tr');
      if(rows.length === 0){
        qs('#divTotal').textContent = '0';
        qs('#inputBayar').value = '';
        tabHeader(null, []);
        qs('.transbar .nofak').textContent = '××××××××××';
        calculateTotalTransaction([]);
        displayNotFound(qs('#table-transaction'), 'Tidak ada transaksi<br><br>Silakan klik "Transaksi Baru"');
      }
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end delete item transaction

// cancel transaction
async function cancelTransaction(invoice, rows){
  startSpinner();
  try{
    let items = [];
    rows.forEach((row, i) => {
      let item = qs('td:nth-child(2)', row).textContent.replace(/\./g, '');
      let qty = qs('td:nth-child(4)', row).textContent.replace(/\./g, '').replace(/\,/g, '.');
      items.push({item, qty});
    });
    const url = 'process/transaction/cancel.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({invoice: invoice, items: items})
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
      qs('#divTotal').textContent = '0';
      qs('#inputBayar').value = '';
      tabHeader(null, []);
      qs('.transbar .nofak').textContent = '××××××××××';
      calculateTotalTransaction([]);
      displayNotFound(qs('#table-transaction'), 'Tidak ada transaksi<br><br>Silakan klik "Transaksi Baru"');
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end cancel transaction

// handle menu items
function handleMenuItems(items, menuBox){
  const ic = '#555';
  const MENU_ITEMS = {
    TRANSACTION: 0,
    EXPENDITURE: 1,
    GUIDE: 2,
    DASHBOARD: 3,
    LOGOUT: 4
  };
  items.forEach((item, i) => {
    const text = item.textContent;
    switch(i){
      case MENU_ITEMS.TRANSACTION:
        item.innerHTML = `${table(12, 12, ic)} ${text}`;
        item.onclick = async () => {
          const distance = document.body.dataset.distance;
          if(distance === '0'){
            const data = atob(qs('body').getAttribute('data-name'));
            alertBox({
              title: 'Langganan Anda Habis',
              subtitle: 'Perpanjang Langganan Sekarang!',
              message: '<p>Untuk saat ini Anda tidak dapat mengakses data penjualan.</p><p>Paket berlangganan Anda telah habis. Silakan perpanjang langganan Anda sekarang agar dapat terus menikmati semua fitur yang tersedia.</p>',
              close: 'Tidak',
              execute: {
                body: {
                  func: formConPay,
                  exec: [data]
                },
                next: 'Ya, Perpanjang'
              }
            });
            menuBox.classList.remove('active');
            return;
          }
          menuBox.classList.remove('active');
          const data_transaction = qs('#data_transaction');
          data_transaction.classList.add('show');
          await loadTabTransaction('default','default');
          const close_tab = qs('#close_transaction');
          close_tab.onclick = () => {
            const tbody_data = qs('#data_transaction tbody#data');
            const tfoot_data = qs('#data_transaction tfoot#data');
            data_transaction.classList.remove('show');
            setTimeout(() => {
              tbody_data.innerHTML = '';
              tfoot_data.remove();
            },600);
          }
        }
      break;
      case MENU_ITEMS.EXPENDITURE:
        item.innerHTML = `${outdent(12, 12, ic)} ${text}`;
        item.onclick = () => {
          menuBox.classList.remove('active');
          openTabExpen();
        }
      break;
      case MENU_ITEMS.GUIDE:
        item.innerHTML = `${book(12, 12, ic)} ${text}`;
        item.onclick = () => {
          menuBox.classList.remove('active');
          viewGuide();
        }
      break;
      case MENU_ITEMS.DASHBOARD:
        item.innerHTML = `${gear(12, 12, ic)} ${text}`;
        item.onclick = () => {
          startSpinner();
          menuBox.classList.remove('active');
          setTimeout(() => {
            stopSpinner();
            window.location.href = '?pg=dashboard';
          }, 500);
        }
      break;
      case MENU_ITEMS.LOGOUT:
        item.innerHTML = `${signout(12, 12, ic)} ${text}`;
        item.onclick = () => {
          menuBox.classList.remove('active');
          logout();
        }
      break;
    }
  });
};
// end handle menu items

// load tab transaction
// calculate transaction detail
function calculateTransactionDetail(){
  const tfd = qs('tfoot#data');
  if(tfd !== null){
    tfd.remove();
  }
  const table = qs('#data_transaction table');
  const data = qsa('tbody#data tr');
  // mendefinisikan total harga
  let totalHarga = 0;
  // mendefinisikan total diskon
  let totalDiskon = 0;
  // mendefinisikan total laba
  let totalLaba = 0;
  data.forEach(data => {
    // ambil data harga dari tabel
    let harga = data.querySelectorAll('td:nth-child(2)');
    // ambil data jumlah dari tabel
    let jumlah = data.querySelectorAll('td:nth-child(3)');
    // ambil data diskon dari tabel
    let diskon = data.querySelectorAll('td:nth-child(4)');
    // ambil data laba dari tabel
    let laba = data.querySelectorAll('td:nth-child(5)');
    // looping harga * jumlah
    harga.forEach((harga,i) => {
      totalHarga += Number(harga.textContent.replace(/\./g, '')) * Number(jumlah[i].textContent.replace(/\,/g, '.'));
    });
    // looping diskon * jumlah
    diskon.forEach((diskon,i) => {
      totalDiskon += Number(diskon.textContent.replace(/\./g, '')) * Number(jumlah[i].textContent.replace(/\,/g, '.'));
    });
    // looping laba
    laba.forEach((laba,i) => {
      totalLaba += Number(laba.textContent.replace(/\./g, ''));
    });
  });
  const tfoot = cment('tfoot');
  tfoot.setAttribute('id', 'data');
  // subtotal
  const rowSubtotal = cment('tr');
  const textSubtotal = cment('td');
  textSubtotal.colSpan = 2;
  textSubtotal.textContent = 'Total Penjualan';
  rowSubtotal.appendChild(textSubtotal);
  const dataSubtotal = cment('td');
  dataSubtotal.colSpan = 4;
  dataSubtotal.textContent = format_number(totalHarga.toString());
  rowSubtotal.appendChild(dataSubtotal);
  tfoot.appendChild(rowSubtotal);
  // diskon
  const rowDiskon = cment('tr');
  const textDiskon = cment('td');
  textDiskon.colSpan = 2;
  textDiskon.textContent = 'Total Diskon';
  rowDiskon.appendChild(textDiskon);
  const dataDiskon = cment('td');
  dataDiskon.colSpan = 4;
  dataDiskon.textContent = format_number(totalDiskon.toString());
  rowDiskon.appendChild(dataDiskon);
  tfoot.appendChild(rowDiskon);
  // laba
  const rowLaba = cment('tr');
  const textLaba = cment('td');
  textLaba.colSpan = 2;
  textLaba.textContent = 'Total Laba';
  rowLaba.appendChild(textLaba);
  const dataLaba = cment('td');
  dataLaba.colSpan = 4;
  dataLaba.textContent = format_number(totalLaba.toString());
  rowLaba.appendChild(dataLaba);
  tfoot.appendChild(rowLaba);
  // pengeluaran
  const rowPengeluaran = cment('tr');
  const textPengeluaran = cment('td');
  textPengeluaran.colSpan = 2;
  textPengeluaran.textContent = 'Total Pengeluaran';
  rowPengeluaran.appendChild(textPengeluaran);
  const dataPengeluaran = cment('td');
  dataPengeluaran.colSpan = 4;
  dataPengeluaran.setAttribute('id', 'totex');
  getTotalExpenditure().then(totalExpenditure => {
    dataPengeluaran.textContent = totalExpenditure;
  });
  rowPengeluaran.appendChild(dataPengeluaran);
  tfoot.appendChild(rowPengeluaran);
  // total
  const rowTotal = cment('tr');
  const textTotal = cment('td');
  textTotal.colSpan = 2;
  textTotal.textContent = 'Total';
  rowTotal.appendChild(textTotal);
  const dataTotal = cment('td');
  dataTotal.colSpan = 4;
  dataTotal.textContent = '000';
  let totalExpen, setDataTotal;
  setTimeout(() => {
    const totalExpen = Number(dataPengeluaran.textContent.replace(/\./g, ''));
    setTimeout(() => {
      const total1 = totalHarga - totalDiskon;
      let total2;
      if(totalLaba < 0){
        total2 = total1 + totalLaba;
      }else{
        total2 = total1 - totalLaba;
      }
      const total3 = total2 - totalExpen;
      setDataTotal = total3;
      dataTotal.textContent = format_number(setDataTotal);
    }, 250);
  }, 750);
  rowTotal.appendChild(dataTotal);
  tfoot.appendChild(rowTotal);
  table.appendChild(tfoot);
};
// end calculate transaction detail
async function loadTabTransaction(sortir, sorlab){
  if(sortir === 'undefined-undefined-'){
    qs('#label_date').textContent = 'Pilih Tanggal';
    qs('#count').textContent = '0';
    qs('#data_transaction tbody#data').innerHTML = '<td colspan="6" style="color:maroon;text-transform:none;text-align:center">Harap pilih tanggal penjualan!</td>';
    return false;
  }
  startSpinner();
  try{
    const url = 'process/transaction/sort-transaction.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({tanggal: sortir, sorlab: sorlab})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      const data = qs('#data_transaction tbody#data');
      qs('#label_date').textContent = result.data_transaction[1];
      qs('#count').textContent = result.data_transaction[2];
      const transactions = result.data_transaction[0];
      let resdata = '';
      transactions.forEach(data =>{
        resdata += data;
      });
      data.innerHTML = resdata;
      const rows = qsa('tr', data);
      rows.forEach((row, i) => {
        const name = qsa('td', row)[0];
        name.textContent = capitalize(name.textContent);
      });
      sortirTransaction(qs('#sort_date #input_date'));
      calculateTransactionDetail();
    }else if(result.status === status.failed){
      speak(result.message);
      const data = qs('#data_transaction');
      data.classList.remove('show');
    }
  }catch(error){
    alertBox({message: 'Error: '+error.message});
  }
};
// sortir transaction
function sortirTransaction(sortir){
  sortir.onchange = async () => {
    let sorlab = sortDate(sortir.value);
    let x = sortir.value.split('-'), d = x[2], m = x[1], y = x[0];
    let sort = y+'-'+m+'-'+d;
    await loadTabTransaction(sort, sorlab);
  }
};
// end sortir transaction
// end load tab transaction

// open tab expen
// close expen
function closeExpen(box, data){
  box.classList.remove('show');
  setTimeout(() => {
    data.innerHTML = '';
  },600);
  document.body.style.overflow = 'auto';
};
function openTabExpen(){
  document.body.style.overflow = 'hidden';
  const dataExpen = qs('#data_expen');
  const close = qs('#data_expen #close_expen');
  const data = qs('#data_expen #data');
  dataExpen.classList.add('show');
  
  // form expen
  const form_expen = cment('form');
  form_expen.setAttribute('id', 'form_expen');
  form_expen.setAttribute('autocomplete', 'off');
  // row nominal
  const rowNominal = cment('div');
  rowNominal.classList.add('row');
  // label nominal
  const labelNominal = cment('label');
  labelNominal.setAttribute('for', 'expen');
  labelNominal.textContent = 'Pengeluaran';
  rowNominal.appendChild(labelNominal);
  // input nominal
  const inputNominal = cment('input');
  inputNominal.setAttribute('type', 'text');
  inputNominal.setAttribute('id', 'expen');
  inputNominal.setAttribute('placeholder', 'Nominal');
  inputNominal.setAttribute('maxlength', '10');
  rowNominal.appendChild(inputNominal);
  // error nominal
  const errNominal = cment('div');
  errNominal.classList.add('err');
  rowNominal.appendChild(errNominal);
  form_expen.appendChild(rowNominal);
  // row description
  const rowDescription = cment('div');
  rowDescription.classList.add('row');
  // label description
  const labelDescription = cment('label');
  labelDescription.setAttribute('for', 'desc');
  labelDescription.textContent = 'Keterangan';
  rowDescription.appendChild(labelDescription);
  // textarea description
  const inputDescription = cment('textarea');
  inputDescription.setAttribute('id', 'desc')
  inputDescription.setAttribute('placeholder', 'Keterangan')
  inputDescription.setAttribute('row', '3')
  inputDescription.setAttribute('maxlength', '100')
  rowDescription.appendChild(inputDescription);
  // error description
  const errDescription = cment('div');
  errDescription.classList.add('err');
  rowDescription.appendChild(errDescription);
  form_expen.appendChild(rowDescription);
  // row button
  const rowButton = cment('div');
  rowButton.classList.add('row', 'text-end');
  // button reset
  const resettButton = cment('button');
  resettButton.setAttribute('type', 'reset');
  resettButton.textContent = 'Reset';
  rowButton.appendChild(resettButton);
  // button submit
  const submitButton = cment('button');
  submitButton.setAttribute('type', 'submit');
  submitButton.classList.add('ms-1');
  submitButton.textContent = 'Tambah';
  rowButton.appendChild(submitButton);
  form_expen.appendChild(rowButton);
  data.appendChild(form_expen);
  inputNominal.oninput = () => {
    inputNominal.value = format_value(inputNominal.value);
  }
  // submit form expen
  form_expen.onsubmit = async (e) => {
    e.preventDefault();
    inputNominal.classList.remove('failed');
    inputDescription.classList.remove('failed');
    errNominal.textContent = '';
    errDescription.textContent = '';
    if(inputNominal.value === ''){
      inputNominal.focus();
      inputNominal.classList.add('failed');
      errNominal.textContent = 'Masukkan nominal pengeluaran!';
      return;
    }else if(inputDescription.value === ''){
      inputDescription.focus();
      inputDescription.classList.add('failed');
      errDescription.textContent = 'Masukkan keterangan pengeluaran!';
      return;
    }else{
      const data = {
        nominal: inputNominal.value,
        description: inputDescription.value
      };
      await submitExpenData(data);
    }
  }
  // end form input
  
  // table expen
  const tableBox = cment('div');
  tableBox.classList.add('table-box');
  tableBox.style.maxHeight = '65vh';
  const tableExpen = cment('table');
  tableExpen.setAttribute('id', 'tableExpen');
  // thead
  const thead = cment('thead');
  const trHead = cment('tr');
  const thNumber = cment('th');
  thNumber.textContent = 'No';
  trHead.appendChild(thNumber);
  const thNominal = cment('th');
  thNominal.textContent = 'Pengeluaran';
  trHead.appendChild(thNominal);
  const thDescription = cment('th');
  thDescription.textContent = 'Keterangan';
  trHead.appendChild(thDescription);
  const thAction = cment('th');
  thAction.colSpan = 2;
  thAction.textContent = 'Aksi';
  trHead.appendChild(thAction);
  thead.appendChild(trHead);
  tableExpen.appendChild(thead);
  // tbody
  const tbody = cment('tbody');
  tbody.setAttribute('id', 'dataBody');
  getExpenData();
  /*
  const trBody = cment('tr');
  const tdNumber = cment('td');
  tdNumber.classList.add('text-center');
  tdNumber.textContent = '1';
  trBody.appendChild(tdNumber);
  
  const tdNominal = cment('td');
  tdNominal.classList.add('text-end');
  tdNominal.textContent = '12.500';
  trBody.appendChild(tdNominal);
  
  const tdDescription = cment('td');
  tdDescription.classList.add('text-start');
  tdDescription.textContent = 'Belanja plastik';
  trBody.appendChild(tdDescription);
  
  const tdAction = cment('td');
  tdAction.classList.add('text-center');
  const btnEdit = cment('span');
  btnEdit.setAttribute('id', 'edit');
  btnEdit.innerHTML = icon.pen(null, null, 'green');
  tdAction.appendChild(btnEdit);
  const btnDelete = cment('span');
  btnDelete.setAttribute('id', 'delt');
  btnDelete.classList.add('ms-1');
  btnDelete.innerHTML = icon.trash(null, null, 'brown');
  tdAction.appendChild(btnDelete);
  trBody.appendChild(tdAction);
  tbody.appendChild(trBody);
  */
  tableExpen.appendChild(tbody);
  tableBox.appendChild(tableExpen);
  data.appendChild(tableBox);
  // end table expen
  
  // close expen
  close.onclick = () => {
    closeExpen(dataExpen, data);
  }

};
// end open tab expen

// view guide
function closeGuide(box, data){
  box.classList.remove('show');
  setTimeout(() => {
    data.innerHTML = '';
  },600);
  document.body.style.overflow = 'auto';
};
async function viewGuide(){
  document.body.style.overflow = 'hidden';
  const data_guide = qs('#data_guide');
  data_guide.classList.add('show');
  const data = qs('#data_guide #data');
  const close = qs('#close_guide');
  await getGuideData(data);
  close.onclick = () => {
    closeGuide(data_guide, data);
  };
};
// end view guide

// confirm payment
function formConPay(data){
  const body = qs('body');
  setTimeout(() => body.style.overflow = 'hidden', 1000);
  const existingForm = qs('#conpay');
  if(existingForm){
    body.removeChild(existingForm);
  }
  const conpay = cment('div');
  conpay.setAttribute('id', 'conpay');
  const form = cment('form');
  form.setAttribute('id', 'formConpay');
  // description
  const rowDescription = cment('div');
  rowDescription.classList.add('row');
  rowDescription.style.padding = '.5rem 1.5rem 0';
  const title = cment('h5');
  title.textContent = 'Perpanjang Langganan';
  rowDescription.appendChild(title);
  const p = cment('p');
  p.style.textAlign = 'justify';
  p.textContent = 'Silakan lakukan pembayaran sesuai dengan jumlah nominal dan data rekening yang tertera pada tabel berikut.';
  rowDescription.appendChild(p);
  const list = cment('table');
  list.style.margin = '1.5rem 0';
  const row1 = cment('tr');
  const desc1 = cment('td');
  desc1.textContent = 'Nominal';
  row1.appendChild(desc1);
  const space1 = cment('td');
  space1.textContent = ':';
  row1.appendChild(space1);
  const itemNominalTF = cment('td');
  itemNominalTF.textContent = 'Rp 54.500';
  row1.appendChild(itemNominalTF);
  list.appendChild(row1);
  const row2 = cment('tr');
  const desc2 = cment('td');
  desc2.textContent = 'Bank';
  row2.appendChild(desc2);
  const space2 = cment('td');
  space2.textContent = ':';
  row2.appendChild(space2);
  const itemBankName = cment('td');
  itemBankName.textContent = 'BRI';
  row2.appendChild(itemBankName);
  list.appendChild(row2);
  const row3 = cment('tr');
  const desc3 = cment('td');
  desc3.textContent = 'Atas Nama';
  row3.appendChild(desc3);
  const space3 = cment('td');
  space3.textContent = ':';
  row3.appendChild(space3);
  const itemBankUsername = cment('td');
  itemBankUsername.textContent = 'Arnadi';
  row3.appendChild(itemBankUsername);
  list.appendChild(row3);
  const row4 = cment('tr');
  const desc4 = cment('td');
  desc4.textContent = 'No.Rekening';
  row4.appendChild(desc4);
  const space4 = cment('td');
  space4.textContent = ':';
  row4.appendChild(space4);
  const itemBankNumber = cment('td');
  itemBankNumber.setAttribute('id', 'itemBankNumber');
  itemBankNumber.textContent = '781901009203530';
  itemBankNumber.onclick = () => {
    navigator.clipboard.writeText(itemBankNumber.textContent).then(function(){
      alertBox({subtitle: 'Nomor Rekening Disalin', message: `Nomor Rekening <strong>${itemBankNumber.textContent}</strong> berhasil disalin.`, close: 'Oke'});
    });
  }
  row4.appendChild(itemBankNumber);
  list.appendChild(row4);
  rowDescription.appendChild(list);
  const p2 = cment('p');
  p2.style.textAlign = 'justify';
  p2.style.marginBottom = '1rem';
  p2.innerHTML = '<strong>Salin Nomor Rekening:</strong><br> klik tepat pada nomor rekening untuk menyalin.';
  rowDescription.appendChild(p2);
  const p3 = cment('p');
  p3.style.textAlign = 'justify';
  p3.style.marginBottom = '1rem';
  p3.textContent = 'Setelah Anda melakukan transfer dengan jumlah nominal ke Bank tujuan seperti yang disebutkan di atas.';
  rowDescription.appendChild(p3);
  const p4 = cment('p');
  p4.style.textAlign = 'justify';
  p4.textContent = 'Jangan lupa untuk konfirmasi dengan mengirimkan screenshot atau bukti transaksi ke kontak WhatsApp Admin App KasirKu.';
  rowDescription.appendChild(p4);
  const divButton = cment('div');
  divButton.setAttribute('id', 'divButton');
  const aLink = cment('a');
  aLink.setAttribute('id', 'sendToWA');
  aLink.setAttribute('href', '#');
  aLink.setAttribute('data-href', 'https://api.whatsapp.com/send?phone=628816849129&text=');
  const button = cment('button');
  button.type = 'submit';
  button.textContent = 'Konfirmasi Pembayaran';
  aLink.appendChild(button);
  divButton.appendChild(aLink);
  rowDescription.appendChild(divButton);
  setTimeout(() => {
    const sendToWA = qs('#sendToWA');
    sendToWA.onclick = (e) => {
      e.preventDefault();
      const progress = qs('.progress');
      const dataProgress = progress.getAttribute('data-progress');
      const dataHref = sendToWA.getAttribute('data-href');
      const title = '*Konfirmasi Transaksi Langganan*\r\n\r\n';
      const ext = atob(dataProgress).split('#');
      const extu = ext[1].split('_');
      const extus = `*Detail*\r\n${atob(atob(extu[0]))}\r\n`;
      const extnu = `${extu[1].replace(/\@/g, ' ')}\r\n`;
      const expay = qs('#conpay table tr td:nth-child(3)').textContent + '\r\n';
      const extnato = `https://data.${ext[2].toLowerCase().replace(/\s/g, '.')}\r\n`;
      const message = encodeURIComponent(`${title}${extus}${extnu}${expay}${extnato}`);
      const whatsappURL = dataHref + message;
      window.open(whatsappURL, '_blank');
      setTimeout(() => {
        body.removeChild(conpay);
        body.style.overflow = 'auto';
      }, 5000);
    }
  }, 0);
  form.appendChild(rowDescription);
  conpay.appendChild(form);
  // close
  const buttonClose = cment('span');
  buttonClose.setAttribute('id', 'close');
  buttonClose.innerHTML = '&times;';
  conpay.appendChild(buttonClose);
  body.appendChild(conpay);
  // buttonClose onclick
  buttonClose.onclick = () => {
    body.removeChild(conpay);
    body.style.overflow = 'auto';
  }
};
// end confirm payment

export {
  getInvoice, formConPay,
  resetFormTransaction,
  resultProductList,
  calculateTotalTransaction,
  searchInvoiceTransaction,
  formEditItemTransaction,
  processDeleteTransaction,
  tabHeader, displayNotFound,
  paymentForm, cancelTransaction,
  handleMenuItems
};