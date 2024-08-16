import {checkDeviceType} from '../files/modules/check/device/type.js';
import {initializeProgressBar, initializePWA, checkInstallationStatus, showOnline, showOffline} from '../files/modules/utils.js';
import {qs, qsa, handleFormLogin, accessLogin, handleFormConfirm, accessConfirm, handleFormReplace, accessReplace, handleFormRegister, accessRegister, accessAddShop} from '../files/modules/aut.js';

// check device type
checkDeviceType();
// initialize pwa
initializePWA();

document.addEventListener('DOMContentLoaded', function(){

// progress bar
initializeProgressBar();
// check instalation status
checkInstallationStatus();

// form login
const form_login = qs('#form-login');
if(form_login){
  handleFormLogin(form_login);
  form_login.onsubmit = async (e) => {
    e.preventDefault();
    await accessLogin(form_login);
  }
}
// end form login

// form confirm
const form_confirm = qs('#form-confirm');
if(form_confirm){
  handleFormConfirm(form_confirm);
  form_confirm.onsubmit = async (e) => {
    e.preventDefault();
    await accessConfirm(form_confirm);
  }
}
// end form confirm

// form replace
const form_replace = qs('#form-replace');
if(form_replace){
  handleFormReplace(form_replace);
  form_replace.onsubmit = async (e) => {
    e.preventDefault();
    await accessReplace(form_replace);
  }
}
// end form replace

// form register
const form_register = qs('#form-register');
if(form_register){
  handleFormRegister(form_register);
  form_register.onsubmit = async (e) => {
    e.preventDefault();
    await accessRegister(form_register);
  }
}
// end form register

// form add shop
const form_add_shop = qs('#add-shop');
if(form_add_shop){
  form_add_shop.onsubmit = async (e) => {
    e.preventDefault();
    await accessAddShop(form_add_shop);
  }
}
// end add shop

// status online offlien
window.addEventListener('online', showOnline);
window.addEventListener('offline', showOffline);
// end status online offline

});