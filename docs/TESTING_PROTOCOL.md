# Remaining human validation

These are planned tests, not completed research or accessibility claims.

## Five-person usability session

Recruit 3–5 volunteers who rent, freelance or have a membership. Explain the
prototype is not legal advice, participation is optional, and use only the
fictional samples. Ask permission before recording or quoting. Do not collect
their private contracts, legal situations, names or contact details in the repo.

Tasks without coaching:

1. Rosa’s gym: identify the renewal amount, cancellation method and notice
   window in under 60 seconds.
2. Explain what “Not flagged” means; it must not be interpreted as “safe”.
3. Find a proposed revision and copy an edited negotiation email.
4. Set the actual date supplied on a task card; download/open the reminder.
5. On a phone, open a clause’s details, close them, and find the report.

Record participant code, device/browser, task success, elapsed time, observed
hesitation, a consented exact quote and resulting design change. Do not invent
results. Retest any critical change with another participant.

| Participant code | Device | Tasks passed | Time to renewal trap | Observation / consented quote | Follow-up change |
|---|---|---|---|---|---|
| Pending | — | — | — | — | — |

## Screen reader pass

On an actual iPhone, enable VoiceOver and use Safari. On desktop use VoiceOver
with Safari or NVDA with Firefox/Chrome. Record OS, browser, reader version,
date, flow, observed announcements and issues—not just “passed”.

- Landmarks and headings: home → intake → scan → report → Clause Lab.
- Native file picker, paste validation and friendly error states.
- One scan-complete announcement; no repeated full-panel reading.
- Clause button name, severity, selected state and explanation.
- Phone sheet heading focus, modal containment, close and focus return.
- Accessibility dialog focus trap and Escape / dismissal.
- Quiz radio names, progress, disabled state, answer feedback and next question.
- Date input instructions, download action, copied feedback, checklist state.
- Test larger text / contrast without losing content.

## Physical-device and final release smoke

Use stable https://hyperbloom-two.vercel.app/ in a private window on iPhone
Safari and Android Chrome. Exercise upload, Reading view, sheet, report, copy,
calendar opening and navigation. Desktop width emulation does not replace this.
Test 200% browser zoom and no-WebGL Reading fallback separately.

## Video capture notes

Never disable device connectivity from an automated test without the owner’s
consent. For privacy proof, load the app first, switch Wi-Fi off manually and
paste a fictional text agreement. This shows warm-loaded local text analysis,
not offline installation or a first-time offline PDF download.
