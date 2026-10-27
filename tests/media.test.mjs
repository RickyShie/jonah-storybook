import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const child=spawn(process.execPath,['server.mjs','--dist'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
try {
 const base=await new Promise((resolve,reject)=>{
  let text='';const timer=setTimeout(()=>reject(Error('Preview server did not start')),5000);
  child.stdout.on('data',chunk=>{text+=chunk;const m=/http:\/\/localhost:(\d+)/.exec(text);if(m){clearTimeout(timer);resolve(`http://127.0.0.1:${m[1]}`);}});
  child.on('error',error=>{clearTimeout(timer);reject(error);});
  child.on('exit',code=>{clearTimeout(timer);reject(Error(`Preview server exited early (${code})`));});
 });
 for(let scene=1;scene<=5;scene++){
  const file=path.join(root,'dist/assets/videos',`scene-${scene}.mp4`), bytes=await stat(file);
  const url=`${base}/assets/videos/scene-${scene}.mp4`;
  const head=await fetch(url,{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');assert.equal(Number(head.headers.get('content-length')),bytes.size);
  const partial=await fetch(url,{headers:{Range:'bytes=0-31'}});
  assert.equal(partial.status,206);assert.equal(partial.headers.get('content-range'),`bytes 0-31/${bytes.size}`);
  const prefix=Buffer.from(await partial.arrayBuffer());assert.equal(prefix.length,32);assert.equal(prefix.toString('ascii',4,8),'ftyp');
  const suffix=await fetch(url,{headers:{Range:'bytes=-32'}});assert.equal(suffix.status,206);
  assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),(await readFile(file)).subarray(-32));
  const invalid=await fetch(url,{headers:{Range:`bytes=${bytes.size}-`}});assert.equal(invalid.status,416);
 }
 console.log('PASS: all five published MP4s have correct MIME, HEAD, byte-range, suffix, and invalid-range responses.');
} finally {child.kill('SIGTERM');}
