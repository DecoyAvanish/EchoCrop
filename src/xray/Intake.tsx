import {useEffect,useRef,useState} from 'react';
import {analyzeText,detectDocumentType,isFlagged,samples,type DocumentSample} from './data';
import {extractDocument} from './extract';
import type {Go} from './types';
import {pad} from './actions';

const minimumLength=25;
const maximumLength=500_000;
const documentTypes=['Lease','Terms of Service','Employment / Freelance','Loan / Credit','Other'];

export default function Intake({onDoc,go}:{onDoc:(doc:DocumentSample)=>void;go:Go}){
  const[tab,setTab]=useState<'file'|'paste'|'sample'>('file');
  const[text,setText]=useState('');
  const[type,setType]=useState('auto');
  const[drag,setDrag]=useState(false);
  const[status,setStatus]=useState('');
  const[busy,setBusy]=useState(false);
  const input=useRef<HTMLInputElement>(null);
  const request=useRef(0);
  useEffect(()=>()=>{request.current++},[]);
  const detected=detectDocumentType(text);
  const submit=(content:string,name:string)=>{
    if(content.trim().length<minimumLength){setStatus('There isn’t enough readable text yet. Add at least one complete clause.');return}
    if(content.length>maximumLength){setStatus('This document is very long. Please scan one agreement or section at a time (up to 500,000 characters).');return}
    const doc=analyzeText(content,name);
    onDoc({...doc,type:type==='auto'?detectDocumentType(content):type});
  };
  const loadFile=async(file?:File)=>{
    if(!file||busy)return;
    const token=++request.current;
    setBusy(true);setStatus(`Reading ${file.name} on your device…`);
    try{
      const result=await extractDocument(file);
      if(token!==request.current)return;
      if(result.imageOnly){setStatus('This looks like an image-only PDF. Choose a searchable copy, or paste text from your device’s text recognition tool.');return}
      submit(result.text,file.name);
    }catch(error){
      if(token!==request.current)return;
      const message=error instanceof Error?error.message:'';
      setStatus(/password/i.test(message)?'This PDF is password protected. Unlock a copy on your device, then try again.':/invalid|corrupt|zip|central directory/i.test(message)?'This file could not be read. It may be damaged or have the wrong file extension. Try exporting a fresh PDF or DOCX.':message||'We couldn’t read this file. Try a fresh copy or paste its text.');
    }finally{if(token===request.current)setBusy(false);if(input.current)input.current.value=''}
  };
  return <main id="main" tabIndex={-1} className="intake-page">
    <div className="page-heading"><button onClick={()=>go('home')}>← HOME</button><p className="kicker">DOCUMENT INTAKE / 01</p><h1>What are you<br/><em>about to sign?</em></h1><p>Bring the agreement. Leave with the questions worth asking.</p></div>
    <section className="intake-console" aria-label="Choose a document">
      <div className="intake-tabs" role="group" aria-label="Document source">{(['file','paste','sample'] as const).map(source=><button key={source} aria-pressed={source===tab} className={source===tab?'active':''} onClick={()=>{setTab(source);setStatus('')}}>{source==='file'?'UPLOAD A FILE':source==='paste'?'PASTE TEXT':'TRY A SAMPLE'}</button>)}</div>
      <div className="intake-meta"><label className="doc-type">AGREEMENT TYPE<select value={type} onChange={e=>setType(e.target.value)}><option value="auto">Detect automatically</option>{documentTypes.map(value=><option key={value}>{value}</option>)}</select></label><p>{type==='auto'&&text.trim().length>=minimumLength?`Detected: ${detected}`:'You can override the detected type at any time.'}</p></div>
      {tab==='file'&&<div className={`drop-bay ${drag?'drag':''} ${busy?'busy':''}`} aria-busy={busy} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void loadFile(e.dataTransfer.files[0])}}>
        <input ref={input} type="file" accept=".txt,.pdf,.docx" tabIndex={-1} aria-hidden="true" onChange={e=>void loadFile(e.target.files?.[0])}/>
        <div className="upload-icon" aria-hidden="true">{busy?'◌':'↥'}</div><h2>{busy?'EXTRACTING THE FINE PRINT':'Drop your agreement here'}</h2><p>PDF, DOCX or TXT · maximum 10 MB</p><button className="primary" disabled={busy} onClick={()=>input.current?.click()}>{busy?'READING FILE…':'CHOOSE A FILE →'}</button><p className="drop-private">Parsed on your device. Your text is never uploaded.</p>
      </div>}
      {tab==='paste'&&<div className="paste-bay"><label className="sr-only" htmlFor="contract-text">Contract text</label><textarea id="contract-text" autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={'Paste your agreement here. Numbered sections and paragraph breaks are welcome.\n\n1. Cancellation\n2. Fees\n3. Your rights'} maxLength={maximumLength+1}/><div><span>{text.length.toLocaleString()} CHARACTERS{!text.trim()?'':text.trim().length<minimumLength?' · ADD A COMPLETE CLAUSE':` · ${type==='auto'?detected:type}`}</span><button className="primary" disabled={text.trim().length<minimumLength||text.length>maximumLength} onClick={()=>submit(text,`Pasted ${type==='auto'?detected:type} agreement`)}>X-RAY THIS TEXT →</button></div></div>}
      {tab==='sample'&&<div className="sample-grid">{samples.map((sample,index)=><button key={sample.id} onClick={()=>onDoc(sample)}><span>{pad(index+1)} / {sample.type.toUpperCase()}</span><b>{sample.name}</b><small>{sample.clauses.length} clauses · {sample.clauses.filter(isFlagged).length} worth a closer look</small><i>OPEN AGREEMENT →</i></button>)}</div>}
      <div className={`file-status ${status?'shown':''}`} role="status" aria-atomic="true" hidden={!status}>{status}</div>
      <div className="local-strip"><span className="local-dot" aria-hidden="true"/><span><b>YOUR TAB. YOUR DOCUMENT.</b><span>Kept in this tab for refresh and back. Clear it from the scan.</span></span><em>NO ACCOUNT · NO UPLOAD</em></div>
    </section>
  </main>;
}
