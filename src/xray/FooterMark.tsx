import {useEffect,useRef} from 'react';

// Cyan → red → green across the word, matching the three steps.
const stops=[[56,225,255],[255,61,90],[60,240,168]];
const mix=(t:number)=>{const s=t<.5?0:1,k=t<.5?t*2:(t-.5)*2;const a=stops[s],b=stops[s+1];return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`};

/** The footer wordmark. Letters swell and light up around the pointer; with no pointer a beam sweeps across on its own. */
export function FooterMark({word,reduced}:{word:string;reduced:boolean}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=host.current;if(!el)return;
    const letters=[...el.querySelectorAll<HTMLElement>('.fm-letter')];
    const zone=el.closest('footer')??el;
    let pointer:number|null=null,visible=false,frame=0;const start=performance.now();
    const scan=(x:number|null)=>{
      const box=el.getBoundingClientRect();
      for(const letter of letters){
        if(x===null){letter.style.setProperty('--p','0');continue}
        const r=letter.getBoundingClientRect();const d=Math.abs(r.left+r.width/2-box.left-x)/(box.width*.17);
        letter.style.setProperty('--p',Math.max(0,1-d*d).toFixed(3));
      }
      el.style.setProperty('--bx',x===null?'-20%':`${x}px`);
      el.classList.toggle('scanning',x!==null);
    };
    const tick=(now:number)=>{
      if(!visible)return;
      if(pointer===null&&!reduced){const w=el.getBoundingClientRect().width;scan(-.15*w+(((now-start)/7000)%1)*1.3*w)}
      frame=requestAnimationFrame(tick);
    };
    const move=(e:Event)=>{const box=el.getBoundingClientRect();pointer=(e as PointerEvent).clientX-box.left;scan(pointer)};
    const leave=()=>{pointer=null;if(reduced)scan(null)};
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;cancelAnimationFrame(frame);if(visible)frame=requestAnimationFrame(tick)});
    io.observe(el);zone.addEventListener('pointermove',move);zone.addEventListener('pointerleave',leave);
    if(reduced)scan(null);
    return()=>{io.disconnect();cancelAnimationFrame(frame);zone.removeEventListener('pointermove',move);zone.removeEventListener('pointerleave',leave)};
  },[reduced]);
  const chars=[...word];
  return <div className="footer-mark" ref={host} aria-hidden="true">
    {chars.map((ch,i)=><span className="fm-letter" key={i} style={{'--lc':mix(chars.length>1?i/(chars.length-1):0)} as React.CSSProperties}>{ch}</span>)}
    <i className="mark-beam"/>
  </div>;
}
