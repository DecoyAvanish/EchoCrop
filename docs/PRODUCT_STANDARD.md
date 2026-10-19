# Product standard and continuing roadmap

This is the working outline requested by the user, based on the supplied independent review. Use it to evaluate future changes.

## Priority order

1. A user's own agreement must be analyzed as carefully as the samples. Maintain fixtures for realistic terms of service, leases, and contractor agreements. Add a regression test for every missed risk or false positive.
2. Distinguish **flagged**, **recognized balanced wording**, and **not flagged / unassessed**. Unknown language is never an assurance. Explain what matched and how the score works without fake precision.
3. Finish the phone flow. A tapped clause must produce immediately visible, keyboard-accessible details. Reading view must show every clause, and 3D pages must expose their page count and continuation.
4. Make the outcome useful: money scenarios with traceable assumptions, proposed wording, editable negotiation messages, deadline reminders, and progress through review.
5. Preserve the current visual identity while making typography, spacing, contrast, focus, light mode, reduced motion, and content clarity work together.
6. Defer heavy graphics, provide a useful non-WebGL presentation, and audit production rather than reporting guessed scores.

## Real-input rules to preserve

- Arbitration, jury and class-action waivers
- Renewal and cancellation windows; phone-only/in-person cancellation and refund barriers
- Unilateral changes, increases without notice, and rent increases
- Non-compete and non-solicit restrictions
- Non-refundable deposits, fees, forfeiture, and exit charges
- Liability caps, unlimited indemnity, and personal guarantees
- Venue, governing law, notice waivers, and assignment
- Perpetual or royalty-free licenses, broad data sharing, and ownership assignment
- Confidentiality or non-disparagement language that bars reporting concerns

Keep each numbered section's qualifications in context. A recognized fair term requires affirmative balanced wording, not just the absence of a known red flag. Every amount in a report must be traceable to the source or explicitly described as an example assumption. Recovery caps are not customer charges; alternative scenarios must not be silently added together.

## State and privacy

Custom documents and their review progress may be remembered in `sessionStorage` so refresh/back works. State must be clearable and disappear when the tab session ends. Preferences may use `localStorage`. Do not silently replace a missing custom document with a sample. Do not include contract text in a URL or log it.

## Interface completion criteria

- Highest risk selected first, score withheld until preparation finishes, no scan replay on report return.
- Unknown passages gray, without a match percentage; balanced matches distinct from risk findings.
- All paper content shares the curved surface texture. Long documents paginate; full wording stays in Reading view.
- Brief scan-complete and clause-selection announcements; no live region over an entire inspector.
- Phone detail sheet has a close button, Escape support, focus trapping and focus return.
- Clause Lab explains what a term says, what it does, and what to ask; its short quiz is self-paced.
- Print includes the original language, effects, requested changes, and edited draft without clipped textarea content.
- Spanish is described as explanation-only unless the whole interface is translated. Sample numbers and deadlines survive translation.
- Native cursor stays available. Motion effects freeze under reduced motion. Contrast and text settings must not hide content.
- Illustrative scenarios are identified as such; they are not presented as research findings or testimonials.

## Verification and release

Exercise samples and custom text, refresh/back, no flags, many clauses, image-only PDF, huge file, unsupported type, copy and calendar downloads. Check desktop, 390px and 320px widths, keyboard focus, light/high contrast/larger text/reduced motion, and a graphics fallback. Run tests, typecheck and production build. Record real audit results in `docs/QA.md`, including any modes not exercised. Keep the deployment URL stable.

The quality target is an excellent submission; a judging result or universal legal accuracy cannot be promised by the interface.
