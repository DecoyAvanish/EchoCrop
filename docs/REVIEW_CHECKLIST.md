# October review: implementation and release checklist

This tracks the supplied review item by item. “Implemented” is a code status,
not a claim that all devices, assistive technologies or judges agree.
See QA.md for the narrower verification evidence.

## Tier 1

- [x] Six missed wording variants: arbitrator without “binding”, negligence
  release, collection/legal fees, uncompensated likeness, posted rule changes,
  business-partner data disclosures. Each has a regression test.
- [ ] Independently supplied complete agreements: obtain 2–3 with permission;
  external excerpt regressions are additional coverage, not a substitute.
- [x] Phone filters: non-shrinking 44px horizontal chips.
- [x] Phone duplicate list: rail list hidden in Reading view; filters apply to
  the one full-width reading list. 3D view retains its navigation rail.
- [x] Compact phone/tablet score; never presents a score while preparing.
- [x] Authored sample proposals; type-aware custom lease/membership renewal
  and non-late-fee proposals.
- [x] Membership type, detection and gym / club counterparty.
- [x] Largest single priced conditional scenario leads money section.
- [x] Stable production URL deployed and opened; release evidence in QA.md.
- [ ] Physical iPhone Safari / Android Chrome checks need an owner/tester.

## Tier 2 — copy and interaction

- [x] Remove claim that a timed sweep measures actual processing.
- [x] Step 3 ACT / ASK, REMIND, NEGOTIATE.
- [x] Home report-preview strip links to Rosa’s report.
- [x] Add gray Not flagged legend with an explicit coverage limitation.
- [x] Consistent Jordan / Mercer St. lease story without changing hero paper.
- [x] Singular / both / all flagged-clause wording.
- [x] NEXT QUESTION and open-specimen minus sign.
- [x] State the non-additive money caveat once; replace “unpriced deposit”.
- [x] STEP 1 OF 3 intake label.
- [x] Shared HOW SCORING WORKS wording and formula.
- [x] One report legal disclaimer (shared footer).
- [x] Explicit not-found route with home and scan actions.
- [x] Hint to locate end / renewal date.
- [x] Collapsible redline details; As written / Proposed remain visible.
- [x] SAVE PDF; consistent toolbar button height.

## Tier 2 — visual and accessibility

- [ ] Paper-internal helper-text styling is deferred with the paper/cursor request.
  An external Reading-view action is available; recheck the authored hint later.
- [x] Light-mode scene containers transparent on the light canvas.
- [x] Nonbreaking X‑RAY preparation label.
- [x] Responsive nonwrapping scan nav; remove clipped decorative frame.
- [x] Full-width tablet document; New Scan left aligned.
- [x] Reticle hidden on hover:none / coarse pointers. Cursor redesign and
  paper-drag changes deferred at the user’s explicit request.
- [x] Focused desktop paper opens at 180%; visible Reading-view action.
- [x] Quiz progress has an allowed img role.
- [x] Fallback paper heading changed to h2, preserving scan heading order.
- [x] Dark readable severity labels and clear pending scan status.
- [x] Minimap 28×28 hit areas, thin visual marks, horizontally scrollable for
  long documents so targets do not overlap.
- [x] Listed small UI text raised to 12px metadata / 13px interactive.
- [x] Visible decoder arrow-key instruction.
- [x] Spanish report explanation and scenario copy; original calculation kept
  separately in English to avoid changing numeric assumptions.
- [ ] Actual screen-reader walkthrough and physical-phone verification:
  prepared in TESTING_PROTOCOL.md; do not label them complete without a tester.

## Tier 3

- [x] Remove unused canonical copies and obsolete paper chunks (82 files).
- [x] Extract identical Three.js r149 into one local runtime; lazy scene
  modules and paper frames reuse it. Intake/report use a CSS dot field.
- [x] Consolidate three app stylesheets; remove 52 retired scene rules.
- [x] Remove misleading scripts + same-origin iframe sandbox.
- [x] QA evidence document and clear untested modes.
- [x] Short case-study README, live link, screenshot slots and current features.
- [x] Social-preview metadata / share image pipeline and Apple touch icon.
- [x] Original-code MIT license with explicit third-party exclusions and credits.
- [x] Descriptive future commit convention documented; existing history preserved.
- [x] Node 22 pinned and pnpm packageManager used by Vercel and CI.
- [x] GitHub Action for tests, typecheck and build.

## Tier 4 — submission work

- [x] Revised captioned, Rosa-first video shot list including warm-loaded
  offline text scan, opening an ICS and screen-reader demonstration.
- [ ] Record and edit the actual video; verify event time limit.
- [x] Research protocol, task-success sheet and consent guidance.
- [ ] Recruit 3–5 actual participants; collect genuine observations and quotes.
- [x] Submission write-up draft, design system, limitations and roadmap.
- [x] Actual caption-linked submission captures: report, phone sheet, redline,
  quiz feedback, light mode and accessibility panel; plus the home capture.
- [ ] Private-window and real-device final smoke test immediately before submission.
- [x] Sourced 2023 Pew statistic in hero and write-up, explicitly about privacy
  policies rather than claiming a finding about every kind of contract.
