import {qs, qsa, alertBox, error, status} from '../../utils.js';

// load form guide
async function loadFormGuide(form){
  const inputTitle = qs('#title', form);
  const inputGuide = qs('#guide', form);
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
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      inputTitle.value = result.guide.title;
      inputGuide.value = result.guide.description.replace(/<br>/g, "\n");
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end load form guide

// handle input form guide
function handleFormGuide(form){
  const inputTitle = qs('#title', form);
  const inputGuide = qs('#guide', form);
  const errInputTitle = qsa('.err', form)[0];
  const errInputGuide = qsa('.err', form)[1];
  inputTitle.oninput = () => {
    if(inputTitle.value !== ''){
      inputTitle.classList.remove('failed');
      errInputTitle.textContent = '';
    }
  }
  inputGuide.oninput = () => {
    if(inputGuide.value !== ''){
      inputGuide.classList.remove('failed');
      errInputGuide.textContent = '';
    }
  }
};
// end handle input form guide

// submit form guide
async function submitFormGuide(form){
  const inputTitle = qs('#title', form);
  const inputGuide = qs('#guide', form);
  const errInputTitle = qsa('.err', form)[0];
  const errInputGuide = qsa('.err', form)[1];
  inputTitle.classList.remove('failed');
  inputGuide.classList.remove('failed');
  errInputTitle.textContent = '';
  errInputGuide.textContent = '';
  if(inputTitle.value === ''){
    inputTitle.focus();
    inputTitle.classList.add('failed');
    errInputTitle.textContent = 'Masukkan judul panduan!';
    return;
  }else if(inputGuide.value === ''){
    inputGuide.focus();
    inputGuide.classList.add('failed');
    errInputGuide.textContent = 'Masukkan keterangan panduan!';
    return;
  }else{
    try{
      const data = {
        title: inputTitle.value,
        guide: inputGuide.value
      };
      const url = 'process/appset/inup-guide.php';
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
        alertBox({message: result.message});
      }else if(result.status === status.failed){
        alertBox({message: result.message});
      }
    }catch(error){
      alertBox({message: 'Error: ' + error.message});
    }
  }
};
// end submit form guide

export {loadFormGuide, handleFormGuide, submitFormGuide};