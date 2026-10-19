import {describe,it,expect} from 'vitest';
import {analyzeText,isFlagged,splitClauses} from './data';
import {exposureFor,verdictFor} from './actions';
import {samples} from './data';

// Reconstructed from the review's quoted passages, not independent blind tests.
const carrier=`1. Service. Your monthly plan includes voice and data.
2. Disputes. You resolve disputes only by individual arbitration administered by the AAA. You waive any right to participate in a class or representative proceeding.
3. Device. The remaining device balance becomes due immediately, plus a $200 deactivation charge.
4. Information. We may use your location and browsing information to deliver tailored ads and may share it with our advertising partners.
5. Network. The provider reserves the right to slow data speeds.
6. Billing. You may receive paper bills for a fee of $2.99 per bill.
7. Price. We may increase prices at any time without notice.
8. Liability. Our liability is limited to $100.
9. Help. Contact support through your account.`;
const sublease=`A. Rent. Late payment incurs a $75 penalty and $10 per day thereafter.
B. Deposit. The deposit, which the Sublessor may keep in full if Subtenant moves out before the end date for any reason, is payable at signing.
C. Breach. A violation allows Sublessor to terminate immediately.
D. Repairs. Subtenant is responsible for all repairs, regardless of cause.
E. Access. Sublessor may access the room at any time without notice.
F. Contact. Notices can be sent to the address below.`;
const nda=`1. Purpose. The parties exchange information for evaluating a project.
2. Definition. Confidential information is identified in writing.
3. Exclusions. Public information and independently developed material are excluded.
4. Duties. Each recipient protects information using reasonable care.
5. Disclosure. Disclosure required by law is permitted.
6. Duration. Duties expire after two years.
7. Law. This agreement is governed by the laws of the State of New York.`;
describe('review contract regressions',()=>{
 it('finds all seven quoted carrier risks in nine passages',()=>{const d=analyzeText(carrier);expect(d.clauses).toHaveLength(9);expect(d.clauses.filter(isFlagged)).toHaveLength(7)});
 it('keeps six lettered sections and flags the five adverse terms',()=>{const d=analyzeText(sublease);expect(d.clauses).toHaveLength(6);expect(d.clauses.filter(isFlagged)).toHaveLength(5)});
 it('does not turn governing law alone into a venue restriction',()=>{const d=analyzeText(nda);expect(d.clauses).toHaveLength(7);expect(d.clauses.filter(isFlagged)).toHaveLength(0)});
 it.each(['(a)','i.'])('keeps %s headings with their qualifications',heading=>expect(splitClauses(`${heading} Deposit. It is returned. It is itemized.`)).toHaveLength(1));
 it('still flags an exclusive court requirement',()=>expect(analyzeText('The courts of New York have exclusive jurisdiction.').clauses.some(isFlagged)).toBe(true));
 it('does not flag an ordinary project price as an additional charge',()=>expect(analyzeText('The project fee is $4,500.').clauses.some(isFlagged)).toBe(false));
 it('explains warning topics even when no supported risk matches',()=>{const d=analyzeText('The deposit and termination details appear in the schedule.');expect(verdictFor(0,0,d).summary).toContain('deposits, termination');expect(verdictFor(0,0,d).title).toBe('No supported')});
 it('leads the lease with exit exposure, without changing the gym headline',()=>{expect(exposureFor(samples[0]).headline).toContain('7,350');expect(exposureFor(samples[3]).headline).toContain('828')});
});
