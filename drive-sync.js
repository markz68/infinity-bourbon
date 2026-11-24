/* Infinity Bourbon Google Drive manual sync. Access tokens are held in memory. */
(()=>{'use strict';
const $=id=>document.getElementById(id), FILE='infinity-bourbon.json', SCOPE='https://www.googleapis.com/auth/drive.appdata';
const BASE='infinity-bourbon-drive-base-v1', KEY='infinity-bourbon-v1';
const LAST_SYNC='infinity-bourbon-drive-last-sync';
let token=null, tokenClient=null, busy=false;
const status=s=>{$('driveStatus').textContent=s};
const current=()=>JSON.parse(localStorage.getItem(KEY));
// Compare validated transaction values, not object property insertion order.
const serial=x=>JSON.stringify(x.map(e=>({type:e.type,date:e.date,amount:e.amount,name:e.type==='add'?e.name:null,proof:e.type==='add'?e.proof:null,note:e.note||null})));
const counts=describeHistory;
// Legacy v1.2.1 baseline is raw JSON; normalize it when reading.
const base=()=>{const raw=localStorage.getItem(BASE);if(raw===null)return null;try{const data=JSON.parse(raw);return Array.isArray(data)?serial(data):null;}catch{return null;}};
function setBase(records) {
 localStorage.setItem(BASE,serial(records));
 try{localStorage.setItem(LAST_SYNC,new Date().toISOString());}catch{}
 refreshLastSync();
}
function refreshLastSync() {
 const last=localStorage.getItem(LAST_SYNC);
 const label=$('driveLastSync');
 label.hidden=!token||!last;
 label.textContent=last?'Last successful sync or backup/restore: '+new Date(last).toLocaleString():'';
}
function setConnected(connected) {
 $('driveConnect').hidden=connected;
 $('driveActions').hidden=!connected;
 for(const id of ['driveSync','driveRestore','driveBackup','driveDisconnect']){
  $(id).disabled=!connected||busy;
 }
 $('importBtn').disabled=busy;
 refreshLastSync();
}
function begin(message) {
 busy=true;
 setConnected(true);
 status(message);
}
function finish() {
 busy=false;
 setConnected(Boolean(token));
}
function validate(x){if(!Array.isArray(x)||x.length>100000)throw Error('Invalid transaction array');if(typeof validEntries!=='function'||!validEntries(x))throw Error('Invalid transaction records');calculate(x);}
async function api(path,options={}){const response=await fetch('https://www.googleapis.com/drive/v3/'+path,{...options,headers:{Authorization:'Bearer '+token,...(options.headers||{})}});if(!response.ok){if(response.status===401){token=null;setConnected(false)}throw Error('Google Drive '+response.status+': '+(await response.text()).slice(0,180))}return response;}
async function findFile(){const q=encodeURIComponent("name = '"+FILE+"' and 'appDataFolder' in parents and trashed = false");const r=await api('files?spaces=appDataFolder&fields=nextPageToken,files(id,name,modifiedTime)&page_size=100&q='+q);const j=await r.json();if((j.files||[]).length>1)throw Error('Multiple cloud data files found; refusing to sync.');return (j.files||[])[0]||null;}
async function downloadFile(id){const r=await api('files/'+encodeURIComponent(id)+'?alt=media');const j=await r.json();if(j.app!=='Infinity Bourbon'||j.schemaVersion!==1)throw Error('Unexpected cloud file format');validate(j.transactions);return j.transactions;}
async function uploadFile(file,items){validate(items);const payload=JSON.stringify({app:'Infinity Bourbon',schemaVersion:1,updatedAt:new Date().toISOString(),transactions:items});if(file){const response=await fetch('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(file.id)+'?uploadType=media&fields=id,size,md5Checksum',{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:payload});if(!response.ok)throw Error('Cloud update failed: '+response.status+' '+(await response.text()).slice(0,180));const uploaded=await response.json();if(!uploaded.id)throw Error('Cloud update did not return a file ID');const check=await downloadFile(file.id);if(serial(check)!==serial(items))throw Error('Cloud verification failed: uploaded records do not match.');}else{const boundary='ib'+Date.now();const meta=JSON.stringify({name:FILE,parents:['appDataFolder'],mimeType:'application/json'});const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+payload+'\r\n--'+boundary+'--';const response=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body});if(!response.ok)throw Error('Upload failed: '+response.status+' '+(await response.text()).slice(0,120));const created=await response.json();if(!created.id)throw Error('Cloud creation returned no file ID');const check=await downloadFile(created.id);if(serial(check)!==serial(items))throw Error('First cloud upload verification failed');}}
async function sync() {
 if(busy||!token||$('importBtn').disabled)return;
 begin('Checking Google Drive…');
 try{
  const local=current();
  validate(local);
  const file=await findFile();
  const remote=file?await downloadFile(file.id):null;
  const localSignature=serial(local);
  const remoteSignature=remote===null?null:serial(remote);
  if(localSignature===remoteSignature){
   setBase(local);
   status('In sync. '+counts(local)+'.');
   return;
  }
  if(file&&local.length===0&&remote.length>0){
   status('This device is empty. Choose Restore from Google Drive to retrieve '+counts(remote)+'.');
   return;
  }
  const baseline=base();
  if(!file||baseline===remoteSignature){
   await verifySnapshots(file,remote,localSignature);
   await uploadFile(file,local);
   setBase(local);
   status('Backup verified. '+counts(local)+'.');
   return;
  }
  if(baseline===localSignature){
   await restorePreview(file,local,remote);
   return;
  }
  status('Sync conflict. This device has '+counts(local)+' and Google Drive has '+counts(remote)+'. Review both copies and choose which one to keep.');
 }catch(error){status('Sync stopped: '+error.message);}
 finally{finish();}
}
$('driveConnect').onclick=()=>{const id=window.INFINITY_BOURBON_GOOGLE_CLIENT_ID;if(!id||id.startsWith('PASTE_')){status('Google Cloud setup required: enter your OAuth Web client ID in drive-config.js.');return;}if(!window.google?.accounts?.oauth2){status('Google sign-in unavailable. Connect to the internet and retry.');return;}tokenClient=google.accounts.oauth2.initTokenClient({client_id:id,scope:SCOPE,callback:res=>{if(res.error){status('Google sign-in failed: '+res.error);return;}token=res.access_token;setConnected(true);status('Connected to Google Drive.')}});tokenClient.requestAccessToken({prompt:'consent'});};

// Recheck both copies after an operation preview and before writing.
async function verifySnapshots(file, remote, localSignature) {
 const latest=await findFile();
 if((latest?.id??null)!==(file?.id??null))throw Error('Google Drive backup changed. Try again.');
 if(file&&serial(await downloadFile(file.id))!==serial(remote))throw Error('Google Drive backup changed. Try again.');
 if(serial(current())!==localSignature)throw Error('Local history changed. Try again.');
}
async function backUpToDrive() {
 if(busy||!token||$('importBtn').disabled)return;
 begin('Checking the Google Drive backup…');
 try{
  const local=current();
  validate(local);
  const file=await findFile();
  const remote=file?await downloadFile(file.id):null;
  const snapshot=serial(local);
  if(remote!==null&&serial(remote)===snapshot){
   setBase(local);
   status('Google Drive already matches this device. '+counts(local)+'.');
   return;
  }
  if(remote?.length&&local.length===0){
   status('This device is empty. Choose Restore from Google Drive to retrieve '+counts(remote)+'.');
   return;
  }
  const detail=file?'Replace '+counts(remote)+' in Google Drive with '+counts(local)+' from this device?':
   'Save '+counts(local)+' from this device to Google Drive?';
  if(!await confirmBackupAction('Back Up to Google Drive?',detail,'Back Up to Google Drive')){
   status('Backup canceled.');
   return;
  }
  await verifySnapshots(file,remote,snapshot);
  status('Saving and verifying your Google Drive backup…');
  await uploadFile(file,local);
  setBase(local);
  status('Google Drive backup verified. '+counts(local)+'.');
 }catch(error){status('Backup stopped: '+error.message);}
 finally{finish();}
}
async function restorePreview(file, local, remote) {
 const accepted=await confirmBackupAction('Restore from Google Drive?',
  'Replace '+counts(local)+' on this device with '+counts(remote)+' from Google Drive?','Restore from Google Drive');
 if(!accepted){status('Restore canceled.');return;}
 await verifySnapshots(file,remote,serial(local));
 save(remote);
 setBase(remote);
 status('Restore complete. This device now has '+counts(remote)+'.');
}
async function restoreFromDrive() {
 if(busy||!token||$('importBtn').disabled)return;
 begin('Checking the Google Drive backup…');
 try{
  const local=current();
  validate(local);
  const file=await findFile();
  if(!file){status('No Google Drive backup found.');return;}
  const remote=await downloadFile(file.id);
  if(serial(local)===serial(remote)){
   setBase(local);
   status('This device already matches Google Drive. '+counts(local)+'.');
   return;
  }
  await restorePreview(file,local,remote);
 }catch(error){status('Restore stopped: '+error.message);}
 finally{finish();}
}

$('driveRestore').onclick=restoreFromDrive;
$('driveBackup').onclick=backUpToDrive;
$('driveSync').onclick=sync;
$('driveDisconnect').onclick=()=>{
 if(token&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(token,()=>{});
 token=null;
 setConnected(false);
 status('Google Drive is disconnected.');
};
})();
