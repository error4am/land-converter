# LAND SEO Roadmap

## Project Context

- Project folder: `LAND/`
- Live base URL: `https://error4am.github.io/land-converter/`
- Repo remote: `https://github.com/error4am/land-converter.git`
- Site type: static GitHub Pages website for Pakistani land unit conversions
- Search traction before this round: about 9k impressions in the last 6 months, roughly 150-200 daily impressions, 9 clicks total

## What We Changed

### Technical SEO

- Fixed broken FAQ JSON-LD on the homepage
- Fixed malformed sitemap namespace in `sitemap.xml`
- Updated sitemap with new URLs
- Improved metadata consistency for homepage title, description, Open Graph, and Twitter tags
- Replaced broken favicon reference with a valid local image reference

### Homepage Improvements

- Reworked `index.html` into a stronger visual homepage with:
  - custom fonts
  - warm land-themed gradients
  - hero section with clearer value proposition
  - stronger converter card
  - clearer FAQ and supporting content sections
  - better internal links to guide pages
- Kept homepage as the main SEO hub

### UX / Script Updates

- Updated `script.js` so prefilled pages auto-render conversions on load
- Added quick-fill buttons support for homepage and guide pages

### New SEO Landing Pages Added

- `marla-to-square-feet/index.html`
- `kanal-to-marla/index.html`
- `kanal-to-square-feet/index.html`
- `acre-to-square-meter/index.html`
- `5-marla-in-square-feet/index.html`

Each page includes:

- unique title and meta description
- self-canonical
- focused copy for one search intent
- FAQ schema
- internal links back to homepage and related pages

## Commit History

- Latest major commit made in this session:
  - `30ecd6c` - `Build SEO landing pages and refresh homepage`

## Deployment Status

- Changes were pushed successfully to `origin/main`
- Google Search Console indexing was requested for:
  - homepage
  - all 5 new landing pages
- Sitemap was resubmitted

## Current Recommendation

- Wait a few days before making more SEO changes
- Best observation windows:
  - early signals: 3-10 days
  - clearer trend: 2-4 weeks
  - stronger judgment: 4-8 weeks

## What To Monitor In Search Console

- impressions by page
- clicks by page
- CTR by page
- average position by query
- which new landing pages begin receiving impressions
- which queries get impressions but low clicks

## Recommended Next Steps Later

After enough time has passed, likely next actions are:

1. Build another batch of focused landing pages, such as:
   - `10-marla-in-square-feet`
   - `1-kanal-in-square-feet`
   - `marla-to-square-meter`
   - `kanal-to-square-meter`
   - `pakistan-land-measurement-guide`
2. Improve CTR based on real query data from Search Console
3. Consider moving to a custom domain if the project keeps growing

## Domain Advice From This Session

- A custom domain can help branding and trust
- It is not an instant ranking boost by itself
- Since the site already has impressions, a domain may make sense later if the project continues growing
- No urgent migration is needed right now; better to let current changes settle first

## Important Notes

- `error4am.github.io/` inside `LAND/` remains untracked and was intentionally not committed; it appears to be a separate leftover nested folder/repo
- Current structure uses directory-based URLs intentionally because they are cleaner for GitHub Pages and SEO than flat `.html` filenames

## If You Reopen This Project Later

Start by checking:

- `SEO_ROADMAP.md`
- `index.html`
- `sitemap.xml`
- `script.js`

Then review Search Console performance before making new SEO edits.
