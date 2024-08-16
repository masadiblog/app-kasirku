function checkDeviceType(){
  const winloc = encodeURIComponent(window.location.toString().split('?')[0]);
  const userAgent = navigator.userAgent.toLowerCase();
  if(/mobile|android|iphone|ipod|blackberry|iemobile|operamini/i.test(userAgent)){
    // diamkan saja, tidak perlu lakukan apapun
  }else if(/ipad|tablet|kindle|playbook/i.test(userAgent)){
    window.location.href = `https://kasirku.atakana.com/check/device/not-supported.html?device=tablet&winloc=${winloc}`;
  }else{
    window.location.href = `https://kasirku.atakana.com/check/device/not-supported.html?device=desktop&winloc=${winloc}`;
  }
}
export {checkDeviceType};