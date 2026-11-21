'use strict';
/* LastChance — original free money-deadline tracker. All logic written from scratch. */
const TYPES={
 return:{label:'Product return',icon:'📦',steps:['Check the item is unused / in return condition','Start the return on the store site or in store','Pack the item with all accessories','Print / save the return label','Drop it off and keep the receipt','Confirm the refund landed']},
 trial:{label:'Free trial ends',icon:'🎟️',steps:['Decide: keep it or cancel it?','Open the service’s subscription page','Cancel before the deadline (you usually keep trial access)','Screenshot / save the cancellation confirmation']},
 subscription:{label:'Subscription renewal',icon:'🔁',steps:['Ask: did I actually use this last period?','If not, cancel before renewal','If yes, check for a cheaper plan','Save the renewal / cancellation confirmation']},
 warranty:{label:'Warranty expires',icon:'🛡️',steps:['Test the product fully — now, not later','Note any faults, photos help','Find the receipt / proof of purchase','Contact the seller or brand before expiry','Save the claim / ticket number']},
 refund:{label:'Refund follow-up',icon:'💸',steps:['Check the refund status','Check your bank / card statement','If missing, contact support with the order number','Save the resolution']},
 insurance:{label:'Insurance renewal',icon:'☂️',steps:['Compare at least one other quote','Check coverage hasn’t quietly changed','Renew or switch before the deadline','Save the new policy document']},
 document:{label:'Document / ID expiry',icon:'🪪',steps:['Check the renewal requirements','Book an appointment if needed','Gather the documents you need','Submit the renewal','Save the new document details']},
 membership:{label:'Membership renewal',icon:'🏋️',steps:['Ask: how many times did I actually go / use it?','Check for pause / freeze options','Cancel or renew before the deadline','Save the confirmation']},
 bill:{label:'Bill due',icon:'🧾',steps:['Check the amount is correct','Pay the bill','Save the payment receipt / reference']},
 custom:{label:'Custom deadline',icon:'✨',steps:['Do the main action','Confirm it’s fully done','Save any proof or confirmation']}};
const KEY='lastchance.v1';
function defaults(){return{items:[],dark:false,currency:'₹'};}
let store=Object.assign(defaults(),loadRaw());
function loadRaw(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return{};}}
function save(){localStorage.setItem(KEY,JSON.stringify(store));}
function $(id){return document.getElementById(id);}
function esc(t){return String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function today(){const d=new Date();d.setHours(0,0,0,0);return d;}
function parseDate(s){const d=new Date(s+'T00:00:00');return isNaN(d)?null:d;}
function daysLeft(item){const dl=parseDate(item.deadline);if(!dl)return null;return Math.round((dl-today())/86400000);}
function money(n,cur){return (cur||store.currency)+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}

/* auto deadline from start + window */
function syncDeadline(){
 const start=$('startInput').value,win=+$('windowSelect').value;
 if(start&&win){const d=parseDate(start);d.setDate(d.getDate()+win);$('deadlineInput').value=d.toISOString().slice(0,10);}
}
$('startInput').addEventListener('change',syncDeadline);$('windowSelect').addEventListener('change',syncDeadline);

$('addBtn').onclick=()=>{
 const name=$('nameInput').value.trim(),deadline=$('deadlineInput').value;
 if(!name){alert('Give it a name first — what is this deadline for?');return;}
 if(!deadline){alert('Pick a deadline date (or a start date + window and I’ll calculate it).');return;}
 const type=$('typeSelect').value;
 const item={id:uid(),type,name,store:$('storeInput').value.trim(),start:$('startInput').value,deadline,amount:+$('amountInput').value||0,currency:$('currencySelect').value,link:$('linkInput').value.trim(),note:$('noteInput').value.trim(),steps:TYPES[type].steps.map(s=>({text:s,done:false})),status:'open',created:Date.now()};
 store.items.unshift(item);save();
 $('nameInput').value='';$('storeInput').value='';$('noteInput').value='';$('linkInput').value='';$('amountInput').value='';
 render();
 window.scrollTo({top:document.body.scrollHeight*.35,behavior:'smooth'});
};

$('sampleBtn').onclick=()=>{
 const t=new Date();const inDays=n=>{const d=new Date(t);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
 const mk=(type,name,store,days,amount)=>({id:uid()+Math.random(),type,name,store,start:inDays(days-20),deadline:inDays(days),amount,currency:store.currency,link:'',note:'Sample — delete me any time',steps:TYPES[type].steps.map(s=>({text:s,done:false})),status:'open',created:Date.now()});
 store.items.push(mk('return','Running shoes (wrong size)','Sports store',3,2499),mk('trial','Music streaming trial','Streamify',6,119),mk('warranty','Bluetooth headphones warranty','SoundBrand',24,3999),mk('subscription','Cloud storage renewal','CloudBox',41,899),mk('document','Driving licence renewal','RTO',65,1500));
 save();render();
};

/* ---- grouping, rendering ---- */
function groupOf(item){
 if(item.status!=='open')return null;
 const d=daysLeft(item);
 if(d<0)return'Overdue'; if(d===0)return'Today'; if(d<=7)return'Next 7 days'; if(d<=30)return'Next 30 days'; return'Later';
}
function render(){
 document.body.classList.toggle('dark',store.dark);$('darkToggle').checked=store.dark;
 const open=store.items.filter(i=>i.status==='open');
 const risk=open.reduce((a,i)=>a+(+i.amount||0),0);
 $('riskTotal').textContent=money(risk);
 const done=store.items.filter(i=>i.status==='done'),missed=store.items.filter(i=>i.status==='missed');
 const saved=done.reduce((a,i)=>a+(+i.amount||0),0),lost=missed.reduce((a,i)=>a+(+i.amount||0),0);
 $('statOpen').textContent=open.length;$('statRisk').textContent=money(risk);$('statSaved').textContent=money(saved);$('statLost').textContent=money(lost);
 $('statRate').textContent=(done.length+missed.length)?Math.round(done.length/(done.length+missed.length)*100)+'%':'—';
 $('statUrgent').textContent=open.filter(i=>{const d=daysLeft(i);return d!==null&&d<=7;}).length;
 /* alerts */
 const urgent=open.filter(i=>{const d=daysLeft(i);return d!==null&&d<=3;}).sort((a,b)=>daysLeft(a)-daysLeft(b));
 $('alertCard').hidden=!urgent.length;
 $('alertList').innerHTML=urgent.map(i=>{const d=daysLeft(i);return `<li><strong>${esc(i.name)}</strong> — ${d<0?Math.abs(d)+' day(s) OVERDUE':d===0?'due TODAY':'due in '+d+' day(s)'} · ${money(i.amount,i.currency)} at risk. Next step: ${esc(nextStep(i))}</li>`;}).join('');
 /* list */
 const q=($('searchInput').value||'').toLowerCase(),f=$('filterSelect').value,sort=$('sortSelect').value;
 let list=store.items.filter(i=>{
   if(f==='open'&&i.status!=='open')return false;
   if(f==='done'&&i.status!=='done')return false;
   if(f==='missed'&&i.status!=='missed')return false;
   if(!['open','all','done','missed'].includes(f)&&i.type!==f)return false;
   if(q&&!(i.name+' '+i.store+' '+i.note+' '+TYPES[i.type].label).toLowerCase().includes(q))return false;
   return true;});
 list.sort((a,b)=>sort==='amount'?(b.amount||0)-(a.amount||0):sort==='newest'?b.created-a.created:(a.deadline<b.deadline?-1:1));
 const groups=['Overdue','Today','Next 7 days','Next 30 days','Later','Completed','Missed'];
 const byGroup={};groups.forEach(g=>byGroup[g]=[]);
 list.forEach(i=>{const g=i.status==='done'?'Completed':i.status==='missed'?'Missed':groupOf(i);if(byGroup[g])byGroup[g].push(i);});
 $('groups').innerHTML=groups.map(g=>byGroup[g].length?`<h3 class="group-title">${g==='Overdue'?'🔴':g==='Today'?'🟠':g==='Completed'?'✅':g==='Missed'?'⚫':'📅'} ${g} (${byGroup[g].length})</h3>`+byGroup[g].map(itemHTML).join(''):'').join('');
 $('emptyText').style.display=list.length?'none':'block';
 bindItems();
}
function nextStep(item){const s=item.steps.find(s=>!s.done);return s?s.text:'All steps ticked — mark it done below.';}
function itemHTML(i){
 const d=daysLeft(i),t=TYPES[i.type];
 const badge=i.status==='done'?'<span class="badge green">Saved ✓</span>':i.status==='missed'?'<span class="badge">Missed</span>':d<0?`<span class="badge red">${Math.abs(d)}d overdue</span>`:d===0?'<span class="badge red">Today!</span>':d<=7?`<span class="badge amber">${d} days left</span>`:`<span class="badge green">${d} days left</span>`;
 const stepsDone=i.steps.filter(s=>s.done).length;
 return `<div class="item ${i.status!=='open'?(i.status==='done'?'done':'missed'):d<0?'overdue':d<=7?'soon':''}">
  <div class="item-head"><div><div class="item-name">${t.icon} ${esc(i.name)}</div>
  <div class="item-meta">${t.label}${i.store?' · '+esc(i.store):''} · Deadline: ${esc(i.deadline)} · ${money(i.amount,i.currency)} at risk${i.note?'<br>'+esc(i.note):''}</div></div>${badge}</div>
  ${i.status==='open'?`<ul class="steps">${i.steps.map((s,ix)=>`<li><label><input type="checkbox" data-step="${i.id}:${ix}" ${s.done?'checked':''}> ${esc(s.text)}</label></li>`).join('')}</ul>
  <div class="item-meta">${stepsDone}/${i.steps.length} steps done · Next: ${esc(nextStep(i))}</div>
  <div class="item-actions">
    <button data-act="done" data-id="${i.id}">✓ Done — saved it</button>
    <button data-act="missed" data-id="${i.id}">Missed it</button>
    <button data-act="ics" data-id="${i.id}">📅 Calendar reminders</button>
    ${i.link?`<a href="${esc(i.link)}" target="_blank" rel="noopener"><button type="button">Open link ↗</button></a>`:''}
    <button data-act="del" data-id="${i.id}">Delete</button>
  </div>`:`<div class="item-actions"><button data-act="reopen" data-id="${i.id}">Reopen</button><button data-act="del" data-id="${i.id}">Delete</button></div>`}
 </div>`;
}
function bindItems(){
 document.querySelectorAll('[data-step]').forEach(cb=>cb.onchange=()=>{const[id,ix]=cb.dataset.step.split(':');const it=store.items.find(x=>x.id===id);if(it){it.steps[+ix].done=cb.checked;save();render();}});
 document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const it=store.items.find(x=>x.id===b.dataset.id);if(!it)return;const act=b.dataset.act;
  if(act==='done'){it.status='done';it.closedAt=Date.now();alert(`🎉 Saved ${money(it.amount,it.currency)} on “${it.name}”. Nice one.`);}
  if(act==='missed'){it.status='missed';it.closedAt=Date.now();}
  if(act==='reopen'){it.status='open';}
  if(act==='del'){if(!confirm('Delete this deadline?'))return;store.items=store.items.filter(x=>x.id!==it.id);}
  if(act==='ics'){download(it.name.replace(/[^\w]+/g,'-')+'.ics',icsFor([it]),'text/calendar');save();render();return;}
  save();render();});
}
$('searchInput').addEventListener('input',render);$('filterSelect').onchange=render;$('sortSelect').onchange=render;

/* ---- calendar (.ics) export with alarms ---- */
function icsDate(d){return d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';}
function icsFor(items){
 const evs=items.map(i=>{
  const dl=parseDate(i.deadline);dl.setHours(9,0,0,0);
  const alarms=[7,3,1,0].map(days=>{const a=new Date(dl);a.setDate(a.getDate()-days);return `BEGIN:VALARM\r\nTRIGGER;VALUE=DATE-TIME:${icsDate(a)}\r\nACTION:DISPLAY\r\nDESCRIPTION:${i.name} deadline in ${days} day(s)\r\nEND:VALARM`;}).join('\r\n');
  return `BEGIN:VEVENT\r\nUID:${i.id}@lastchance\r\nDTSTAMP:${icsDate(new Date())}\r\nDTSTART:${icsDate(dl)}\r\nSUMMARY:⏰ LastChance: ${i.name} — ${TYPES[i.type].label} (${money(i.amount,i.currency)} at risk)\r\nDESCRIPTION:Next step: ${nextStep(i)}${i.note?'\\n'+i.note:''}\r\n${alarms}\r\nEND:VEVENT`;
 }).join('\r\n');
 return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LastChance//EN\r\n${evs}\r\nEND:VCALENDAR`;
}
$('icsAllBtn').onclick=()=>{const open=store.items.filter(i=>i.status==='open');if(!open.length){alert('No open deadlines yet — add one first.');return;}download('lastchance-reminders.ics',icsFor(open),'text/calendar');};
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}

/* ---- notifications, data, theme, PWA ---- */
$('notifyBtn').onclick=()=>{if('Notification' in window)Notification.requestPermission().then(p=>alert(p==='granted'?'Notifications allowed. While LastChance is open, urgent deadlines will also notify you here. For closed-app reminders, use the calendar export above — that’s the reliable one.':'Notification permission was not granted.'));};
$('exportBtn').onclick=()=>download('lastchance-data.json',JSON.stringify(store,null,2),'application/json');
$('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d.items))throw 0;store=Object.assign(defaults(),d);save();render();alert('Data imported ✓');}catch{alert('That file does not look like LastChance data.');}});};
$('darkToggle').onchange=e=>{store.dark=e.target.checked;save();render();};
$('clearBtn').onclick=()=>{if(confirm('Delete all LastChance data on this device?')){store=defaults();save();render();}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').hidden=false;});
$('installBtn').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null;$('installBtn').hidden=true;}};
$('currencySelect').value=store.currency||'₹';
$('currencySelect').addEventListener('change',e=>{store.currency=e.target.value;});
render();
/* in-app nudge on load for anything overdue */
setTimeout(()=>{const od=store.items.filter(i=>i.status==='open'&&(daysLeft(i)||0)<0);if(od.length&&'Notification' in window&&Notification.permission==='granted')new Notification('LastChance ⏰',{body:`You have ${od.length} overdue deadline(s). Open LastChance to act.`});},1500);
