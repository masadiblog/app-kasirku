import {qs, qsa, cment, alertBox, error, status, button, startSpinner, stopSpinner} from '../utils.js';
import {accessVerification} from './authentication.js';

// process data guide
async function processDataGuide(data){
  startSpinner();
  try{
    const url = 'process/appset/inup-guide.php';
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
      alertBox({message: result.message});
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end process data guide

// form data guide
function formDataGuide(viewBox, data){
  const existingForm1 = qs('#accessVerification');
  const existingForm2 = qs('#formDataGuide');
  if(existingForm1){
    viewBox.removeChild(existingForm1);
  }
  if(existingForm2){
    viewBox.removeChild(existingForm2);
  }
  const form = cment('form');
  form.setAttribute('id', 'formDataGuide');
  const rowTitle = cment('div');
  rowTitle.classList.add('row', 'mb2');
  const labelTitle = cment('label');
  labelTitle.textContent = 'Judul Panduan';
  rowTitle.appendChild(labelTitle);
  const inputTitle = cment('input');
  inputTitle.type = 'text';
  inputTitle.placeholder = 'Masukkan Judul';
  inputTitle.value = data.title;
  rowTitle.appendChild(inputTitle);
  form.appendChild(rowTitle);
  const rowGuide = cment('div');
  rowGuide.classList.add('row', 'mb2');
  const labelGuide = cment('label');
  labelGuide.textContent = 'Data Panduan';
  rowGuide.appendChild(labelGuide);
  const inputGuide = cment('textarea');
  inputGuide.style.height = 70+'vh';
  inputGuide.placeholder = 'Masukkan data pandaduan';
  inputGuide.value = data.description.replace(/<br>/g, "\n");
  rowGuide.appendChild(inputGuide);
  form.appendChild(rowGuide);
  const rowButtons = cment('div');
  rowButtons.classList.add('row', 'ta-right');
  const buttonReset = cment('button');
  buttonReset.classList.add('mr1');
  buttonReset.type = 'reset';
  buttonReset.textContent = 'Reset';
  rowButtons.appendChild(buttonReset);
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.textContent = 'Simpan';
  rowButtons.appendChild(buttonSubmit);
  form.appendChild(rowButtons);
  viewBox.appendChild(form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    inputTitle.classList.remove('failed');
    inputGuide.classList.remove('failed');
    if(inputTitle.value === ''){
      inputTitle.focus();
      inputTitle.classList.add('failed');
      return;
    }else if(inputGuide.value === ''){
      inputGuide.focus();
      inputGuide.classList.add('failed');
      return;
    }else{
      const dataValue = {
        title: inputTitle.value,
        guide: inputGuide.value
      };
      await processDataGuide(dataValue);
    }
  }
};
// end form data guide

// get dara guide
async function getDataGuide(viewBox){
  startSpinner();
  try{
    const url = 'process/appset/load.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({data: 'guide'})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      formDataGuide(viewBox, result.guide);
    }else if(result.status === status.not_ready){
      stopSpinner();
      formDataGuide(viewBox, result.guide);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: 'Error: ' + error.message});
  }
};
// end get dara guide

// load data guide
function loadDataGuide(viewBox){
  accessVerification(undefined, viewBox, getDataGuide);
};
// end load data guide

export {loadDataGuide};