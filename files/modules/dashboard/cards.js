import {qs, qsa, cment, alertBox, error, status, button, showLoader, startSpinner} from '../utils.js';
import {barcodeScanner} from '../product/barcode-scanner.js';

import {loadDataSales} from './sales.js';
import {loadDataProducts} from './products.js';
import {loadDataStore} from './store.js';
import {loadDataAccount} from './account.js';
import {loadDataGuide} from './guide.js';
import {loadEmailForm} from './email.js';
import {loadWhatsAppForm} from './whatsapp.js';
import {loadDataDevelope} from './develope.js';

// handle sales
function handleSales(viewBox){
  loadDataSales(viewBox);
};
// end handle sales

// handle products
function handleProducts(viewBox){
  startSpinner();
  loadDataProducts(viewBox);
};
// end handle products

// handle store
function handleStore(viewBox){
  loadDataStore(viewBox);
};
// end handle store

// handle account
function handleAccount(viewBox){
  loadDataAccount(viewBox);
};
// end handle account

// handle guide
function handleGuide(viewBox){
  loadDataGuide(viewBox);
};
// end handle guide

// handle email
function handleEmail(viewBox){
  loadEmailForm(viewBox);
};
// end handle email

// handle whatsapp
function handleWhatsapp(viewBox){
  loadWhatsAppForm(viewBox);
};
// end handle whatsapp

// handle develop
function handleDevelope(viewBox){
  loadDataDevelope(viewBox);
};
// end handle develop

// handle view data box
function handleViewDataBox(idx, viewBox){
  switch(idx){
    // sales
    case 0: return handleSales(viewBox); break;
    // products
    case 1: return handleProducts(viewBox); break;
    // store
    case 2: return handleStore(viewBox); break;
    // account
    case 3: return handleAccount(viewBox); break;
    // guide
    // email
    case 4: return handleEmail(viewBox); break;
    // whatsapp
    case 5: return handleWhatsapp(viewBox); break;
    case 6: return handleGuide(viewBox); break;
    // develop
    case 7: return handleDevelope(viewBox); break;
  }
};
// end handle view data box

// view data box
function viewDataBox(idx){
  const viewBox = cment('div');
  viewBox.setAttribute('id', 'viewBox');
  const box = cment('div');
  box.setAttribute('id', 'box');
  const data = cment('div');
  data.setAttribute('id', 'data');
  handleViewDataBox(idx, data);
  box.appendChild(data);
  viewBox.appendChild(box);
  document.body.appendChild(viewBox);
  document.body.style.overflow = 'hidden';
  viewBox.classList.add('show');
};
// end view data box

// handle cards
function handleCards(cards){
  const buttons = qsa('.card-footer button', cards);
  const tab_logout = qs('#tab_logout');
  const tab_title = qs('#tab_title');
  const BUTTON_TARGET = {
    OPEN_SALES: 0,
    OPEN_PRODUCT: 1,
    OPEN_STORE: 2,
    OPEN_ACCOUNT: 3,
    OPEN_EMAIL: 4,
    OPEN_WHATSAPP: 5,
    OPEN_GUIDE: 6,
    OPEN_DEVELOPE: 7
  };
  buttons.forEach((button, i) => {
    switch(i){
      // sales
      case BUTTON_TARGET.OPEN_SALES:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Analitik Penjualan';
          viewDataBox(i);
        }
      break;
      // products
      case BUTTON_TARGET.OPEN_PRODUCT:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Input Data Produk';
          viewDataBox(i);
          const formInputProduct = qs('#formInputProduct');
          if(formInputProduct){
            const inputCode = qs('input#code');
            const inputName = qs('input#name');
            barcodeScanner((codeValue) => {
              if(codeValue === inputCode.value){
                return;
              }
              inputCode.value = codeValue;
              inputName.focus();
            });
          }
        }
      break;
      // store
      case BUTTON_TARGET.OPEN_STORE:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Toko Anda';
          viewDataBox(i);
        }
      break;
      // account
      case BUTTON_TARGET.OPEN_ACCOUNT:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Akun Anda';
          viewDataBox(i);
        }
      break;
      // guide
      case BUTTON_TARGET.OPEN_GUIDE:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Data Panduan';
          viewDataBox(i);
        }
      break;
      // email
      case BUTTON_TARGET.OPEN_EMAIL:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Kontak Email';
          viewDataBox(i);
        }
      break;
      // whatsapp
      case BUTTON_TARGET.OPEN_WHATSAPP:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Kontak WhatsApp';
          viewDataBox(i);
        }
      break;
      // develop
      case BUTTON_TARGET.OPEN_DEVELOPE:
        button.onclick = () => {
          tab_logout.innerHTML = '&times;';
          tab_title.textContent = 'Akses Pengembang';
          viewDataBox(i);
        }
      break;
    }
  });
};
// end handle cards

export {handleCards};