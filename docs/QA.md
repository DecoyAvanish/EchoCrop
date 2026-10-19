# Verification results

Live: https://hyperbloom-two.vercel.app/

| Area | Result |
|---|---|
| Build | Node 22 / pnpm 11.25.0; TypeScript, Vite and 66 regression tests pass. |
| Sample agreements | Four agreements, eight clauses each, with both balanced and adverse provisions. |
| Lease amounts | $7,350 rent penalty + $2,450 deposit = $9,800. Separate day-10 late fee: $250. Ordinary renewal rent is not counted as a penalty. |
| Rule regressions | Carrier fixture: 7 expected risks; sublease: 5; NDA: no false venue flag. These are authored regression fixtures, not blind accuracy measurements. |
| Reading and paper | Reading view is the default. Optional curved paper holds eight clauses per page; all original text remains available in Reading view. |
| Phone layout | 390px scan, detail sheet and report captured. Scan and report width stay 390px; all three filters remain visible. [Scan](launch-scan-390.jpg), [details](launch-sheet-390.jpg), [report](launch-report-390.jpg). |
| Clause Lab | Specimen dialog opens without changing grid layout. Escape closes it and returns focus. Quiz records answer feedback and running score. |
| Intake | Samples hide the type override. File selection says “Open a file”; supported file errors remain recoverable. |
| Calendar | Date entry is explicit; generated ICS uses escaped text, all-day dates and UTF-8 line folding. A real calendar opening remains a human check. |
| Spanish | Clause explanations, money explanations and report verdict are translated. Navigation, source wording and some controls remain English. Original calculations are labelled in English. |
| Graphics | Poster first, then interaction/delayed idle. Hidden scenes pause; reduced motion freezes movement. Mobile rendering uses lower pixel density and a 30fps limit. |
| Previous production audit | Lighthouse mobile: performance 90, accessibility 100, best practices 100, SEO 100; TBT 360ms. A fresh final-release audit is recorded below when available. |

## Scope of verification

Browser checks use Chromium viewport emulation, not physical phone hardware.
Automated accessibility checks do not certify screen-reader usability.
Regression examples do not establish a real-world detection rate. “Not flagged”
means no supported risk rule matched, not that an agreement is safe.

## Before submission

Three unseen contracts and answer keys from another author; 3–5 consenting user
sessions; a captioned demonstration; physical VoiceOver/iPhone and Android checks;
private-window smoke tests; actual calendar opening and final printed-PDF review.
The exact paper bundle entitlement still requires account-owner confirmation.
Community orbital/dot-matrix licensing is verified. See
[launch checklist](LAUNCH_CHECKLIST.md) for the item-by-item implementation map.
