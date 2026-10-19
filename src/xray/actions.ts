import type {Clause,DocumentSample} from './data';

/** Two-digit index that keeps working past nine (01…24). */
export const pad=(n:number)=>String(n).padStart(2,'0');

/** Thresholds match the gauge labels: Low/Moderate ≤50, High ≤75, Severe above. */
export type Verdict={title:string;accent:string;summary:string};
export function verdictFor(score:number,flags:number):Verdict{
  if(flags===0)return{title:'Looks',accent:'fair.',summary:'No common high-risk patterns were found. Still read the details that matter to you.'};
  if(score<=50)return{title:'Read',accent:'carefully.',summary:`There ${flags===1?'is 1 clause':`are ${flags} clauses`} worth clarifying before you sign.`};
  if(score<=75)return{title:'Proceed with',accent:'caution.',summary:`${flags} clauses could cost you money, rights, or control. Negotiate before you sign.`};
  return{title:'Don’t sign',accent:'yet.',summary:`${flags} clauses carry serious risk. Ask for changes or get advice before you sign.`};
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
const icsText=(s:string)=>s.replace(/[\;,]/g,m=>`\\${m}`).replace(/\n/g,'\\n');

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
    'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Contract notice deadline approaching','TRIGGER:-P1D','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
}

/** Copy text with a fallback for browsers or frames without the async clipboard API. */
export async function copyText(text:string){
  try{await navigator.clipboard.writeText(text);return true}catch{
    const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';
    document.body.append(area);area.select();let ok=false;try{ok=document.execCommand('copy')}catch{}area.remove();return ok;
  }
}
