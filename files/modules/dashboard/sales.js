import {qs, qsa, cment, alertBox, error, status, capitalize, format_number, startSpinner, stopSpinner} from '../utils.js';
import {search} from '../icons/icon.js';

// load date
function loadDate(elemt){
  const option = cment('option');
  option.setAttribute('selected', '');
  option.value = '';
  elemt.appendChild(option);
  option.textContent = 'Tanggal';
  for(let i = 1; i <= 31; i++){
    let ii;
    if(i < 10){
      ii = i.toString();
      ii = '0' + ii;
    }else{
      ii = i.toString();
    }
    const optionValue = cment('option');
    optionValue.value = ii;
    optionValue.textContent = ii;
    elemt.appendChild(optionValue);
  }
};
// end load date

// load month
function loadMonth(elemt){
  const option = cment('option');
  option.setAttribute('selected', '');
  option.value = '';
  option.textContent = 'Bulan';
  elemt.appendChild(option);
  const dataMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  dataMonth.forEach(month => {
    const optionValue = cment('option');
    optionValue.value = month;
    optionValue.textContent = month;
    elemt.appendChild(optionValue);
  });
};
// end load month

// load year
function loadYear(elemt){
  const option = cment('option');
  option.setAttribute('selected', '');
  option.value = '';
  option.textContent = 'Tahun';
  elemt.appendChild(option);
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + 1;
  for(let year = startYear; year <= endYear; year++){
    const optionValue = cment('option');
    optionValue.value = year;
    optionValue.textContent = year;
    elemt.appendChild(optionValue);
  }
};
// end load year

// submit form
async function submitForm(selectDate, selectMonth, selectYear){
  if(selectDate.value !== ''){
    if(selectMonth.value === '' || selectYear.value === ''){
      alertBox({message: 'Harap pilih bulan dan tahun!'});
      return;
    }
  }else if(selectMonth.value !== '' && selectYear.value === ''){
    alertBox({message: 'Harap pilih tahun!'});
    return;
  }
  let url;
  let data;
  if(selectDate.value === '' && selectMonth.value === '' && selectYear.value === ''){
    url = 'process/analityc/by-all.php';
    data = `${selectDate.value}_${selectMonth.value}_${selectYear.value}`;
  }else
  if(selectDate.value !== '' && selectMonth.value !== '' && selectYear.value !== ''){
    url = 'process/analityc/by-date.php';
    data = `${selectDate.value}_${selectMonth.value}_${selectYear.value}`;
  }else if(selectMonth.value !== '' && selectYear.value !== ''){
    url = 'process/analityc/by-month.php';
    data = `${selectMonth.value}_${selectYear.value}`;
  }else if(selectYear.value !== ''){
    url = 'process/analityc/by-year.php';
    data = `${selectYear.value}`;
  }
  startSpinner();
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({request: true, selected: data})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      dataBody(result.products[0]);
      calculateSaleTotal(result.products[1].saleTotal);
      calculateDiscountTotal(result.products[1].discountTotal);
      calculateExpenTotal(result.products[1].expenTotal);
      calculateProfitTotal(result.products[1].profitTotal);
    }else if(result.status === status.not_ready){
      stopSpinner();
      dataBody(result.products);
      calculateSaleTotal(0);
      calculateDiscountTotal(0);
      calculateExpenTotal(0);
      calculateProfitTotal(0);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: `Error: ${error.message}`});
  }
};
// end submit form

// load form selection
async function loadFormSelection(){
  const dataBox = qs('#dataBox');
  const existing = qs('#formSales');
  if(existing){
    dataBox.removeChild(existing);
  }
  const form = cment('form');
  form.setAttribute('id', 'formSales');
  // row
  const row = cment('div');
  row.classList.add('row');
  // col
  const col = cment('div');
  col.classList.add('col');
  // col sate
  const colDate = cment('div');
  colDate.classList.add('date');
  const selectDate = cment('select');
  selectDate.setAttribute('id', 'date');
  loadDate(selectDate);
  colDate.appendChild(selectDate);
  col.appendChild(colDate);
  // col month
  const colMonth = cment('div');
  colMonth.classList.add('month');
  const selectMonth = cment('select');
  selectMonth.setAttribute('id', 'month');
  loadMonth(selectMonth);
  colMonth.appendChild(selectMonth);
  col.appendChild(colMonth);
  // col year
  const colYear = cment('div');
  colYear.classList.add('year');
  const selectYear = cment('select');
  selectYear.setAttribute('id', 'year');
  loadYear(selectYear);
  colYear.appendChild(selectYear);
  col.appendChild(colYear);
  // col button
  const colButton = cment('div');
  const buttonSubmit = cment('button');
  buttonSubmit.type = 'submit';
  buttonSubmit.innerHTML = search(null, null, 'white');
  colButton.appendChild(buttonSubmit);
  col.appendChild(colButton);
  row.appendChild(col);
  form.appendChild(row);
  dataBox.appendChild(form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    await submitForm(selectDate, selectMonth, selectYear);
  }
};
// end load form selection

// data body
function dataBody(items){
  setTimeout(() => {
    const body = qs('table#analityc tbody');
    if(body){
      body.innerHTML = '';
    }
    if(items.status === status.not_ready){
      qs('#titleTable').textContent = items.message;
      const row = cment('tr');
      const message = cment('td');
      message.colSpan = 6;
      message.style.textAlign = 'center';
      message.style.padding = '2rem 1rem';
      message.textContent = items.message;
      row.appendChild(message);
      body.appendChild(row);
    }else{
      const total = items.reduce((sum, item) => sum + Number(item.sale), 0);
      items.forEach((item, i) => {
        const percent = (item.sale / total * 100).toFixed(2);
        const rows = cment('tr');
        // td number
        const tdNumber = cment('td');
        tdNumber.setAttribute('id', 'tdNumber');
        tdNumber.textContent = i + 1;
        rows.appendChild(tdNumber);
        // td by
        const tdBy = cment('td');
        tdBy.setAttribute('id', 'tdBy');
        tdBy.textContent = item.date;
        rows.appendChild(tdBy);
        // td name
        const tdName = cment('td');
        tdName.setAttribute('id', 'tdName');
        tdName.textContent = capitalize(item.name);
        rows.appendChild(tdName);
        // td sold
        const tdSold = cment('td');
        tdSold.setAttribute('id', 'tdSold');
        tdSold.textContent = format_number(item.sold);
        rows.appendChild(tdSold);
        // td price
        const tdPrice = cment('td');
        tdPrice.setAttribute('id', 'tdPrice');
        tdPrice.textContent = format_number(item.price);
        rows.appendChild(tdPrice);
        // td sale
        const tdSale = cment('td');
        tdSale.setAttribute('id', 'tdSale');
        tdSale.textContent = format_number(item.sale);
        rows.appendChild(tdSale);
        // td expen
        const tdExpen = cment('td');
        tdExpen.setAttribute('id', 'tdExpen');
        tdExpen.textContent = format_number(item.expen);
        rows.appendChild(tdExpen);
        // td discount
        const tdDiscount = cment('td');
        tdDiscount.setAttribute('id', 'tdDiscount');
        tdDiscount.textContent = format_number(item.discount);
        rows.appendChild(tdDiscount);
        // td profit
        const tdProfit = cment('td');
        tdProfit.setAttribute('id', 'tdProfit');
        tdProfit.textContent = format_number(item.profit);
        rows.appendChild(tdProfit);
        // td percent
        const tdPercent = cment('td');
        tdPercent.setAttribute('id', 'tdPercent');
        tdPercent.textContent = `${format_number(percent)}%`;
        rows.appendChild(tdPercent);
        body.appendChild(rows);
        const thName = qs('#thName');
        const thSold = qs('#thSold');
        const thSale = qs('#thSale');
        const thPercent = qs('#thPercent');
        const thPrice = qs('#thPrice');
        const thExpen = qs('#thExpen');
        const thBy = qs('#thBy');
        qs('#titleTable').textContent = item.titleTable;
        if(item.by === 'none' || item.by === 'date'){
          thBy.style.display = 'none';
          tdBy.style.display = 'none';
          thSale.style.display = 'none';
          tdSale.style.display = 'none';
          thExpen.style.display = 'none';
          tdExpen.style.display = 'none';
          thPercent.style.display = 'none';
          tdPercent.style.display = 'none';
          thPrice.style.display = 'table-cell';
          tdPrice.style.display = 'table-cell';
          thSold.style.display = 'table-cell';
          tdSold.style.display = 'table-cell';
          thName.style.display = 'table-cell';
          tdName.style.display = 'table-cell';
        }else{
          thBy.style.display = 'table-cell';
          tdBy.style.display = 'table-cell';
          thName.style.display = 'none';
          tdName.style.display = 'none';
        }
        if(item.by === 'month'){
          thBy.style.display = 'table-cell';
          tdBy.style.display = 'table-cell';
          thBy.textContent = item.byMonth;
          thSale.style.display = 'table-cell';
          tdSale.style.display = 'table-cell';
          thExpen.style.display = 'table-cell';
          tdExpen.style.display = 'table-cell';
          thPercent.style.display = 'table-cell';
          tdPercent.style.display = 'table-cell';
          thName.style.display = 'none';
          tdName.style.display = 'none';
          thPrice.style.display = 'none';
          tdPrice.style.display = 'none';
          thSold.style.display = 'none';
          tdSold.style.display = 'none';
        }else if(item.by === 'year'){
          thBy.style.display = 'table-cell';
          tdBy.style.display = 'table-cell';
          thBy.textContent = item.byYear;
          thSale.style.display = 'table-cell';
          tdSale.style.display = 'table-cell';
          thExpen.style.display = 'table-cell';
          tdExpen.style.display = 'table-cell';
          thPercent.style.display = 'table-cell';
          tdPercent.style.display = 'table-cell';
          thName.style.display = 'none';
          tdName.style.display = 'none';
          thPrice.style.display = 'none';
          tdPrice.style.display = 'none';
          thSold.style.display = 'none';
          tdSold.style.display = 'none';
        }else if(item.by === 'all'){
          thBy.style.display = 'table-cell';
          tdBy.style.display = 'table-cell';
          thPercent.style.display = 'table-cell';
          tdPercent.style.display = 'table-cell';
          thName.style.display = 'none';
          tdName.style.display = 'none';
          thPrice.style.display = 'none';
          tdPrice.style.display = 'none';
          thSold.style.display = 'none';
          tdSold.style.display = 'none';
          thBy.textContent = item.byAll;
        }
      });
    }
  }, 0);
};
// end data body

// load data body
async function loadDataBody(){
  startSpinner();
  try{
    const url = 'process/analityc/by-all.php';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({request: true})
    });
    if(!response.ok){
      stopSpinner();
      alertBox({message: error.network});
      return;
    }
    const result = await response.json();
    if(result.status === status.success){
      stopSpinner();
      dataBody(result.products[0]);
      calculateSaleTotal(result.products[1].saleTotal);
      calculateDiscountTotal(result.products[1].discountTotal);
      calculateExpenTotal(result.products[1].expenTotal);
      calculateProfitTotal(result.products[1].profitTotal);
    }else if(result.status === status.not_ready){
      stopSpinner();
      dataBody(result.products);
      calculateSaleTotal(0);
      calculateDiscountTotal(0);
      calculateExpenTotal(0);
      calculateProfitTotal(0);
    }else if(result.status === status.failed){
      stopSpinner();
      alertBox({message: result.message});
    }
  }catch(error){
    stopSpinner();
    alertBox({message: `Error: ${error.message}`});
  }
};
// end load data body

// calculate
// calculate sale total
function calculateSaleTotal(saleTotal){
  setTimeout(() => qs('#saleInt').textContent = format_number(saleTotal), 250);
};
// calculate discount total
function calculateDiscountTotal(discountTotal){
  setTimeout(() => qs('#discountInt').textContent = format_number(discountTotal), 500);
};
// calculate expen total
function calculateExpenTotal(expenTotal){
  setTimeout(() => qs('#expenInt').textContent = format_number(expenTotal), 750);
};
// calculate profit total
function calculateProfitTotal(profitTotal){
  setTimeout(() => qs('#profitInt').textContent = format_number(profitTotal), 1000);
};
// end calculate

// load table data sales
async function loadDataTableSales(){
  const dataBox = qs('#dataBox');
  const caption = cment('div');
  caption.setAttribute('id', 'titleTable');
  dataBox.appendChild(caption);
  const tableBox = cment('div');
  tableBox.setAttribute('id', 'tableBox');
  tableBox.classList.add('max-height-83');
  const table = cment('table');
  table.setAttribute('id', 'analityc');
  // thead
  const thead = cment('thead');
  const trHead = cment('tr');
  // th number
  const thNumber = cment('th');
  thNumber.setAttribute('id', 'thNumber');
  thNumber.textContent = '#';
  trHead.appendChild(thNumber);
  // th by
  const thBy = cment('th');
  thBy.setAttribute('id', 'thBy');
  trHead.appendChild(thBy);
  // th sale
  const thSale = cment('th');
  thSale.setAttribute('id', 'thSale');
  thSale.textContent = 'Penjualan';
  trHead.appendChild(thSale);
  // th expen
  const thExpen = cment('th');
  thExpen.setAttribute('id', 'thExpen');
  thExpen.textContent = 'Pengeluaran';
  trHead.appendChild(thExpen);
  // th name
  const thName = cment('th');
  thName.setAttribute('id', 'thName');
  thName.textContent = 'Produk';
  trHead.appendChild(thName);
  // th sold
  const thSold = cment('th');
  thSold.setAttribute('id', 'thSold');
  thSold.textContent = 'Terjual';
  trHead.appendChild(thSold);
  // th price
  const thPrice = cment('th');
  thPrice.setAttribute('id', 'thPrice');
  thPrice.textContent = 'Harga';
  trHead.appendChild(thPrice);
  // th discount
  const thDiscount = cment('th');
  thDiscount.setAttribute('id', 'thDiscount');
  thDiscount.textContent = 'Diskon';
  trHead.appendChild(thDiscount);
  // th profit
  const thProfit = cment('th');
  thProfit.setAttribute('id', 'thProfit');
  thProfit.textContent = 'Keuntungan';
  trHead.appendChild(thProfit);
  // th percent
  const thPercent = cment('th');
  thPercent.setAttribute('id', 'thPercent');
  thPercent.textContent = '{ % }';
  trHead.appendChild(thPercent);
  thead.appendChild(trHead);
  table.appendChild(thead);
  // tbody
  const tbody = cment('tbody');
  await loadDataBody();
  table.appendChild(tbody);
  // tfoot
  const tfoot = cment('tfoot');
  // sale
  const rowSale = cment('tr');
  const saleText = cment('td');
  saleText.colSpan = 4;
  saleText.textContent = 'Total Penjualan';
  rowSale.appendChild(saleText);
  const saleInt = cment('td');
  saleInt.setAttribute('id', 'saleInt');
  saleInt.colSpan = 4;
  rowSale.appendChild(saleInt);
  tfoot.appendChild(rowSale);
  // discount
  const rowDiscount = cment('tr');
  const discountText = cment('td');
  discountText.colSpan = 4;
  discountText.textContent = 'Total Diskon';
  rowDiscount.appendChild(discountText);
  const discountInt = cment('td');
  discountInt.setAttribute('id', 'discountInt');
  discountInt.colSpan = 4;
  rowDiscount.appendChild(discountInt);
  tfoot.appendChild(rowDiscount);
  // expen
  const rowExpen = cment('tr');
  const expenText = cment('td');
  expenText.colSpan = 4;
  expenText.textContent = 'Total Pengeluaran';
  rowExpen.appendChild(expenText);
  const expenInt = cment('td');
  expenInt.setAttribute('id', 'expenInt');
  expenInt.colSpan = 4;
  rowExpen.appendChild(expenInt);
  tfoot.appendChild(rowExpen);
  // profit
  const rowProfit = cment('tr');
  const profitText = cment('td');
  profitText.colSpan = 4;
  profitText.textContent = 'Total Keuntungan';
  rowProfit.appendChild(profitText);
  const profitInt = cment('td');
  profitInt.setAttribute('id', 'profitInt');
  profitInt.colSpan = 4;
  rowProfit.appendChild(profitInt);
  tfoot.appendChild(rowProfit);

  table.appendChild(tfoot);
  tableBox.appendChild(table);
  dataBox.appendChild(tableBox);
};
// end load table data sales

// view data sles
async function viewDataSales(viewBox){
  const dataBox = cment('div');
  dataBox.setAttribute('id', 'dataBox');
  setTimeout(() => loadFormSelection(), 0);
  setTimeout(() => loadDataTableSales(), 0);
  viewBox.appendChild(dataBox);
};
// end view data sales

// load data sales
function loadDataSales(viewBox){
  viewDataSales(viewBox);
};
// end load data sales

export {loadDataSales};