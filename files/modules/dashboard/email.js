import {qs, qsa, cment, alertBox, error, status, startSpinner, stopSpinner} from '../utils.js';
import {handleTooltipAlert} from '../aut.js';

// send email message
async function sendEmailMessage(data){
  startSpinner();
  try{
    const url = 'process/message/email.php';
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
// end send email message

// function load email form
function loadEmailForm(viewBox){
  const existingForm = qs('#formEmail');
  if(existingForm){
    viewBox.removeChild(existingForm);
  }
  const form = cment('form');
  form.setAttribute('id', 'formEmail');
  form.setAttribute('autocomplete', 'off');
  form.classList.add('mt2');
  // description
  const rowDesc = cment('div');
  rowDesc.classList.add('row', 'mb2');
  const p = cment('p');
  p.textContent = 'Kirim pesan Anda langsung ke kontak Email admin App KasirKu. Jika ini tidak bekerja, Anda dapat menghubungi via kontak WhatsApp.';
  rowDesc.appendChild(p);
  form.appendChild(rowDesc);
  // name
  const rowName = cment('div');
  rowName.classList.add('row', 'mb2');
  const labelName = cment('label');
  labelName.textContent = 'Nama Anda';
  rowName.appendChild(labelName);
  const inputName = cment('input');
  inputName.type = 'text';
  inputName.maxLength = 20;
  inputName.placeholder = 'Masukkan Nama Anda';
  rowName.appendChild(inputName);
  form.appendChild(rowName);
  // email
  const rowEmail = cment('div');
  rowEmail.classList.add('row', 'mb2');
  const labelEmail = cment('label');
  labelEmail.textContent = 'Email Anda';
  rowEmail.appendChild(labelEmail);
  const inputEmail = cment('input');
  inputEmail.type = 'email';
  inputEmail.maxLength = 50;
  inputEmail.placeholder = 'Masukkan Email Anda';
  rowEmail.appendChild(inputEmail);
  form.appendChild(rowEmail);
  // title
  const rowTitle = cment('div');
  rowTitle.classList.add('row', 'mb2');
  const labelTitle = cment('label');
  labelTitle.textContent = 'Judul Pesan';
  rowTitle.appendChild(labelTitle);
  const inputTitle = cment('input');
  inputTitle.type = 'text';
  inputTitle.maxLength = 70;
  inputTitle.placeholder = 'Masukkan Judul Pesan';
  rowTitle.appendChild(inputTitle);
  form.appendChild(rowTitle);
  // message
  const rowMessage = cment('div');
  rowMessage.classList.add('row', 'mb2');
  const labelMessage = cment('label');
  labelMessage.textContent = 'Pesan Email';
  rowMessage.appendChild(labelMessage);
  const inputMessage = cment('textarea');
  inputMessage.rows = 7;
  inputMessage.maxLength = 300;
  inputMessage.placeholder = 'Masukkan Pesan Email';
  rowMessage.appendChild(inputMessage);
  form.appendChild(rowMessage);
  // buttons
  const rowButtons = cment('div');
  rowButtons.classList.add('row', 'ta-right');
  const buttonReset = cment('button');
  buttonReset.classList.add('mr1');
  buttonReset.type = 'reset';
  buttonReset.textContent = 'Reset';
  rowButtons.appendChild(buttonReset);
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.textContent = 'Kirim';
  rowButtons.appendChild(buttonSubmit);
  form.appendChild(rowButtons);
  viewBox.appendChild(form);
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    inputName.classList.remove('failed');
    inputEmail.classList.remove('failed');
    inputTitle.classList.remove('failed');
    inputMessage.classList.remove('failed');
    if(inputName.value === ''){
      inputName.focus();
      inputName.classList.add('failed');
      return;
    }else if(inputEmail.value === ''){
      inputEmail.focus();
      inputEmail.classList.add('failed');
      return;
    }else if(inputTitle.value === ''){
      inputTitle.focus();
      inputTitle.classList.add('failed');
      return;
    }else if(inputMessage.value === ''){
      inputMessage.focus();
      inputMessage.classList.add('failed');
      return;
    }else{
      const dataValue = {
        name: inputName.value,
        email: inputEmail.value,
        title: inputTitle.value,
        message: inputMessage.value
      };
      await sendEmailMessage(dataValue);
    }
  }
  setTimeout(() => {
    const rows = qsa('#formEmail .row');
    rows.forEach((row, i) => {
      let textValue;
      if(i === 1){
        textValue = 'Maksimal nama 20 karakter!';
      }else if(i === 2){
        textValue = 'Maksimal email 50 karakter!';
      }else if(i === 3){
        textValue = 'Maksimal judul 70 karakter!';
      }else if(i === 4){
        textValue = 'Maksimal pesan 300 karakter!';
      }
      handleTooltipAlert(row, textValue, 'label');
    });
  }, 0);
};
// end function load email form

export {loadEmailForm};