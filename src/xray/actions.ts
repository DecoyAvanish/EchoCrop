import type {Clause,DocumentSample} from './data';

/** Two-digit index that keeps working past nine (01…24). */
export const pad=(n:number)=>String(n).padStart(2,'0');

/** Thresholds match the gauge labels: Low/Moderate ≤50, High ≤75, Severe above. */
export type Verdict={title:string;accent:string;summary:string};
export function verdictFor(score:number,flags:number):Verdict{
  if(flags===0)return{title:'No risk',accent:'patterns found.',summary:'No supported risk patterns were found. Unmatched wording still needs your review; this is not a complete legal review.'};
  if(score<=50)return{title:'Read',accent:'carefully.',summary:`There ${flags===1?'is 1 clause':`are ${flags} clauses`} worth clarifying before you sign.`};
  if(score<=75)return{title:'Proceed with',accent:'caution.',summary:`${flags} clauses could cost you money, rights, or control. Negotiate before you sign.`};
  return{title:'Don’t sign',accent:'yet.',summary:`${flags} clauses carry serious risk. Ask for changes or get advice before you sign.`};
}

export const money=(amount:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:amount%1?2:0}).format(amount);

export type ExposureScenario={clauseId:string;title:string;amount:number;kind:'exit'|'fees'|'renewal'|'stated';assumptions:string;unpriced?:string};
export type Exposure={headline:string;label:string;summary:string;scenarios:ExposureScenario[];identifiedAmounts:number[]};

const numberWords:Record<string,number>={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
const readNumber=(s:string)=>Number(s)||numberWords[s.toLowerCase()]||0;
const dollarValues=(text:string)=>Array.from(text.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)/g),m=>Number(m[1].replace(/,/g,''))).filter(Number.isFinite);
const dollarPattern='\\$\\s*([\\d,]+(?:\\.\\d{1,2})?)';
const feeRole='(?:fees?|deposits?|charges?|penalt(?:y|ies)|prepayment|advance payment|prepaid balance)';

/** Use only amounts attached to a named fee/deposit, never the passage's first price. */
function explicitFeeAmounts(text:string){
  const after=new RegExp(`\\b${feeRole}\\s*(?:(?:of|is|will be|shall be|amounts? to|:|=)\\s*)?${dollarPattern}`,'gi');
  const before=new RegExp(`${dollarPattern}\\s+(?:(?:non[-\\s]?refundable|annual|yearly|monthly|one[-\\s]time|refundable|security|initial|late|facilities|enhancement|administrative|processing|cancellation|termination|booking|enrollment)\\s+){0,4}${feeRole}\\b`,'gi');
  return [...new Set([...text.matchAll(after),...text.matchAll(before)].map(match=>Number(match[1].replace(/,/g,''))).filter(Number.isFinite))];
}

function explicitBaseAmounts(text:string){
  const after=new RegExp(`\\b(?:rent|price|base price|membership price|subscription price|regular payment)\\s*(?:(?:of|is|will be|shall be|:|=)\\s*)?${dollarPattern}`,'gi');
  const monthly=new RegExp(`${dollarPattern}\\s*(?:/\\s*month\\b|per\\s+month\\b|a\\s+month\\b)`,'gi');
  return [...text.matchAll(after),...text.matchAll(monthly)].map(match=>Number(match[1].replace(/,/g,''))).filter(Number.isFinite);
}

function explicitDailyLateFee(text:string){
  if(/\b(?:capped at|cap of|maximum|cannot exceed|may not exceed|not to exceed|not exceed|limited to|up to)\b/i.test(text))return null;
  const after=new RegExp(`\\blate\\s+(?:fee|charge|penalty)\\s*(?:(?:of|is|will be|shall be|starts? at|:|=)\\s*)?${dollarPattern}\\s+(?:plus|and)\\s+${dollarPattern}\\s*(?:for\\s+)?(?:each\\s+additional\\s+day|per\\s+day|a\\s+day|/day)\\b`,'i');
  const before=new RegExp(`${dollarPattern}\\s+(?:initial\\s+)?late\\s+(?:fee|charge|penalty)\\s+(?:plus|and)\\s+${dollarPattern}\\s*(?:for\\s+)?(?:each\\s+additional\\s+day|per\\s+day|a\\s+day|/day)\\b`,'i');
  const match=text.match(after)||text.match(before);
  if(!match)return null;
  const base=Number(match[1].replace(/,/g,'')),daily=Number(match[2].replace(/,/g,''));
  return Number.isFinite(base+5*daily)?{base,daily}:null;
}

/** Separate conditional scenarios, never a total of mutually exclusive costs or repeated figures. */
export function exposureFor(doc:DocumentSample):Exposure{
  const scenarios:ExposureScenario[]=[];
  const monthlyCandidates=doc.clauses.filter(clause=>/\brent\b/i.test(`${clause.originalText} ${clause.costImpact}`)).flatMap(clause=>{
    const text=`${clause.originalText} ${clause.costImpact}`;
    return Array.from(text.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)\s*(?:\/\s*month\b|per\s+month\b|a\s+month\b)|monthly\s+rent\s+(?:of\s+|is\s+)?\$\s*([\d,]+(?:\.\d{1,2})?)/gi),match=>Number((match[1]||match[2]).replace(/,/g,''))).filter(Number.isFinite);
  });
  const distinctMonthly=[...new Set(monthlyCandidates)];
  // Conflicting rent figures need human context; do not pick one for a headline.
  const monthly=distinctMonthly.length===1?distinctMonthly[0]:null;
  const identifiedAmounts=[...new Set(doc.clauses.filter(c=>['critical','high','moderate'].includes(c.severity)).flatMap(c=>dollarValues(c.originalText)))];
  for(const clause of doc.clauses){
    if(!['critical','high','moderate'].includes(clause.severity))continue;
    const text=clause.originalText;
    const months=text.match(/\b(\d+|one|two|three|four|five|six|twelve)\s+months?[’']?\s+(?:of\s+)?rent/i);
    if(/early terminat|leaving early|break.*lease/i.test(`${text} ${clause.plainEnglish}`)&&months&&monthly){
      const count=readNumber(months[1]);
      scenarios.push({clauseId:clause.id,title:'Early-exit penalty',amount:count*monthly,kind:'exit',assumptions:`${count} months × ${money(monthly)}/month. The monthly rent comes from the supplied document or its sample explanation. Applies only if this early-exit clause is triggered.`,unpriced:/forfeit.*deposit|deposit.*forfeit/i.test(text)?'Security deposit forfeiture is also stated, but its amount is not supplied.':undefined});
      continue;
    }
    const lateFee=explicitDailyLateFee(text);
    if(lateFee){
      const{base,daily}=lateFee;
      scenarios.push({clauseId:clause.id,title:'Late-fee example',amount:base+5*daily,kind:'fees',assumptions:`${money(base)} initial charge + 5 additional charged days × ${money(daily)}/day. This is one illustrative late-payment scenario, not a prediction or an added charge in the exit scenario.`});
      continue;
    }
    if(/renew/i.test(text)){
      const period=text.match(/(\d+|one|two|three|twelve)[-\s]+(?:months?|years?)/i);
      const given=clause.costImpact.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
      if(/lease/i.test(doc.type)&&monthly&&period){
        const count=readNumber(period[1])*(/year/i.test(period[0])?12:1);
        scenarios.push({clauseId:clause.id,title:'Renewal commitment',amount:count*monthly,kind:'renewal',assumptions:`${count} months × ${money(monthly)}/month if the notice window is missed. This is rent for an additional term, not a penalty; it is not added to the early-exit or late-fee examples.`});
      }else if(given){
        scenarios.push({clauseId:clause.id,title:'Renewal charge',amount:Number(given[1].replace(/,/g,'')),kind:'renewal',assumptions:'Amount stated in the sample explanation for one missed renewal. It is conditional on renewal and is separate from every other scenario.'});
      }
      continue;
    }
    const fees=explicitFeeAmounts(text);
    const baseAmounts=explicitBaseAmounts(text);
    const unassignedAmount=dollarValues(text).some(amount=>!fees.includes(amount)&&!baseAmounts.includes(amount));
    if(fees.length===1&&!unassignedAmount&&!/liability|cap(?:ped)? at|maximum liability/i.test(text)){
      scenarios.push({clauseId:clause.id,title:/deposit/i.test(text)?'Deposit or fee at stake':'Stated additional fee',amount:fees[0],kind:'stated',assumptions:'This amount is explicitly attached to a named fee or deposit. Timing, applicability, future increases, and enforceability need checking. It is not added to other conditional scenarios.'});
    }
  }
  const primary=scenarios.find(x=>x.kind==='exit')||scenarios.filter(x=>x.kind!=='renewal').sort((a,b)=>b.amount-a.amount)[0];
  if(primary)return{headline:`${money(primary.amount)}${primary.unpriced?' + deposit':''}`,label:primary.title,summary:'A concrete amount to discuss before signing. Each amount below is a separate conditional scenario; they are not added into a misleading total.',scenarios,identifiedAmounts};
  if(scenarios.length)return{headline:money(scenarios[0].amount),label:'Possible renewal commitment',summary:'A stated renewal amount, conditional on missing a notice window. It is a payment commitment, not a guaranteed penalty.',scenarios,identifiedAmounts};
  if(identifiedAmounts.length)return{headline:identifiedAmounts.map(money).join(' · '),label:'Amounts to inspect',summary:'These amounts appear in flagged clauses. Their roles differ, so we cannot responsibly turn them into a total cost of signing.',scenarios,identifiedAmounts};
  return{headline:'Exposure not priced',label:'Money is only part of the risk',summary:'This document does not provide enough figures to calculate a reliable dollar exposure. Rights, privacy, and uncapped obligations can still matter.',scenarios,identifiedAmounts};
}

/** Starting language for negotiation, based on the matched issue, not a reviewed legal redline. */
export function proposedTextFor(clause:Clause):string{
  const authored=(clause as Clause&{proposedText?:string}).proposedText;
  if(authored)return authored;
  const category=String(clause.category);
  const proposals:Record<string,string>={
    Arbitration:'After a dispute arises, both parties may voluntarily agree in writing to arbitration. Otherwise, either party may bring an eligible claim in court, including small claims court. No class-action waiver applies.',
    'Auto-renewal':'Provide written notice at least 30 days before renewal, including the renewal date and price. Cancellation may be completed online or by email until the renewal date and takes effect at the end of the current paid term.',
    Fees:'All fees must be listed in this agreement. Any late fee is limited to the lower of $25 or the amount permitted by applicable law, applies once per late payment, and begins only after a five-day grace period. No daily late fees apply.',
    'Data rights':'Rights are limited to the specific data or paid deliverables necessary to provide the agreed services. Pre-existing work and unrelated projects remain with their owner. Any other sharing or use requires separate, informed consent.',
    Termination:'Either party may terminate with 30 days written notice. Any early-exit fee is limited to one month of the regular payment, subject to applicable law. Deposits remain subject only to documented, lawful deductions. Pay for work already completed.',
    'Entry rights':'Except for emergencies, entry requires at least 24 hours written notice, a stated reason, and a reasonable time agreed with the resident, subject to applicable law.',
    Liability:'Each party is responsible only for losses caused by its own breach, negligence, or misconduct. Any liability cap must apply fairly to both parties and must not exclude rights or remedies that applicable law does not allow the parties to waive.',
    'Non-compete':'No restriction applies to unrelated work, general skills, or future employment. Any restriction necessary to protect confidential information must be narrowly defined, time-limited, and subject to applicable law.',
    'Cancellation':'Cancellation may be completed online or by email using the same ease as enrollment. It takes effect at the end of the current paid term. No in-person visit or telephone call is required. Any refund policy must be disclosed before payment.',
    'Price changes':'Give at least 30 days written notice of a proposed price increase. The customer may cancel without penalty before the new price takes effect. No change applies retroactively.',
    'Unilateral changes':'Material changes require at least 30 days written notice and the affected party’s affirmative agreement. If agreement is not given, that party may end the contract without an additional penalty before the change takes effect.',
    'Non-refundable fees':'Any deposit remains refundable except for specifically itemized, reasonable, and lawful deductions. Disclose all cancellation charges before payment and refund amounts for services not provided.',
    'Venue':'Either party may bring an eligible claim in a court with jurisdiction where the customer lives or where the services are provided. This agreement does not restrict non-waivable rights under applicable law.',
    'Confidentiality':'Confidentiality covers only specifically identified non-public information. It does not prevent truthful reviews, reporting concerns to regulators, obtaining professional advice, or disclosures required by law.',
    'Personal guarantee':'No individual personal guarantee is required. Obligations belong only to the contracting entity and are limited to the specific amounts and responsibilities stated in this agreement.',
    Assignment:'Neither party may assign this agreement in a way that materially reduces the other party’s rights without prior written consent. Existing obligations and protections continue after any permitted assignment.',
  };
  return proposals[category]||`Replace the disputed wording with a clear, mutual term that implements this request: ${clause.askInstead}`;
}

/** Who the negotiation email is addressed to, based on the document type. */
export function counterpartyFor(type:string){
  if(/lease/i.test(type))return'your landlord';
  if(/employ|freelance|contract/i.test(type))return'your client';
  if(/loan|credit/i.test(type))return'your lender';
  if(/terms|service/i.test(type))return'the provider';
  return'the other party';
}

/** Notice window written into a clause, e.g. "90 days before expiration" or "48 hours before renewal". */
export function noticeFor(clause:Pick<Clause,'originalText'>):{days:number;label:string}|null{
  const m=clause.originalText.match(/(?:\(\s*)?(\d+)\s*\)?\s*(days?|hours?)\s+(?:before|prior to)/i);
  if(!m)return null;
  const n=Number(m[1]),hours=/hour/i.test(m[2]);
  return{days:hours?Math.max(1,Math.ceil(n/24)):n,label:`${n} ${hours?'hours':'days'}`};
}

const icsDate=(d:Date)=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
const icsText=(s:string)=>s.replace(/[\\;,]/g,m=>`\\${m}`).replace(/\r\n?|\n/g,'\\n');

/** RFC 5545: at most 75 UTF-8 octets per physical line, with a space on continuations. */
function foldIcsLine(line:string){
  const encoder=new TextEncoder(),lines:string[]=[];
  let current='',octets=0;
  for(const character of line){
    const length=encoder.encode(character).length;
    if(octets+length>75){lines.push(current);current=' ';octets=1}
    current+=character;octets+=length;
  }
  lines.push(current);return lines.join('\r\n');
}

/** Date to act by: the notice deadline, with a week of buffer so the reminder arrives in time. */
export function reminderDate(endDate:Date,noticeDays:number,bufferDays=7){
  const d=new Date(endDate);d.setDate(d.getDate()-noticeDays-bufferDays);return d;
}

/** A standalone all-day calendar event (RFC 5545) with a one-day-before alert. Built locally; nothing is uploaded. */
export function buildReminderIcs(doc:Pick<DocumentSample,'name'>,clause:Pick<Clause,'category'|'askInstead'|'originalText'>,endDate:Date,noticeDays:number,now=new Date()){
  const start=reminderDate(endDate,noticeDays),end=new Date(start);end.setDate(end.getDate()+1);
  const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fine Print X-Ray//Deadline Catcher//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@fineprint-xray.local`,`DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(start)}`,`DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${icsText(`Act now: ${clause.category} notice for ${doc.name}`)}`,
    `DESCRIPTION:${icsText(`The notice window closes in about a week (${noticeDays} days before ${icsDate(endDate)}).\n\nClause: ${clause.originalText}\n\nWhat to ask for: ${clause.askInstead}`)}`,
    'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Contract notice deadline approaching','TRIGGER:-P1D','END:VALARM','END:VEVENT','END:VCALENDAR'].map(foldIcsLine).join('\r\n')+'\r\n';
}

/** Copy text with a fallback for browsers or frames without the async clipboard API. */
export async function copyText(text:string){
  try{await navigator.clipboard.writeText(text);return true}catch{
    const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';
    document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy')}catch{}area.remove();return ok;
  }
}
