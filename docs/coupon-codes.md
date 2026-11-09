# Homepage gift-card configuration

Edit **`src/data/gift-card.json`** for all card content. It replaces the separate
codes and countdown configuration files. The current values have been preserved.

| Setting | Controls |
| --- | --- |
| `eyebrow`, `badge`, `heading` | Card labels and main heading |
| `timer.nextRefreshAt` | Actual next release time, or `null` |
| `timer.activeText`, `pendingText`, `endedText` | Countdown messages |
| `timer.scheduledLabel`, `unscheduledText` | Release details in the info tip |
| `link.url`, `label`, `logo` | External destination, button text, logo path |
| `gifts.title`, `codes`, `infoText` | Gift section title, tokens, info tip |

Replace the three `DEMO` entries in `gifts.codes` with your real gift codes.
Keep the JSON format, with strings in double quotes. These are public values;
do not put passwords or private tokens in this file. Use a full HTTPS destination
for the link and a local public asset path such as `/images/dmplay-logo.png` for the logo.

The homepage imports this file at build time. Commit and push your edit, then let
Cloudflare rebuild to update the deployed page. There is no external coupon service
or redemption validation. Copying confirms only that the text reached the clipboard.

Blank entries and duplicate codes are omitted. With an empty array, the coupon panel
is hidden. Without JavaScript, codes remain selectable and copy buttons stay hidden.

## Gift-code countdown

Set `timer.nextRefreshAt` in `src/data/gift-card.json` to the actual next release time in
ISO format with a timezone, for example `YYYY-MM-DDTHH:mm:ss+05:30` for India.
Leave it `null` when no release has been scheduled; the card shows an announcement
placeholder, with no invented deadline. Invalid values also show this fallback.

The display uses India Standard Time. The countdown uses the absolute timestamp,
so refreshing the page does not restart it. At zero it stops and asks visitors to
check back. It does not automatically generate or publish gift codes: update the
`gifts.codes` and `timer.nextRefreshAt`, then rebuild/deploy for each actual drop.
The timer shows total hours, minutes and seconds; hours do not wrap at 24.
Flip-style digit motion and the timer glow respect reduced-motion settings. Without
JavaScript the scheduled date remains available in the gift-code info tip, but the
ticking clock stays hidden. The tip opens by tapping or keyboard activation.
