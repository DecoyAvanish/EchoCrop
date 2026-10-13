export type Severity = 'critical' | 'high' | 'moderate' | 'safe';
export type Category = 'Arbitration' | 'Auto-renewal' | 'Fees' | 'Data rights' | 'Termination' | 'Entry rights' | 'Liability' | 'Fair terms';

export type Clause = {
  id: string; category: Category; severity: Severity; confidence: number;
  originalText: string; plainEnglish: string; costImpact: string; askInstead: string;
  numbers?: string[];
};

export type DocumentSample = { id: string; name: string; type: string; clauses: Clause[] };

const c = (id:string, category:Category, severity:Severity, confidence:number, originalText:string, plainEnglish:string, costImpact:string, askInstead:string, numbers?:string[]):Clause => ({id,category,severity,confidence,originalText,plainEnglish,costImpact,askInstead,numbers});

export const samples: DocumentSample[] = [
  {id:'lease',name:'Apartment Lease — 47 Mercer St.',type:'Lease',clauses:[
    c('l1','Fair terms','safe',99,'The premises shall be used solely as a private residence by the Tenant.','This home is for residential use only.','No unusual cost. This is a standard use clause.','No change needed.'),
    c('l2','Entry rights','moderate',91,'Landlord may enter the premises at reasonable times upon twelve (12) hours notice for inspection, repair, or showing.','Your landlord can enter with only 12 hours notice.','Short notice can disrupt work, sleep, or privacy.','Request at least 24 hours written notice, except in emergencies.',['12 hours']),
    c('l3','Arbitration','critical',98,'Any dispute arising under this Lease shall be resolved by binding arbitration. Tenant waives the right to trial by jury and to participate in any class action.','You give up the right to sue your landlord in court or join a group lawsuit.','Filing and arbitrator fees can make a small claim expensive to pursue.','Delete mandatory arbitration, or make it optional after a dispute begins.'),
    c('l4','Fees','high',96,'Rent received after the fifth day is subject to a late charge of $125 plus $25 for each additional day.','A late payment starts at $125 and grows by $25 every day.','Ten days late would cost $250 on top of rent.','Cap the late fee and add a written grace period.',['$125','$25/day']),
    c('l5','Termination','high',94,'Early termination requires payment of three months rent and forfeiture of the security deposit.','Leaving early could cost three months of rent plus your deposit.','At $2,450/month, the stated penalty is at least $7,350 before the deposit.','Ask for a one-month fee or permission to find a replacement tenant.',['3 months','$7,350']),
    c('l6','Fair terms','safe',97,'Security deposit shall be returned within 30 days, less itemized lawful deductions.','Your deposit must be returned within 30 days with a list of any deductions.','This is specific and gives you a paper trail.','No change needed. Keep photos and your move-in checklist.',['30 days']),
    c('l7','Auto-renewal','high',95,'This Lease automatically renews for successive one-year terms unless written notice is received at least 90 days before expiration.','The lease renews for a full year unless you cancel at least 90 days early.','Missing the window could lock you into another year of rent.','Request month-to-month renewal and a 30-day reminder.',['90 days','1 year']),
  ]},
  {id:'streaming',name:'Northstar+ Terms of Service',type:'Terms of Service',clauses:[
    c('s1','Auto-renewal','high',98,'Your subscription automatically renews each month unless cancelled at least 48 hours before the renewal date.','You keep getting charged until you cancel, and must do it 48 hours early.','$16.99 each missed month.','Ask for a renewal reminder and cancellation effective through the billing date.',['$16.99','48 hours']),
    c('s2','Data rights','critical',94,'We may share usage, device, and inferred-interest data with affiliates, advertising networks, and marketing partners.','Your activity and inferred interests may be shared for advertising.','The cost is loss of privacy and control over profiling.','Request opt-out by default and sharing limited to service delivery.'),
    c('s3','Arbitration','critical',97,'All claims must be brought in individual binding arbitration. Class proceedings are waived.','You cannot take the company to court or join a class action.','Individual arbitration may cost more than the claim is worth.','Make arbitration optional.'),
    c('s4','Fair terms','safe',96,'You may cancel online at any time from account settings.','You can cancel online without calling support.','No unusual cost.','Keep this term.'),
  ]},
  {id:'freelance',name:'Acme Studio Contractor Agreement',type:'Employment / Freelance',clauses:[
    c('f1','Data rights','critical',96,'Contractor irrevocably assigns all inventions and works conceived during the term, whether or not related to the Services.','They claim ownership of anything you create during the contract—even unrelated work.','You could lose rights to side projects or reusable tools.','Limit assignment to paid deliverables created specifically for this project.'),
    c('f2','Liability','high',92,'Contractor shall indemnify Company against any and all claims, damages, and expenses without limitation.','You could be responsible for unlimited company losses and legal bills.','There is no stated financial cap.','Cap liability at the fees paid under the agreement.'),
    c('f3','Termination','moderate',93,'Company may terminate this Agreement at any time without cause upon written notice.','They may end the job immediately for any reason.','You could lose expected income without transition time.','Request 14 days notice and payment for committed work.',['14 days']),
  ]},
  {id:'gym',name:'Pulse House Membership',type:'Other',clauses:[
    c('g1','Auto-renewal','high',97,'Membership renews automatically for twelve-month periods unless cancelled in person 60 days before renewal.','It renews for a year, and cancellation requires an in-person visit 60 days early.','$828 for another year at $69/month.','Allow online cancellation at any time with 30 days notice.',['12 months','60 days','$828']),
    c('g2','Fees','high',93,'An annual facilities enhancement fee of $149 may be adjusted without notice.','There is a $149 yearly fee that can increase without warning.','$149 now, with no limit on future increases.','Set a maximum and require advance notice.',['$149']),
    c('g3','Fair terms','safe',95,'Membership may be frozen for documented medical reasons at no charge.','You can pause for medical reasons without paying.','This is member-friendly.','No change needed.'),
  ]}
];

const rules:{category:Category;severity:Severity;pattern:RegExp;plain:string;cost:string;ask:string}[]=[
  {category:'Arbitration',severity:'critical',pattern:/arbitrat|class action|jury trial/i,plain:'You may be giving up court and group-action rights.',cost:'Private dispute resolution can carry filing and arbitrator fees.',ask:'Make arbitration optional after a dispute begins.'},
  {category:'Auto-renewal',severity:'high',pattern:/automatic(?:ally)? renew|successive term/i,plain:'This can keep charging or recommit you unless you cancel in time.',cost:'The cost may equal another full billing or contract term.',ask:'Require a reminder and a simple cancellation path.'},
  {category:'Data rights',severity:'critical',pattern:/third part|affiliate|marketing partner|perpetual license|assign(?:s|ment)? all/i,plain:'This grants broad rights to share your data or own your work.',cost:'The impact is loss of privacy or control over valuable work.',ask:'Limit rights to what is necessary to deliver the service.'},
  {category:'Fees',severity:'high',pattern:/late fee|late charge|administrative fee|facilit(?:y|ies).*fee|rate.*increase/i,plain:'This adds or increases charges beyond the headline price.',cost:'Fees can compound or rise without a clear ceiling.',ask:'Ask for a fixed cap, notice, and a grace period.'},
  {category:'Termination',severity:'high',pattern:/early termination|terminate.*without cause|forfeit/i,plain:'Ending the agreement may be expensive or one-sided.',cost:'You may owe penalties or lose expected income.',ask:'Request notice, a cure period, and a capped exit fee.'},
  {category:'Entry rights',severity:'moderate',pattern:/enter the premises|right of entry/i,plain:'This gives the other party access to your space.',cost:'The impact is mainly privacy and disruption.',ask:'Require at least 24 hours written notice except emergencies.'},
  {category:'Liability',severity:'high',pattern:/indemnif|hold harmless|waive.*liability/i,plain:'You may be taking responsibility for unusually broad losses.',cost:'The potential liability may be uncapped.',ask:'Limit responsibility to your own negligence and cap the amount.'},
];

export function analyzeText(text:string, name='Pasted agreement'):DocumentSample {
  const parts=text.split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/).map(x=>x.trim()).filter(x=>x.length>25).slice(0,24);
  const clauses=parts.map((originalText,i)=>{const rule=rules.find(r=>r.pattern.test(originalText)); const numbers=originalText.match(/\$[\d,]+(?:\.\d+)?|\d+\s*(?:days?|months?|years?|hours?|%)/gi)||undefined;
    return rule?c(`u${i}`,rule.category,rule.severity,88,originalText,rule.plain,rule.cost,rule.ask,numbers):c(`u${i}`,'Fair terms','safe',72,originalText,'No common high-risk pattern was detected in this passage.','No direct cost detected. Review important terms in context.','Ask a qualified professional if this term affects a major decision.');
  });
  return {id:'custom',name,type:'Other',clauses:clauses.length?clauses:[c('u0','Fair terms','safe',60,text||'No readable text found.','No common risk pattern was detected.','No amount detected.','Try pasting the document text directly.')]};
}

export const scoreFor=(clauses:Clause[])=>Math.min(99,Math.round(100*(1-Math.exp(-clauses.reduce((n,x)=>n+(x.severity==='critical'?25:x.severity==='high'?12:x.severity==='moderate'?5:0),0)/75))));
export const severitySymbol:Record<Severity,string>={critical:'⬢',high:'◆',moderate:'▲',safe:'●'};
