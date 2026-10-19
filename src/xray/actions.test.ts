import {describe,expect,it} from 'vitest';
import {analyzeText,samples,scoreFor} from './data';
import {buildReminderIcs,counterpartyFor,noticeFor,pad,reminderDate,verdictFor} from './actions';

describe('report helpers',()=>{
  it('pads clause numbers past nine',()=>{expect(pad(3)).toBe('03');expect(pad(12)).toBe('12')});
  it('adapts the verdict to the score',()=>{
    expect(verdictFor(0,0).accent).toBe('fair.');
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

describe('deadline catcher',()=>{
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
});

describe('local analysis',()=>{
  it('flags risky language and scores it',()=>{
    const doc=analyzeText('Any dispute shall be resolved by binding arbitration.\n\nThis agreement automatically renews for successive terms.');
    expect(doc.clauses.map(c=>c.severity)).toEqual(['critical','high']);
    expect(scoreFor(doc.clauses)).toBeGreaterThan(30);
  });
});
