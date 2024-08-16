import {qs, qsa, cment, alertBox, error, status} from '../utils.js';
import {lazyImageLoading} from '../lazy/image/loading.js';

// get data guide
async function getGuideData(dataBox){
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
      const title = cment('div');
      title.setAttribute('id', 'title');
      const titleText = cment('h1');
      titleText.textContent = result.guide.title;
      title.appendChild(titleText);
      dataBox.appendChild(title);
      const dataText = cment('div');
      dataText.setAttribute('id', 'dataText')
      dataText.innerHTML = result.guide.description;
      const postDate = cment('div');
      postDate.setAttribute('id', 'postDate');
      postDate.innerHTML = `Diterbitkan Pada<br>${result.guide.post}`;
      dataText.appendChild(postDate);
      const updateDate = cment('div');
      updateDate.setAttribute('id', 'updateDate');
      updateDate.innerHTML = `Terakhir Diperbarui Pada<br>${result.guide.update}`;
      dataText.appendChild(updateDate);
      dataBox.appendChild(dataText);
      if(qsa('img.lazy').length > 0){
        setTimeout(() => {
        lazyImageLoading();
        }, 1000);
      }
    }else if(result.status === status.not_ready){
      const data = cment('div');
      data.classList.add('text-center', 'py-3');
      data.style.color = 'white';
      data.textContent = result.guide.message;
      dataBox.appendChild(data);
    }else if(result.status === status.failed){
      alertBox({message: result.message});
    }
  }catch(error){
    alertBox({message: 'Error: ' + error.message});
  }
};
// end get data guide

export {getGuideData};