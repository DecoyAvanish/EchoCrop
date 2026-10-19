import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {analyzeText,samples,scoreFor} from './data';
import {buildReminderIcs,counterpartyFor,exposureFor,noticeFor,pad,proposedTextFor,reminderDate,verdictFor} from './actions';
import Report from './Report';

describe('report helpers',()=>{
  it('pads clause numbers past nine',()=>{expect(pad(3)).toBe('03');expect(pad(12)).toBe('12')});
  it('adapts the verdict to the score',()=>{
    expect(verdictFor(0,0).accent).toBe('patterns found.');
    expect(verdictFor(30,1).summary).toContain('1 clause');
    expect(verdictFor(59,5).title).toBe('Proceed with');
    expect(verdictFor(90,8).title).toBe('Don’t sign');
  });
  it('addresses the email to the right person',()=>{
    expect(counterpartyFor('Lease')).toBe('your landlord');
    expect(counterpartyFor('Employment / Freelance')).toBe('your client');
    expect(counterpartyFor('Terms of Service')).toBe('the provider');
    expect(counterpartyFor('Other')).toBe('the other party');
  });
});

describe('honest financial exposure',()=>{
  const feeDocument=(text:string)=>({...samples[0],clauses:[{...samples[0].clauses[3],originalText:text}]});
  it('keeps exit, late-payment, and renewal scenarios separate',()=>{
    const result=exposureFor(samples[0]);
    expect(result.headline).toBe('$7,350 + deposit');
    expect(result.scenarios.find(x=>x.kind==='exit')?.amount).toBe(7350);
    expect(result.scenarios.find(x=>x.kind==='fees')?.amount).toBe(250);
    expect(result.scenarios.find(x=>x.kind==='renewal')?.amount).toBe(29400);
    expect(result.summary).toContain('not added');
    expect(result.headline).not.toContain('37,000');
  });
  it('does not turn the company liability cap into the customer cost',()=>{
    const clause={...samples[2].clauses[1],originalText:'The company’s maximum liability is capped at $50.',costImpact:'The company limits what you may recover to $50.'};
    const result=exposureFor({id:'cap',name:'Service terms',type:'Terms of Service',clauses:[clause]});
    expect(result.scenarios).toHaveLength(0);
    expect(result.label).toBe('Amounts to inspect');
    expect(result.identifiedAmounts).toEqual([50]);
  });
  it('uses the late charge rather than rent when both are in one preserved section',()=>{
    const result=exposureFor(feeDocument('1. Monthly rent is $2,450. A late charge of $125 plus $25 for each additional day applies.'));
    expect(result.scenarios.find(x=>x.kind==='fees')?.amount).toBe(250);
    expect(result.headline).toBe('$250');
  });
  it('recognizes a named additional fee separately from a base price',()=>{
    const result=exposureFor(feeDocument('The monthly price is $69. An annual facilities enhancement fee of $149 applies.'));
    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].amount).toBe(149);
  });
  it('declines a cost scenario when the role or choice of amount is ambiguous',()=>{
    for(const text of ['Monthly rent is $2,450. Additional fees may apply.','An application fee of $35 and a processing fee of $50 apply.','A $12 small fee and a processing fee of $50 apply.','A late fee of $125 plus $25 per day applies, capped at $150.']){
      expect(exposureFor(feeDocument(text)).scenarios).toHaveLength(0);
    }
  });
  it('states the limitation when no dollar exposure can be calculated',()=>{
    expect(exposureFor(samples[2]).headline).toBe('Exposure not priced');
  });
  it('does not guess which rent applies when the document has conflicting monthly figures',()=>{
    const conflicting={...samples[0],clauses:[...samples[0].clauses,{...samples[0].clauses[0],id:'different-rate',originalText:'The monthly rent is $1,800.',costImpact:'No unusual additional fee.'}]};
    expect(exposureFor(conflicting).scenarios.some(x=>x.kind==='exit')).toBe(false);
    expect(exposureFor(conflicting).scenarios.some(x=>x.kind==='renewal')).toBe(false);
  });
  it('offers usable proposed wording for every flagged sample clause',()=>{
    for(const doc of samples)for(const clause of doc.clauses.filter(x=>['critical','high','moderate'].includes(x.severity))){
      expect(proposedTextFor(clause).length).toBeGreaterThan(50);
      expect(proposedTextFor(clause)).not.toBe(clause.askInstead);
    }
  });
});

describe('deadline catcher',()=>{
  it('requires an actual renewal date instead of pre-filling an invented one',()=>{
    const html=renderToStaticMarkup(createElement(Report,{doc:samples[0],go:()=>{},language:'en'}));
    expect(html).toMatch(/type="date"[^>]*value=""/);
    expect(html).toContain('<button disabled="">ADD REMINDER TO CALENDAR');
  });
  it('finds notice windows in every sample that has one',()=>{
    const lease=samples[0].clauses.find(c=>c.category==='Auto-renewal')!;
    expect(noticeFor(lease)).toEqual({days:90,label:'90 days'});
    expect(noticeFor(samples[1].clauses[0])).toEqual({days:2,label:'48 hours'});
    expect(noticeFor(samples[3].clauses[0])).toEqual({days:60,label:'60 days'});
    expect(noticeFor({originalText:'Tenant shall pay rent monthly.'})).toBeNull();
  });
  it('builds a valid calendar file a week before the deadline',()=>{
    const end=new Date(2027,5,30);
    expect(reminderDate(end,90).toDateString()).toBe(new Date(2027,2,25).toDateString());
    const ics=buildReminderIcs(samples[0],samples[0].clauses[6],end,90);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain('DTSTART;VALUE=DATE:20270325');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).not.toMatch(/[^\r]\n/);
  });
  it('folds long Unicode lines at 75 UTF-8 octets without damaging text',()=>{
    const name='Contrato de José 🏠 — revisión '.repeat(14);
    const ics=buildReminderIcs({name},samples[0].clauses[6],new Date(2027,5,30),90);
    const encoder=new TextEncoder();
    const physical=ics.split('\r\n');
    expect(physical.every(line=>encoder.encode(line).length<=75)).toBe(true);
    expect(physical.some(line=>line.startsWith(' '))).toBe(true);
    expect(ics.replace(/\r\n[ \t]/g,'')).toContain(`SUMMARY:Act now: Auto-renewal notice for ${name}`);
    expect(ics).not.toContain('\uFFFD');
    expect(ics.endsWith('\r\n')).toBe(true);
  });
  it('escapes calendar punctuation, backslashes, and newlines',()=>{
    const ics=buildReminderIcs({name:'José, A; B\\C\nNext'},samples[0].clauses[6],new Date(2027,5,30),90);
    expect(ics.replace(/\r\n[ \t]/g,'')).toContain('José\\, A\\; B\\\\C\\nNext');
  });
});

describe('local analysis',()=>{
  it('flags risky language and scores it',()=>{
    const doc=analyzeText('Any dispute shall be resolved by binding arbitration.\n\nThis agreement automatically renews for successive terms.');
    expect(doc.clauses.map(c=>c.severity)).toEqual(['critical','high']);
    expect(scoreFor(doc.clauses)).toBeGreaterThan(30);
  });
});
