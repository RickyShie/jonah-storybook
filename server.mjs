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
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let file;
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);res.end();return;}
 const relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(file).pipe(res);
 });
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?`Port ${port} is already in use. Open http://localhost:${port} if this game is already running, or use another PORT.`:err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 const url=`http://localhost:${port}`;console.log(`ヨナのものがたり\n${url}\nPress Ctrl+C to stop.`);
 if(process.argv.includes('--open'))execFile(process.platform==='darwin'?'open':process.platform==='win32'?'explorer':'xdg-open',[url]);
});
