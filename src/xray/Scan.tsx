import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import HeroPaper from './HeroPaper';
import {clauseTitle,isFlagged,scoreFor,severityLabel,severitySymbol,type Clause,type DocumentSample,type Severity} from './data';
import {localizeClause} from './localize';
import {pad,reviewContext} from './actions';
import {scoringExplanation} from './scoring';
import {CopyButton,Gauge} from './ui';
import {documentKey,readSession,writeSession} from './session';
import type {Go,Settings} from './types';


const order:Record<Severity,number>={critical:4,high:3,moderate:2,safe:1,neutral:0};
const labels={en:{plain:'Plain English',cost:'What this could cost you',ask:'What to ask for'},es:{plain:'EN LENGUAJE CLARO',cost:'LO QUE ESTO PODRÍA COSTARTE',ask:'QUÉ PEDIR EN SU LUGAR'}};
const isTyping=(target:EventTarget|null)=>target instanceof HTMLElement&&(target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function Inspector({clause,index,total,score,language,reviewed,onReview,onClose}:{clause:Clause;index:number;total:number;score:number;language:Settings['language'];reviewed:boolean;onReview:()=>void;onClose?:()=>void}){
  const text=localizeClause(clause,language);
  return <>
    <div className="inspector-head"><span>{severitySymbol[clause.severity]} {severityLabel[clause.severity]}</span><span className="inspector-count">{pad(index+1)} / {pad(total)}</span>{onClose&&<button onClick={onClose} aria-label="Close clause details">×</button>}</div>
    <h2 id="clause-detail-title" tabIndex={-1}>{clauseTitle(clause)}</h2>
    {clause.severity!=='neutral'&&<p className="match-note">{clause.severity==='safe'?'Balanced provision':'Why it’s flagged'}</p>}
    <details className="original"><summary>Read the original</summary><blockquote>“{clause.originalText}”</blockquote></details>
    <section lang={language}><span>{labels[language].plain}</span><p>{text.plain}</p><CopyButton text={text.plain} label="Copy explanation"/></section>
    <section lang={language}><span>{labels[language].cost}</span><p>{text.cost}</p>{clause.numbers&&<div className="number-chips">{clause.numbers.map((n,i)=><b key={`${n}-${i}`}>{n}</b>)}</div>}</section>
    <section lang={language}><span>{labels[language].ask}</span><p>{text.ask}</p><CopyButton text={text.ask} label="Copy request"/></section>
    <button className={`review-clause ${reviewed?'reviewed':''}`} aria-pressed={reviewed} onClick={onReview}>{reviewed?'✓ Reviewed':'Mark as reviewed'}</button>
    <details className="score-method"><summary>How scoring works</summary><p>{clause.severity==='neutral'?'No supported risk or balanced-term rule matched this passage. It remains not flagged.':'A local language rule matched this passage. The flag identifies a wording pattern and does not determine whether a term is enforceable.'}</p>{clause.evidence&&<p>Matched wording: <q>{clause.evidence}</q></p>}<p>{scoringExplanation} Current document score: {score}/100.</p></details>
    <p className="inspector-foot">Read the original in context. This tool explains patterns; it does not determine enforceability.</p>
  </>;
}

export default function Scan({doc,go,settings,onClear}:{doc:DocumentSample;go:Go;settings:Settings;onClear:()=>void}){
  const key=documentKey(doc);
  const firstRisk=doc.clauses.reduce((best,clause,index)=>order[clause.severity]>order[doc.clauses[best].severity]?index:best,0);
  const[active,setActive]=useState(()=>Math.min(doc.clauses.length-1,Math.max(0,readSession(`${key}:active`,firstRisk))));
  const[zoom,setZoom]=useState(2.4);
  const[progress,setProgress]=useState(()=>settings.reduced||readSession(`${key}:complete`,false)?100:0);
  const[filter,setFilter]=useState<'all'|'flagged'|'neutral'>('all');
  const[mobile,setMobile]=useState(()=>matchMedia('(max-width: 900px)').matches);
  const[flat,setFlat]=useState(()=>readSession(`${key}:reading-default-v2`,true));
  const[reviewed,setReviewed]=useState<string[]>(()=>readSession(`${key}:reviewed`,[]));
  const[sheet,setSheet]=useState(false);
  const[announcement,setAnnouncement]=useState('');
  const dialog=useRef<HTMLDialogElement>(null);
  const paper=useRef<HTMLDivElement>(null);
  const score=scoreFor(doc.clauses);
  const flagged=doc.clauses.filter(isFlagged).length;
  const selected=doc.clauses[active];
  const pageSize=8;
  const paperPage=Math.floor(active/pageSize);
  const paperPages=Math.ceil(doc.clauses.length/pageSize);
  const paperClauses=useMemo(()=>doc.clauses.slice(paperPage*pageSize,(paperPage+1)*pageSize),[doc,paperPage,pageSize]);
  const visible=doc.clauses.filter(c=>filter==='all'||(filter==='flagged'?isFlagged(c):!isFlagged(c)));
  const count=(severity:Severity)=>doc.clauses.filter(c=>c.severity===severity).length;
  useEffect(()=>{const query=matchMedia('(max-width: 900px)');const change=()=>{setMobile(query.matches);if(!query.matches)setSheet(false)};query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);
  useEffect(()=>{if(progress===100){writeSession(`${key}:complete`,true);return}if(settings.reduced){setProgress(100);return}const timer=setInterval(()=>setProgress(p=>Math.min(100,p+5)),60);return()=>clearInterval(timer)},[key,settings.reduced,progress===100]);
  useEffect(()=>{writeSession(`${key}:active`,active)},[key,active]);
  useEffect(()=>{writeSession(`${key}:reviewed`,reviewed)},[key,reviewed]);
  useEffect(()=>{writeSession(`${key}:reading-default-v2`,flat)},[key,flat]);
  useEffect(()=>{const node=dialog.current;if(!node)return;if(sheet&&mobile&&!node.open){node.showModal();requestAnimationFrame(()=>node.querySelector<HTMLElement>('h2')?.focus())}else if(node.open&&!sheet)node.close();return()=>{if(node.open)node.close()}},[sheet,mobile]);
  useEffect(()=>{if(!sheet)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[sheet]);
  const selectClause=useCallback((index:number)=>{
    setActive(index);setZoom(2.4);
    const clause=doc.clauses[index];
    setAnnouncement(`Clause ${index+1} of ${doc.clauses.length}. ${clauseTitle(clause)}. ${severityLabel[clause.severity]}.`);
    if(mobile)setSheet(true);
    else if(flat)requestAnimationFrame(()=>paper.current?.querySelector<HTMLElement>(`[data-clause="${index}"]`)?.scrollIntoView({block:'nearest',behavior:settings.reduced?'instant':'smooth'}));
  },[doc,mobile,flat,settings.reduced]);
  useEffect(()=>{const keydown=(event:KeyboardEvent)=>{if(isTyping(event.target)||event.ctrlKey||event.metaKey||event.altKey||document.querySelector('.modal')||sheet)return;if(event.key.toLowerCase()==='j'){event.preventDefault();selectClause(Math.min(doc.clauses.length-1,active+1))}if(event.key.toLowerCase()==='k'){event.preventDefault();selectClause(Math.max(0,active-1))}if(event.key==='Escape')setZoom(1)};addEventListener('keydown',keydown);return()=>removeEventListener('keydown',keydown)},[active,selectClause,doc,sheet]);
  const review=()=>setReviewed(previous=>previous.includes(selected.id)?previous.filter(id=>id!==selected.id):[...previous,selected.id]);
  const inspectorProps={clause:selected,index:active,total:doc.clauses.length,score,language:settings.language,reviewed:reviewed.includes(selected.id),onReview:review};
  return <main id="main" tabIndex={-1} className="chamber">
    <div className="chamber-top"><button onClick={()=>go('intake')}>← New scan</button><div><span>{doc.type.toUpperCase()}</span><h1 className="doc-title">{doc.name}</h1></div><div className="scan-state" aria-hidden="true">{progress<100?'Preparing document':'Scanned locally'}</div><div className="scan-score"><Gauge score={progress<100?0:score} busy={progress<100}/></div><button onClick={()=>go('report')}>Open report →</button></div>
    <div className="risk-strip" role="group" aria-label="Biggest risks"><strong>BIGGEST RISKS</strong><span className="critical">⬢ {count('critical')} CRITICAL</span><span className="high">◆ {count('high')} HIGH</span><span className="moderate">▲ {count('moderate')} MODERATE</span><small>{!flagged?reviewContext(doc):''}</small></div>
    <div className="chamber-body">
      <aside className={`clause-rail ${flat?'reading-index':''}`}  aria-label="Clause index"><div className="rail-title"><span>{doc.clauses.length} CLAUSES</span><b>{reviewed.filter(id=>doc.clauses.some(c=>c.id===id&&isFlagged(c))).length} of {flagged} flagged reviewed</b></div><div className="filters" role="group" aria-label="Filter clauses">{(['all','flagged','neutral'] as const).map(value=><button key={value} aria-pressed={filter===value} className={filter===value?'active':''} onClick={()=>setFilter(value)}>{value==='neutral'?'Not flagged':value==='all'?'All':'Flagged'}</button>)}</div><div className="clause-list">{visible.map(clause=>{const index=doc.clauses.indexOf(clause);return <button key={clause.id} className={`${clause.severity} ${active===index?'active':''}`} aria-current={active===index?'true':undefined} onClick={()=>selectClause(index)}><span aria-hidden="true">{reviewed.includes(clause.id)?'✓':severitySymbol[clause.severity]}</span><div><b>{clauseTitle(clause)}</b><small>{severityLabel[clause.severity]}</small></div><em>{pad(index+1)}</em></button>})}{!visible.length&&<p className="empty-filter">No {filter==='neutral'?'not flagged':filter} clauses in this agreement. Try All to see every passage.</p>}</div><button className="clear-session" onClick={onClear}>Clear this document</button></aside>
      <section className={`document-stage ${flat?'flat':''}`} aria-label="Your agreement"><div className="view-controls" role="group" aria-label="Document view"><button aria-pressed={!flat} className={!flat?'active':''} onClick={()=>setFlat(false)}>3D paper</button><button aria-pressed={flat} className={flat?'active':''} onClick={()=>setFlat(true)}>Reading view</button></div>
        {flat?<div ref={paper} className="flat-paper" role="group" aria-label="Readable document"><header><small>FINE PRINT X-RAY / YOUR AGREEMENT</small><h2>{doc.name}</h2><p>Choose a clause to see its explanation and next steps.</p></header>{visible.map((clause)=>{const index=doc.clauses.indexOf(clause);return <button data-clause={index} key={clause.id} className={`${clause.severity} ${active===index?'active':''}`} aria-current={active===index?'true':undefined} onClick={()=>selectClause(index)}><b>{pad(index+1)} · {severitySymbol[clause.severity]} {clauseTitle(clause)} · {severityLabel[clause.severity]}</b><span>{clause.originalText}</span><small>{mobile?'TAP FOR DETAILS →':reviewed.includes(clause.id)?'REVIEWED ✓':'VIEW EXPLANATION →'}</small></button>})}{mobile&&!visible.length&&<p>No clauses match this filter. Choose All to read the complete agreement.</p>}</div>:<><HeroPaper mode="chamber" active={active%pageSize} scanning={progress<100} reduced={settings.reduced} clauses={paperClauses.map(c=>({...c,category:clauseTitle(c)}))} documentTitle={doc.name} onClauseSelect={index=>selectClause(paperPage*pageSize+index)} zoom={zoom} pageNumber={paperPage+1} pageCount={paperPages} totalClauses={doc.clauses.length} clauseOffset={paperPage*pageSize}/><div className="paper-zoom-controls" role="group" aria-label="Document zoom"><button onClick={()=>setZoom(z=>Math.max(.85,z-.2))} aria-label="Zoom out">−</button><button onClick={()=>setZoom(1)} aria-label={`Reset zoom. Currently ${Math.round(zoom*100)} percent`}>{Math.round(zoom*100)}%</button><button onClick={()=>setZoom(z=>Math.min(2.5,z+.2))} aria-label="Zoom in">+</button></div></>}
        <div className="minimap"><div className="paper-pagination"><button disabled={flat||paperPage===0} onClick={()=>setActive((paperPage-1)*pageSize)} aria-label="Previous paper page">←</button><span>{flat?`${doc.clauses.length} CLAUSES`:`PAGE ${pad(paperPage+1)} / ${pad(paperPages)}`}</span><button disabled={flat||paperPage===paperPages-1} onClick={()=>setActive((paperPage+1)*pageSize)} aria-label="Next paper page">→</button></div><div className="clause-map-viewport"><div className="clause-map" style={{minWidth:`${Math.max(196,doc.clauses.length*28)}px`}}>{doc.clauses.map((clause,index)=><button key={clause.id} className={`${clause.severity} ${active===index?'active':''}`} style={{left:`${(index+.5)/doc.clauses.length*100}%`}} onClick={()=>selectClause(index)} aria-label={`Clause ${index+1}: ${clauseTitle(clause)}, ${severityLabel[clause.severity]}`}/>)}</div></div></div>
      </section>
      {!mobile&&<aside className={`inspector ${selected.severity}`} aria-label="Selected clause details"><Inspector {...inspectorProps}/></aside>}
    </div>
    {mobile&&<dialog ref={dialog} className={`clause-sheet inspector ${selected.severity}`} aria-labelledby="clause-detail-title" onCancel={()=>setSheet(false)} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientY<box.top)setSheet(false)}}}><Inspector {...inspectorProps} onClose={()=>setSheet(false)}/></dialog>}
    <p className="sr-only" role="status" aria-atomic="true">{progress<100?'Preparing your document.':`Scan complete. ${flagged} of ${doc.clauses.length} clauses flagged. Risk score ${score} out of 100.`}</p><p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
  </main>;
}
