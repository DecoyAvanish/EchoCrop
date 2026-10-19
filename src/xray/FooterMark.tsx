import {useEffect,useRef} from 'react';

// Cyan → red → green across the word, matching the three steps. Walking the hue wheel (through violet, then amber) keeps the in-between letters vivid instead of muddy.
const hues=[189,351,516];
const tint=(t:number)=>{t=Math.min(1,Math.max(0,t));const h=(t<.5?hues[0]+(hues[1]-hues[0])*t*2:hues[1]+(hues[2]-hues[1])*(t-.5)*2)%360;
  const l=.61,c=(1-Math.abs(2*l-1)),x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return [r,g,b].map(v=>Math.round((v+m)*255))};
const mix=(t:number)=>`rgb(${tint(t).join(',')})`;

const GAP=24,REACH=270,PUSH=18,RING=900;

/** The footer wordmark and the dot field behind it. Letters swell and the dots light up and part around the pointer; a click sends out a ripple; with no pointer a beam sweeps across on its own. */
export function FooterMark({word,reduced}:{word:string;reduced:boolean}){
  const host=useRef<HTMLDivElement>(null),field=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const el=host.current,canvas=field.current;if(!el||!canvas)return;
    const zone=el.closest('footer')??el.parentElement!;
    const ctx=canvas.getContext('2d');
    const letters=[...el.querySelectorAll<HTMLElement>('.fm-letter')];
    let W=0,H=0,reach=REACH,dot='150,180,210',visible=false,frame=0,last=performance.now(),still=0;
    let pointer:{x:number,y:number}|null=null;
    const cur={x:-999,y:-999,a:0};const rings:{x:number,y:number,t:number}[]=[];const start=last;

    const size=()=>{
      const r=zone.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;
      reach=Math.min(REACH,Math.max(110,W*.3));canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
      dot=getComputedStyle(zone).getPropertyValue('--fx-dot').trim()||dot;still=0;
    };
    // Where the mark sits inside the footer, for the auto sweep and the letter falloff.
    const markBox=()=>{const z=zone.getBoundingClientRect(),m=el.getBoundingClientRect();return {x:m.left-z.left,y:m.top-z.top,w:m.width,h:m.height}};

    const paint=(now:number,m:ReturnType<typeof markBox>)=>{
      const on=cur.a>.01,z=zone.getBoundingClientRect();
      // Read every letter first, then write, so the loop never forces a relayout.
      const centers=letters.map(letter=>{const r=letter.getBoundingClientRect();return r.left+r.width/2-z.left});
      letters.forEach((letter,i)=>{
        const d=Math.abs(centers[i]-cur.x)/(m.w*.17);
        letter.style.setProperty('--p',on?(Math.max(0,1-d*d)*cur.a).toFixed(3):'0');
      });
      el.style.setProperty('--bx',`${cur.x-m.x}px`);
      el.classList.toggle('scanning',on);
      if(!ctx)return;
      ctx.clearRect(0,0,W,H);
      const [r,g,b]=tint((cur.x-m.x)/m.w);
      if(on&&!reduced){
        const glow=ctx.createRadialGradient(cur.x,cur.y,0,cur.x,cur.y,reach*1.6);
        glow.addColorStop(0,`rgba(${r},${g},${b},${.16*cur.a})`);glow.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
      }
      const live=reduced?[]:rings.filter(ring=>now-ring.t<RING);rings.splice(0,rings.length,...live);
      for(const ring of live){const k=Math.max(0,now-ring.t)/RING,[rr,rg,rb]=tint((ring.x-m.x)/m.w);
        ctx.strokeStyle=`rgba(${rr},${rg},${rb},${.45*(1-k)**2})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ring.x,ring.y,k*reach*2.2,0,Math.PI*2);ctx.stroke()}
      for(let y=GAP/2;y<H;y+=GAP)for(let x=GAP/2;x<W;x+=GAP){
        let px=x,py=y,f=0;
        if(on){const dx=x-cur.x,dy=y-cur.y,d=Math.hypot(dx,dy);if(d<reach){f=(1-d/reach)**2*cur.a;if(!reduced&&d>0){px+=dx/d*f*PUSH;py+=dy/d*f*PUSH}}}
        for(const ring of live){const k=Math.max(0,now-ring.t)/RING,rad=k*reach*2.2,d=Math.hypot(x-ring.x,y-ring.y),band=Math.max(0,1-Math.abs(d-rad)/28)*(1-k);
          if(band>0){f=Math.max(f,band);if(d>0){px+=(x-ring.x)/d*band*10;py+=(y-ring.y)/d*band*10}}}
        if(f<.02){ctx.fillStyle=`rgba(${dot},.13)`;ctx.fillRect(px-.75,py-.75,1.5,1.5);continue}
        const [cr,cg,cb]=tint((px-m.x)/m.w);
        ctx.fillStyle=`rgba(${cr},${cg},${cb},${Math.min(1,.12+f*.9)})`;
        const s=1.5+f*2.8;ctx.beginPath();ctx.arc(px,py,s/2,0,Math.PI*2);ctx.fill();
      }
    };

    const tick=(now:number)=>{
      if(!visible)return;
      frame=requestAnimationFrame(tick);
      const dt=Math.min(64,Math.max(0,now-last));last=now;
      const m=markBox();
      let target=pointer;
      if(!target&&!reduced)target={x:m.x-.15*m.w+(((now-start)/7000)%1)*1.3*m.w,y:m.y+m.h*.55};
      const k=reduced?1:1-Math.pow(1-.16,dt/16.7);
      if(target){if(cur.a<.01){cur.x=target.x;cur.y=target.y}cur.x+=(target.x-cur.x)*k;cur.y+=(target.y-cur.y)*k}
      const want=target?1:0;cur.a+=(want-cur.a)*(reduced?1:k*.6);
      const moving=target&&(Math.abs(target.x-cur.x)>.2||Math.abs(target.y-cur.y)>.2)||Math.abs(want-cur.a)>.005||rings.length>0;
      // Only repaint while something is changing; a resting pointer costs nothing.
      if(moving||still<2){paint(now,m);still=moving?0:still+1}
    };

    const local=(e:PointerEvent)=>{const z=zone.getBoundingClientRect();return {x:e.clientX-z.left,y:e.clientY-z.top}};
    const move=(e:Event)=>{pointer=local(e as PointerEvent);still=0};
    const leave=()=>{pointer=null;still=0};
    const press=(e:Event)=>{if(reduced)return;const p=local(e as PointerEvent);rings.push({...p,t:performance.now()});still=0};
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;cancelAnimationFrame(frame);if(visible){last=performance.now();still=0;frame=requestAnimationFrame(tick)}});
    const ro=new ResizeObserver(size);
    size();ro.observe(zone);io.observe(zone);
    zone.addEventListener('pointermove',move);zone.addEventListener('pointerleave',leave);zone.addEventListener('pointerdown',press);
    return()=>{io.disconnect();ro.disconnect();cancelAnimationFrame(frame);zone.removeEventListener('pointermove',move);zone.removeEventListener('pointerleave',leave);zone.removeEventListener('pointerdown',press)};
  },[reduced]);
  const chars=[...word];
  return <>
    <canvas className="footer-field" ref={field} aria-hidden="true"/>
    <div className="footer-mark" ref={host} aria-hidden="true">
      {chars.map((ch,i)=><span className="fm-letter" key={i} style={{'--lc':mix(chars.length>1?i/(chars.length-1):0)} as React.CSSProperties}>{ch}</span>)}
      <i className="mark-beam"/>
    </div>
  </>;
}
