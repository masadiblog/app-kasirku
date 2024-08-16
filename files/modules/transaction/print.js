import {qs, qsa, cment, alertBox, startSpinner, stopSpinner} from '../utils.js';
import {handleTooltipAlert} from '../aut.js';

// form connect to printer
function connectToPrinter(){
  const existing = qs('#formConnectBox');
  if(existing){
    existing.remove();
  }
  const formConnectBox = cment('div');
  formConnectBox.setAttribute('id', 'formConnectBox');
  const formConnect = cment('form');
  // title
  const title =  cment('h5');
  title.textContent = 'Hubungkan Printer Anda';
  formConnect.appendChild(title);
  // description 1
  const p1 = cment('p');
  p1.textContent = 'Agar dapat mencetak struk dari setiap transaksi yang diinginkan, hubungkan aplikasi dengan perangkat printer bluetooth Anda. Aktifkan layanan lokasi dan bluetooth pada smartphone Anda.';
  formConnect.appendChild(p1);
  // service uuid
  const rowServiceUUID = cment('div');
  rowServiceUUID.classList.add('row');
  const labelServiceUUID = cment('label');
  labelServiceUUID.textContent = 'Data Service UUID';
  rowServiceUUID.appendChild(labelServiceUUID);
  const inputServiceUUID = cment('textarea');
  inputServiceUUID.placeholder = '000018f0-0000-1000-8000-00805f9b34fb';
  inputServiceUUID.value = '000018f0-0000-1000-8000-00805f9b34fb';
  rowServiceUUID.appendChild(inputServiceUUID);
  formConnect.appendChild(rowServiceUUID);
  // character uuid
  const rowCharacterUUID = cment('div');
  rowCharacterUUID.classList.add('row');
  const lableCharacterUUID = cment('label');
  lableCharacterUUID.textContent = 'Data Characteristic UUID';
  rowCharacterUUID.appendChild(lableCharacterUUID);
  const inputCharacterUUID = cment('textarea');
  inputCharacterUUID.placeholder = '00002af1-0000-1000-8000-00805f9b34fb';
  inputCharacterUUID.value = '00002af1-0000-1000-8000-00805f9b34fb';
  rowCharacterUUID.appendChild(inputCharacterUUID);
  formConnect.appendChild(rowCharacterUUID);
  // buttons
  const rowButtons = cment('div');
  rowButtons.style.marginBottom = '1rem';
  rowButtons.style.textAlign = 'right';
  rowButtons.classList.add('row');
  const cancelButton = cment('button');
  cancelButton.classList.add('me-1');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Tidak';
  rowButtons.appendChild(cancelButton);
  const connectButton = cment('button');
  connectButton.type = 'submit';
  connectButton.textContent = 'Hubungkan';
  rowButtons.appendChild(connectButton);
  formConnect.appendChild(rowButtons);
  // description 2
  const p2 = cment('p');
  p2.innerHTML = 'Jika Service UUID dan Characteristic UUID di atas tidak cocok dengan printer bluetooth Anda, coba pelajari cara mendapatkan keduanya <a href="#">disini</a>.';
  formConnect.appendChild(p2);
  formConnectBox.appendChild(formConnect);
  document.body.appendChild(formConnectBox);
  connectButton.onclick = async (e) => {
    e.preventDefault();
    if(inputServiceUUID.value === ''){
      inputServiceUUID.focus();
      return;
    }else if(inputCharacterUUID.value === ''){
      inputCharacterUUID.focus();
      return;
    }else{
      await processConnectToPrinter(inputServiceUUID.value, inputCharacterUUID.value);
    }
  }
  cancelButton.onclick = () => {
    formConnectBox.remove();
  }
  const rows = qsa('#formConnectBox form .row');
  rows.forEach((row, i) => {
    let textValue = 'printer thermal, jika ini tidak bekerja coba ganti dengan UUID printer Anda.';
    if(i === 0){
      textValue = `Kode Service UUID ${textValue}`;
    }else if(i === 1){
      textValue = `Kode Characteristic UUID ${textValue}`;
    }
    handleTooltipAlert(row, textValue, 'label');
  });
};
// end form connect to printer

// connect to printer
let bluetoothDevice = null;
let bluetoothServer = null;
let printerCharacteristic = null;
let isConnected = false;
async function processConnectToPrinter(serviceUUID, characterUUID){
  startSpinner();
  try{
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUUID] }],
      optionalServices: ["battery_service"]
    });
    alertBox({message: 'Hubungkan: ' + bluetoothDevice.name});
    bluetoothServer = await bluetoothDevice.gatt.connect();
    const service = await bluetoothServer.getPrimaryService(serviceUUID);
    alertBox({message: 'Menghubungkan...'});
    printerCharacteristic = await service.getCharacteristic(characterUUID);
    alertBox({message: 'Terhubung, printer siap digunakan untuk cetak struk.'});
    stopSpinner();
    localStorage.setItem('serviceUUID', serviceUUID);
    localStorage.setItem('characterUUID', characterUUID);
    isConnected = true;
  }catch(error){
    stopSpinner();
    alertBox({message: 'Gagal menghubungkan ke printer: ' + error + '<br>Coba hubungkan kembali.'});
    isConnected = false;
  }
};
// end connect to printer

// write data chunk
async function writeDataInChunks(characteristic, data){
  const MAX_SIZE = 512;
  for (let offset = 0; offset < data.length; offset += MAX_SIZE) {
    const chunk = data.slice(offset, offset + MAX_SIZE);
    await characteristic.writeValue(chunk);
  }
};
// end write data chunk

// print data
async function printDataToPrinter(dataToPrint){
  try{
    if(!isConnected || !printerCharacteristic){
      //alertBox({message: 'Tidak ada perangkat bluetooth yang terhubung!'});
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToPrint);
    await writeDataInChunks(printerCharacteristic, data);
    alertBox({
      title: 'Status Pembayaran',
      message: 'Pembayaran dan struk berhasil diproses.',
      close: 'Oke'
    });
  }catch(error){
    alertBox({message: 'Gagal mengirim data ke printer: ' + error});
  }
};
// end print data

export {isConnected, connectToPrinter, processConnectToPrinter, printDataToPrinter};