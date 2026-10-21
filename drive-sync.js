/* Infinity Bourbon Google Drive manual sync v1.2.0. No credentials are stored. */
(()=>{'use strict';
const $=id=>document.getElementById(id), FILE='infinity-bourbon.json', SCOPE='https://www.googleapis.com/auth/drive.appdata';
const BASE='infinity-bourbon-drive-base-v1', KEY='infinity-bourbon-v1';
let token=null, tokenClient=null, busy=false;
const status=s=>{$('driveStatus').textContent=s};
const current=()=>JSON.parse(localStorage.getItem(KEY));
const serial=x=>JSON.stringify(x);
const base=()=>localStorage.getItem(BASE);
const setBase=x=>localStorage.setItem(BASE,serial(x));
function setConnected(yes){$('driveSync').disabled=!yes;$('driveDisconnect').disabled=!yes;$('driveConnect').disabled=yes;}
function validate(x){if(!Array.isArray(x)||x.length>100000)throw Error('Invalid transaction array');if(typeof validEntries!=='function'||!validEntries(x))throw Error('Invalid transaction records');calculate(x);}
async function api(path,options={}){const response=await fetch('https://www.googleapis.com/drive/v3/'+path,{...options,headers:{Authorization:'Bearer '+token,...(options.headers||{})}});if(!response.ok){if(response.status===401){token=null;setConnected(false)}throw Error('Google Drive '+response.status+': '+(await response.text()).slice(0,180))}return response;}
async function findFile(){const q=encodeURIComponent("name = '"+FILE+"' and 'appDataFolder' in parents and trashed = false");const r=await api('files?spaces=appDataFolder&fields=nextPageToken,files(id,name,modifiedTime)&page_size=100&q='+q);const j=await r.json();if((j.files||[]).length>1)throw Error('Multiple cloud data files found; refusing to sync.');return (j.files||[])[0]||null;}
async function downloadFile(id){const r=await api('files/'+encodeURIComponent(id)+'?alt=media');const j=await r.json();if(j.app!=='Infinity Bourbon'||j.schemaVersion!==1)throw Error('Unexpected cloud file format');validate(j.transactions);return j.transactions;}
async function uploadFile(file,items){validate(items);const payload=JSON.stringify({app:'Infinity Bourbon',schemaVersion:1,updatedAt:new Date().toISOString(),transactions:items});if(file){await api('files/'+encodeURIComponent(file.id)+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body:payload});}else{const boundary='ib'+Date.now();const meta=JSON.stringify({name:FILE,parents:['appDataFolder'],mimeType:'application/json'});const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+payload+'\r\n--'+boundary+'--';const response=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body});if(!response.ok)throw Error('Upload failed: '+response.status+' '+(await response.text()).slice(0,120));}}
async function sync(){if(busy||!token)return;busy=true;$('driveSync').disabled=true;status('Checking private Drive folder…');try{const local=current();validate(local);const file=await findFile();if(!file){await uploadFile(null,local);setBase(local);status('First backup uploaded to private Google Drive. In sync.');return;}
const remote=await downloadFile(file.id),l=serial(local),r=serial(remote),b=base();
if(l===r){setBase(local);status('In sync. No changes needed.');return;}
if(b===r){await uploadFile(file,local);setBase(local);status('Local changes uploaded. In sync.');return;}
if(b===l){if(confirm('Google Drive has newer records. Replace this device’s local copy? Export a JSON backup first if unsure.')){save(remote);setBase(remote);status('Cloud changes downloaded. In sync.');}else status('Download canceled. No records changed.');return;}
status('Conflict: local and Drive data differ. No changes made. Export backups from both devices before resolving.');
}catch(e){status('Sync stopped safely: '+e.message)}finally{busy=false;$('driveSync').disabled=!token;}}
$('driveConnect').onclick=()=>{const id=window.INFINITY_BOURBON_GOOGLE_CLIENT_ID;if(!id||id.startsWith('PASTE_')){status('Google Cloud setup required: enter your OAuth Web client ID in drive-config.js.');return;}if(!window.google?.accounts?.oauth2){status('Google sign-in unavailable. Connect to the internet and retry.');return;}tokenClient=google.accounts.oauth2.initTokenClient({client_id:id,scope:SCOPE,callback:res=>{if(res.error){status('Google sign-in failed: '+res.error);return;}token=res.access_token;setConnected(true);status('Connected. Tap Sync now to compare local and cloud records.')}});tokenClient.requestAccessToken({prompt:'consent'});};
$('driveSync').onclick=sync;
$('driveDisconnect').onclick=()=>{if(token&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(token,()=>{});token=null;setConnected(false);status('Disconnected. Local records preserved.');};
})();
