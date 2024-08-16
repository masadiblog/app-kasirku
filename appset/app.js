import {qs, qsa, alertBox, error, status} from '../files/modules/utils.js';
import {loadFormGuide, handleFormGuide, submitFormGuide} from '../files/modules/appset/guide/input.js';

document.addEventListener('DOMContentLoaded', function(){

const formGuide = qs('#form-guide');
if(formGuide){
  loadFormGuide(formGuide);
  handleFormGuide(formGuide);
  formGuide.onsubmit = async (e) => {
    e.preventDefault();
    await submitFormGuide(formGuide);
  }
}

});