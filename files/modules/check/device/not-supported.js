import {qs, cment, capitalize} from '../../utils.js';
function notSupported(){
  // handle url params
  const urlParams = new URLSearchParams(window.location.search);
  const device = urlParams.get('device');
  const winloc = urlParams.get('winloc');
  // handle mobile version
  const userAgent = navigator.userAgent.toLowerCase();
  if(/mobile|android|iphone|ipod|blackberry|iemobile|operamini/i.test(userAgent)){
    window.location.href = winloc;
    return;
  }
  // status version
  let statusVersion;
  if(device === 'tablet'){
    statusVersion = device;
  }else if(device === 'desktop'){
    statusVersion = device;
  }else{
    window.location.href = winloc;
  }
  qs('title').textContent = 'Versi Tidak Didukung!';
  // handle message
  const appName = '<strong>App KasirKu</strong>';
  const container = cment('div');
  container.classList.add('container');
  const message = cment('div');
  message.classList.add('message');
  const title = cment('h1');
  title.textContent = 'Versi Tidak Didukung!';
  message.appendChild(title);
  const p1 = cment('p');
  p1.innerHTML = `Ups! sepertinya Anda coba mengakses versi lain. Perangkat atau versi <strong>${capitalize(statusVersion)}</strong> yang Anda gunakan tidak cocok dengan aplikasi ${appName}.`;
  message.appendChild(p1);
  const p2 = cment('p');
  p2.innerHTML = `${appName} dirancang khusus untuk perangkat mobile. Coba buka dari smartphone Anda. Terima kasih.`;
  message.appendChild(p2);
  container.appendChild(message);
  document.body.appendChild(container);
}
document.addEventListener('DOMContentLoaded', function(){
  notSupported();
});