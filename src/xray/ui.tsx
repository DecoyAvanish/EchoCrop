import {useEffect,useState} from 'react';
import {copyText} from './actions';

export function Gauge({score,large=false,busy=false}:{score:number;large?:boolean;busy?:boolean}){
  const label=score>75?'Severe':score>50?'High':score>25?'Moderate':score===0?'Unassessed':'Low';
  return <div className={`gauge ${large?'large':''} ${busy?'busy':''}`} style={{'--score':`${score*3.6}deg`} as React.CSSProperties} role="img" aria-label={busy?'Scanning document. Risk score available when complete.':`Risk score ${score} out of 100, ${label}`}>
    <div className="gauge-ring" aria-hidden="true"><span><b>{busy?'—':score}</b><small>/100</small></span></div>
    <div aria-hidden="true"><small>RISK SCORE</small><b>{busy?'Scanning…':label}</b></div>
  </div>;
}

export function CopyButton({text,label='COPY',className}:{text:string;label?:string;className?:string}){
  const[state,setState]=useState<'idle'|'done'|'fail'>('idle');
  useEffect(()=>{setState('idle')},[text]);
  useEffect(()=>{if(state==='idle')return;const timer=setTimeout(()=>setState('idle'),2400);return()=>clearTimeout(timer)},[state]);
  return <><button className={`${className??''} ${state==='done'?'copied':''}`} onClick={async()=>setState(await copyText(text)?'done':'fail')}>{state==='done'?'COPIED ✓':state==='fail'?'COPY UNAVAILABLE':label}</button><span className="sr-only" role="status">{state==='done'?'Copied to clipboard.':state==='fail'?'Copy unavailable. Select the text and use your browser’s Copy command.':''}</span></>;
}
