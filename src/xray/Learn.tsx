import {useCallback,useEffect,useRef,useState} from 'react';
import {StructureFlowCollection} from '../shaders/structure-flow/StructureFlowCollection';
import {samples} from './data';
import {Icon} from './Icon';
import {pad} from './actions';
import type {Go} from './types';

type Level='critical'|'high'|'moderate'|'safe';
const levels:Record<Level,{label:string,bars:number}>={critical:{label:'Critical',bars:4},high:{label:'High',bars:3},moderate:{label:'Watch',bars:2},safe:{label:'Fair',bars:1}};

const specimens=[
  {name:'Mandatory arbitration',area:'COURT RIGHTS',symbol:'↗',example:'Any dispute shall be resolved by binding arbitration. Tenant waives the right to trial by jury and to participate in any class action.',does:'This can replace a public court process with private dispute resolution and block a group claim. The process, fees, and available exceptions matter.',ask:'Make arbitration optional after a dispute begins. Keep access to small claims court and remove the class-action waiver.',trap:'waives the right to trial by jury',level:'critical' as Level,sample:0},
  {name:'Indemnification',area:'LIABILITY',symbol:'∞',example:'Contractor shall indemnify Company against any and all claims, damages, and expenses without limitation.',does:'You may have to cover someone else’s losses and legal bills, even where the connection to your own work is broad. “Without limitation” leaves no stated ceiling.',ask:'Limit it to losses caused by your own breach, negligence, or misconduct. Set a reasonable mutual cap and exclude losses caused by the other party.',trap:'any and all claims, damages, and expenses without limitation',level:'critical' as Level,sample:2},
  {name:'Automatic renewal',area:'BILLING',symbol:'↻',example:'Membership renews automatically for twelve-month periods unless cancelled in person 60 days before renewal.',does:'The notice window closes two months early and requires a visit. In our $69/month sample, missing it can mean another $828 term.',ask:'Allow online or email cancellation, send a reminder before the deadline, and make renewal month to month.',trap:'cancelled in person 60 days before renewal',level:'high' as Level,sample:3},
  {name:'Early-exit penalties',area:'PENALTIES',symbol:'$',example:'Early termination requires payment of three months rent and forfeiture of the security deposit.',does:'At the sample’s $2,450 monthly rent, three months plus the $2,450 deposit totals $9,800. That is a conditional exit cost, not an automatic charge at signing.',ask:'Negotiate a smaller, fixed exit fee or a replacement-tenant option. Keep deposit deductions specific and itemized.',trap:'three months rent and forfeiture of the security deposit',level:'high' as Level,sample:0},
  {name:'IP assignment',area:'OWNERSHIP',symbol:'©',example:'Contractor irrevocably assigns all inventions and works conceived during the term, whether or not related to the Services.',does:'The scope reaches beyond the work you were hired to do. It could claim unrelated side projects, reusable tools, and pre-existing ideas.',ask:'Limit assignment to the paid deliverables created for this project. Keep your pre-existing work, tools, and unrelated projects.',trap:'whether or not related to the Services',level:'high' as Level,sample:2},
  {name:'Broad data sharing',area:'PRIVACY',symbol:'◎',example:'We may share usage, device, and inferred-interest data with affiliates, advertising networks, and marketing partners.',does:'The information is not limited to what you provide directly. Inferred interests and device activity can travel to a broad set of advertising partners.',ask:'Limit sharing to service delivery, name the recipients, provide a clear opt-out, and require separate consent for advertising.',trap:'inferred-interest data with affiliates, advertising networks',level:'moderate' as Level,sample:1},
  {name:'Changes without notice',area:'CONTROL',symbol:'±',example:'An annual facilities enhancement fee of $149 may be adjusted without notice.',does:'The $149 amount is not a lasting ceiling. The provider keeps the ability to raise it without giving you time to change plans.',ask:'Set a cap, require advance written notice, and let you cancel without penalty before a price increase takes effect.',trap:'adjusted without notice',level:'moderate' as Level,sample:3},
  {name:'Cancellation hurdles',area:'YOUR WAY OUT',symbol:'⤴',example:'Cancellation must be completed in person at the original location at least 60 days before renewal.',does:'A narrow method and early deadline can make a simple subscription hard to stop. Check both how to cancel and when cancellation becomes effective.',ask:'Use a cancellation method as easy as enrollment, with written confirmation and no mandatory call or visit.',trap:'in person at the original location',level:'high' as Level,sample:3},
  {name:'A fair term has specifics',area:'BALANCE',symbol:'✓',example:'Security deposit shall be returned within 30 days, less itemized lawful deductions.',does:'A clear time limit and itemized deductions give you something concrete to check. A positive rule can recognize this wording; an unmatched clause cannot be assumed safe.',ask:'Keep the deadline and itemization requirement. Take move-in photos and ask where to send a forwarding address.',trap:'within 30 days, less itemized lawful deductions',level:'safe' as Level,sample:0},
];

const questions=[
  {doc:'Gym membership',prompt:'Which term can quietly commit you to another year?',options:['Your $69 membership bills monthly and can be cancelled online before the next payment date.','Your $69 membership renews for twelve months unless notice arrives 60 days before renewal.','Your $69 membership lasts one month; a new term requires your express written agreement.'],answer:1,why:'The second term combines a full-year renewal with an early notice deadline. Monthly billing does not necessarily mean a monthly commitment.',tip:'Look for “renews,” the length of the next term, and how early notice must arrive.'},
  {doc:'Freelance agreement',prompt:'Which ownership term reaches beyond the job?',options:['For the $4,500 project, the client owns only the four paid final deliverables listed in Schedule A.','For the $4,500 project, the contractor retains existing tools and licenses four paid final deliverables.','For the $4,500 project, the client owns every idea created during its three months, including unrelated work.'],answer:2,why:'“All ideas” and “whether related … or not” reach into side projects. A narrower term ties ownership to specific, paid project deliverables.',tip:'Check what is covered, when it transfers, and what you keep.'},
  {doc:'Lease · late fees',prompt:'Which wording leaves the amount open-ended?',options:['A late payment adds one $25 fee after five days; no additional daily charge applies to that payment.','A late payment adds $125 plus $25 for each additional day; there is no maximum charge for that payment.','A late payment adds $25 after five days; the total late charge cannot exceed $50 in that billing month.'],answer:1,why:'An uncapped daily charge grows the longer payment is late. A fixed, one-time fee has a clearer maximum, though local rules still matter.',tip:'Find the starting charge, the repeat charge, and the maximum.'},
];

/** Splits a clause around its trap phrase so the phrase can be marked. */
function marked(text:string,trap:string){const at=text.indexOf(trap);return at<0?<>{text}</>:<>{text.slice(0,at)}<mark>{trap}</mark>{text.slice(at+trap.length)}</>}

type QuizResult={score:number;complete:boolean};

function TrapQuiz({onResult}:{onResult:(result:QuizResult)=>void}){
  const[validation,setValidation]=useState('');
  const[index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[answered,setAnswered]=useState(false),[results,setResults]=useState<boolean[]>([]),[complete,setComplete]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const question=questions[index];
  const score=results.filter(Boolean).length;
  useEffect(()=>{onResult({score,complete})},[score,complete,onResult]);
  const focusHeading=()=>requestAnimationFrame(()=>heading.current?.focus());
  const submit=()=>{if(choice===null){setValidation('Pick a clause first.');return}if(answered)return;setValidation('');setAnswered(true);setResults(value=>[...value,choice===question.answer])};
  const next=()=>{if(index===questions.length-1){setComplete(true);focusHeading();return}setIndex(value=>value+1);setChoice(null);setAnswered(false);focusHeading()};
  const restart=()=>{setIndex(0);setChoice(null);setAnswered(false);setResults([]);setComplete(false);focusHeading()};
  const right=answered&&choice===question.answer;
  return <section className="trap-quiz v3" aria-labelledby="quiz-title">
    <div className="quiz-intro">
      <p className="mark"><b>§ 3</b><span>Three questions. No timer.</span></p>
      <h2 id="quiz-title" tabIndex={-1}>Spot <em>the trap.</em></h2>
      <p className="quiz-lede">Each question hides one clause that costs more than it looks. Pick it, then see why it matters.</p>
      <ol className="quiz-track" aria-label={complete?'Quiz complete':`Question ${index+1} of ${questions.length}`}>{questions.map((item,i)=>{const state=results[i]===undefined?(i===index&&!complete?'current':'todo'):results[i]?'right':'wrong';return <li key={i} className={state}><span className="track-node" aria-hidden="true">{state==='right'?'✓':state==='wrong'?'×':pad(i+1)}</span><span className="track-label">{item.doc}<small>{state==='right'?'Spotted':state==='wrong'?'Missed':state==='current'?'In progress':'Up next'}</small></span></li>})}</ol>
      <p className="quiz-score" role="status"><b>{score}</b><span>of {questions.length} traps spotted{answered&&!complete?right?' · last answer correct':' · last answer missed':''}</span></p>
    </div>
    <div className={`quiz-card ${answered?right?'is-right':'is-wrong':''} ${complete?'is-complete':''}`}>
      <span className="quiz-beam" aria-hidden="true" key={`${index}-${answered}`}/>
      {complete?<div className="quiz-done"><small>THE LAB IS COMPLETE</small><h3 ref={heading} tabIndex={-1}><b>{score}</b> of {questions.length} spotted.</h3><p>{score===3?'You caught the scope, the deadline and the compounding cost. Keep those three checks for your next contract.':'The useful part is knowing what to look for: scope, deadlines and compounding costs. Run the examples again.'}</p><ul className="quiz-recap">{questions.map((item,i)=><li key={i} className={results[i]?'right':'wrong'}><span aria-hidden="true">{results[i]?'✓':'×'}</span><b>{item.doc}</b><small>{results[i]?'Spotted':'Missed'}</small></li>)}</ul><button className="primary" onClick={restart}>Try again <span aria-hidden="true">↺</span></button></div>:<>
      <div className="quiz-card-head"><small>QUESTION {pad(index+1)} / {pad(questions.length)}</small><span>{question.doc}</span></div>
      <h3 ref={heading} tabIndex={-1}>{question.prompt}</h3>
      <fieldset disabled={answered}><legend className="sr-only">Choose one clause</legend>{question.options.map((option,i)=><label key={option} className={`${choice===i?'selected':''} ${answered&&i===question.answer?'correct':''} ${answered&&choice===i&&i!==question.answer?'incorrect':''}`}><input type="radio" name={`trap-${index}`} value={i} checked={choice===i} onChange={()=>{setChoice(i);setValidation('')}}/><span className="quiz-option-letter" aria-hidden="true">§{String.fromCharCode(65+i)}</span><span className="quiz-option-text">{option}</span>{answered&&i===question.answer&&<strong className="trap-stamp">The trap</strong>}{answered&&choice===i&&i!==question.answer&&<strong className="pick-stamp">Your pick</strong>}</label>)}</fieldset>
      <div className="quiz-feedback" role="status">{validation&&<p className="quiz-validation">{validation}</p>}{answered&&<><b>{right?'You found it.':'Take another look.'}</b><p>{question.why}</p><p className="quiz-tip"><span>Tip</span>{question.tip}</p></>}</div>
      <div className="quiz-actions">{answered?<button className="primary" onClick={next}>{index===questions.length-1?'See my result':'Next question'} <span aria-hidden="true">→</span></button>:<button className="primary" aria-disabled={choice===null} onClick={submit}>Check my answer <span aria-hidden="true">→</span></button>}<span>{answered?'Read the explanation, then continue.':choice===null?'Select a clause to begin.':'Ready when you are.'}</span></div></>}
    </div>
  </section>;
}

export default function Learn({go,reduced}:{go:Go;reduced:boolean}){
 const [selected,setSelected]=useState<number|null>(null);
 const [quiz,setQuiz]=useState<QuizResult>({score:0,complete:false});
 const onResult=useCallback((result:QuizResult)=>setQuiz(result),[]);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
 const close=()=>{dialog.current?.close();setSelected(null);requestAnimationFrame(()=>opener.current?.focus())};
 useEffect(()=>{if(selected!==null){dialog.current?.showModal();requestAnimationFrame(()=>dialog.current?.querySelector<HTMLElement>('h2')?.focus())}},[selected]);
 const icons=['gavel','shield','refresh','door','document','data','edit','door','check'] as const;
 const specimen=selected===null?null:specimens[selected];
 // Cards light up around the pointer; the position is written as CSS variables so the glow is pure CSS.
 const glow=(event:React.PointerEvent<HTMLElement>)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.term-card');if(!card)return;const box=card.getBoundingClientRect();card.style.setProperty('--mx',`${event.clientX-box.left}px`);card.style.setProperty('--my',`${event.clientY-box.top}px`)};
 // Enough copies to fill the wall, each one rotated so the repetition is not obvious.
 const wall=Array.from({length:9},(_,copy)=>[...specimens.slice(copy%9),...specimens.slice(0,copy%9)]).flat();
 return <main id="main" tabIndex={-1} className="learn learn-v2">
  <StructureFlowCollection variant="orbital-sphere" speed={reduced?0:.34} particleSize={0.012} particleOpacity={0.24} orbitOpacity={0.16} hue={0} scale={1.55} haloOpacity={0.10} className="learn-orbital-field"/>
  <div className="page-heading"><p className="kicker">Clause Lab</p><h1>Learn the language.<br/><em>Keep your leverage.</em></h1><p>Inspect the wording, understand its effect and find a concrete question to ask.</p><a className="lab-quiz-link text-link" href="#trap-quiz" onClick={event=>{event.preventDefault();document.getElementById('quiz-title')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});document.getElementById('quiz-title')?.focus()}}>Try the three-question quiz ↓</a><figure className="lab-specimen" aria-hidden="true"><div className="lab-paper"><small>Specimen · Membership agreement, §4</small><p>Membership renews automatically for twelve-month periods unless cancelled <mark>in person 60 days before renewal</mark>.</p></div><ol><li><b>Says</b>Renewal is automatic, and leaving takes a visit.</li><li><b>Does</b>Miss the window and you owe another $828 year.</li><li><b>Ask</b>Cancel online, with 30 days’ notice.</li></ol></figure></div>
  <section className="term-section" aria-labelledby="terms-title">
   <div className="term-head"><div><p className="mark"><b>§ 9</b><span>The specimen wall</span></p><h2 id="terms-title">Nine terms <em>worth knowing.</em></h2><p>Hover or focus a card to x-ray its wording. Open it to see what the clause does and what to ask for instead.</p></div><ul className="term-legend" aria-label="Risk levels">{(Object.keys(levels) as Level[]).map(level=><li key={level} className={`lv-${level}`}><span className="term-meter" aria-hidden="true">{[0,1,2,3].map(n=><i key={n} className={n<levels[level].bars?'on':''}/>)}</span>{levels[level].label}</li>)}</ul></div>
   <div className="term-grid" onPointerMove={glow}>{specimens.map((item,i)=><button className={`term-card lv-${item.level}`} key={item.name} aria-haspopup="dialog" style={{'--i':i} as React.CSSProperties} onClick={event=>{opener.current=event.currentTarget;setSelected(i)}}>
     <span className="term-top"><span className="term-no" aria-hidden="true">{pad(i+1)}</span><span className="term-area">{i===8?'Balanced example':item.area.toLowerCase()}</span><span className="term-level"><span className="term-meter" aria-hidden="true">{[0,1,2,3].map(n=><i key={n} className={n<levels[item.level].bars?'on':''}/>)}</span>{levels[item.level].label}<span className="sr-only"> risk</span></span></span>
     <span className="term-icon" aria-hidden="true"><Icon name={icons[i]}/></span>
     <span className="term-name">{item.name}</span>
     <span className="term-clause" aria-hidden="true">“{marked(item.example,item.trap)}”</span>
     <span className="term-open">Inspect clause <b aria-hidden="true">→</b></span>
     <span className="term-scan" aria-hidden="true"/>
   </button>)}</div>
   <p className="specimen-caption">Examples are illustrative, not reports from real users.</p>
  </section>
  <dialog ref={dialog} className={`specimen-dialog ${specimen?`lv-${specimen.level}`:''} ${selected===8?'safe':''}`} aria-labelledby="specimen-title" onCancel={event=>{event.preventDefault();close()}} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close()}}}>{specimen&&<><button className="specimen-close" onClick={close} aria-label="Close specimen">×</button><p className="kicker">{selected===8?'SAFE · BALANCED EXAMPLE':specimen.area} · {levels[specimen.level].label.toUpperCase()}</p><h2 id="specimen-title" tabIndex={-1}>{specimen.name}</h2><div className="specimen-content"><section><h3>What it says</h3><blockquote>“{marked(specimen.example,specimen.trap)}”</blockquote></section><section><h3>What it does</h3><p>{specimen.does}</p></section><section><h3>What to ask for</h3><p>{specimen.ask}</p></section><button onClick={()=>{close();go('scan',samples[specimen.sample])}}>Explore the sample →</button></div></>}</dialog>
  <div id="trap-quiz"><TrapQuiz onResult={onResult}/></div>
  <section className="final-cta v3 lab-final" aria-labelledby="lab-final-title"><div className="fine-wall" aria-hidden="true"><p className="wall-text">{wall.map((item,i)=><span key={i}>{item.example} </span>)}</p><p className="wall-text wall-lit">{wall.map((item,i)=>{const at=item.example.indexOf(item.trap);return <span key={i}>{item.example.slice(0,at)}<span className={item.level}>{item.trap}</span>{item.example.slice(at+item.trap.length)} </span>})}</p><span className="wall-beam"/></div><div className="final-inner"><p className="mark"><b>§ ✓</b><span>Your turn</span></p><h2 id="lab-final-title">You know the traps.<br/><em>Go find yours.</em></h2><div className="final-actions"><button className="primary" onClick={()=>go('intake')}>Scan your document <span aria-hidden="true">→</span></button><button className="secondary-link" onClick={()=>go('scan',samples[0])}>Practice on the sample lease</button></div><dl className="final-stats"><div><dt>Traps lit up behind this text</dt><dd>{specimens.filter(item=>item.level!=='safe').length}</dd></div><div><dt>{quiz.complete?'Traps you spotted in the quiz':'Traps waiting in the quiz'}</dt><dd>{quiz.complete?`${quiz.score}/${questions.length}`:questions.length}</dd></div><div><dt>Bytes of your document uploaded</dt><dd>0</dd></div></dl></div></section>
 </main>;
}
