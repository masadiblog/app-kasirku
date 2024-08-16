import {qs, cment, alertBox, error, status, startSpinner, stopSpinner} from '../utils.js';

// access validation
async function authentication(data, devbox, viewBox, execute){
  startSpinner();
  try{
    const url = 'process/admin/authentication.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({validation: data})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      const existingForm = qs('#accessVerification');
      if(existingForm){
        viewBox.removeChild(existingForm);
      }
      if(devbox !== undefined){
        execute(devbox, viewBox);
      }else{
        execute(viewBox);
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
// end access validation

// access verification
function accessVerification(devbox, viewBox, execute){
  const existingForm = qs('#accessVerification');
  if(existingForm){
    viewBox.removeChild(existingForm);
  }
  const form = cment('form');
  form.setAttribute('id', 'accessVerification');
  form.classList.add('mt1');
  // text
  const text = cment('p');
  text.classList.add('mb3');
  text.textContent = 'Hanya pengembang yang dapat mengakses halaman ini. Jika Anda adalah pengembang, silakan masukkan kode otentikasi.';
  form.appendChild(text);
  // input access
  const rowAccess = cment('div');
  rowAccess.classList.add('row', 'mb2');
  const labelAccess = cment('label');
  labelAccess.textContent = 'Kode Otentikasi';
  rowAccess.appendChild(labelAccess);
  const inputAccess = cment('input');
  inputAccess.type = 'text';
  inputAccess.placeholder = 'Masukkan Kode Otentikasi';
  rowAccess.appendChild(inputAccess);
  form.appendChild(rowAccess);
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
  buttonSubmit.textContent = 'Akses';
  rowButtons.appendChild(buttonSubmit);
  form.appendChild(rowButtons);
  viewBox.appendChild(form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    inputAccess.classList.remove('failed');
    if(inputAccess.value === ''){
      inputAccess.focus();
      inputAccess.classList.add('failed');
      return;
    }else{
      await authentication(inputAccess.value, devbox, viewBox, execute);
    }
  }
};
// end access verification

export {accessVerification};