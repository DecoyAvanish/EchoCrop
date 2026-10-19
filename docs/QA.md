# Release verification — 19 October 2026

Stable site: https://hyperbloom-two.vercel.app/

This is evidence from the checks actually performed, not a statement of perfect
accessibility, legal accuracy, universal compatibility or a guaranteed judging score.
The supplied independent review is a useful baseline, but its tests are not
silently counted as fresh tests performed in this pass.

## Builds and regression tests

Vercel production build GoXF9sP1LTHnrvUQMDAf99PLKMSR passed TypeScript,
45 Vitest tests and Vite on Node 22 / pnpm 11.25.0. The suite includes the final
section-reference regressions and contextual identity-use / collection-fee copy. Local node_modules reads intermittently
stalled, so the clean remote build was the release gate.

- Covered: six review misses; positive safe versus unassessed states; segmentation
  past the old 24-clause limit; type detection; Spanish sample amounts; per-clause
  proposals; largest conditional exposure; caps not mistaken for charges; valid
  UTF-8 folded ICS lines and explicit date requirement.
- Two published short arbitration excerpts were checked (AT&T consumer terms and
  Shop Planet Fitness retail terms). They are not a benchmark of either complete
  agreement and do not represent a gym membership test.
- A 40-section browser fixture exposed an additional parser issue: repeated body
  text such as “information section 1” was split into another heading. The local
  parser fix now preserves 40 sections and two tests protect repeated numbers and
  cross-references. The highest-risk final clause remains detectable.

## Automated live audits

Lighthouse 13.5.0, Headless Chrome 155, default simulated mobile throttling
(4× CPU, 1.6 Mbps), 412×823 unless stated. Chrome was launched with
`--headless --no-sandbox --disable-gpu`; this is not physical phone hardware.
Accessibility uses Lighthouse's axe-based checks, not a separate exhaustive
axe-core run across every preference combination.

| Live route | Accessibility |
|---|---:|
| Home | 100 |
| Streaming scan at 320×800 | 100 |
| Gym report | 100 |
| Clause Lab | 100 |

Home's same full audit: Performance **68**, Best Practices **100**, SEO **100**.
FCP 1.6s; LCP 2.0s; TBT 3,590ms; CLS 0.001; Speed Index 2.8s.
The earlier release measured 42 performance and CLS 0.208 under this tool.
These are individual runs, not a controlled statistical comparison. 3D startup
still costs main-thread time on slow/graphics-disabled systems; performance is
not “100/100”. Keep that limitation visible.

Raw diagnostic artifacts for this session are in /private/tmp:
fineprint-review-home.json, fineprint-review-scan-320.json,
fineprint-review-report.json and fineprint-review-learn.json.

## Browser interaction and responsive checks

In-app Chromium desktop browser, actual rendered app:

- 1440px home: no horizontal overflow; paper reached ready state; visible orbital.
- 768px scan: reading surface 740px, score present, New Scan left aligned.
  An inherited rule hid Open Report; fixed and clicked successfully on production.
- 390px scan: filters 44px high in a 69px scrollable row; reading surface 362px;
  rail list hidden in Reading view; score 59/100 High; no page overflow.
- Phone clause sheet: selecting arbitration focused its h2, showed consequence
  and request, and closing returned to the clause.
- 320px home and scan: document width stayed 320px; controls remained reachable.
- All five preferences enabled together on the report at 320px: modal width
  284px with a 38px heading and no page overflow. Light, high contrast, larger
  text and readable font visibly reflowed. Reduced motion was enabled live.
- Spanish money explanation, top risks and clause explanations appeared with
  original dollar amounts retained; calculations remain inspectable in English.
- Gym report leads with $828, retains the separate $149 scenario, says Membership,
  addresses the gym / club and uses a facilities-fee-specific revision.
- Copy Summary showed “COPIED” plus a status announcement.
- Report redline explanations are collapsed initially. Print preparation expands
  these details and restores their previous state after printing.
- Shared Three.js r149 scene loaded without browser console errors in preview.
- Final live DOCX extraction: fineprint-demo.docx produced nine passages, including
  all eight expected risk matches (1 critical, 6 high, 1 moderate).
- Fresh error-state retest: zero-byte TXT, 11 MB DOCX, unsupported RTF, invalid PDF
  and fake DOCX each produced a friendly error and left the file picker usable.
  Invalid PDF / DOCX were checked after extraction finished, not during loading.
- Clause Lab quiz accepted the correct radio answer, showed explanatory feedback
  and NEXT QUESTION. Open specimen visibly used CLOSE SPECIMEN and a minus sign.
- An additional desktop Lighthouse accessibility run with --disable-webgl on the
  final lease scan scored 100. This is an automated fallback audit, not a physical
  device or an interactive WebGL-disabled walkthrough.

## Final regression checks

- Paper visibility regression fix: reusing the parent's Three.js namespace left
  iframe WebGL/CanvasTexture rendering blank depending on loading order.
  Both authored paper pages now execute the cached runtime asset in their own
  window. Verified the actual hero paper and scan paper visually in preview
  718hlmr6b, including native drag-to-turn in both and scan clause selection.
  Two source regressions prevent reintroducing parent.THREE borrowing.
  Production 72huGmKsZdCuJoGbZ1npsrrUiCEk passed all 47 tests, TypeScript and Vite.
  Both hero and scan were visibly rechecked on the stable public URL after a
  cached reload. Reduced motion kept the scan paper visible and disabled its
  pointer interaction; normal-mode native dragging was verified in both scenes.

- Final 45-test production build passed. Browser retest on preview
  a7i5a5n1r retained exactly 40 clauses, selected the critical 40th clause, kept
  the phone rail hidden, and preserved all 40 plus selection after refresh.
- Unknown #/nope route showed an explicit not-found heading, Home and Scan actions.

## Explicit remaining checks
- Physical iPhone Safari and Android Chrome; desktop Safari / Firefox.
- Actual VoiceOver / NVDA walkthrough and a recorded reader sample.
- Standalone axe across every theme/preference combination, rather than four
  default live Lighthouse route audits.
- Fresh post-change print/PDF export, interactive no-WebGL walkthrough, 200%
  browser zoom, real PDF / scanned-PDF matrix and physical calendar opening.
  The bad-file and DOCX checks above were rerun; the supplied review’s other
  baseline tests are not silently substituted for these remaining manual tests.
- A private-window pre-submission smoke test, full independently supplied
  agreements, 3–5 real usability sessions and the actual captioned video.
- Paper drag/cursor redesign and paper-internal hint styling remain deferred at
  the user's explicit instruction.
- CI workflow is configured but has not run on GitHub until a commit is pushed.
