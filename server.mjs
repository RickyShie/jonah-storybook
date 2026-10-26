import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
const projectRoot=path.dirname(fileURLToPath(import.meta.url));
const root=process.argv.includes('--dist')?path.join(projectRoot,'dist'):projectRoot;
if(!fs.existsSync(path.join(root,'index.html'))){
 console.error('Website files are missing. Run npm run build before npm run preview.');
 process.exit(1);
}
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let file;
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);res.end();return;}
 const relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
   if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;}
   else {const suffix=Number(match[2]);start=Math.max(0,stat.size-suffix);if(suffix===0)start=stat.size;}
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=stat.size||end<start){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);
  res.writeHead(status,headers);
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file,{start,end}).pipe(res);
 });
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?`Port ${port} is already in use. Open http://localhost:${port} if this game is already running, or use another PORT.`:err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 const url=`http://localhost:${server.address().port}`;console.log(`ヨナのものがたり\n${url}\nPress Ctrl+C to stop.`);
 if(process.argv.includes('--open'))execFile(process.platform==='darwin'?'open':process.platform==='win32'?'explorer':'xdg-open',[url]);
});
