import {qs, qsa, cment, speak, initializeProgressBar, previousPage, audioPlaying, notificationAlert, showOnline, showOffline, format_number, capitalize, alertBox, button, status, error, startSpinner, stopSpinner, screenLoader} from '../files/modules/utils.js';
import {arrowLeft, signout} from '../files/modules/icons/icon.js';
import {logout} from '../files/modules/aut.js';
import {handleCards} from '../files/modules/dashboard/cards.js';

startSpinner();

document.addEventListener('DOMContentLoaded', function(){

// progress bar
initializeProgressBar();

// toolbar
const toolbar = qs('.toolbar');
if(toolbar){
  qs('#tab_back').innerHTML = arrowLeft(16, 16, 'white');
  qs('#tab_logout').innerHTML = signout(16, 16, 'white');
}
// end toolbar

// cards
const cards = qs('.cards');
if(cards){
  handleCards(cards);
}
// end cards

// tab back page
const tab_back = qs('#tab_back');
if(tab_back){
  tab_back.onclick = () => {
    previousPage(tab_back, 1);
  }
}
// end tab back page

// tab logout
const tab_logout = qs('#tab_logout');
if(tab_logout){
  tab_logout.onclick = () => {
    logout(tab_logout);
  }
}
// end tab logout

// status online offlien
window.addEventListener('online', showOnline);
window.addEventListener('offline', showOffline);
// end status online offline

screenLoader();
stopSpinner();

});