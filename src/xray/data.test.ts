import {describe,expect,it} from 'vitest';
import {analyzeText,detectDocumentType,isFlagged,samples,scoreFor,splitClauses} from './data';
import {localizeClause} from './localize';
import {eightRiskTerms,freelanceAgreement,residentialLease} from './fixtures/contracts';

describe('real input regression contracts',()=>{
  it('recognizes all eight adverse sections in a pasted platform agreement',()=>{
    const doc=analyzeText(eightRiskTerms,'Northline terms');
    const risks=doc.clauses.filter(isFlagged);
    expect(doc.type).toBe('Terms of Service');
    expect(risks).toHaveLength(8);
    expect(risks.map(c=>c.category)).toEqual(['Unilateral changes','Liability','Non-compete','Non-refundable charges','Venue and law','Price increases','Content license','Non-refundable charges']);
    expect(risks.every(c=>c.evidence&&c.proposedText)).toBe(true);
    expect(risks.find(c=>c.category==='Liability')?.costImpact).toContain('$50');
    expect(risks.find(c=>c.category==='Non-refundable charges')?.costImpact).toContain('$3,000');
    expect(scoreFor(doc.clauses)).toBeGreaterThan(70);
    expect(doc.clauses.filter(c=>c.severity==='safe')).toHaveLength(0);
  });

  it('keeps numbered lease sections whole, finds overlooked rights, and preserves balanced terms',()=>{
    const doc=analyzeText(residentialLease);
    expect(doc.type).toBe('Lease');
    expect(doc.clauses.filter(isFlagged).map(c=>c.category)).toEqual(['Entry rights','Price increases','Arbitration','Notice waiver','Assignment','Termination']);
    const deposit=doc.clauses.find(c=>c.originalText.startsWith('Section 2.'))!;
    expect(deposit.severity).toBe('safe');
    expect(doc.clauses.find(c=>c.category==='Arbitration')?.originalText).toContain('Tenant waives');
    const description=doc.clauses.find(c=>c.originalText.startsWith('Section 9.'))!;
    expect(description.category).toBe('Not flagged');
    expect(description.severity).toBe('neutral');
    expect(description.confidence).toBe(0);
  });

  it('finds ownership, indemnity, work restrictions, gag clauses, and guarantees in freelance input',()=>{
    const doc=analyzeText(freelanceAgreement);
    expect(doc.type).toBe('Employment / Freelance');
    expect(doc.clauses.filter(isFlagged).map(c=>c.category)).toEqual(['Data rights','Liability','Non-compete','Confidentiality','Personal guarantee','Termination']);
    expect(doc.clauses.find(c=>c.category==='Non-compete')?.numbers).toContain('24 months');
  });
});

describe('honest coverage and segmentation',()=>{
  it('flags uncapped or unlimited liability when the restriction precedes the noun',()=>{
    for(const adjective of ['uncapped','unlimited']){
      const clause=analyzeText(`Contractor has ${adjective} liability for all damages.`).clauses[0];
      expect(clause.category).toBe('Liability');
      expect(clause.severity).toBe('high');
      expect(clause.evidence).toBe(`${adjective} liability`);
    }
  });

  it('never equates an unmatched passage with a safe match',()=>{
    const doc=analyzeText('The blue meeting room contains six chairs.\n\nThe service opens at nine each morning.');
    expect(doc.clauses.length).toBe(2);
    expect(doc.clauses.every(c=>c.severity==='neutral'&&c.category==='Not flagged'&&c.confidence===0)).toBe(true);
    expect(doc.clauses.some(isFlagged)).toBe(false);
    expect(scoreFor(doc.clauses)).toBe(0);
  });

  it('positively recognizes online cancellation while retaining cancellation hurdles as risks',()=>{
    const fair=analyzeText('You may cancel online at any time from account settings.');
    expect(fair.clauses[0].severity).toBe('safe');
    for(const text of ['You must call customer service to cancel your membership.','Cancellation is permitted only in person at the original gym.','To cancel your service you must send certified mail.']){
      expect(analyzeText(text).clauses[0].category).toBe('Cancellation');
    }
    const restricted=analyzeText('You may cancel online at any time. There are no refunds for unused service.');
    expect(restricted.clauses.some(c=>c.severity==='safe')).toBe(false);
    expect(restricted.clauses.some(isFlagged)).toBe(true);
  });

  it('keeps every section past the old 24-clause cutoff, including a final risk',()=>{
    const text=Array.from({length:30},(_,i)=>`${i+1}. Schedule ${i+1}. Meetings take place in the main office.`).concat('31. Disputes. All claims must be brought in individual binding arbitration.').join('\n');
    const doc=analyzeText(text);
    expect(doc.clauses).toHaveLength(31);
    expect(doc.clauses[30].category).toBe('Arbitration');
  });

  it('preserves short input, decimals, and inline numbered sections',()=>{
    expect(splitClauses('1. Payment is $49.95 monthly. 2. Fees are non-refundable.')).toHaveLength(2);
    expect(splitClauses('1. Deliver work by June 30. The fee is $500.\n2. Final files are sent by email.')).toHaveLength(2);
    expect(analyzeText('Payment is due.').clauses[0].originalText).toBe('Payment is due.');
    expect(analyzeText('').clauses[0].severity).toBe('neutral');
    const unicode=analyzeText('The $3,000 deposit is non‑refundable.').clauses[0];
    expect(unicode.category).toBe('Non-refundable charges');
    expect(unicode.evidence).toBe('non‑refundable');
  });

  it('does not flag optional arbitration as mandatory or ordinary third-party mentions as data sharing',()=>{
    expect(analyzeText('Arbitration is optional and requires mutual agreement.').clauses.some(isFlagged)).toBe(false);
    expect(analyzeText('A third party may deliver the physical package.').clauses.some(isFlagged)).toBe(false);
    expect(analyzeText('We will not sell or share your personal data with third parties.').clauses.some(isFlagged)).toBe(false);
    expect(analyzeText('No non-compete restriction applies to Contractor.').clauses.some(isFlagged)).toBe(false);
    expect(analyzeText('No personal guarantee is required from any employee.').clauses.some(isFlagged)).toBe(false);
  });

  it('detects document types without defaulting every upload to lease',()=>{
    expect(detectDocumentType('Tenant pays rent to Landlord for the premises.')).toBe('Lease');
    expect(detectDocumentType('Contractor delivers services to Client.')).toBe('Employment / Freelance');
    expect(detectDocumentType('A subscription account renews monthly.')).toBe('Terms of Service');
    expect(detectDocumentType('Borrower repays the loan to Lender at the stated annual percentage rate.')).toBe('Loan / Credit');
    expect(detectDocumentType('This credit card agreement sets an APR and monthly repayment schedule.')).toBe('Loan / Credit');
    expect(detectDocumentType('A general agreement about a boat.')).toBe('Other');
  });
});

describe('clause-specific Spanish explanations',()=>{
  it('translates every sample and retains its meaningful figures',()=>{
    for(const sample of samples)for(const clause of sample.clauses){
      const t=localizeClause(clause,'es');
      expect(t.plain).not.toBe(clause.plainEnglish);
      expect(t.ask.length).toBeGreaterThan(12);
    }
    expect(localizeClause(samples[0].clauses[4],'es').cost).toContain('$7,350');
    expect(localizeClause(samples[0].clauses[3],'es').cost).toContain('$250');
    expect(localizeClause(samples[3].clauses[0],'es').cost).toContain('$828');
    expect(localizeClause(samples[1].clauses[0],'es').cost).toContain('$16.99');
  });

  it('keeps unmatched Spanish explanations neutral rather than claiming safety',()=>{
    const clause=analyzeText('The room contains six chairs.').clauses[0];
    expect(localizeClause(clause,'es').plain).toContain('Aún debes revisarlo');
  });
});
