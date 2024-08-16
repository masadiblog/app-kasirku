import * as kasirku from './modules/module.js';
const {qs, qsa, aut, ui, utils, icon, scan, intrans, lotrans} = kasirku;

// initilize pwa
utils.initializePWA();

utils.startSpinner();

document.addEventListener('DOMContentLoaded', function(){

// progress bar
utils.initializeProgressBar();
// check instalation status
utils.checkInstallationStatus();
// verification member status
utils.verifyMemberStatus();

const formTransaction = qs('form#transaction');
const resetButton = qs('#reset', formTransaction);
const subTransButton = qs('#subTrans', formTransaction)
const newTransButton = qs('#transbar');
const paymentButton = qs('#btnBayar');
const canTransButton = qs('#canTrans');
const tableTransaction = qs('#table-transaction');
const inputName = qs('input#nama', formTransaction);
const inputCode = qs('input#kode', formTransaction);
const inputCheckbox = qs('input#checkbox', formTransaction);
const inputPrice = qs('input#harga', formTransaction);
const inputQty = qs('input#jumlah', formTransaction);
const inputDiscount = qs('input#diskon', formTransaction);
const invoice = qs('.transbar .nofak');
const total = qs('#divTotal');
const tabTransaction = qs('#tab_transaction');
const tabGuide = qs('#tab_guide');
const tabLogout = qs('#tab_logout');

// input transaction
if(formTransaction){
  // auto input with scanning
  scan.barcodeScanner((codeValue) => {
    inputName.blur();
    inputCode.classList.remove('failed');
    if(!invoice.textContent.match(/[0-9]/)){ return;
    }else if(codeValue === inputCode.value){
      if(inputCheckbox.checked === true){
        setTimeout(() => inputCode.value = '', 1500);
      }else{
        inputCode.classList.add('failed');
      }
      return;
    }
    inputCode.value = codeValue;
    intrans.loadAutoInputTransaction(invoice.textContent, codeValue, inputCheckbox.checked);
  });
  // input validation
  inputCheckbox.checked = localStorage.getItem('checked') === 'true';
  inputCheckbox.onchange = () => {
    inputName.focus();
    inputCheckbox.setAttribute('id', '');
    setTimeout(() => {
      inputCheckbox.setAttribute('id', 'checkbox');
    }, 5000);
    if(inputCheckbox.checked){
      localStorage.setItem('checked', 'true');
      utils.notificationAlert('Duplikasi data transaksi diaktifkan', 'info');
    }else{
      localStorage.setItem('checked', 'false');
      utils.notificationAlert('Duplikasi data transaksi dinonaktifkan', 'danger');
    }
  }
  inputCode.onfocus = () => {
    const scanBoxActive = qs('#scanBox').getAttribute('class');
    if(scanBoxActive === 'active'){
      utils.alertBox({message: 'Silakan mulai scan produk!'});
    }else{
      utils.alertBox({message: 'Silakan klik tombol "Mulai Scan".'});
    }
  }
  inputPrice.oninput = () => {
    inputPrice.value = utils.format_value(inputPrice.value);
  }
  inputQty.oninput = () => {
    inputQty.value = utils.format_value(inputQty.value);
    if(inputQty.value === ''){
      inputDiscount.value = '';
      inputDiscount.setAttribute('readonly', '');
    }else{
      inputDiscount.removeAttribute('readonly');
    }
  }
  inputDiscount.oninput = () => {
    inputDiscount.value = utils.format_value(inputDiscount.value);
  }
  // load product list on input name
  inputName.oninput = intrans.debounce(async () => {
    try{
      await intrans.autoLoadProductList(inputName, invoice, transbar);
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }, 300);
  // manual input with submit form
  resetButton.innerHTML = icon.refresh(null, null, 'white');
  subTransButton.innerHTML = `${icon.plus(null, null, 'white')}`;
  subTransButton.onclick = () => {
    if(inputName.value === '' && !invoice.textContent.match(/[0-9]/)){
      utils.alertBox({message: 'Tidak ada data yang perlu diproses!<br>Silakan klik "Transaksi Baru".'});
      return;
    }
  }
  formTransaction.onsubmit = async (e) => {
    e.preventDefault();
    inputName.classList.remove('failed');
    inputCode.classList.remove('failed');
    inputPrice.classList.remove('failed');
    inputQty.classList.remove('failed');
    if(inputQty.value === '0'){
      inputQty.focus();
      inputQty.select();
      return;
    }else{
      await intrans.loadManualInputTransaction(formTransaction, invoice, transbar);
    }
  }
  resetButton.onclick = () => {
    if(inputName.value === '' && inputCode.value === ''){
      utils.alertBox({message: 'Tidak ada input data untuk direset!'});
      return;
    }
    ui.resetFormTransaction(formTransaction, 'manual');
  }
}
// end input transaction

// get invoice
if(newTransButton){
  newTransButton.onclick = () => {
    ui.getInvoice(invoice, formTransaction, newTransButton);
  }
}
// end get invoice

// process payment
if(paymentButton){
  paymentButton.onclick = () => {
    if(!invoice.textContent.match(/[0-9]/) || total.textContent === '0'){
      utils.alertBox({message: 'Tidak ada pembayaran yang perlu diproses!'});
      return;
    }
    const data = {
      invoice: invoice.textContent,
      total: total.textContent
    };
    ui.paymentForm(data);
  }
}
// end process payment

// cancel transaction
if(canTransButton){
  canTransButton.onclick = () => {
    const tabData = qsa('table tr td', tableTransaction);
    if(!invoice.textContent.match(/[0-9]/) || tabData.length < 7){
      utils.alertBox({message: 'Tidak ada transaksi yang perlu dibatalkan!'});
      return;
    }
    utils.alertBox({
      title: 'Batalkan Transaksi',
      message: 'Yakin akan membatalkan transaksi ini?',
      close: 'Tidak',
      execute: {
        body: {
          func: ui.cancelTransaction,
          exec: [invoice.textContent, qsa('table tbody tr', tableTransaction)]
        },
        next: 'Ya, Batalkan'
      }
    });
  }
}
// end cancel transaction

// search invoice transaction
const seaTransButton = qs('#seaTransButton');
if(seaTransButton){
  seaTransButton.innerHTML = icon.search(null, null, 'white');
  seaTransButton.onclick = () => {
    const searchBox = qs('#searchBox');
    const inputSearch = qs('#search');
    searchBox.classList.add('active');
    setTimeout(() => {
      inputSearch.focus();
    }, 500);
    inputSearch.oninput = () => {
      if(!inputSearch.value.match(/[0-9]+$/g)){
        inputSearch.value = inputSearch.value.substr(0, 0);
        return;
      }
    }
    inputSearch.onkeypress = async (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        // verification member status
        const distance = document.body.dataset.distance;
        if(distance === '0'){
          const data = atob(qs('body').getAttribute('data-name'));
          utils.alertBox({
            title: 'Langganan Anda Habis',
            subtitle: 'Perpanjang Langganan Sekarang!',
            message: '<p>Untuk saat ini Anda tidak dapat menggunakan fitur pencarian transaksi.</p><p>Paket berlangganan Anda telah habis. Silakan perpanjang langganan Anda sekarang agar dapat terus menikmati semua fitur yang tersedia.</p>',
            close: 'Tidak',
            execute: {
              body: {
                func: ui.formConPay,
                exec: [data]
              },
              next: 'Ya, Perpanjang'
            }
          });
          inputSearch.blur();
          return;
        }
        const d = new Date();
        const y = d.getFullYear();
        let m = d.getMonth() + 1;
        let checkValue;
        if(m < 10){
          checkValue = y + '0' + m;
        }else{
          checkValue = y + m;
        }
        if(inputSearch.value === checkValue){
          utils.alertBox({message: 'Minimal 4 angka terakhir!'});
          return;
        }
        if(inputSearch.value.length < 13){
          if(inputSearch.value.match(checkValue)){
            utils.alertBox({message: 'Minimal 4 angka terakhir!'});
            return;
          }else if(inputSearch.value.match(y)){
            utils.alertBox({message: 'Minimal 4 angka terakhir!'});
            return;
          }
        }
        if(inputSearch.value.length > 3){
          await ui.searchInvoiceTransaction(inputSearch, searchBox);
        }else{
          utils.alertBox({message: 'Minimal 4 angka terakhir!'});
        }
      }
    }
    const closeBox = qs('#closeBox');
    closeBox.onclick = () => {
      inputSearch.value = '';
      searchBox.classList.remove('active');
    }
  }
}
// end search invoice transaction

// load transaction & display transaction
if(tableTransaction){
  lotrans.loadTransactions(tableTransaction, invoice);
}
// end load transaction & display transaction


const menuButton = qs('#menuButton');
if(menuButton){
  const menuBox = qs('#menuBox');
  menuButton.innerHTML = icon.bars();
  menuButton.onclick = () => {
    qs('.tabtrans').style.overflow = 'hidden';
    if(scan.checkCameraActive()){
      return;
    }
    menuBox.classList.add('active');
    const listItems = qsa('ul li', menuBox);
    ui.handleMenuItems(listItems, menuBox);
    const closeMenu = qs('#closeMenu');
    closeMenu.innerHTML = icon.bars();
    closeMenu.onclick = () => {
      qs('.tabtrans').style.overflow = 'auto';
      menuBox.classList.remove('active');
    }
  }
}

// status online offlien
window.addEventListener('online', utils.showOnline);
window.addEventListener('offline', utils.showOffline);
// end status online offline

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistration().then((registration) => {
    registration.update();
  });
}

utils.screenLoader();
utils.stopSpinner();

});