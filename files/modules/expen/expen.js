import {qs, qsa, cment, alertBox, status, error, sortirListNumber, format_number, format_value} from '../utils.js';
import {pen, trash} from '../icons/icon.js';

// insert to table list
function insertToTableList(table, data){
  const tbody = qs('tbody', table);
  const checkRows = qsa('tr td', tbody);
  if(checkRows.length === 1){
    tbody.innerHTML = '';
  }
  const newRow = tbody.insertRow(0);
  const number = newRow.insertCell(0);
  const description = newRow.insertCell(1);
  const nominal = newRow.insertCell(2);
  const edit = newRow.insertCell(3);
  const delt = newRow.insertCell(4);
  number.classList.add('text-center');
  description.classList.add('text-start');
  nominal.classList.add('text-end');
  edit.classList.add('text-center');
  delt.classList.add('text-center');
  number.textContent = 1;
  description.textContent = data.keterangan;
  nominal.textContent = format_number(data.pengeluaran);
  const btnEdit = cment('span');
  btnEdit.setAttribute('id', 'edit');
  btnEdit.innerHTML = pen(null,
   null, 'green');
  edit.appendChild(btnEdit);
  const btnDelete = cment('span');
  btnDelete.setAttribute('id', 'delt');
  btnDelete.innerHTML = trash(null,
   null, 'brown');
  delt.appendChild(btnDelete);
  edit.onclick = () => {
    const dataForm = {
      pengeluaran: nominal.textContent,
      keterangan: description.textContent,
      dataId: data.id_pengeluaran,
      rowel: newRow
    };
    formUpdateExpen(dataForm);
  }
  delt.onclick = () => {
    alertBox({
      title: 'Konfirmasi Hapus',
      message: `<p>Yakin ingin menghapus data ini?</p>* Rp ${nominal.textContent}<br>* ${description.textContent}`,
      close: 'Tidak',
      execute: {
        body: {
          func: deleteExpenData,
          exec: [data.id_pengeluaran, newRow]
        },
        next: 'Hapus'
      }
    });
  }
  sortirListNumber(qsa('tbody tr', table), 'td');
}
// end insert to table list

// delete expen data
async function deleteExpenData(data, rowel){
  try{
    const url = 'process/expen/delete.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({data: data})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      rowel.remove();
      const tbody = qs('#tableExpen tbody');
      const rows = qsa('tr', tbody);
      if(rows.length === 0){
        const trBody = cment('tr');
        const tdNotFound = cment('td');
        tdNotFound.colSpan = 5;
        tdNotFound.classList.add('text-center', 'text-brown', 'py-3');
        tdNotFound.textContent = 'Tidak ada data pengeluaran!';
        trBody.appendChild(tdNotFound);
        tbody.appendChild(trBody);
        return;
      }
      sortirListNumber(rows, 'td');
      alertBox({message: result.message});
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end delete expen data

// submit expen data
async function submitExpenData(data){
  try{
    const url = 'process/expen/input.php';
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
      const table = qs('#tableExpen');
      insertToTableList(table, result.expens);
      qs('input#expen').value = '';
      qs('textarea#desc').value = '';
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end submit expen data

// update expen data
async function updateExpenData(data){
  try{
    const sendData = {
      expen: data.expen,
      description: data.description,
      dataId: data.dataId
    };
    const url = 'process/expen/update.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendData)
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      qs('td:nth-child(2)', data.rowel).textContent = data.description;
      qs('td:nth-child(3)', data.rowel).textContent = data.expen;
      data.boxForm.remove();
      alertBox({message: result.message});
    }else if(result.status === status .failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end update expen data

// form update expen
function formUpdateExpen(data){
  const boxFormEdit = cment('div');
  boxFormEdit.classList.add('boxFormEdit');
  const formEdit = cment('form');
  formEdit.setAttribute('id', 'formEdit');
  const title = cment('h5');
  title.textContent = 'Perbarui Data Pengeluaran';
  formEdit.appendChild(title);
  
  const rowExpen = cment('div');
  rowExpen.classList.add('row');
  const labelExpen = cment('label');
  labelExpen.setAttribute('for', 'expen');
  labelExpen.textContent = 'Pengeluaran';
  rowExpen.appendChild(labelExpen);
  const inputExpen = cment('input');
  inputExpen.setAttribute('type', 'text');
  inputExpen.setAttribute('id', 'expen');
  inputExpen.setAttribute('maxlength', '10');
  inputExpen.setAttribute('placeholder', 'Nominal');
  inputExpen.value = data.pengeluaran;
  rowExpen.appendChild(inputExpen);
  const errExpen = cment('div');
  errExpen.classList.add('err');
  rowExpen.appendChild(errExpen);
  formEdit.appendChild(rowExpen);
  
  const rowDesc = cment('div');
  rowDesc.classList.add('row');
  const inputDesc = cment('textarea')
  inputDesc.setAttribute('id', 'desc');
  inputDesc.setAttribute('maxlength', '100');
  inputDesc.setAttribute('placeholder', 'Keterangan');
  inputDesc.value = data.keterangan;
  rowDesc.appendChild(inputDesc);
  const errDesc = cment('div');
  errDesc.classList.add('err');
  rowDesc.appendChild(errDesc);
  formEdit.appendChild(rowDesc);
  
  const rowButton = cment('div');
  rowButton.classList.add('row', 'text-end');
  const btnCancel = cment('button');
  btnCancel.setAttribute('type', 'reset');
  btnCancel.textContent = 'Batal';
  rowButton.appendChild(btnCancel);
  const btnSubmit = cment('button');
  btnSubmit.setAttribute('type', 'submit');
  btnSubmit.textContent = 'Simpan';
  rowButton.appendChild(btnSubmit);
  formEdit.appendChild(rowButton);
  boxFormEdit.appendChild(formEdit);
  document.body.appendChild(boxFormEdit);
  inputExpen.oninput = () => {
    inputExpen.value = format_value(inputExpen.value);
  }
  formEdit.onsubmit = async (e) => {
    e.preventDefault();
    inputExpen.classList.remove('failed');
    inputDesc.classList.remove('failed');
    errExpen.textContent = '';
    errDesc.textContent = '';
    if(inputExpen.value === ''){
      inputExpen.focus();
      inputExpen.classList.add('failed');
      errExpen.textContent = 'Masukkan nominal pengeluaran!';
      return;
    }else if(inputDesc.value === ''){
      inputDesc.focus();
      inputDesc.classList.add('failed');
      errDesc.textContent = 'Masukkan keterangan pengeluaran!';
      return;
    }else{
      const dataForm = {
        expen: inputExpen.value,
        description: inputDesc.value,
        dataId: data.dataId,
        rowel: data.rowel,
        boxForm: boxFormEdit
      };
      await updateExpenData(dataForm);
    }
  }
  btnCancel.onclick = () => {
    boxFormEdit.remove();
  }
};
// end form update expen

// result expen data
function resultExpenData(result){
  const tbody = qs('#tableExpen tbody');
  if(tbody){
    if(result.status === status.not_ready){
      const trBody = cment('tr');
      const tdNotFound = cment('td');
      tdNotFound.colSpan = 5;
      tdNotFound.classList.add('text-center', 'text-brown', 'py-3');
      tdNotFound.textContent = result.message;
      trBody.appendChild(tdNotFound);
      tbody.appendChild(trBody);
      return;
    }
    if(result.length > 0){
      result.forEach((data, i) => {
        const trBody = cment('tr');
        trBody.dataset.id = data.id_pengeluaran;
        const tdNumber = cment('td');
        tdNumber.classList.add('text-center');
        tdNumber.textContent = i + 1;
        trBody.appendChild(tdNumber);
        
        const tdDescription = cment('td');
        tdDescription.classList.add('text-start');
        tdDescription.textContent = data.keterangan;
        trBody.appendChild(tdDescription);
        
        const tdNominal = cment('td');
        tdNominal.classList.add('text-end');
        tdNominal.textContent = format_number(data.pengeluaran);
        trBody.appendChild(tdNominal);
        
        const tdEdit = cment('td');
        tdEdit.classList.add('text-center');
        const btnEdit = cment('span');
        btnEdit.setAttribute('id', 'edit');
        btnEdit.innerHTML = pen(null, null, 'green');
        tdEdit.appendChild(btnEdit);
        trBody.appendChild(tdEdit);
        const tdDelete = cment('td');
        tdDelete.classList.add('text-center');
        const btnDelete = cment('span');
        btnDelete.setAttribute('id', 'delt');
        btnDelete.innerHTML = trash(null, null, 'brown');
        tdDelete.appendChild(btnDelete);
        trBody.appendChild(tdDelete);
        tbody.appendChild(trBody);
        tdEdit.onclick = () => {
          const dataForm = {
            pengeluaran: tdNominal.textContent,
            keterangan: tdDescription.textContent,
            dataId: data.id_pengeluaran,
            rowel: trBody
          };
          formUpdateExpen(dataForm);
        }
        tdDelete.onclick = () => {
          alertBox({
            title: 'Konfirmasi Hapus',
            message: `<p>Yakin ingin menghapus data ini?</p>* Rp ${tdNominal.textContent}<br>* ${tdDescription.textContent}`,
            close: 'Tidak',
            execute: {
              body: {
                func: deleteExpenData,
                exec: [data.id_pengeluaran, trBody]
              },
              next: 'Hapus'
            }
          });
        }
      });
    }
  }
};
// end result expen data

// get expen data
async function getExpenData(){
  try{
    const url = 'process/expen/load.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({expen: 'expenditure'})
    });
    if(!response.ok){
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      setTimeout(() => {
        resultExpenData(result.expens);
      }, 1000);
    }else if(result.status === status.not_ready){
      resultExpenData(result);
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end expen data

export {submitExpenData, getExpenData};