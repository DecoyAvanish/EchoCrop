import {Component,Suspense,lazy,useCallback,useEffect,useRef,useState,type ErrorInfo,type ReactNode} from 'react';
import MotionDirector from './MotionDirector';
import Home from './Home';
import {samples,type DocumentSample} from './data';
import {clearDocument,documentKey,loadDocument,readSession,saveDocument,writeSession} from './session';
import type {Go,Page,Settings} from './types';

const Intake=lazy(()=>import('./Intake'));
const Scan=lazy(()=>import('./Scan'));
const Report=lazy(()=>import('./Report'));
const Learn=lazy(()=>import('./Learn'));
const pages:Page[]=['home','intake','scan','report','learn'];
const titles:Record<Page,string>={home:'Fine Print X-Ray  -  Know before you sign',intake:'Scan a document  -  Fine Print X-Ray',scan:'Scan results  -  Fine Print X-Ray',report:'Risk report  -  Fine Print X-Ray',learn:'Clause Lab  -  Fine Print X-Ray','not-found':'Page not found  -  Fine Print X-Ray'};
const memoryDocuments=new Map<string,DocumentSample>();

function currentRoute(){
  const[path,query]=location.hash.replace(/^#\/?/,'').split('?');
  const page=(!path?'home':pages.includes(path as Page)?path:'not-found') as Page;
  const params=new URLSearchParams(query);
  const sample=samples.find(doc=>doc.id===params.get('doc'));
  const custom=loadDocument(params.get('session'))??memoryDocuments.get(params.get('session')??'');
  const last=loadDocument(readSession<string|null>('last-document',null));
  const doc=sample??custom??(!params.has('doc')&&!params.has('session')?last:null);
  if((page==='scan'||page==='report')&&!doc)return{page:'intake' as Page,doc:samples[0],missing:true};
  return{page,doc:doc??samples[0],missing:false};
}
function routeFor(page:Page,doc:DocumentSample){
  if(page!=='scan'&&page!=='report')return `#/${page==='home'?'':page}`;
  const sample=samples.find(s=>s.id===doc.id);
  return sample?`#/${page}?doc=${encodeURIComponent(sample.id)}`:`#/${page}?session=${encodeURIComponent(documentKey(doc))}`;
}
function initialSettings():Settings{
  let saved:Partial<Settings>={};try{const parsed=JSON.parse(localStorage.getItem('xray-settings')||'{}');if(parsed&&typeof parsed==='object')saved=parsed}catch{}
  return{reduced:typeof saved.reduced==='boolean'?saved.reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,contrast:saved.contrast===true,light:saved.light===true,large:saved.large===true,dyslexic:saved.dyslexic===true,language:saved.language==='es'?'es':'en'};
}
function Logo({go}:{go:Go}){return <button className="logo" onClick={()=>go('home')} aria-label="Fine Print X-Ray home"><span className="logo-mark" aria-hidden="true">⌖</span><span aria-hidden="true">FINE PRINT <b>X-RAY</b></span></button>}
function Nav({page,go,access}:{page:Page;go:Go;access:()=>void}){
  const[open,setOpen]=useState(false);const menu=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!open)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menu.current?.focus()}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[open]);
  useEffect(()=>{setOpen(false)},[page]);
  const nav=(next:Page)=>{setOpen(false);go(next)};
  return <header className="nav"><Logo go={go}/><button ref={menu} className="nav-menu" aria-expanded={open} aria-controls="main-nav" onClick={()=>setOpen(value=>!value)}><span aria-hidden="true">{open?'×':'☰'}</span> {open?'Close':'Menu'}</button><nav id="main-nav" className={open?'open':''} aria-label="Main navigation"><button aria-current={page==='home'?'page':undefined} className={page==='home'?'active':''} onClick={()=>nav('home')}>Home</button><button aria-current={page==='learn'?'page':undefined} className={page==='learn'?'active':''} onClick={()=>nav('learn')}>Clause Lab</button><button onClick={()=>{setOpen(false);access()}}>Accessibility</button></nav><button className={`nav-scan ${['intake','scan','report'].includes(page)?'active':''}`} aria-current={['intake','scan','report'].includes(page)?'page':undefined} onClick={()=>nav('intake')}>Scan<span className="nav-scan-long"> document</span><span aria-hidden="true"> →</span></button></header>;
}
function Access({settings,setSettings,close}:{settings:Settings;setSettings:React.Dispatch<React.SetStateAction<Settings>>;close:()=>void}){
  const panel=useRef<HTMLElement>(null);
  useEffect(()=>{
    const root=panel.current;if(!root)return;
    const opener=document.activeElement as HTMLElement|null;
    const visibleControls=()=>[...root.querySelectorAll<HTMLElement>('button,input,select,summary')].filter(node=>node.getClientRects().length>0);
    visibleControls()[0]?.focus();
    const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();close()}if(event.key==='Tab'){const controls=visibleControls();const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}};
    addEventListener('keydown',key);return()=>{document.body.style.overflow=oldOverflow;removeEventListener('keydown',key);requestAnimationFrame(()=>opener?.focus())};
  },[close]);
  const settingsList=[['reduced','Reduced motion','Freezes background movement, paper motion and decorative transitions.'],['contrast','High contrast','Makes text, controls and boundaries more distinct.'],['light','Light theme','Uses a light canvas with darker text and deeper accent colors.'],['large','Larger text','Increases text size and lets panels reflow.'],['dyslexic','Readable typeface','Uses Atkinson Hyperlegible with comfortable spacing.']] as const;
  return <div className="modal" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}><section ref={panel} role="dialog" aria-modal="true" aria-labelledby="access-title" className="access"><button className="x" onClick={close} aria-label="Close accessibility settings">×</button><p className="kicker">Your view, your comfort</p><h2 id="access-title">Make room<br/>for clarity.</h2><p className="access-intro">Apply changes live. Preferences are remembered on this device.</p>{settingsList.map(([key,label,description])=><label className="setting" key={key}><span><b id={`setting-${key}`}>{label}</b><small id={`setting-${key}-description`}>{description}</small></span><input role="switch" type="checkbox" aria-labelledby={`setting-${key}`} aria-describedby={`setting-${key}-description`} checked={settings[key]} onChange={event=>setSettings(previous=>({...previous,[key]:event.target.checked}))}/><i aria-hidden="true"/></label>)}<label className="language">Explanations in<select value={settings.language} onChange={event=>setSettings(previous=>({...previous,language:event.target.value==='es'?'es':'en'}))}><option value="en">English</option><option value="es" lang="es">Español  -  explanations only</option></select></label><p className="access-language-note">Navigation and source documents stay in their original language. Sample explanations include their original amounts and deadlines.</p><div className="access-shortcuts"><span>KEYBOARD SHORTCUTS</span><p><kbd>Tab</kbd> move · <kbd>Enter</kbd> open · <kbd>J</kbd> / <kbd>K</kbd> clauses · <kbd>Esc</kbd> close</p></div><button className="primary" onClick={close}>Done →</button></section></div>;
}
class PageBoundary extends Component<{children:ReactNode},{error:boolean}>{
  state={error:false};
  static getDerivedStateFromError(){return{error:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('Page could not render',error,info.componentStack)}
  render(){if(this.state.error)return <main id="main" className="page-failure" tabIndex={-1}><p className="kicker">Let’s get you back</p><h1>This view couldn’t open.</h1><p>Your document stays in this tab. Reload to try again.</p><button className="primary" onClick={()=>location.reload()}>Reload the page</button></main>;return this.props.children}
}

export default function App(){
  const[route,setRoute]=useState(currentRoute);
  const[access,setAccess]=useState(false);
  const[notice,setNotice]=useState(route.missing?'That document is no longer in this tab. Choose it again to continue.':'');
  const[settings,setSettings]=useState<Settings>(initialSettings);
  const closeAccess=useCallback(()=>setAccess(false),[]);
  const first=useRef(true);
  const[offlineReady,setOfflineReady]=useState(false);
  // Warm only the small application routes, not PDF/DOCX engines or graphics.
  // A loaded text workflow can then continue without a network connection.
  useEffect(()=>{let cancelled=false;const timer=setTimeout(()=>{void Promise.all([import('./Intake'),import('./Scan'),import('./Report'),import('./Learn')]).then(()=>{if(!cancelled)setOfflineReady(true)}).catch(()=>{})},6500);return()=>{cancelled=true;clearTimeout(timer)}},[]);
  useEffect(()=>{try{localStorage.setItem('xray-settings',JSON.stringify(settings))}catch{}},[settings]);
  useEffect(()=>{const os=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setSettings(previous=>({...previous,reduced:os.matches}));os.addEventListener('change',change);return()=>os.removeEventListener('change',change)},[]);
  useEffect(()=>{const sync=()=>{const next=currentRoute();setRoute(next);if(next.missing)setNotice('That document is no longer in this tab. Choose it again to continue.')};addEventListener('hashchange',sync);return()=>removeEventListener('hashchange',sync)},[]);
  useEffect(()=>{
    document.title=titles[route.page];
    if(first.current&&route.page==='home'){first.current=false;return}
    first.current=false;scrollTo({top:0,behavior:'instant'});
    let observer:MutationObserver|undefined;
    const focusHeading=()=>{const heading=document.querySelector<HTMLElement>('#main h1');if(!heading)return false;heading.tabIndex=-1;heading.focus({preventScroll:true});observer?.disconnect();return true};
    if(focusHeading())return;
    observer=new MutationObserver(()=>{focusHeading()});
    observer.observe(document.querySelector('.interface-content')??document.body,{childList:true,subtree:true});
    const timer=setTimeout(()=>observer?.disconnect(),15000);
    return()=>{clearTimeout(timer);observer?.disconnect()};
  },[route.page,route.doc]);
  const go:Go=useCallback((page,document)=>{
    const next=document??route.doc;
    if(document&&!samples.some(sample=>sample.id===document.id)){memoryDocuments.set(documentKey(document),document);const saved=saveDocument(document);if(saved)writeSession('last-document',saved);else setNotice('Your browser could not remember this document. Keep this tab open while reviewing it.')}
    const hash=routeFor(page,next);setRoute({page,doc:next,missing:false});if(location.hash!==hash)location.hash=hash;
  },[route.doc]);
  const onClear=()=>{memoryDocuments.delete(documentKey(route.doc));clearDocument(route.doc);writeSession('last-document',null);setNotice('Document cleared from this tab.');go('intake',samples[0])};
  const active=settings.reduced||settings.contrast||settings.light||settings.large||settings.dyslexic;
  return <div className={`app ${active?'accessibility-active':''} ${settings.reduced?'reduced-motion':''} ${settings.light?'light':''} ${settings.contrast?'contrast':''} ${settings.large?'large-type':''} ${settings.dyslexic?'dyslexic':''} ${access?'access-open':''}`}>
    <MotionDirector page={route.page} reduced={settings.reduced}/>
    <div className="interface-content" inert={access}>
      <a href="#main" className="skip" onClick={event=>{event.preventDefault();document.getElementById('main')?.focus()}}>Skip to content</a>
      <Nav page={route.page} go={go} access={()=>setAccess(true)}/>
      {notice&&<div className="session-notice" role="status"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss notice">×</button></div>}
      <PageBoundary key={route.page}><Suspense fallback={<main id="main" className="route-loading" tabIndex={-1}><span className="loading-line"/><p role="status">Opening your workspace…</p></main>}>
        {route.page==='not-found'&&<main id="main" className="page-failure" tabIndex={-1}><p className="kicker">Page not found</p><h1>This page isn’t here.</h1><p>Head home or start a document scan.</p><button className="secondary" onClick={()=>go('home')}>Go home</button><button className="primary" onClick={()=>go('intake')}>Scan a document →</button></main>}
        {route.page==='home'&&<Home go={go} reduced={settings.reduced} offlineReady={offlineReady}/>}
        {route.page==='intake'&&<Intake go={go} onDoc={document=>go('scan',document)}/>}
        {route.page==='scan'&&<Scan key={documentKey(route.doc)} doc={route.doc} go={go} settings={settings} onClear={onClear}/>}
        {route.page==='report'&&<Report key={documentKey(route.doc)} doc={route.doc} go={go} language={settings.language}/>}
        {route.page==='learn'&&<Learn go={go} reduced={settings.reduced}/>}
      </Suspense></PageBoundary>
      <footer><Logo go={go}/><p>Read closely. Ask clearly. Sign on your terms.<br/><span>This tool explains patterns. It is not legal advice.</span></p><nav aria-label="Footer"><button onClick={()=>go('intake')}>Scan a document</button><button onClick={()=>go('learn')}>Clause Lab</button><button onClick={()=>setAccess(true)}>Accessibility</button></nav><span>© 2026 Fine Print X-Ray</span><div className="footer-credits"><span>3D paper and orbital visuals: <a href="https://threeui.com" target="_blank" rel="noreferrer">ThreeUI ↗</a> (<a href="https://github.com/DecoyAvanish/EchoCrop/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noreferrer">licence ↗</a>)</span><a href="https://github.com/DecoyAvanish/EchoCrop" target="_blank" rel="noreferrer">Source on GitHub ↗</a><span>Built for HyperBloom 2026</span><span>Document text stays on your device.</span></div></footer>
    </div>
    {access&&<Access settings={settings} setSettings={setSettings} close={closeAccess}/>}
  </div>;
}
