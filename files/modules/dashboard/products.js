import {qs, qsa, cment, alertBox, error} from '../utils.js';
import {loadTableProducts} from '../product/load.js';
import {handleFormInputProduct, processInputProduct} from '../product/input.js';
import {searchProducts, debounce} from '../product/search.js';

// form input product
function formInputProduct(viewBox){
  const form = cment('form');
  form.setAttribute('id', 'formInputProduct');
  // row one
  const rowOne = cment('div');
  rowOne.classList.add('row');
  const colRowOne = cment('div');
  colRowOne.classList.add('col');
  // div code
  const divCode = cment('div');
  const labelCode = cment('label');
  labelCode.setAttribute('for', 'code');
  labelCode.textContent = 'Kode';
  divCode.appendChild(labelCode);
  // input code
  const inputCode = cment('input');
  inputCode.setAttribute('type', 'text');
  inputCode.setAttribute('id', 'code');
  divCode.appendChild(inputCode);
  colRowOne.appendChild(divCode);
  // div name
  const divName = cment('div');
  divName.classList.add('col-name');
  const labelName = cment('labe');
  labelName.setAttribute('for', 'name');
  labelName.textContent = 'Nama';
  divName.appendChild(labelName);
  const inputName = cment('input');
  inputName.setAttribute('type', 'text');
  inputName.setAttribute('id', 'name');
  divName.appendChild(inputName);
  colRowOne.appendChild(divName);
  rowOne.appendChild(colRowOne);
  form.appendChild(rowOne);
  // row two
  const rowTwo = cment('div');
  rowTwo.classList.add('row');
  const colRowTwo = cment('div');
  colRowTwo.classList.add('col');
  // div capital
  const divCapital = cment('div');
  divCapital.classList.add('col-capital');
  const labelCapital = cment('label');
  labelCapital.setAttribute('for', 'capital');
  labelCapital.textContent = 'Modal';
  divCapital.appendChild(labelCapital);
  const inputCapital = cment('input');
  inputCapital.setAttribute('type', 'text');
  inputCapital.setAttribute('id', 'capital');
  divCapital.appendChild(inputCapital);
  colRowTwo.appendChild(divCapital);
  // div price
  const divPrice = cment('div');
  divPrice.classList.add('col-price');
  const labelPrice = cment('label');
  labelPrice.setAttribute('for', 'price');
  labelPrice.textContent = 'Harga';
  divPrice.appendChild(labelPrice);
  const inputPrice = cment('input');
  inputPrice.setAttribute('type', 'text');
  inputPrice.setAttribute('id', 'price');
  divPrice.appendChild(inputPrice);
  colRowTwo.appendChild(divPrice);
  // div stock
  const divStock = cment('div');
  const labelStock = cment('label');
  labelStock.setAttribute('for', 'stock');
  labelStock.textContent = 'Stok';
  divStock.appendChild(labelStock);
  const inputStock = cment('input');
  inputStock.setAttribute('type', 'text');
  inputStock.setAttribute('id', 'stock');
  divStock.appendChild(inputStock);
  colRowTwo.appendChild(divStock);
  rowTwo.appendChild(colRowTwo);
  form.appendChild(rowTwo);
  // row three
  const rowThree = cment('div');
  rowThree.classList.add('row', 'mt1', 'ta-right');
  const buttonslReset = cment('button');
  buttonslReset.classList.add('mr1');
  buttonslReset.setAttribute('type', 'reset');
  buttonslReset.setAttribute('id', 'reset');
  buttonslReset.textContent = 'Reset';
  rowThree.appendChild(buttonslReset);
  const buttonslSubmit = cment('button');
  buttonslSubmit.setAttribute('type', 'submit');
  buttonslSubmit.setAttribute('id', 'submit');
  buttonslSubmit.textContent = 'Simpan';
  rowThree.appendChild(buttonslSubmit);
  form.appendChild(rowThree);
  viewBox.appendChild(form);
  handleFormInputProduct(form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    inputCode.classList.remove('failed');
    inputName.classList.remove('failed');
    inputCapital.classList.remove('failed');
    inputPrice.classList.remove('failed');
    inputStock.classList.remove('failed');
    if(inputName.value === ''){
      inputName.focus();
      inputName.classList.add('failed');
      return;
    }else if(inputCapital.value === ''){
      inputCapital.focus();
      inputCapital.classList.add('failed');
      return;
    }else if(inputPrice.value === ''){
      inputPrice.focus();
      inputPrice.classList.add('failed');
      return;
    }else{
      const dataInput = {
        code: inputCode.value,
        name: inputName.value,
        capital: inputCapital.value,
        price: inputPrice.value,
        stock: inputStock.value
      };
      await processInputProduct(dataInput, form);
    }
  }
  formSearchProduct(viewBox);
};
// end form input product

  // search product
function formSearchProduct(viewBox){
  const rowFormSearchProduct = cment('div');
  rowFormSearchProduct.classList.add('row');
  const formSearchProduct = cment('form');
  formSearchProduct.setAttribute('id', 'formSearchProduct');
  const inputSearch = cment('input');
  inputSearch.classList.add('ta-center');
  inputSearch.setAttribute('type', 'search');
  inputSearch.setAttribute('id', 'search');
  inputSearch.setAttribute('placeholder', 'Kode / Nama Produk');
  formSearchProduct.appendChild(inputSearch);
  rowFormSearchProduct.appendChild(formSearchProduct);
  viewBox.appendChild(rowFormSearchProduct);
  inputSearch.oninput = debounce(async (e) => {
    e.preventDefault();
    try{
      await searchProducts(inputSearch.value);
    }catch(error){
      alertBox({message: 'Masalah: ' + error.message});
    }
  }, 300);
  // table products
  setTimeout(() => {
    const tableBox = cment('div');
    tableBox.setAttribute('id', 'tableBox');
    loadTableProducts(tableBox);
    viewBox.appendChild(tableBox);
  }, 500);
};
// end form search product

// load data products
function loadDataProducts(viewBox){
  formInputProduct(viewBox);
};
// load data products

//export {loadDataProducts, formInputProduct, formSearchProduct};
export {loadDataProducts};