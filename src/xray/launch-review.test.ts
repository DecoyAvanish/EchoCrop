import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {samples,isFlagged,clauseTitle} from './data';
import {exposureFor,verdictFor,reminderDate} from './actions';
import {riskBand} from './scoring';
import {Gauge} from './ui';
import Report from './Report';

describe('launch consistency',()=>{
 it.each(samples.map(d=>[d.id,d] as const))('%s has eight substantive clauses and mixed findings',(_,doc)=>{
  expect(doc.clauses.length).toBeGreaterThanOrEqual(8);
  expect(doc.clauses.some(isFlagged)).toBe(true);
  expect(doc.clauses.some(c=>c.severity==='safe')).toBe(true);
  expect(doc.clauses.every(c=>c.originalText.length>60)).toBe(true);
 });
 it('prices the lease deposit exactly once and removes ordinary rent renewal from money scenarios',()=>{
  const e=exposureFor(samples[0]);expect(e.headline).toBe('$9,800');
  expect(e.scenarios.find(s=>s.kind==='exit')?.amount).toBe(3*2450+2450);
  expect(e.scenarios.some(s=>s.kind==='renewal')).toBe(false);
  expect(e.primaryAssumptions).toContain('$2,450 security deposit');
  expect(reminderDate(new Date(2027,0,7),60).toDateString()).toBe(new Date(2026,10,1).toDateString());
 });
 it('uses the same day-ten explanation in the inspector and money section',()=>{
  expect(exposureFor(samples[0]).scenarios.find(s=>s.kind==='fees')?.assumptions).toBe(samples[0].clauses[3].costImpact);
 });
 it('does not present a residential-use restriction as safe',()=>{
  expect(samples[0].clauses[0].severity).toBe('neutral');
  expect(clauseTitle(samples[0].clauses[0])).toBe('Use of premises');
  expect(clauseTitle(samples[0].clauses[5])).toBe('Deposit return');
 });
 it('keeps score thresholds and verdicts aligned',()=>{
  expect([0,29,30,54,55,99].map(riskBand)).toEqual(['Not flagged','Low','Moderate','Moderate','High','High']);
  expect(verdictFor(30,1).accent).toBe('caution.');expect(verdictFor(59,5).title).toBe('Negotiate before');
 });
 it('exposes the scale as a usable method link',()=>{
  const html=renderToStaticMarkup(createElement(Gauge,{score:59,large:true}));
  expect(html).toContain('href="#score-method"');expect(html).toContain('55–99 High');
 });
 it('renders the primary amount once without a duplicate scenario card',()=>{
  const html=renderToStaticMarkup(createElement(Report,{doc:samples[0],go:()=>{},language:'en'}));
  const panel=html.split('class="exposure-panel"')[1].split('class="report-grid"')[0];
  expect(panel.match(/\$9,800/g)).toHaveLength(1);
  expect(html).not.toContain('$29,400');expect(html).toContain('How scoring works');
 });
});
