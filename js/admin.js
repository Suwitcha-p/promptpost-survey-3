// เปลี่ยนเป็นรหัสที่คุณต้องการก่อนใช้งานจริง
const ADMIN_PASSWORD = "PromptPostAdmin2026";
let responses=[]; let charts={};

document.addEventListener('DOMContentLoaded',checkAuth);
function checkAuth(){
  const ok=sessionStorage.getItem('promptpost_admin_auth')==='true';
  document.getElementById('password-gate').style.display=ok?'none':'flex';
  document.getElementById('admin-content').style.display=ok?'block':'none';
  if(ok){ document.getElementById('webhook-input').value=getUrl(); loadRealData(); }
}
function handlePasswordSubmit(e){
  e.preventDefault(); const input=document.getElementById('admin-pass-input');
  if(input.value===ADMIN_PASSWORD){sessionStorage.setItem('promptpost_admin_auth','true');document.getElementById('pass-error').style.display='none';checkAuth();}
  else{document.getElementById('pass-error').style.display='block';input.value='';input.focus();}
}
function logoutAdmin(){sessionStorage.removeItem('promptpost_admin_auth');location.reload();}
function getUrl(){return(localStorage.getItem(CONFIG.STORAGE_KEY_WEBHOOK)||CONFIG.GOOGLE_SHEET_WEBHOOK_URL||'').trim();}
async function loadRealData(){
  const url=getUrl(), status=document.getElementById('connection-status');
  if(!url){status.className='status-box error';status.textContent='ยังไม่ได้ตั้งค่า Google Sheets Web App URL';renderAll([]);return;}
  status.className='status-box';status.textContent='กำลังโหลดข้อมูลจริงจาก Google Sheets...';
  try{
    const r=await fetch(`${url}${url.includes('?')?'&':'?'}action=read&_=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`); const result=await r.json();
    if(result.status!=='success')throw new Error(result.message||'API error');
    responses=result.data||[];renderAll(responses);status.className='status-box success';status.textContent=`เชื่อมต่อสำเร็จ · ข้อมูลจริง ${responses.length} Records`;document.getElementById('last-update').textContent=new Date().toLocaleTimeString('th-TH');
  }catch(e){console.error(e);status.className='status-box error';status.textContent='เชื่อมต่อ Google Sheets ไม่สำเร็จ: '+e.message;renderAll([]);}
}
function pct(n,t){return t?Math.round(n/t*100)+'%':'0%';}
function renderAll(data){
 document.getElementById('kpi-total').textContent=data.length;document.getElementById('record-count').textContent=data.length;
 const regular=data.filter(x=>String(x['3.4 แนวโน้มใช้เป็นประจำ']||'').includes('ใช้อย่างแน่นอน')).length;
 const relief=data.filter(x=>String(x['8.1 Value & Pain Point Relief']||'').includes('มากที่สุด')).length;
 const aware=data.filter(x=>!String(x['7.1 Brand Awareness']||'').includes('ไม่เคย')).length;
 document.getElementById('kpi-regular').textContent=pct(regular,data.length);document.getElementById('kpi-relief').textContent=pct(relief,data.length);document.getElementById('kpi-awareness').textContent=pct(aware,data.length);
 renderCharts(data);renderTable(data);
}
function countTerms(data,key,terms){const o={};terms.forEach(t=>o[t]=0);data.forEach(r=>{const v=String(r[key]||'');terms.forEach(t=>{if(v.includes(t))o[t]++;});});return o;}
function makeChart(id,type,map){if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type,data:{labels:Object.keys(map),datasets:[{data:Object.values(map),backgroundColor:['#FE3B1F','#173B8F','#3CB4E5','#FF8672','#8B5CF6','#10B981','#F59E0B','#94A3B8'],borderWidth:1}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});}
function renderCharts(data){
 makeChart('chartFeature','doughnut',countTerms(data,'3.1 ฟีเจอร์ที่ต้องการ',['รับ–ส่งเอกสารออนไลน์','เซ็นเอกสารออนไลน์','กระเป๋าเก็บเอกสารดิจิทัล','เก็บเอกสารและจ่ายเงิน','โหวตออนไลน์']));
 makeChart('chartPain','bar',countTerms(data,'2.1 เอกสารที่ยุ่งยาก',['เอกสารการศึกษา','เอกสารส่วนตัว','เอกสารการเงิน','เอกสารการสมัครงาน','อื่นๆ']));
 makeChart('chartMedia','bar',countTerms(data,'5.1 ช่องทางรับข้อมูล',['Facebook','Instagram','TikTok','YouTube Shorts','X (Twitter)','Google','เพื่อน','อื่นๆ']));
 makeChart('chartPricing','doughnut',countTerms(data,'6.2 รูปแบบการจ่ายเงิน',['ใช้งานฟรี','รายเดือน','รายปี','ซื้อขาด','อื่นๆ']));
}
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function short(v,n=70){const s=esc(v||'-');return s.length>n?s.slice(0,n)+'…':s;}
function renderTable(data){const tb=document.getElementById('responses-tbody');if(!data.length){tb.innerHTML='<tr><td colspan="11" class="empty">ยังไม่มีข้อมูลคำตอบจริง</td></tr>';return;}tb.innerHTML=[...data].reverse().map(r=>`<tr><td>${short(r['Timestamp'],28)}</td><td>${short(r['1.1 อายุ'])}</td><td>${short(r['1.2 สถานภาพ'],40)}</td><td>${short(r['1.3 การอยู่อาศัย'],35)}</td><td>${short(r['3.1 ฟีเจอร์ที่ต้องการ'],55)}</td><td>${short(r['3.2 เหตุผลเปิดใช้งานครั้งแรก'],55)}</td><td>${short(r['3.4 แนวโน้มใช้เป็นประจำ'])}</td><td>${short(r['6.2 รูปแบบการจ่ายเงิน'])}</td><td>${short(r['7.1 Brand Awareness'])}</td><td>${short(r['8.1 Value & Pain Point Relief'])}</td><td>${short(r['9.1 Feedback'],70)}</td></tr>`).join('');}
function exportToCSV(){if(!responses.length){alert('ยังไม่มีข้อมูลจริงสำหรับ Export');return;}const h=Object.keys(responses[0]);const rows=[h,...responses.map(r=>h.map(k=>r[k]??''))];const csv='\uFEFF'+rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));a.download=`PromptPost_Real_Data_${new Date().toISOString().slice(0,10)}.csv`;a.click();}
async function deleteAllData(){const url=getUrl();if(!url){alert('กรุณาตั้งค่า Google Sheets URL ก่อน');return;}if(prompt('การลบจะลบคำตอบทั้งหมดและเก็บหัวตารางไว้\n\nพิมพ์ DELETE เพื่อยืนยัน')!=='DELETE')return;try{const r=await fetch(`${url}${url.includes('?')?'&':'?'}action=deleteAll&_=${Date.now()}`);const x=await r.json();if(x.status!=='success')throw new Error(x.message||'ลบไม่สำเร็จ');alert('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว');loadRealData();}catch(e){alert('ไม่สามารถลบข้อมูลได้: '+e.message);}}
function openWebhookModal(){document.getElementById('webhook-modal').style.display='flex';document.getElementById('webhook-input').value=getUrl();}
function closeWebhookModal(){document.getElementById('webhook-modal').style.display='none';}
function saveWebhookUrl(){const v=document.getElementById('webhook-input').value.trim();if(!v.startsWith('https://script.google.com/')){alert('กรุณาใส่ Google Apps Script Web App URL ที่ถูกต้อง');return;}localStorage.setItem(CONFIG.STORAGE_KEY_WEBHOOK,v);closeWebhookModal();loadRealData();}
