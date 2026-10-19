import {useEffect,useMemo,useState} from 'react';
import {clauseTitle,isFlagged,scoreFor,severitySymbol,type Clause,type DocumentSample,type Severity} from './data';
import {localizeClause} from './localize';
import {scoringExplanation} from './scoring';
import {exposureExplanation,scenarioExplanation,scenarioTitle} from './reportLanguage';
import {buildReminderIcs,counterpartyFor,exposureFor,money,noticeFor,pad,proposedTextFor,reminderDate,verdictFor} from './actions';
import {Gauge,CopyButton} from './ui';
import {documentKey,readSession,writeSession} from './session';
import type {Go,Language} from './types';

type ReportProps={doc:DocumentSample;go:Go;language:Language};
const severityOrder:Record<Severity,number>={critical:4,high:3,moderate:2,safe:1,neutral:0};

function DeadlineCatcher({doc,clause,notice,language}:{doc:DocumentSample;clause:Clause;notice:{days:number;label:string};language:Language}){
  const key=`deadline:${documentKey(doc)}:${clause.id}`;
  const [end,setEnd]=useState(()=>readSession<string>(key,''));
  useEffect(()=>{writeSession(key,end)},[key,end]);
  const endDate=new Date(`${end}T12:00:00`),valid=!Number.isNaN(endDate.getTime());
  const remind=valid?reminderDate(endDate,notice.days):null,late=remind!==null&&remind<new Date(),id=`end-${clause.id}`;
  const download=()=>{
    if(!valid)return;
    const url=URL.createObjectURL(new Blob([buildReminderIcs(doc,clause,endDate,notice.days)],{type:'text/calendar'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=`${clause.category.toLowerCase().replace(/\W+/g,'-')}-reminder.ics`;anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <article className={`deadline ${clause.severity}`}>
    <small>{severitySymbol[clause.severity]} {clause.category.toUpperCase()} · {notice.label.toUpperCase()} NOTICE</small>
    <p lang={language}>{localizeClause(clause,language).plain}</p>
    <label htmlFor={id}>When does this term end or renew?</label>
    {doc.id==='lease'&&clause.id==='l7'&&<p className="sample-deadline">Sample term ends October 31, 2027. Renewal notice is due August 2, 2027.</p>}{doc.id==='gym'&&clause.id==='g1'&&<p className="sample-deadline">Sample term ends January 7, 2027. Notice is due November 8, 2026. The early reminder is November 1, 2026.</p>}<input id={id} type="date" value={end} onChange={e=>setEnd(e.target.value)} aria-describedby={`${id}-hint`}/>
    <p id={`${id}-hint`} className={`deadline-hint ${late?'late':''}`} role="status">{!remind?(doc.type==='Lease'?'Look for the end date in the term section, usually on page 1 of your lease.':'Look for the current term’s end or renewal date in your agreement or membership account.'):late?'The early reminder date has passed. Check the actual notice deadline and act promptly.':`Calendar reminder: ${remind.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'})}, one week before the ${notice.label} notice deadline.`}</p>
    <button onClick={download} disabled={!valid}>Add reminder to calendar →</button>
  </article>;
}

export default function Report(props:ReportProps){return <ReportContent key={documentKey(props.doc)} {...props}/>}

function ReportContent({doc,go,language}:ReportProps){
  useEffect(()=>{
    let expanded:HTMLDetailsElement[]=[];
    const prepare=()=>{expanded=[...document.querySelectorAll<HTMLDetailsElement>('.redline-details:not([open])')];expanded.forEach(node=>node.open=true)};
    const restore=()=>expanded.forEach(node=>node.open=false);
    addEventListener('beforeprint',prepare);addEventListener('afterprint',restore);
    return()=>{removeEventListener('beforeprint',prepare);removeEventListener('afterprint',restore)};
  },[]);
  const score=scoreFor(doc.clauses);
  const risks=useMemo(()=>doc.clauses.filter(isFlagged).sort((a,b)=>severityOrder[b.severity]-severityOrder[a.severity]),[doc]);
  const baseVerdict=verdictFor(score,risks.length,doc);
  const verdict=language==='es'?{title:risks.length?(score>=55?'No firmes':score>=30?'Procede con':'Lee con'):'Sin patrones',accent:risks.length?(score>=55?'tal como está.':score>=30?'precaución.':'atención.'):'compatibles detectados.',summary:risks.length?`${risks.length} cláusulas requieren revisión. Comprueba los riesgos y negocia los cambios antes de firmar.`:'El texto sin coincidencias sigue sin evaluar. Revisa el acuerdo completo, especialmente los importes, depósitos y condiciones de terminación.'}:baseVerdict;
  const party=counterpartyFor(doc.type),exposure=useMemo(()=>exposureFor(doc),[doc]);
  const counts=(severity:Severity)=>doc.clauses.filter(x=>x.severity===severity).length;
  const deadlines=doc.clauses.map(clause=>({clause,notice:noticeFor(clause)})).filter((x):x is {clause:Clause;notice:{days:number;label:string}}=>x.notice!==null);
  const initialDraft=risks.length?`Hi, thank you for sending ${(doc.name.endsWith('.')?doc.name.slice(0,-1):doc.name)}. Before I sign, I’d like to discuss these terms:\n\n${risks.map(x=>`• ${clauseTitle(x)}: ${x.askInstead}`).join('\n\n')}\n\nCould you send a revised copy reflecting any changes we agree to? Thank you.`:`Hi, thank you for sending ${(doc.name.endsWith('.')?doc.name.slice(0,-1):doc.name)}. I have reviewed the highlighted information and will check the full agreement before deciding whether to sign. Please confirm the price, renewal date, and cancellation process in writing. Thank you.`;
  const key=`report:${documentKey(doc)}`;
  const [saved]=useState(()=>readSession<{draft:string;done:string[]}>(key,{draft:initialDraft,done:[]}));
  const [draft,setDraft]=useState(saved.draft),[done,setDone]=useState<string[]>(saved.done);
  useEffect(()=>{writeSession(key,{draft,done})},[key,draft,done]);
  const checklist=[...risks.map(x=>({id:x.id,text:`${x.category}: ${x.askInstead}`})),{id:'written-changes',text:'Get every agreed change written into the final copy, including any edits discussed by email.'},{id:'retain-copy',text:'Read the complete revised agreement and keep a copy of the signed version.'}];
  const doneCount=checklist.filter(x=>done.includes(x.id)).length;
  const summary=`${doc.name}\nRule-based risk score: ${score}/100 · ${risks.length} flagged clauses.\n${exposure.label}: ${exposure.headline}. ${exposure.summary}\n\n${risks.map(x=>`${x.category} (${x.severity}): ${x.plainEnglish}\nAsk: ${x.askInstead}`).join('\n\n')}`;
  return <main id="main" tabIndex={-1} className="report report-v2">
    <div className="report-head">
      <div><button onClick={()=>go('scan')}>← Back to scan</button><p className="kicker">// YOUR DOCUMENT, DECODED</p><h1>{verdict.title}<br/><em>{verdict.accent}</em></h1><p className="report-document-name">{doc.name}</p><p lang={language}>{verdict.summary}</p></div>
      <Gauge score={score} large/>
    </div>
    <section className="report-toolbar" aria-label="Report actions"><span>{doc.type.toUpperCase()} · {doc.clauses.length} CLAUSES CHECKED</span><CopyButton text={summary} label="Copy summary"/><button onClick={()=>window.print()}>Save PDF</button><button className="primary" onClick={()=>go('intake')}>Scan another →</button></section>
    <section className="exposure-panel" aria-labelledby="exposure-title">
      <div className="exposure-heading" lang={language}><p className="kicker">{language==='es'?'// LA CUESTIÓN ECONÓMICA':'// THE MONEY QUESTION'}</p><span>{language==='es'?exposure.scenarios.length?'IMPORTE PARA REVISAR':'REVISIÓN DE IMPORTES':exposure.label}</span><h2 id="exposure-title">{language==='es'?exposure.headline.replace('Exposure not priced','Importe no calculado').replace(' + your deposit',' + tu depósito'):exposure.headline}</h2><p>{language==='es'?'Un importe concreto para discutir antes de firmar. Comprueba los supuestos en cada escenario.':exposure.summary}</p>{exposure.primaryAssumptions&&(language==='es'?<details className="primary-calculation"><summary>Cálculo original (en inglés)</summary><p lang="en">{exposure.primaryAssumptions}</p></details>:<p className="primary-calculation">{exposure.primaryAssumptions}</p>)}</div>
      <div className="exposure-detail" lang={language}>
        {exposure.scenarios.length>0?<><div className="exposure-scenarios">{exposure.scenarios.filter(x=>x.clauseId!==exposure.primaryId).map((x,i)=><article key={`${x.clauseId}-${i}`}><div><h3>{scenarioTitle(x,language)}</h3><b>{money(x.amount)}{x.unpriced?(language==='es'?' + tu depósito':' + your deposit'):''}</b></div><p lang={language}>{scenarioExplanation(x,language)}</p>{language==='es'&&<details><summary>CÁLCULO ORIGINAL (EN INGLÉS)</summary><p lang="en">{x.assumptions}</p></details>}{x.unpriced&&<p className="unpriced-note">{x.unpriced}</p>}</article>)}</div><p className="exposure-rule">{exposureExplanation(language)}</p></>:<div className="unpriced-exposure"><span aria-hidden="true">∑</span><h3>{language==='es'?'Límites claros, preguntas útiles.':'Honest limits, useful questions.'}</h3><p>{language==='es'?'Solo mostramos importes cuando su función y sus supuestos son claros. Revisa las cláusulas originales para comprobar precios, límites y condiciones.':'We show amounts only when their role and assumptions are clear. Open the original clauses below to check missing prices, caps, and triggers.'}</p></div>}
      </div>
    </section>
    <section className="report-grid">
      <div className="top-problems"><p className="kicker">// START HERE</p>{risks.length===0?<article className="neutral"><span aria-hidden="true"> - </span><div><small>NO SUPPORTED RISK MATCHES</small><h2>Keep reading the rest.</h2><p>Not flagged means a supported rule did not match. Check prices, dates, cancellation, and any unfamiliar wording in the complete agreement.</p></div></article>:risks.slice(0,3).map((x,i)=>{const text=localizeClause(x,language);return <article key={x.id} className={x.severity}><span aria-hidden="true">{pad(i+1)}</span><div lang={language}><small>{severitySymbol[x.severity]} {x.severity.toUpperCase()} · {x.category}</small><h2>{text.plain}</h2><p>{text.cost}</p></div></article>})}</div>
      <div className="breakdown"><p className="kicker">// THE FULL PICTURE</p><ul className="legend-list" aria-label={`${risks.length} flags by severity`}>{(['critical','high','moderate','safe','neutral'] as Severity[]).map(s=><li className={`legend ${s}`} key={s}><span>{severitySymbol[s]} {s==='neutral'?'NOT FLAGGED':s.toUpperCase()}</span><b>{counts(s)}</b></li>)}</ul><details id="score-method" className="score-info"><summary>How scoring works</summary><p>{scoringExplanation}</p></details></div>
    </section>
    {risks.length>0&&<section className="redlines" aria-labelledby="redline-title"><div className="report-section-intro"><p className="kicker">// FROM FINDING TO FIX</p><h2 id="redline-title">See a better starting point.</h2><p>{risks.length===1?'Compare the flagged clause':risks.length===2?'Compare both flagged clauses':`Compare all ${risks.length} flagged clauses`} with proposed wording. These are editable negotiation starting points, not lawyer-reviewed replacements. Check local rules and the rest of the agreement before using them.</p></div><div className="redline-list">{risks.map((clause,i)=>{const text=localizeClause(clause,language);const proposed=proposedTextFor(clause,doc.type);return <article key={clause.id} className={`redline ${clause.severity}`} aria-labelledby={`redline-${clause.id}`}><header><span>{pad(i+1)} · {severitySymbol[clause.severity]} {clause.severity.toUpperCase()}</span><h3 id={`redline-${clause.id}`}>{clauseTitle(clause)}</h3></header><div className="redline-comparison"><section className="redline-original"><h4>AS WRITTEN</h4><blockquote>{clause.originalText}</blockquote></section><section className="redline-proposal"><h4>PROPOSED WORDING</h4><p>{proposed}</p><CopyButton text={proposed} label="Copy proposed wording"/></section></div><details className="redline-details"><summary>Show details</summary><div className="redline-explainer" lang={language}><p><b>{language==='es'?'Qué significa':'What it does'}</b>{text.plain}</p><p><b>{language==='es'?'Posible impacto':'Possible impact'}</b>{text.cost}</p><p><b>{language==='es'?'Qué pedir':'Your request'}</b>{text.ask}</p></div></details></article>})}</div></section>}
    {deadlines.length>0&&<section className="deadlines" aria-labelledby="deadlines-title"><div><p className="kicker">// DEADLINE CATCHER</p><h2 id="deadlines-title">Don’t miss the window.</h2><p>{deadlines.length===1?'A notice deadline appears':'Notice deadlines appear'} in this document. Set the actual end or renewal date, then add a reminder to your calendar. Dates and reminder files stay on your device.</p></div><div className="deadline-list">{deadlines.map(x=><DeadlineCatcher key={x.clause.id} doc={doc} clause={x.clause} notice={x.notice} language={language}/>)}</div></section>}
    <section className="checklist" aria-labelledby="checklist-title"><div><p className="kicker">// BEFORE YOU SIGN</p><h2 id="checklist-title">Turn review into action.</h2><p className="checklist-progress" role="status">{doneCount} of {checklist.length} steps reviewed{doneCount===checklist.length?'. Your checklist is complete.':''}</p><p>Saved in this browser tab for this document. Completing the checklist does not certify the agreement.</p><div className="progress-bar" aria-hidden="true"><i style={{width:`${doneCount/checklist.length*100}%`}}/></div></div><ul>{checklist.map(item=><li key={item.id}><label><input type="checkbox" checked={done.includes(item.id)} onChange={e=>setDone(previous=>e.target.checked?[...previous,item.id]:previous.filter(id=>id!==item.id))}/><span aria-hidden="true"/>{item.text}</label></li>)}</ul></section>
    <section className="negotiation"><div><p className="kicker">// DRAFT EMAIL TO {party.toUpperCase()}</p><h2>{risks.length?'Ask for better terms.':'Confirm the essentials.'}</h2><p>Edit the draft, then copy it into your email. Check the recipient, amounts, and names before sending. Your edits are saved in this tab.</p></div><div className="draft"><label htmlFor="negotiation-draft">YOUR EDITABLE MESSAGE</label><textarea id="negotiation-draft" value={draft} onChange={e=>setDraft(e.target.value)}/><pre className="print-draft">{draft}</pre><CopyButton text={draft} label="Copy email draft"/></div></section>
  </main>;
}
