import {useEffect} from 'react';
import {StructureFlowCollection} from '../shaders/structure-flow/StructureFlowCollection';
import '../shaders/scene-performance.css';

const headingSelector='.process h2,.personas h2,.deadlines h2,.checklist h2,.signals h2,.examples h2,.privacy h2,.final-cta h2,.page-heading h1,.learn-cta h2,.report-head h1,.negotiation h2';
const revealSelector='.process article,.personas article,.deadline,.checklist>*,.signal,.compare,.privacy>div,.glossary article,.top-problems article,.breakdown,.negotiation>div,.final-cta>*';

export default function MotionDirector({page,reduced}:{page:string;reduced:boolean}){
  useEffect(()=>{
    const app=document.querySelector('.app');
    app?.classList.toggle('reduced-motion',reduced);
    document.documentElement.classList.toggle('reduced-motion',reduced);
    return()=>{app?.classList.remove('reduced-motion');document.documentElement.classList.remove('reduced-motion')};
  },[reduced]);

  useEffect(()=>{
    if(reduced)return;
    const app=document.querySelector<HTMLElement>('.app');if(!app)return;
    // Observe intact headings: characters stay in the natural text flow, so
    // wrapping, kerning, selection, and screen-reader output remain reliable.
    const headings=[...document.querySelectorAll<HTMLElement>(headingSelector)];
    const reveals=[...document.querySelectorAll<HTMLElement>(revealSelector)];
    headings.forEach(el=>el.classList.add('motion-heading'));
    reveals.forEach(el=>el.classList.add('fx-reveal'));
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const element=entry.target as HTMLElement;
        element.classList.add('in-view');element.style.setProperty('--view','1');
        observer.unobserve(element);
      });
    },{threshold:.08,rootMargin:'0px 0px -3%'});
    [...headings,...reveals].forEach(el=>observer.observe(el));
    let frame=0,mouseX=.5,mouseY=.5;
    const update=()=>{
      frame=0;
      const progress=Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));
      app.style.setProperty('--scroll',String(progress));app.style.setProperty('--scroll-pct',String(Math.round(progress*100)));
      app.style.setProperty('--mx',String(mouseX));app.style.setProperty('--my',String(mouseY));
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    const move=(event:PointerEvent)=>{
      mouseX=event.clientX/innerWidth;mouseY=event.clientY/innerHeight;schedule();
      document.querySelector<HTMLCanvasElement>('.structure-dot-field canvas')?.dispatchEvent(new PointerEvent('pointermove',{clientX:event.clientX,clientY:event.clientY}));
    };
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pointermove',move,{passive:true});
    update();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);removeEventListener('pointermove',move)};
  },[page,reduced]);
  return <>{(page==='home'||page==='scan'||page==='learn')?<StructureFlowCollection variant="dot-matrix" speed={reduced?0:1} gridScale={60} mouseAmount={0.040} pulseSpeed={0.40} hue={0} radius={0.150} opacity={0.35} className="structure-dot-field"/>:<div className="structure-dot-field scene-static-dot" aria-hidden="true"/>}{!reduced&&<><div className="laser-flow" aria-hidden="true"><i className="laser-fog"/><i className="laser-beam"/><i className="laser-wisps"/></div><div className="scroll-hud" aria-hidden="true"><span>XRAY DEPTH</span><i/><b className="scroll-number"/></div><div className="focus-reticle" aria-hidden="true"><i/><i/></div></>}</>;
}
