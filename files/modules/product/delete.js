import {qs, qsa, speak, audioPlaying, format_number, capitalize, notificationAlert, alertBox, error, status, button, sortirListNumber, startSpinner, stopSpinner} from '../utils.js';

// process delete product
async function processDeleteProduct(idp, idt, row){
  startSpinner();
  try{
    const url = 'process/product/delete.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({idp: idp, idt: idt})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      row.remove();
      const rows = qsa('#tableProduct tbody tr');
      sortirListNumber(rows, 'td');
      if(rows.length === 0){
        stopSpinner();
        window.location.reload();
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
// end process delete product

export {processDeleteProduct};