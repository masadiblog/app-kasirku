import {qs, qsa, cment, capitalize, alertBox, status, error, startSpinner, stopSpinner} from '../utils.js';
import {accessVerification} from './authentication.js';
import {search, eye} from '../icons/icon.js';

// table list data member
function tableListDataMember(data, viewBox){
  const existing = qs('#tableBox');
  if(existing){
    existing.remove();
  }
  const tableBox = cment('div');
  tableBox.setAttribute('id', 'tableBox');
  const table = cment('table');
  // thead
  const thead = cment('thead');
  const trHead = cment('tr');
  // th number
  const thNumber = cment('th');
  thNumber.setAttribute('id', 'thNumber');
  thNumber.textContent = 'No';
  trHead.appendChild(thNumber);
  // th store
  const thStore = cment('th');
  thStore.setAttribute('id', 'thStore');
  thStore.textContent = 'Toko';
  trHead.appendChild(thStore);
  // th status
  const thStatus = cment('th');
  thStatus.setAttribute('id', 'thStatus');
  thStatus.textContent = 'Status';
  trHead.appendChild(thStatus);
  // th action
  const thAction = cment('th');
  thAction.setAttribute('id', 'thAction');
  thAction.textContent = 'Aksi';
  trHead.appendChild(thAction);
  thead.appendChild(trHead);
  table.appendChild(thead);
  //tbody
  const tbody = cment('tbody');
  bodyListDataMember(data, tbody);
  table.appendChild(tbody);
  tableBox.appendChild(table);
  viewBox.appendChild(tableBox);
};
// end table list data member

// body list data member
function bodyListDataMember(data, tbody){
  if(data.key !== undefined && data.key === true){
    const trBody = cment('tr');
    const tdMessage = cment('td');
    tdMessage.colSpan = 4;
    tdMessage.style.padding = '2rem 1rem';
    tdMessage.classList.add('ta-center');
    tdMessage.textContent = data.message;
    trBody.appendChild(tdMessage);
    tbody.appendChild(trBody);
  }else{
    data.forEach((store, i) => {
      const trBody = cment('tr');
      // td number
      const tdNumber = cment('td');
      tdNumber.setAttribute('id', 'tdNumber');
      tdNumber.textContent = i + 1;
      trBody.appendChild(tdNumber);
      // td store
      const tdStore = cment('td');
      tdStore.setAttribute('id', 'tdStore');
      tdStore.textContent = store.name;
      trBody.appendChild(tdStore);
      // td status
      const tdStatus = cment('td');
      tdStatus.setAttribute('id', 'tdStatus');
      tdStatus.textContent = store.status;
      trBody.appendChild(tdStatus);
      // td action
      const tdAction = cment('td');
      tdAction.setAttribute('id', 'tdAction');
      tdAction.dataset.list = store.list;
      tdAction.textContent = 'Detail';
      trBody.appendChild(tdAction);
      tbody.appendChild(trBody);
      tdAction.onclick = () => {
        const list = tdAction.dataset.list;
        detailDataMember(list, tdStatus, viewBox);
      }
    });
  }
};
// end body list data member

// load list data member
async function loadListDataMember(viewBox, input){
  startSpinner();
  try{
    let url;
    if(input === undefined){
      url = 'process/appset/member/load.php';
    }else{
      url = 'process/appset/member/search.php';
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({input: input})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      tableListDataMember(result.data, viewBox);
    }else if(result.status === status.not_ready){
      stopSpinner();
      tableListDataMember(result.data, viewBox);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: `Error: ${error.message}`});
  }
};
// end load list data member

// update status member
async function updateStatusMember(input, contex1, contex2){
  startSpinner();
  try{
    const url = 'process/appset/member/update.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({input: input})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      contex1.textContent = result.data.status;
      contex2[0].textContent = result.data.status;
      contex2[1].textContent = result.data.start;
      contex2[2].textContent = result.data.limit;
      alertBox({
        message: `
          <p>${result.data.notification}</p>
          <textarea id="copyMessage" style="width:100%;height:150px;padding:1rem" readonly>${result.data.message}</textarea>
        `
      });
      const copyMessage = qs('#copyMessage');
      copyMessage.onclick = () => {
        navigator.clipboard.writeText(copyMessage.textContent).then(function(){
          alertBox({message: result.data.copied, close: 'Oke'});
        });
      }
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: `Error: ${error.message}`});
  }
};
// end update status member

// table detail data member
function tableDetailDataMember(data, contex1, viewBox){
  const existing = qs('#tableDetail');
  if(existing){
    existing.remove();
  }
  const tableDetail = cment('div');
  tableDetail.setAttribute('id', 'tableDetail');
  const tableBox = cment('div');
  tableBox.setAttribute('id', 'tableBox');
  const table = cment('table');
  const tbody = cment('tbody');
  if(data.key === '0'){
    const td = cment('td');
    td.style.padding = '2rem 1rem';
    td.style.textAlign = 'center';
    td.style.width = '100%';
    td.textContent = data.message;
    tbody.appendChild(td);
  }else{
    // name
    const trName = cment('tr');
    const tdName = cment('td');
    tdName.textContent = 'Nama';
    trName.appendChild(tdName);
    const tdSpace1 = cment('td');
    tdSpace1.textContent = ':';
    trName.appendChild(tdSpace1);
    const tdNameValue = cment('td');
    tdNameValue.textContent = data.name;
    trName.appendChild(tdNameValue);
    tbody.appendChild(trName);
    // status
    const trStatus = cment('tr');
    const tdStatus = cment('td');
    tdStatus.textContent = 'Status';
    trStatus.appendChild(tdStatus);
    const tdSpace2 = cment('td');
    tdSpace2.textContent = ':';
    trStatus.appendChild(tdSpace2);
    const tdStatusValue = cment('td');
    tdStatusValue.setAttribute('id', 'tdStatusValue');
    tdStatusValue.textContent = data.status;
    trStatus.appendChild(tdStatusValue);
    tbody.appendChild(trStatus);
    // contact
    const trContact = cment('tr');
    const tdContact = cment('td');
    tdContact.textContent = 'Kontak';
    trContact.appendChild(tdContact);
    const tdSpace3 = cment('td');
    tdSpace3.textContent = ':';
    trContact.appendChild(tdSpace3);
    const tdContactValue = cment('td');
    tdContactValue.textContent = data.contact;
    trContact.appendChild(tdContactValue);
    tbody.appendChild(trContact);
    // address
    const trAddress = cment('tr');
    const tdAddress = cment('td');
    tdAddress.textContent = 'Alamat';
    trAddress.appendChild(tdAddress);
    const tdSpace4 = cment('td');
    tdSpace4.textContent = ':';
    trAddress.appendChild(tdSpace4);
    const tdAddressValue = cment('td');
    tdAddressValue.textContent = data.address;
    trAddress.appendChild(tdAddressValue);
    tbody.appendChild(trAddress);
    // start
    const trStart = cment('tr');
    const tdStart = cment('td');
    tdStart.textContent = 'Mulai';
    trStart.appendChild(tdStart);
    const tdSpace5 = cment('td');
    tdSpace5.textContent = ':';
    trStart.appendChild(tdSpace5);
    const tdStartValue = cment('td');
    tdStartValue.setAttribute('id', 'tdStartValue');
    tdStartValue.textContent = data.start;
    trStart.appendChild(tdStartValue);
    tbody.appendChild(trStart);
    // limit
    const trLimit = cment('tr');
    const tdLimit = cment('td');
    tdLimit.textContent = 'Akhir';
    trLimit.appendChild(tdLimit);
    const tdSpace6 = cment('td');
    tdSpace6.textContent = ':';
    trLimit.appendChild(tdSpace6);
    const tdLimitValue = cment('td');
    tdLimitValue.setAttribute('id', 'tdLimitValue');
    tdLimitValue.textContent = data.limit;
    trLimit.appendChild(tdLimitValue);
    tbody.appendChild(trLimit);
    // register
    const trRegister = cment('tr');
    const tdRegister = cment('td');
    tdRegister.textContent = 'Registrasi';
    trRegister.appendChild(tdRegister);
    const tdSpace7 = cment('td');
    tdSpace7.textContent = ':';
    trRegister.appendChild(tdSpace7);
    const tdRegisterValue = cment('td');
    tdRegisterValue.textContent = data.register;
    trRegister.appendChild(tdRegisterValue);
    tbody.appendChild(trRegister);
  }
  table.appendChild(tbody);
  tableBox.appendChild(table);
  tableDetail.appendChild(tableBox);
  // buttons
  const footer = cment('div');
  footer.setAttribute('id', 'footer');
  const cancelButton = cment('button');
  cancelButton.setAttribute('id', 'cancelButton');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Tutup';
  footer.appendChild(cancelButton);
  const updateButton = cment('button');
  updateButton.setAttribute('id', 'updateButton');
  updateButton.dataset.list = data.list;
  updateButton.type = 'button';
  updateButton.textContent = 'Perbarui Status';
  footer.appendChild(updateButton)
  tableDetail.appendChild(footer);
  cancelButton.onclick = () => {
    tableDetail.remove();
  }
  updateButton.onclick = async () => {
    const list = updateButton.dataset.list;
    await updateStatusMember(list, contex1, [qs('#tdStatusValue'), qs('#tdStartValue'), qs('#tdLimitValue')]);
  }
  viewBox.appendChild(tableDetail);
};
// end table detail data member

// detail data member
async function detailDataMember(input, contex1, viewBox){
  startSpinner();
  try{
    const url = 'process/appset/member/detail.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({input: input})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      tableDetailDataMember(result.data, contex1, viewBox);
    }else if(result.status === status.not_ready){
      stopSpinner();
      tableDetailDataMember(result.data, contex1, viewBox);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: `Error: ${error.message}`});
  }
};
// end detail data member

// load data member
async function viewDataMember(devBox, viewBox){
  const form = cment('form');
  const col = cment('div');
  col.classList.add('col');
  const inputSearch = cment('input');
  inputSearch.type = 'search';
  inputSearch.placeholder = 'Ketik Nama Toko';
  col.appendChild(inputSearch);
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.innerHTML = search(null, null, 'white');
  col.appendChild(buttonSubmit);
  form.appendChild(col);
  devBox.appendChild(form);
  inputSearch.oninput = () => {
    if(inputSearch.value !== ''){
      inputSearch.value = capitalize(inputSearch.value.replace(/https\:\/\/data\./g, '').replace(/\./g, ' '));
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    inputSearch.classList.remove('failed');
    if(inputSearch.value === ''){
      inputSearch.focus();
      inputSearch.classList.add('failed');
      return;
    }else{
      loadListDataMember(viewBox, inputSearch.value);
    }
  }
  await loadListDataMember(viewBox);
};
// end load data member

// load data develope
function loadDataDevelope(viewBox){
  const devBox = cment('div');
  devBox.setAttribute('id', 'devBox');
  accessVerification(devBox, viewBox, viewDataMember);
  viewBox.appendChild(devBox);
  
};
// end load data develope

export {loadDataDevelope};