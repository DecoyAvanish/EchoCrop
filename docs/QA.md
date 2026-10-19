# Verification summary — 19 October 2026

Live: https://hyperbloom-two.vercel.app/

| Check | Evidence / result |
|---|---|
| Production toolchain | Node 22 / pnpm 11.25.0; TypeScript, 56 regression tests and Vite passed in a clean preview build. |
| Carrier review fixture | 9 passages; 7 expected risk passages detected. |
| Room-sublease review fixture | 6 lettered sections preserved; all 5 expected risk passages detected. |
| Mutual-NDA review fixture | 7 sections; zero flagged passages, including no false venue flag on governing law alone. |
| Broader regressions | Existing rules, 40-section preservation, unknown vs balanced terms, money assumptions, per-clause proposals, Spanish sample figures and calendar generation remain covered. |
| Paper | Hero and scan visibility/drag verified in the preceding release. Updated scan visually verified: selected arbitration is focused; pages balance 4 + 3; gauge denominator is contained. |
| File handling | Prior Chromium checks: DOCX extraction; empty, oversized, unsupported, malformed PDF and fake DOCX show recoverable errors. |
| Phone / preferences | Prior Chromium checks at 1440, 768, 390 and 320px, including phone-sheet focus/return and combined preferences. New filter layout wraps rather than hiding choices off-screen. |
| Accessibility audits | Previous production Lighthouse accessibility: Home, streaming scan, gym report and Clause Lab each 100. WebGL-disabled scan also 100. These are automated checks, not screen-reader certification. |
| Performance baseline | Previous Lighthouse simulated mobile: performance 68; TBT 3,590ms; LCP 2.0s; CLS 0.001. Graphics now begin after interaction or delayed idle; no improved score is claimed without a new measurement. |
| Spanish scope | Clause explanations, monetary explanations and report verdict are translated. Source wording, navigation, some headings and controls remain English. Original calculations remain inspectable in English. |

## How to interpret the contract results

The three review fixtures are reconstructed from the quoted examples in the
review. They are regression tests, **not blind independent agreements** and not
a measured real-world accuracy rate. Another author must supply three unseen
complete contracts and expected findings before an independent hit rate can be
reported. A zero score means no supported risk pattern matched, not legal safety;
contextual deposit, termination and money reminders remain visible.

## Outstanding human verification

Physical iPhone VoiceOver, Android Chrome, Safari/Firefox, a private-window
phone/laptop smoke test, real calendar opening, final saved-PDF inspection,
3–5 participant sessions and a captioned video are not yet verified.
See [submission readiness](SUBMISSION_READINESS.md) for ownership and exact next
steps. The broader preference/zoom/error-state results in the supplied review are
external baseline evidence, not new checks silently attributed to this pass.

ThreeUI Community orbital/dot-matrix source and MIT terms were verified against
upstream hashes. The exact paper bundle entitlement still needs account-owner
confirmation. Event rules allow AI-assisted development; the submission credits
that assistance and the third-party visual foundations.
