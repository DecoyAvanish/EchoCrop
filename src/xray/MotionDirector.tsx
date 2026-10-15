import {useEffect} from 'react';
import {StructureFlowCollection} from '../shaders/structure-flow/StructureFlowCollection';

const headingSelector='.process h2,.signals h2,.examples h2,.privacy h2,.final-cta h2,.page-heading h1,.learn-cta h2,.report-head h1,.negotiation h2';
const revealSelector='.process article,.signal,.compare,.privacy>div,.glossary article,.top-problems article,.breakdown,.negotiation>div,.final-cta>*';

function splitText(root:Element){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.textContent?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
  const nodes:Text[]=[];while(walker.nextNode())nodes.push(walker.currentNode as Text);let index=0;
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();[...(node.textContent||'')].forEach(char=>{const span=document.createElement('span');span.className='type-char';span.style.setProperty('--char',String(index++));span.textContent=char===' '?'\u00a0':char;fragment.append(span)});node.replaceWith(fragment)});
  root.setAttribute('data-char-count',String(index));
}

export default function MotionDirector({page,reduced}:{page:string;reduced:boolean}){
  useEffect(()=>{
    const app=document.querySelector('.app');
    app?.classList.toggle('reduced-motion',reduced);
    document.documentElement.classList.toggle('reduced-motion',reduced);
    return()=>{app?.classList.remove('reduced-motion');document.documentElement.classList.remove('reduced-motion')};
  },[reduced]);
  useEffect(()=>{
    if(reduced)return;
    const forward=(event:PointerEvent)=>{
      const canvas=document.querySelector<HTMLCanvasElement>('.structure-dot-field canvas');
      canvas?.dispatchEvent(new PointerEvent('pointermove',{clientX:event.clientX,clientY:event.clientY}));
    };
    window.addEventListener('pointermove',forward,{passive:true});
    return()=>window.removeEventListener('pointermove',forward);
  },[reduced]);
  useEffect(()=>{if(reduced)return;const app=document.querySelector('.app') as HTMLElement|null;if(!app)return;const headings=[...document.querySelectorAll(headingSelector)];headings.forEach(splitText);const reveal=[...document.querySelectorAll(revealSelector)] as HTMLElement[];reveal.forEach((el,i)=>{el.classList.add('fx-reveal');el.style.setProperty('--stagger',String(i%5))});
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.14,rootMargin:'0px 0px -8%'});[...headings,...reveal].forEach(el=>io.observe(el));
    let raf=0,mouseX=.5,mouseY=.5;const update=()=>{raf=0;const vh=innerHeight,doc=Math.max(1,document.documentElement.scrollHeight-vh),progress=Math.min(1,scrollY/doc);app.style.setProperty('--scroll',String(progress));app.style.setProperty('--scroll-pct',`${Math.round(progress*100)}`);app.style.setProperty('--mx',String(mouseX));app.style.setProperty('--my',String(mouseY));headings.forEach(h=>{const r=h.getBoundingClientRect(),p=Math.max(0,Math.min(1,(vh-r.top)/(vh*.78))),count=+(h.getAttribute('data-char-count')||0);(h.querySelectorAll('.type-char') as NodeListOf<HTMLElement>).forEach((c,i)=>{const local=Math.max(0,Math.min(1,p*1.72-i/Math.max(1,count)*.7));c.style.setProperty('--typed',String(local))})});document.querySelectorAll<HTMLElement>('.fx-reveal.in-view').forEach(el=>{const r=el.getBoundingClientRect(),raw=(vh-r.top)/(vh+r.height),p=Math.max(0,Math.min(1,raw*1.75));el.style.setProperty('--view',String(p))})};const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};const move=(e:PointerEvent)=>{mouseX=e.clientX/innerWidth;mouseY=e.clientY/innerHeight;schedule()};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pointermove',move,{passive:true});update();
    return()=>{cancelAnimationFrame(raf);io.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);removeEventListener('pointermove',move)}
  },[page,reduced]);
  return <><StructureFlowCollection variant="dot-matrix" speed={reduced?0:1.00} gridScale={60} mouseAmount={0.040} pulseSpeed={0.40} hue={0} radius={0.150} opacity={0.35} className="structure-dot-field"/>{!reduced&&<><div className="laser-flow" aria-hidden="true"><i className="laser-fog"/><i className="laser-beam"/><i className="laser-wisps"/></div><div className="scroll-hud" aria-hidden="true"><span>XRAY DEPTH</span><i/><b className="scroll-number"/></div><div className="focus-reticle" aria-hidden="true"><i/><i/></div></>}</>
}
