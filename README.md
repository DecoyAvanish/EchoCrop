# Fine Print X-Ray

**Read the part they hoped you wouldn't.** Fine Print X-Ray scans a lease, terms of service, freelance contract or membership agreement in your browser and shows, in plain language, which clauses could cost you money, rights or control, before you sign.

Built for the HyperBloom October UI/UX & Web Design Hackathon.

## The problem

Most people skim contracts because the alternative is a lawyer they can't afford. The costly parts tend to be the quiet ones: an arbitration clause that waives your right to sue, a late fee that grows every day, or a 90-day cancellation window that renews you for another year.

## Who it's for

| Persona | Moment | What they need |
|---|---|---|
| Maya, first-time renter | Signing her first lease | Spot penalties and waived rights before paying the deposit |
| Dev, freelance designer | Reviewing a client contract | Catch ownership grabs and uncapped liability |
| Rosa, busy subscriber | Joining a gym | Catch the notice window before it auto-renews |

Each persona on the home page opens their document as a one-click demo.

## The flow

1. **Drop** a PDF, DOCX or text file, paste text, or pick a sample. Everything is parsed on the device.
2. **X-ray.** A scan chamber sweeps the document on 3D paper (or a flat reading view). Each clause gets a severity, a plain-English summary, what it could cost you and what to ask for instead.
3. **Act.** The report gives a verdict that adapts to the score, a deadline catcher that turns notice windows into calendar reminders (`.ics`), a before-you-sign checklist, and an editable negotiation email addressed to the right person (landlord, client, provider).

## Design decisions

- **Every effect means something.** The sweep is real scan progress, the glow is severity, and the gauge is the risk score.
- **Severity never relies on color alone.** Each level has a shape (⬢ ◆ ▲ ●) and a word as well as a color.
- **Privacy by architecture.** No account, no upload, no AI service. Calendar files and email drafts are generated locally.
- **Honest scoring.** "Match strength" describes how directly a rule matched. The scoring method is explained in place, and the site says it is not legal advice.

## Accessibility

- Keyboard-complete flows, a visible focus ring, a skip link, and focus moved to the page heading on every route change.
- Screen reader support: labelled gauges and charts, a single polite announcement when the scan finishes, and readable labels for animated headings.
- An accessibility panel with reduced motion (it also follows the OS setting), high contrast, a light theme, larger type, a dyslexia-friendly font, and Spanish explanations.
- Responsive down to 320px, with a mobile menu, and phones open the readable flat view by default.
- Forced-colors and print styles.
- axe-core reports no violations on the home, scan, report and Clause Lab pages.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # unit tests for scoring, verdicts and the deadline catcher
pnpm typecheck
pnpm build && pnpm preview
```

Pages use hash routes (`#/scan?doc=lease`), so links to samples can be shared and the back button works on any static host.

## Limitations

This is a design prototype, not legal advice. Analysis is rule-based pattern matching, not a language model, and image-only PDFs need OCR first.
