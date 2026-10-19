/** Shared wording for scan and report: a prioritization signal, not a probability. */
export const scoringExplanation='Critical matches add 25 points, high 12, and moderate 5. The score is 100 × (1 − exp(−points / 75)), rounded and capped at 99. Recognized balanced and not-flagged text add no points. This prioritizes supported wording patterns; it is not a probability, a complete legal review, or a decision about enforceability.';

export const riskBand=(score:number)=>score===0?'Not flagged':score<30?'Low':score<55?'Moderate':'High';
export const scoreScale='1–29 Low · 30–54 Moderate · 55–99 High.';
