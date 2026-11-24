'use strict';
const KEY='infinity-bourbon-v1';
const seed=[];
const safeDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00'));
let entries;
try {const stored=localStorage.getItem(KEY);entries=stored===null?structuredClone(seed):JSON.parse(stored);if(!validEntries(entries))throw Error('Invalid data');if(stored===null)localStorage.setItem(KEY,JSON.stringify(entries));}catch(e){alert('Could not load saved data. Do not clear site storage. Error: '+e.message);entries=[];}
const $=id=>document.getElementById(id);
const fmt=(n,d=2)=>Number(n.toFixed(d)).toLocaleString(undefined,{maximumFractionDigits:d});
function validEntries(a){return Array.isArray(a)&&a.length<=100000&&a.every(x=>x&&['add','pour'].includes(x.type)&&safeDate(x.date)&&Number.isFinite(x.amount)&&x.amount>0&&x.amount<=100000&&(!x.note||typeof x.note==='string'&&x.note.length<=500)&&(x.type!=='add'||typeof x.name==='string'&&x.name.trim().length>0&&x.name.length<=100&&Number.isFinite(x.proof)&&x.proof>0&&x.proof<=200));}
function calculate(list){let parts=[];let volume=0;let adds=0,pours=0;for(const e of list){if(e.type==='add'){parts.push({name:e.name,amount:e.amount,proof:e.proof});volume+=e.amount;adds++;}else{if(e.amount>volume+1e-8)throw Error('A pour exceeds the amount available at that point in history');const factor=volume>0?Math.max(0,(volume-e.amount)/volume):0;for(const p of parts)p.amount*=factor;volume=Math.max(0,volume-e.amount);pours++;}}const weighted=parts.reduce((s,p)=>s+p.amount*p.proof,0);return{parts:parts.filter(p=>p.amount>1e-9),volume,proof:volume>1e-9?weighted/volume:0,adds,pours};}
function node(tag,cls,content){const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el;}
function render(){let state;try{state=calculate(entries);}catch(e){alert('Transaction history needs correction: '+e.message);return;}
 $('volume').textContent=fmt(state.volume,3)+' oz';$('proof').textContent=fmt(state.proof,3);$('abv').textContent=fmt(state.proof/2,2)+'% ABV';$('additions').textContent=state.adds;$('pours').textContent=state.pours;$('blendCount').textContent=state.parts.length+' ingredients';
 const comp=$('composition');comp.replaceChildren();const grouped=new Map();for(const p of state.parts){const k=p.name+'|'+p.proof;if(!grouped.has(k))grouped.set(k,{...p});else grouped.get(k).amount+=p.amount;}
 for(const p of [...grouped.values()].sort((a,b)=>b.amount-a.amount)){const percent=state.volume?100*p.amount/state.volume:0;const item=node('div','composition-item');const top=node('div','comp-top');top.append(node('span','comp-name',p.name),node('span','',fmt(percent,2)+'%'));item.append(top,node('div','comp-meta',fmt(p.amount,3)+' oz remaining · '+fmt(p.proof,3)+' proof'));const bar=node('div','bar');const fill=node('div','bar-fill');fill.style.width=percent+'%';bar.append(fill);item.append(bar);comp.append(item);}
 if(!grouped.size)comp.append(node('p','muted','Bottle is empty. Add bourbon to get started.'));
 const hist=$('history');hist.replaceChildren();entries.slice().reverse().forEach(e=>{const row=node('div','history-item');const left=node('div');left.append(node('div','history-title',e.type==='add'?e.name:'Pour removed'));const sub=[e.date,e.type==='add'?fmt(e.proof,3)+' proof':'',e.note||''].filter(Boolean).join(' · ');left.append(node('div','history-sub',sub));row.append(left,node('div','history-amount'+(e.type==='pour'?' out':''),(e.type==='pour'?'-':'+')+fmt(e.amount,3)+' oz'));hist.append(row);});$('undoBtn').disabled=!entries.length;
}
function save(next){if(!validEntries(next))throw Error('Invalid transaction data');calculate(next);localStorage.setItem(KEY,JSON.stringify(next));entries=next;render();}
function toast(message){const el=$('toast');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',3000);}
let mode='add';function openForm(type){mode=type;$('entryForm').reset();$('formError').textContent='';$('entryDate').value=[new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,'0'),String(new Date().getDate()).padStart(2,'0')].join('-');$('dialogTitle').textContent=type==='add'?'Add bourbon':'Record pour';$('submitEntry').textContent=type==='add'?'Save addition':'Save pour';$('addFields').hidden=type==='pour';$('whiskeyName').required=type==='add';$('whiskeyProof').required=type==='add';$('entryDialog').showModal();}
$('addBtn').onclick=()=>openForm('add');$('pourBtn').onclick=()=>openForm('pour');$('closeDialog').onclick=()=>$('entryDialog').close();
$('entryForm').onsubmit=e=>{e.preventDefault();const amount=Number($('entryAmount').value);const date=$('entryDate').value;const note=$('entryNote').value.trim();const record={type:mode,date,amount};if(note)record.note=note;if(mode==='add'){record.name=$('whiskeyName').value.trim();record.proof=Number($('whiskeyProof').value);}try{save([...entries,record]);$('entryDialog').close();toast(mode==='add'?'Bourbon added':'Pour recorded');}catch(err){$('formError').textContent=err.message;}};
const undoDialog=$('undoDialog');let pendingUndo=null;
$('undoBtn').onclick=()=>{if(!entries.length)return;const last=entries[entries.length-1];pendingUndo=JSON.stringify(entries);$('undoName').textContent=last.type==='add'?last.name:'Pour removed';$('undoDetails').textContent=fmt(last.amount,3)+' oz'+(last.type==='add'?' · '+fmt(last.proof,3)+' proof':'');$('undoDate').textContent='Date: '+last.date;undoDialog.showModal();};
$('cancelUndo').onclick=()=>undoDialog.close();
undoDialog.addEventListener('close',()=>{pendingUndo=null;});
$('confirmUndo').onclick=()=>{if(pendingUndo===null||JSON.stringify(entries)!==pendingUndo){undoDialog.close();alert('History changed. Review Undo Last again.');return;}try{save(entries.slice(0,-1));undoDialog.close();toast('Last transaction removed');}catch(e){alert(e.message);}};
$('newBottleBtn').onclick=()=>{if(!entries.length){toast('Your bottle is already empty');return;}if(!confirm('START NEW BOTTLE\n\nThis will remove all '+entries.length+' transactions from this device.\n\nDownload a JSON backup first. This is not reversible with Undo Last.\n\nContinue?'))return;if(!confirm('FINAL CONFIRMATION\n\nClear this bottle and start fresh?\n\nYou can still restore a saved Google Drive backup.'))return;try{save([]);toast('New empty bottle started');backupDialog.close();}catch(e){alert(e.message);}};
function download(filename,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function localDate(date) {
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,'0');
 const day=String(date.getDate()).padStart(2,'0');
 return year+'-'+month+'-'+day;
}
function describeHistory(records) {
 const additions=records.filter(record=>record.type==='add').length;
 const pours=records.length-additions;
 const count=(number,label)=>number+' '+label+(number===1?'':'s');
 return count(records.length,'transaction')+' ('+count(additions,'addition')+', '+count(pours,'pour')+')';
}
function confirmBackupAction(title, detail, action) {
 const dialog=$('backupConfirm');
 if(dialog.open)return Promise.resolve(false);
 $('backupConfirmTitle').textContent=title;
 $('backupConfirmDetail').textContent=detail;
 $('backupConfirmAction').textContent=action;
 dialog.returnValue='cancel';
 return new Promise(resolve=>{
  dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});
  dialog.showModal();
 });
}
$('exportJson').onclick=()=>{
 const now=new Date();
 download('infinity-bourbon-backup-'+localDate(now)+'.json',
  JSON.stringify({app:'Infinity Bourbon',schemaVersion:1,exportedAt:now.toISOString(),transactions:entries},null,2),
  'application/json');
 $('fileStatus').textContent='Backup file exported.';
};
$('exportCsv').onclick=()=>{
 const fields=['type','date','name','amount','proof','note'];
 const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 const spreadsheetCell=value=>typeof value==='string'&&/^[\s]*[=+@-]|^[\t\r\n]/.test(value)?"'"+value:value;
 const csv=[fields.join(','),...entries.map(record=>fields.map(field=>quote(spreadsheetCell(record[field]))).join(','))].join('\r\n');
 download('infinity-bourbon-history.csv','\ufeff'+csv,'text/csv;charset=utf-8');
};
$('importBtn').onclick=()=>$('importFile').click();
$('importFile').onchange=async event=>{
 const input=event.target;
 const file=input.files[0];
 if(!file)return;
 const status=$('fileStatus');
 $('importBtn').disabled=true;
 try{
  if(file.size>5e6)throw Error('File is too large');
  const data=JSON.parse(await file.text());
  if(data?.app!=='Infinity Bourbon'||data.schemaVersion!==1||!validEntries(data.transactions))throw Error('Choose a valid Infinity Bourbon JSON backup.');
  calculate(data.transactions);
  const before=localStorage.getItem(KEY);
  const accepted=await confirmBackupAction('Restore from Backup File?',
   'Replace '+describeHistory(entries)+' on this device with '+describeHistory(data.transactions)+' from '+file.name+'?','Restore Backup');
  if(!accepted){status.textContent='Restore canceled.';return;}
  if(localStorage.getItem(KEY)!==before)throw Error('Local history changed. Try again.');
  save(data.transactions);
  status.textContent='Backup restored. This device now has '+describeHistory(entries)+'.';
 }catch(error){status.textContent='Restore failed: '+error.message;}
 finally{input.value='';$('importBtn').disabled=false;}
};
const backupDialog=$('backupDialog');
const backupTools=$('backupTools');
$('settingsTop').onclick=()=>backupDialog.showModal();
$('closeBackup').onclick=$('settingsDone').onclick=()=>backupDialog.close();
$('openBackupTools').onclick=()=>backupTools.showModal();
$('backToSettings').onclick=$('backupDone').onclick=()=>backupTools.close();
const aboutDialog=$('aboutDialog');
if(aboutDialog){
 $('openAbout').onclick=()=>aboutDialog.showModal();
 $('closeAbout').onclick=$('aboutDone').onclick=()=>aboutDialog.close();
}
for(const dialog of [backupDialog,backupTools,aboutDialog].filter(Boolean)){
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
}
render();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
