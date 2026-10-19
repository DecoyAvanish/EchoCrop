import {useEffect,useState} from 'react';
import {riskBand,scoreScale} from './scoring';
import {copyText} from './actions';

export function Gauge({score,large=false,busy=false}:{score:number;large?:boolean;busy?:boolean}){
  const label=riskBand(score);
  return <div className={`gauge ${large?'large':''} ${busy?'busy':''}`} style={{'--score':`${score*3.6}deg`} as React.CSSProperties} role={large?'group':'img'} aria-label={busy?'Scanning document. Risk score available when complete.':`Risk score ${score} out of 100, ${label}`}>
    <div className="gauge-ring" aria-hidden="true"><span><b>{busy?'—':score}</b><small>/100</small></span></div>
    <div aria-hidden="true"><small>Risk score</small><b>{busy?'Scanning…':label}</b></div>
    {large&&<p className="gauge-scale">{scoreScale}<span>Based on severity, not probability. Zero means no supported risk match.</span><a href="#score-method" onClick={event=>{event.preventDefault();const method=document.getElementById('score-method') as HTMLDetailsElement|null;if(method){method.open=true;method.scrollIntoView({behavior:document.documentElement.classList.contains('reduced-motion')?'instant':'smooth',block:'start'});method.querySelector<HTMLElement>('summary')?.focus({preventScroll:true})}}}>How scoring works ↓</a></p>}
  </div>;
}

export function CopyButton({text,label='Copy',className}:{text:string;label?:string;className?:string}){
  const[state,setState]=useState<'idle'|'done'|'fail'>('idle');
  useEffect(()=>{setState('idle')},[text]);
  useEffect(()=>{if(state==='idle')return;const timer=setTimeout(()=>setState('idle'),2400);return()=>clearTimeout(timer)},[state]);
  return <><button className={`${className??''} ${state==='done'?'copied':''}`} onClick={async()=>setState(await copyText(text)?'done':'fail')}>{state==='done'?'Copied ✓':state==='fail'?'Copy unavailable':label.charAt(0)+label.slice(1).toLowerCase()}</button><span className="sr-only" role="status">{state==='done'?'Copied to clipboard.':state==='fail'?'Copy unavailable. Select the text and use your browser’s Copy command.':''}</span></>;
}
