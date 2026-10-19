export type Severity = 'critical' | 'high' | 'moderate' | 'safe' | 'neutral';
export type Category = 'Arbitration' | 'Auto-renewal' | 'Fees' | 'Data rights' | 'Termination' | 'Entry rights' | 'Liability' | 'Fair terms' | 'Unilateral changes' | 'Non-compete' | 'Non-refundable charges' | 'Venue and law' | 'Price increases' | 'Content license' | 'Cancellation' | 'Confidentiality' | 'Personal guarantee' | 'Notice waiver' | 'Assignment' | 'Not flagged';

export type Clause = {
  id: string; category: Category; severity: Severity; confidence: number;
  originalText: string; plainEnglish: string; costImpact: string; askInstead: string;
  numbers?: string[];
  /** Suggested negotiation language, not a jurisdiction-specific legal replacement. */
  proposedText?: string;
  /** The exact phrase that triggered the local rule, so a match is inspectable. */
  evidence?: string;
};

export type DocumentSample = { id: string; name: string; type: string; clauses: Clause[] };

const c = (id:string, category:Category, severity:Severity, confidence:number, originalText:string, plainEnglish:string, costImpact:string, askInstead:string, numbers?:string[]):Clause => ({id,category,severity,confidence,originalText,plainEnglish,costImpact,askInstead,numbers});

export const samples: DocumentSample[] = [
  {id:'lease',name:'Apartment Lease — 47 Mercer St.',type:'Lease',clauses:[
    c('l1','Fair terms','safe',99,'The premises shall be used solely as a private residence by the Tenant.','This home is for residential use only.','No unusual cost. This is a standard use clause.','No change needed.'),
    c('l2','Entry rights','moderate',91,'Landlord may enter the premises at reasonable times upon twelve (12) hours notice for inspection, repair, or showing.','Your landlord can enter with only 12 hours notice.','Short notice can disrupt work, sleep, or privacy.','Request at least 24 hours written notice, except in emergencies.',['12 hours']),
    c('l3','Arbitration','critical',98,'Any dispute arising under this Lease shall be resolved by binding arbitration. Tenant waives the right to trial by jury and to participate in any class action.','You give up the right to sue your landlord in court or join a group lawsuit.','Filing and arbitrator fees can make a small claim expensive to pursue.','Delete mandatory arbitration, or make it optional after a dispute begins.'),
    c('l4','Fees','high',96,'Rent received after the fifth day is subject to a late charge of $125 plus $25 for each additional day.','A late payment starts at $125 and grows by $25 every day.','Ten days late would cost $250 on top of rent.','Cap the late fee and add a written grace period.',['$125','$25/day']),
    c('l5','Termination','high',94,'Early termination requires payment of three months rent and forfeiture of the security deposit.','Leaving early could cost three months of rent plus your deposit.','At $2,450/month, three months of rent is $7,350, plus your deposit.','Ask for a one-month fee or permission to find a replacement tenant.',['3 months','$7,350']),
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
  {id:'gym',name:'Pulse House Membership',type:'Membership',clauses:[
    c('g1','Auto-renewal','high',97,'Membership renews automatically for twelve-month periods unless cancelled in person 60 days before renewal.','It renews for a year, and cancellation requires an in-person visit 60 days early.','$828 for another year at $69/month.','Allow online cancellation at any time with 30 days notice.',['12 months','60 days','$828']),
    c('g2','Fees','high',93,'An annual facilities enhancement fee of $149 may be adjusted without notice.','There is a $149 yearly fee that can increase without warning.','$149 now, with no limit on future increases.','Set a maximum and require advance notice.',['$149']),
    c('g3','Fair terms','safe',95,'Membership may be frozen for documented medical reasons at no charge.','You can pause for medical reasons without paying.','This is member-friendly.','No change needed.'),
  ]}
];

type Rule = {category:Category;severity:Severity;pattern:RegExp;exclude?:RegExp;plain:string;cost:string;ask:string;proposed:string};

// Most specific rights/financial restrictions come first. Unknown language is
// deliberately neutral: absence from this rule set is not a safety finding.
const rules:Rule[]=[
  {category:'Termination',severity:'high',pattern:/balance\s+(?:becomes?|is)\s+due\s+immediately/i,plain:'The remaining balance can become payable all at once, with any stated exit charges added.',cost:'You may need to pay the unpaid balance immediately rather than through the original payment schedule.',ask:'Preserve the payment schedule and remove accelerated payment and deactivation penalties.',proposed:'Ending service does not accelerate the remaining balance. Existing installments continue on their agreed schedule, without an additional deactivation penalty.'},
  {category:'Liability',severity:'high',pattern:/responsib\w*.{0,60}all repairs|all repairs.{0,90}regardless of cause/i,plain:'This shifts repair responsibility to you regardless of who caused the damage.',cost:'You could pay for defects, ordinary wear, or damage you did not cause.',ask:'Limit your responsibility to damage you cause; preserve the owner’s maintenance duties.',proposed:'The occupant is responsible only for damage caused by their negligence or misconduct, not ordinary wear, defects, or repairs legally owed by the owner.'},
  {category:'Unilateral changes',severity:'high',pattern:/(?:slow|throttl)\w*.{0,45}(?:speed|data)|(?:speed|data).{0,45}(?:slow|throttl)/i,plain:'The provider can reduce your data speeds.',cost:'You may pay the same price for reduced service.',ask:'Specify speed thresholds, advance notice, and a penalty-free exit.',proposed:'Any speed reduction must follow clearly disclosed thresholds. Material reductions require notice and a right to cancel without penalty.'},
  {category:'Arbitration',severity:'critical',pattern:/arbitrat\w*.{0,160}(?:individual|waiv|class|representative)|(?:individual|waiv\w*|class|representative).{0,100}arbitrat|(?:claims?|disputes?|action).{0,85}(?:decided|resolved|settled).{0,50}arbitrator|agree to arbitrate.{0,45}(?:disputes|claims)|not by a judge or jury.{0,65}individual basis|binding arbitration|(?:must|shall|required to)\s+(?:be\s+)?(?:resolved|settled|submitted|brought).{0,70}arbitrat|waiv\w*.{0,45}(?:class action|class proceeding|jury trial|trial by jury)|class (?:action|proceeding)s?.{0,35}(?:waiv|prohibit)/i,exclude:/arbitration (?:is |shall be )?optional|may (?:choose|elect) arbitration/i,plain:'This requires private arbitration or waives court, jury, or group-action rights.',cost:'Filing and arbitrator fees can make an individual claim expensive to pursue.',ask:'Keep court and small-claims access; make arbitration optional after a dispute starts.',proposed:'Either party may choose arbitration only by mutual written agreement after a dispute arises. Court, small-claims, and applicable collective-action rights are preserved.'},
  {category:'Non-compete',severity:'high',pattern:/non[-\s]?(?:compet(?:e|ition)|solicit\w*)|(?:shall not|may not|must not|prohibit\w*|restrict\w*|agree\w* not to).{0,90}(?:compet(?:e|ing)|solicit.{0,35}(?:client|customer|employee)|work for.{0,30}competitor)/i,plain:'This can restrict where you work or which customers you can approach after the agreement ends.',cost:'A long or broad restriction can limit future earnings and work opportunities.',ask:'Remove the restriction, or narrowly limit its duration, scope, and affected clients.',proposed:'No restriction applies to future employment or unrelated clients. Any agreed non-solicitation restriction is limited to clients personally served under this agreement and to a reasonable, expressly stated period.'},
  {category:'Personal guarantee',severity:'critical',pattern:/personal(?:ly)?\s+guarante\w*|guarant(?:or|ee).{0,65}(?:personal|individual|joint and several)|(?:personally|individually)\s+(?:liable|responsible).{0,55}(?:debt|obligation|payment)|joint(?:ly)? and several(?:ly)?.{0,50}(?:liable|liability)/i,plain:'You may have to pay the business’s obligations from your own money or assets.',cost:'Personal exposure can extend beyond the contract price and survive the business ending.',ask:'Remove the personal guarantee or state a fixed amount, end date, and release conditions.',proposed:'Obligations are solely those of the contracting business. No owner, employee, or representative gives a personal guarantee or assumes individual liability.'},
  {category:'Content license',severity:'critical',pattern:/(?:name|image|likeness).{0,100}without compensation|(?:perpetual|irrevocable|royalty[-\s]free|worldwide).{0,150}(?:licen[cs]e|right.{0,15}(?:use|reproduce|exploit)|content|submissions)|(?:licen[cs]e|grant\w*.{0,25}rights?).{0,150}(?:perpetual|irrevocable|royalty[-\s]free)/i,plain:'This grants lasting or very broad permission to use your content without paying you.',cost:'You could lose control over reuse, commercial distribution, or deletion of your work.',ask:'Limit the license to providing the service, with ownership retained and deletion rights.',proposed:'You retain ownership of your content. The provider receives a non-exclusive license only as necessary to deliver the service, ending when the content is deleted except for legally required retention.'},
  {category:'Data rights',severity:'critical',pattern:/(?:location|browsing|share it).{0,140}advertis|(?:share|sell|disclos|transfer)\w*.{0,110}(?:data|information|interest|usage).{0,100}(?:affiliate|advertis|marketing|business partner|third part)|(?:share|sell|disclos|transfer)\w*.{0,70}(?:affiliate|advertis|marketing|business partner|third part).{0,80}(?:data|information)|(?:irrevocably\s+)?assign\w*.{0,35}all.{0,65}(?:invention|work|intellectual property|rights)/i,plain:'This gives the other party broad control over your personal data or ownership of your work.',cost:'You may lose privacy or rights to valuable work, including projects outside this agreement.',ask:'Limit data sharing to service delivery and ownership transfers to specifically paid deliverables.',proposed:'Personal data is used only to provide the service and is not sold or shared for advertising without separate consent. Any transfer of work is limited to identified, fully paid project deliverables; pre-existing and unrelated work remains yours.'},
  {category:'Non-refundable charges',severity:'high',pattern:/(?:deposit).{0,120}(?:keep|retain|forfeit)|(?:keep|retain|forfeit)\w*.{0,70}deposit|non[-\s]?refund(?:able)?|(?:deposit|fee|payment|amount).{0,65}(?:not refundable|never refund|forfeit)|(?:no|without) refund(?:s)?\b/i,plain:'This says money already paid may not be returned, even if you cancel or do not use the service.',cost:'You could lose the stated deposit, advance payment, or remaining prepaid balance.',ask:'Provide a proportionate refund for unused service and itemize any legitimate deductions.',proposed:'Unused prepaid amounts and deposits will be refunded within 30 days after cancellation, less only documented, reasonable charges for services already provided or actual damage.'},
  {category:'Price increases',severity:'high',pattern:/(?:price|rent|rate|fee|charge)s?.{0,80}(?:increas|rais|adjust|chang).{0,70}(?:without|any time|at any time|sole discretion|notice)|(?:increas|rais|adjust|chang)\w*.{0,45}(?:price|rent|rate|fee|charge)s?(?:.{0,65}(?:without|notice|discretion|any time))|rent(?:al)?(?:\s+(?:shall|will|may|is|be|automatically))*\s+(?:increas|rais|escalat)/i,plain:'The other party can raise the price or rent, potentially without a clear limit or advance warning.',cost:'Future payments may be higher than the amount you agreed to at signup.',ask:'Fix the price for the current term; require advance notice and a right to exit before any increase.',proposed:'The agreed price is fixed during the current term. Any later increase requires at least 30 days written notice, and you may cancel before it takes effect without penalty.'},
  {category:'Cancellation',severity:'high',pattern:/(?:cancel\w*|terminat\w*).{0,95}(?:by (?:phone|telephone)|call(?:ing)?|in[-\s]person|certified mail|business hours|only)|(?:phone|telephone|in[-\s]person)[-\s]only.{0,60}cancel|(?:must|required to|may only).{0,40}(?:call|visit).{0,70}(?:cancel|terminat)/i,plain:'Cancellation requires an extra step such as calling, visiting in person, or using a narrow channel.',cost:'A difficult cancellation process can lead to unwanted additional charges.',ask:'Allow online cancellation through the same channel used to sign up, effective by the next bill.',proposed:'You may cancel online from your account, or by email, at any time. Cancellation is confirmed immediately and takes effect before the next billing period without an additional cancellation fee.'},
  {category:'Auto-renewal',severity:'high',pattern:/automatic(?:ally)?\s+renew|renew\w*\s+automatic(?:ally)?|successive\s+(?:one[-\s]year\s+|twelve[-\s]month\s+)?terms?|renew\w*.{0,70}unless.{0,80}(?:cancel|notice)/i,plain:'The agreement renews unless you cancel within the stated notice window.',cost:'Missing the window may commit you to another full billing or contract term.',ask:'Require a renewal reminder, a shorter notice window, and simple online cancellation.',proposed:'The provider will send a renewal reminder at least 30 days before renewal. You may cancel online at any time before renewal; no new fixed term begins without clear notice.'},
  {category:'Unilateral changes',severity:'high',pattern:/(?:we|company|provider|landlord|service|either party).{0,45}(?:may|can|reserves? the right to).{0,45}(?:chang|modif|amend|revis)\w*.{0,65}(?:term|agreement|contract|polic|rule)|(?:chang|modif|amend|revis)\w*.{0,45}(?:term|agreement|contract|polic|rule).{0,75}(?:without notice|at any time|from time to time|when posted|sole discretion|unilateral)|continued use.{0,80}(?:accept|consent|agree)/i,plain:'The other party can change the deal after you agree, potentially treating continued use as consent.',cost:'New obligations or fewer protections could apply without a fresh agreement.',ask:'Require written notice and express consent for material changes, with a penalty-free exit.',proposed:'Material changes require advance written notice and your express agreement. If you do not agree, you may end the agreement without penalty before the changes take effect.'},
  {category:'Confidentiality',severity:'high',pattern:/(?:shall not|may not|must not|prohibit\w*|agree\w* not to).{0,90}(?:disparag|negative (?:review|comment)|publicly discuss|disclos\w*.{0,40}(?:terms|complaint|experience))|non[-\s]?disparagement|(?:confidential|confidentiality).{0,85}(?:complaint|review|regulator|government|legal counsel)/i,plain:'This may limit honest reviews, discussion of your experience, or reporting a problem.',cost:'You could face a threatened penalty for speaking about the agreement or seeking help.',ask:'Protect honest reviews and disclosure to advisers, regulators, and legally protected recipients.',proposed:'Nothing restricts honest reviews, reporting suspected misconduct, legally protected disclosures, or confidential discussions with legal, financial, or professional advisers.'},
  {category:'Notice waiver',severity:'high',pattern:/waiv\w*.{0,65}(?:notice|demand|hearing)|without (?:prior )?(?:written )?notice.{0,70}(?:evict|terminat|repossess|default)/i,plain:'You may be giving up advance notice or the chance to respond before action is taken.',cost:'You could have less time to fix a missed payment, dispute a claim, or protect your rights.',ask:'Preserve required notices and provide a clear, reasonable period to respond or cure a breach.',proposed:'All legally required notices are preserved. Before termination or enforcement, the affected party will receive written notice and a reasonable opportunity to respond and cure any remediable breach.'},
  {category:'Assignment',severity:'moderate',pattern:/(?:assign|transfer)\w*.{0,70}(?:this agreement|this contract|its rights|our rights|rights and obligations).{0,80}(?:without|consent|any time|third part)|(?:this agreement|this contract).{0,40}(?:assign|transfer)\w*.{0,60}(?:without|consent)|assignment.{0,55}(?:without|sole discretion)/i,plain:'The agreement or its obligations can be transferred to someone else without your approval.',cost:'You could be required to deal with a new party without the same service or financial protections.',ask:'Require notice and consent for a transfer that materially changes your rights or service.',proposed:'An assignment requires advance written notice and your consent if it materially affects your rights or performance. Any assignee must accept all existing obligations and protections.'},
  {category:'Venue and law',severity:'moderate',pattern:/(?:exclusive|sole|mandatory).{0,60}(?:venue|jurisdiction|courts?)|(?:venue|jurisdiction|courts?).{0,60}(?:exclusive|sole|mandatory)|(?:out[-\s]of[-\s]state|foreign).{0,30}(?:court|venue|jurisdiction)/i,plain:'This restricts where a dispute must be brought. A distant forum can make a claim harder.',cost:'Travel, local counsel, and unfamiliar procedures can add to the cost of a dispute.',ask:'Use a convenient local forum and preserve any mandatory consumer or worker protections.',proposed:'Any dispute may be brought in a competent court where the affected individual lives or the services were provided. Mandatory consumer and worker protections remain applicable.'},
  {category:'Liability',severity:'high',pattern:/releas\w*.{0,150}(?:claim|negligence)|own negligence|indemnif\w*|hold.{0,10}harmless|waiv\w*.{0,40}liability|(?:uncapped|unlimited)\s+liability|(?:liability|damages|recovery).{0,75}(?:cap(?:ped)?|limit(?:ed)?|not exceed|maximum|\$\s*\d)|(?:not|never).{0,20}liable.{0,60}(?:damage|loss|claim)|limitation of liability/i,plain:'This shifts losses to you or caps what you can recover if the other party causes harm.',cost:'The amount you can recover may be much lower than your actual loss, while your own exposure may be broad.',ask:'Make liability balanced, set a reasonable cap, and preserve remedies for fraud and serious misconduct.',proposed:'Each party is responsible for losses caused by its own breach or negligence. Any liability limit is mutual and reasonable, and does not exclude fraud, willful misconduct, or liability that law does not permit the parties to limit.'},
  {category:'Fees',severity:'high',pattern:/(?:penalty|charge|fee).{0,45}(?:\$\s*\d|per day)|\$\s*[\d,.]+.{0,35}(?:penalty|charge|fee)|(?:all|any|reasonable).{0,30}(?:collection costs|attorneys?[’']? fees)|collection costs|late fee|late charge|administrative fee|facilit(?:y|ies).{0,40}fee|processing fee|(?:additional|penalty|cancellation).{0,20}(?:fee|charge)/i,plain:'This adds a fee beyond the headline price, which may repeat or compound.',cost:'Extra charges can increase the total amount you owe.',ask:'State every fee up front, cap it, and allow a reasonable grace period.',proposed:'All fees must be disclosed before agreement, reflect reasonable actual costs, and be capped. No late fee applies during a written grace period, and no fee compounds daily.'},
  {category:'Termination',severity:'high',pattern:/terminat\w*\s+immediately|balance\s+(?:becomes?|is)\s+due\s+immediately|early termination|terminat\w*.{0,60}without cause|forfeit\w*|(?:company|provider|client).{0,55}(?:terminate|end).{0,40}(?:at any time|immediately)/i,plain:'Ending the agreement may carry a penalty or give the other party an unusually broad right to end it.',cost:'You could owe an exit payment or lose expected income without a transition period.',ask:'Request advance notice, payment for completed work, a cure period, and a capped exit fee.',proposed:'Either party may terminate on 30 days written notice. Completed and committed work will be paid. A remediable breach receives notice and a reasonable cure period; any agreed early-exit fee must be expressly capped.'},
  {category:'Entry rights',severity:'moderate',pattern:/(?:access|enter)\w*.{0,85}(?:any time|without notice)|enter (?:the |your )?(?:premises|property|unit|apartment)|right of entry/i,exclude:/(?:24|twenty[-\s]four|48|forty[-\s]eight)\s*(?:\(24\)|\(48\))?\s*hours?.{0,35}(?:written )?notice|except in (?:an )?emergenc/i,plain:'This gives another party access to your space, possibly with little advance warning.',cost:'The main impact is disruption and loss of privacy.',ask:'Require at least 24 hours written notice, reasonable hours, and a narrow emergency exception.',proposed:'Except for an emergency, entry requires at least 24 hours written notice, a stated legitimate purpose, and reasonable daytime hours.'},
];

const fairRules:Rule[]=[
  {category:'Fair terms',severity:'safe',pattern:/(?:deposit|security).{0,60}(?:return|refund)\w*.{0,35}(?:within )?(?:30|thirty|14|fourteen|21|twenty[-\s]one)\s*days?.{0,90}(?:itemiz|documented|deduction)/i,plain:'This sets a specific deposit-return deadline and requires documented deductions.',cost:'A deadline and an itemized record make deductions easier to check.',ask:'Keep this protection and save photos and payment records.',proposed:''},
  {category:'Fair terms',severity:'safe',pattern:/(?:may|can|able to)\s+cancel\s+online\s+(?:at\s+)?any\s*time|cancel(?:lation)?.{0,25}online.{0,35}(?:any time|anytime).{0,30}(?:without|no)\s+(?:fee|penalt)/i,plain:'You can cancel online at any time without a required call or visit.',cost:'This gives you a practical way to stop future charges.',ask:'Keep this term and save the cancellation confirmation.',proposed:''},
  {category:'Fair terms',severity:'safe',pattern:/(?:freeze|frozen|pause).{0,65}medical.{0,35}(?:no charge|without (?:a )?fee|free)|medical.{0,60}(?:freeze|pause).{0,35}(?:no charge|without (?:a )?fee)/i,plain:'This allows a medical pause without an added fee.',cost:'You can avoid charges during the stated medical pause.',ask:'Keep this protection and check the documentation required.',proposed:''},
];

export const isFlagged=(clause:Pick<Clause,'severity'>)=>clause.severity==='critical'||clause.severity==='high'||clause.severity==='moderate';
export const severityLabel:Record<Severity,string>={critical:'Critical',high:'High',moderate:'Moderate',safe:'Safe',neutral:'Not flagged'};

/** Detect the agreement's subject rather than defaulting every upload to a lease. */
export function detectDocumentType(text:string):DocumentSample['type']{
  const terms=[{type:'Membership',pattern:/\b(?:gym|club|membership|member|fitness|facilities|subscription box)\b/gi},{type:'Lease',pattern:/\b(?:tenant|landlord|residential lease|rental agreement|premises|security deposit|rent)\b/gi},{type:'Employment / Freelance',pattern:/\b(?:contractor|employee|employer|freelance|deliverables|employment|client|inventions)\b/gi},{type:'Loan / Credit',pattern:/\b(?:loan|borrower|lender|credit agreement|credit card|annual percentage rate|APR|repayment|principal balance|interest rate|promissory note)\b/gi},{type:'Terms of Service',pattern:/\b(?:subscription|subscriber|terms of service|terms of use|account|platform|service|membership|renewal date)\b/gi}];
  const ranked=terms.map(x=>({...x,count:(text.match(x.pattern)||[]).length})).sort((a,b)=>b.count-a.count);
  return ranked[0].count?ranked[0].type:'Other';
}

/** Keep numbered sections intact so qualifications in the next sentence stay in context. */
export function splitClauses(text:string):string[]{
  const normalized=text.replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ').trim();
  if(!normalized)return[];
  const letterHeading=/^[ \t]*(?:[A-Z]\.|\([a-z]\)|[ivxlcdm]+\.)\s+/im;
  if(letterHeading.test(normalized)){
    return normalized.split(/\n(?=[ \t]*(?:[A-Z]\.|\([a-z]\)|[ivxlcdm]+\.)\s+)/i).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  }
  let previousNumber=0;
  const numbered=normalized.replace(/(^|\s)((?:Section\s+\d+(?:\.\d+)*[.:]?\s+|Article\s+(?:\d+|[IVX]+)[.:]?\s+|\d{1,3}[.)]\s+(?=[A-Z])))/gim,(match,boundary:string,heading:string,offset:number)=>{
    const number=Number(heading.match(/\d+/)?.[0]);
    const start=offset+boundary.length;
    const startsLine=start===0||/\n[ \t]*$/.test(normalized.slice(0,start));
    const labelled=/^(?:Section|Article)\b/i.test(heading);
    // An inline number must continue the section sequence. This avoids treating
    // a date such as "June 30. The fee…" or a heading's repeated number as a section.
    if(!startsLine&&number!==previousNumber+1)return match;
    if(labelled&&!startsLine&&!/[.!?]\s*$/.test(normalized.slice(0,start)))return match;
    if(Number.isFinite(number))previousNumber=number;
    return`\n\n${heading}`;
  });
  const hasNumbered=/^(?:Section\s+\d|Article\s+(?:\d|[IVX])|\d{1,3}[.)]\s)/im.test(numbered);
  const blocks=numbered.split(/\n\s*\n+/).flatMap(block=>{
    const clean=block.replace(/\s*\n\s*/g,' ').replace(/[ \t]+/g,' ').trim();
    if(!clean)return[];
    // Numbered sections retain every sentence, including exceptions and remedies.
    if(hasNumbered||/^(?:Section\s+\d|Article\s+|\d+[.)]\s)/i.test(clean))return[clean];
    return clean.split(/(?<=[.!?])\s+(?=[A-Z][a-z])/);
  });
  return blocks.map(x=>x.trim()).filter(x=>/[A-Za-zÀ-ÿ]{2}/.test(x));
}

function quantifiedCost(original:string,rule:Rule,numbers:string[]|undefined){
  const dollars=numbers?.filter(x=>x.startsWith('$'))||[];
  if(rule.category==='Non-refundable charges'&&dollars.length)return`${dollars.join(' and ')} is described as non-refundable or at risk of forfeiture. Check when a refund is available.`;
  if(rule.category==='Liability'&&dollars.length&&/(?:cap|limit|exceed|maximum)/i.test(original))return`The stated recovery limit is ${dollars.join(' / ')}. Losses above that amount may not be recoverable under this term.`;
  if((rule.category==='Fees'||rule.category==='Price increases')&&dollars.length)return`The clause names ${dollars.join(' and ')} in charges. Check whether these are one-time, recurring, or added to the base price.`;
  if(rule.category==='Non-compete'&&numbers?.length)return`The restriction names ${numbers.join(', ')}. Its duration and scope could limit future income.`;
  return rule.cost;
}

const matchable=(text:string)=>text.replace(/[\u2010-\u2015\u2212]/g,'-');

function ruleEvidence(rule:Rule,text:string){
  const match=matchable(text).match(rule.pattern);
  return match&&match.index!==undefined?text.slice(match.index,match.index+match[0].length):undefined;
}

function matchesRule(rule:Rule,source:string){
  const text=matchable(source);
  if(!rule.pattern.test(text)||rule.exclude?.test(text))return false;
  // A promise not to do something is different from a permission to do it.
  // Leave these passages neutral unless a separate positive rule recognizes them.
  if(rule.category==='Data rights'&&/\b(?:do|does|will|shall)\s+not\s+(?:sell|share|disclose|transfer)\b/i.test(text)&&!/(?:but|except|however|unless)/i.test(text))return false;
  if(rule.category==='Non-compete'&&/\bno\s+non[-\s]?(?:compete|solicitation)|non[-\s]?compete.{0,25}(?:does not|shall not) apply/i.test(text))return false;
  if(rule.category==='Personal guarantee'&&/\bno\s+personal\s+guarantee|(?:does not|shall not)\s+personally\s+guarantee/i.test(text))return false;
  // An agreed service price is not an added charge or penalty. Keep ordinary
  // compensation neutral unless the passage also states an adverse fee trigger.
  if(rule.category==='Fees'&&/(?:project|service|contractor|consulting)\s+fee|(?:client|company)\s+(?:will|shall)\s+pay/i.test(text)&&!/(?:penalty|late|additional|deactivation|per day|per bill|without notice|collection)/i.test(text))return false;
  return true;
}

function contextualRule(rule:Rule,text:string):Rule{
  if(rule.category==='Content license'&&/(?:name|image|likeness).{0,100}without compensation/i.test(text))return {...rule,plain:'This permits promotional use of your name, image or likeness without paying you.',cost:'You may lose control over where your identity appears or what it seems to endorse.',ask:'Make promotional use optional, require separate written consent, and allow consent to be withdrawn.',proposed:'Promotional use of a person’s name, image or likeness requires separate, voluntary written consent identifying the permitted use and duration. Declining or withdrawing consent does not affect access to the service.'};
  if(rule.category==='Liability'&&/releas.*claim|own negligence/i.test(text))return {...rule,plain:'This asks you to release claims, potentially even when the other party’s negligence causes harm.',cost:'You could lose a route to compensation for an injury or loss caused by the other party.',ask:'Remove the negligence release and preserve claims and remedies that applicable law protects.',proposed:'Each party remains responsible for harm caused by its own negligence or misconduct. Nothing releases claims that applicable law does not permit the parties to waive.'};
  if(rule.category==='Fees'&&/collection costs|attorneys?[’']? fees/i.test(text))return {...rule,plain:'Collection costs and legal fees may be added to the amount you owe.',cost:'A disputed or overdue payment could grow beyond the original balance; no fixed amount is stated here.',ask:'Limit recovery to reasonable, documented amounts awarded or permitted by law, with notice and a chance to dispute the balance.',proposed:'Collection costs and legal fees are recoverable only to the extent reasonable, documented and awarded or permitted by applicable law. Written notice and a reasonable opportunity to dispute the balance must come first.'};
  return rule;
}

export function analyzeText(text:string, name='Pasted agreement'):DocumentSample {
  const paragraphs=text.replace(/\r\n?/g,'\n').split(/\n\s*\n/).map(x=>x.replace(/\s+/g,' ').trim());
  const clauses=splitClauses(text).map((originalText,i)=>{
    const numbers=matchable(originalText).match(/\$\s?[\d,]+(?:\.\d+)?|\d+\s*[-–]?\s*(?:days?|months?|years?|hours?|%)/gi)||undefined;
    const directRule=rules.find(r=>matchesRule(r,originalText));
    const numbered=/^(?:Section\s+\d|Article\s+|\d+[.)]\s)/i.test(originalText);
    const context=numbered?originalText:paragraphs.find(x=>x.includes(originalText))||originalText;
    // A cancellation sentence followed by "no refunds" in the same paragraph
    // must not receive a green label just because segmentation separated them.
    const fairRule=!rules.some(r=>matchesRule(r,context))?fairRules.find(r=>matchesRule(r,originalText)):undefined;
    const rule=directRule||fairRule;
    if(!rule)return c(`u${i}`,'Not flagged','neutral',0,originalText,'No supported risk or balanced-term rule matched this passage. It still needs your review.','No cost estimate is available for an unrecognized term.','Read this in context and ask about obligations, limits, or costs that are unclear.',numbers);
    const contextual=contextualRule(rule,originalText);
    return{...c(`u${i}`,rule.category,rule.severity,92,originalText,contextual.plain,quantifiedCost(originalText,contextual,numbers),contextual.ask,numbers),proposedText:contextual.proposed||undefined,evidence:ruleEvidence(rule,originalText)};
  });
  return {id:'custom',name,type:detectDocumentType(text),clauses:clauses.length?clauses:[c('u0','Not flagged','neutral',0,text||'No readable text found.','There is not enough readable text to analyze.','No cost estimate is available.','Paste the agreement text or try another document.')]};
}

// Sample explanations keep their authored amounts while gaining actionable
// replacement wording from the same rules used by uploaded agreements.
const sampleProposals:Record<string,string>={
 l2:'Except in an emergency, the landlord will provide at least 24 hours written notice of the purpose and reasonable time of entry, subject to applicable law.',
 l3:'Arbitration is optional and requires mutual written agreement after a dispute arises. Court, jury, small-claims and applicable collective-action rights are preserved.',
 l4:'A late charge applies only once after a five-day grace period and is limited to a reasonable amount permitted by applicable law. No daily compounding charge applies.',
 l5:'A tenant may leave early by providing 30 days written notice and paying no more than one month of rent, or by finding an approved replacement tenant. Security deposit deductions remain limited to documented, lawful losses.',
 l7:'After the initial lease term, the tenancy continues month to month unless both parties agree in writing to a new fixed term. Tenant may give 30 days written notice, subject to applicable law.',
 g1:'Membership continues month to month after the initial term. The club will send a written renewal reminder at least 30 days before renewal. Members may cancel online or by email with 30 days notice; no visit is required.',
 g2:'The annual facilities enhancement fee is fixed at $149 for the current term. Any proposed increase requires 30 days written notice and an opportunity to cancel without penalty before it applies.',
 s1:'The provider will send a reminder before each renewal. Subscribers may cancel online through the renewal date, effective before the next billing period, without an extra 48-hour cutoff.',
 s2:'Data will be used only for service delivery. Advertising or profiling disclosures require separate opt-in consent and a clear way to withdraw it.',
 s3:'Arbitration is optional after a dispute arises and requires mutual written consent. Eligible court and collective-action rights remain available.',
 f1:'Assignment covers only identified, fully paid deliverables created specifically for these services. Pre-existing tools, general skills and unrelated projects remain the contractor’s property.',
 f2:'Each party indemnifies the other only for losses caused by its own breach or misconduct. Liability is mutually capped at fees paid under this agreement, except where applicable law prohibits a cap.',
 f3:'Either party may terminate with 14 days written notice. The client will pay for completed work and non-cancellable commitments agreed in advance.'
};
for(const sample of samples)for(const clause of sample.clauses){
  const rule=rules.find(r=>r.category===clause.category&&matchesRule(r,clause.originalText));
  if(rule&&isFlagged(clause)){clause.proposedText=sampleProposals[clause.id]||rule.proposed;clause.evidence=ruleEvidence(rule,clause.originalText)}
}

export const scoreFor=(clauses:Clause[])=>Math.min(99,Math.round(100*(1-Math.exp(-clauses.reduce((n,x)=>n+(x.severity==='critical'?25:x.severity==='high'?12:x.severity==='moderate'?5:0),0)/75))));
export const severitySymbol:Record<Severity,string>={critical:'⬢',high:'◆',moderate:'▲',safe:'●',neutral:'○'};
