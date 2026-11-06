# Homepage coupon codes

Edit `src/data/coupons.json` to replace the three `SAMPLE` entries with your codes.
Keep the JSON array format, with each code in double quotes. These are public values;
do not put passwords or private tokens in this file.

The homepage imports this file at build time. Commit and push your edit, then let
Cloudflare rebuild to update the deployed page. There is no external coupon service
or redemption validation. Copying confirms only that the text reached the clipboard.

Blank entries and duplicate codes are omitted. With an empty array, the coupon panel
is hidden. Without JavaScript, codes remain selectable and copy buttons stay hidden.
