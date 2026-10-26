"""Render approved-style layered illustration loops as static-hostable MP4s.
Requires numpy, opencv-python-headless, imageio-ffmpeg. No network at render time.
"""
from pathlib import Path
import argparse, json, math, subprocess, sys
import cv2, numpy as np
from PIL import Image
import imageio_ffmpeg

W,H,FPS,DURATION=1280,720,24,12
ROOT=Path(__file__).resolve().parents[1]
SPECS={
1:dict(box=[149,97,648,917],head=[.287,.205],chest=[.260,.410],shawl=[.160,.570]),
2:dict(box=[194,295,984,941],head=[.230,.410],chest=[.290,.600],shawl=[.300,.780]),
3:dict(box=[610,724,1044,941],head=[.440,.820],chest=[.490,.915],shawl=[.560,.910]),
4:dict(box=[506,260,960,724],head=[.530,.355],chest=[.470,.480],shawl=[.350,.510]),
5:dict(box=[807,327,1197,714],head=[.533,.425],chest=[.565,.535],shawl=[.654,.607]),
6:dict(box=[99,101,629,864],head=[.220,.200],chest=[.200,.400],shawl=[.102,.530])}

def render_scene(n, root, work):
 source=root/'assets/animation-sources'/f'scene-{n}'
 bg=np.array(Image.open(source/'background.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS))
 im=Image.open(source/'character.png').convert('RGBA')
 alpha=np.array(im.getchannel('A')); yy,xx=np.where(alpha>8)
 bounds=(int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1))
 spec=SPECS[n]; x0,y0,x1,y1=spec['box']; target=(round(x0*W/1672),round(y0*H/941),round(x1*W/1672),round(y1*H/941))
 layer=Image.new('RGBA',(W,H));cut=im.crop(bounds).resize((target[2]-target[0],target[3]-target[1]),Image.Resampling.LANCZOS);layer.paste(cut,target[:2]);fg=np.array(layer)
 # Premultiplied color prevents dark fringes when the transparent layer moves.
 af=fg[:,:,3:4].astype(np.float32)/255
 rgba=np.concatenate((fg[:,:,:3].astype(np.float32)*af,af*255),axis=2)
 Y,X=np.mgrid[:H,:W].astype(np.float32);U=X/W;V=Y/H
 def gauss(c,r):return np.exp(-2.2*(((U-c[0])/r[0])**2+((V-c[1])/r[1])**2)).astype(np.float32)
 chest=gauss(spec['chest'],(.11,.18));head=gauss(spec['head'],(.07,.11));shawl=gauss(spec['shawl'],(.07,.17))
 if n==3:chest*=.65;head*=.7;shawl*=.65
 if n==5:
  fishd=np.sqrt(((U-.5)/.47)**2+((V-.49)/.34)**2)
  k=np.clip((fishd-.8)/.7,0,1);fishmask=1-k*k*(3-2*k)
 else:fishmask=None
 # Water regions exclude ship and character; motion falls smoothly to zero.
 water=np.zeros((H,W),np.float32)
 if n==2:water=np.clip((U-.83)/.12,0,1)*np.clip((V-.37)/.2,0,1)
 if n==3:water=np.clip((U-.72)/.15,0,1)*np.clip((.65-V)/.25,0,1)
 if n==4:water=np.clip((U-.58)/.15,0,1)*np.clip((V-.5)/.15,0,1)
 sail=gauss([.78,.1],[.25,.18]) if n in (2,3,4) else np.zeros_like(U)
 leaves=gauss([.15,.10],[.18,.16]) if n==1 else np.zeros_like(U)
 crowd=np.zeros_like(U)
 if n==6:
  for c in [[.55,.65],[.73,.62],[.88,.69]]:crowd+=gauss(c,[.10,.20])*.5
 out=root/'assets/videos'/f'scene-{n}.mp4';out.parent.mkdir(parents=True,exist_ok=True)
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
 command=[ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(out)]
 process=subprocess.Popen(command,stdin=subprocess.PIPE)
 first=None;last=None;changed=None
 try:
  for frame in range(FPS*DURATION):
   u=frame/(FPS*DURATION);phase=2*math.pi*u;B=math.sin(phase*3);Q=math.sin(phase);S=math.sin(phase*2+.8)
   bdx=(water*2*np.sin(V*28+phase*2)+sail*1.4*math.sin(phase)+leaves*1.3*math.sin(phase*2)).astype(np.float32)
   bdy=(water*2.8*np.sin(U*22+phase*2)+crowd*.8*math.sin(phase*2)).astype(np.float32)
   if n==5:
    cyc=math.sin(phase*2);bmx=((U-.5)/(1+.009*cyc*fishmask)+.5)*W;bmy=((V-.49)/(1+.027*cyc*fishmask)+.49)*H
   else:bmx=X-bdx;bmy=Y-bdy
   back=cv2.remap(bg,bmx.astype(np.float32),bmy.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101).astype(np.float32)
   dy=-3.5*B*chest-1.7*math.sin(phase*3-.3)*head
   dx=(X-spec['chest'][0]*W)*.025*B*chest+1.5*Q*head+2.1*S*shawl
   if n==5:dy+=1.44*math.sin(phase*2)
   moved=cv2.remap(rgba,(X-dx).astype(np.float32),(Y-dy).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
   a=moved[:,:,3:4]/255;rgb=back*(1-a)+moved[:,:,:3]
   if n==5:
    glow=gauss([.55,.47],[.17,.25])*(.015+.008*B)
    rgb+=glow[:,:,None]*np.array([100,64,12],np.float32)
   rgb=np.clip(rgb,0,255).astype(np.uint8)
   if n==5:
    for i in range(22):
     px=((i*.3717)%1+.006*math.sin(phase+i*2.31))%1;py=1-(((i*.2343)%1+u*(1+i%2))%1)
     if .10<px<.88 and .17<py<.83:continue
     cv2.circle(rgb,(int(px*W),int(py*H)),2+i%3,(163,214,226),1,cv2.LINE_AA)
   if frame==0:first=rgb.copy();Image.fromarray(rgb).save(work/f'scene-{n}-start.jpg',quality=92)
   if frame==FPS:changed=rgb.copy();Image.fromarray(rgb).save(work/f'scene-{n}-motion.jpg',quality=92)
   last=rgb
   process.stdin.write(rgb.tobytes())
 finally:process.stdin.close()
 if process.wait()!=0:raise RuntimeError(f'Encoding scene {n} failed')
 assert np.mean(np.abs(first.astype(float)-changed.astype(float)))>.02,'Animation did not change'
 seam=float(np.mean(np.abs(first.astype(float)-last.astype(float))))
 report=dict(scene=n,width=W,height=H,fps=FPS,duration=DURATION,frames=FPS*DURATION,bytes=out.stat().st_size,mean_loop_seam_difference=round(seam,4),source_alpha_bbox=bounds,target_bbox=target)
 (work/f'scene-{n}-report.json').write_text(json.dumps(report,indent=2))
 print(json.dumps(report),flush=True)

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=ROOT);ap.add_argument('--work',type=Path,default=Path('.animation-render'));ap.add_argument('scenes',nargs='*',type=int);args=ap.parse_args();args.work.mkdir(parents=True,exist_ok=True)
 for n in args.scenes or range(1,7):render_scene(n,args.root,args.work)
