import {qs, qsa, cment, capitalize, startSpinner, stopSpinner} from '../utils.js';
import {handleTooltipAlert} from '../aut.js';

// send whtasapp message
function sendWhatsAppMessage(data, viewBox){
  startSpinner();
  const phone = '6281285242366';
  const message = encodeURIComponent(`*${data.title}*\r\n\r\n${data.message}`);
  const whtasappURL = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
  window.open(whtasappURL, '_blank');
  setTimeout(() => stopSpinner(), 5000);
};
// end send whtasapp message

// load whtasapp from
function loadWhatsAppForm(viewBox){
  const existingForm = qs('#formWhatsApp');
  if(existingForm){
    viewBox.removeChild(existingForm);
  }
  const form = cment('form');
  form.setAttribute('id', 'formWhatsApp');
  form.classList.add('mt2');
  // description
  const rowDesc = cment('div');
  rowDesc.classList.add('row', 'mb2');
  const p = cment('p');
  p.textContent = 'Kirim pesan Anda langsung ke kontak WhatsApp admin App KasirKu.';
  rowDesc.appendChild(p);
  form.appendChild(rowDesc);
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
  labelMessage.textContent = 'Isi Pesan';
  rowMessage.appendChild(labelMessage);
  const inputMessage = cment('textarea');
  inputMessage.rows = 7;
  inputMessage.maxLength = 300;
  inputMessage.placeholder = 'Masukkan Isi Pesan';
  rowMessage.appendChild(inputMessage);
  form.appendChild(rowMessage);
  // buttuons
  const rowButtons = cment('div');
  rowButtons.classList.add('row', 'ta-right');
  const buttuonReset = cment('button');
  buttuonReset.classList.add('mr1');
  buttuonReset.type = 'Reset';
  buttuonReset.textContent = 'Reset';
  rowButtons.appendChild(buttuonReset);
  const buttuonSubmit = cment('button');
  buttuonSubmit.type = 'submit';
  buttuonSubmit.textContent = 'Kirim';
  rowButtons.appendChild(buttuonSubmit);
  form.appendChild(rowButtons);
  viewBox.appendChild(form);
  // set oninput
  inputTitle.oninput = () => {
    inputTitle.value = capitalize(inputTitle.value);
  }
  // submit form
  form.onsubmit = (e) => {
    e.preventDefault();
    inputTitle.classList.remove('failed');
    inputMessage.classList.remove('failed');
    if(inputTitle.value === ''){
      inputTitle.focus();
      inputTitle.classList.add('failed');
      return;
    }else if(inputMessage.value === ''){
      inputMessage.focus();
      inputMessage.classList.add('failed');
      return;
    }else{
      const dataValue = {
        title: inputTitle.value,
        message: inputMessage.value
      };
      sendWhatsAppMessage(dataValue, viewBox);
      inputTitle.value = '';
      inputMessage.value = '';
    }
  }
  // set tooltip
  setTimeout(() => {
    const rows = qsa('#formWhatsApp .row');
    rows.forEach((row, i) => {
      let textValue;
      if(i === 1){
        textValue = 'Maksimal judul pesan 70 karakter!';
      }else if(i === 2){
        textValue = 'Maksimal isi pesan 300 karakter!';
      }
      handleTooltipAlert(row, textValue, 'label');
    });
  }, 0);
};
// enb load whtasapp from

export {loadWhatsAppForm};