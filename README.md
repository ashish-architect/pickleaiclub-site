# Pickle.ai Club website

A static website (HTML, CSS and vanilla JS, with no build step) for the Pickle.ai pickleball club. It includes tournament pages, leagues, DUPR nights, bootcamps, venue partners, membership and contact.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| All tournaments (filter + search) | `tournaments.html` |
| Tournament detail (`?id=<slug>`) | `tournament.html` |
| DUPR Nights | `dupr-nights.html` |
| Bootcamps | `bootcamps.html` |
| Triple Threat League | `triple-threat-league.html` |
| Pickle.ai League | `pickle-ai-league.html` |
| Past Tournaments | `past-tournaments.html` |
| Membership | `membership.html` |
| Contact | `contact.html` |
| Create / edit tournament (organiser) | `admin.html` |

## Run locally

```powershell
python -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` directly also works.

## Creating a tournament (with photos and videos)

1. Open `admin.html` (the **+ Create Tournament** button in the header).
2. Fill in the details, schedule, results and stats, and upload a cover image, gallery photos and videos (or paste YouTube/Vimeo links).
3. Click **Save & preview**. The tournament is saved as a **draft in your browser** (IndexedDB) and shows on every page, but only in your browser.
4. To publish it for everyone, click **Export for publishing**. Unzip the downloaded file into this folder, overwriting `data/tournaments.js` and adding files under `assets/uploads/`, then commit and push.

You can also edit `data/tournaments.js` by hand. The field reference is at the top of that file.

> Large videos: prefer YouTube links. Git hosts limit file sizes (GitHub: 100 MB per file).

## Content to edit

- Contact details and social links: `js/site.js` (`SITE` object)
- Navigation: `js/site.js` (`NAV`)
- Venue partners: `data/venues.js`
- Bootcamp history: `bootcamps.html`

## Deploy

Any static host works: GitHub Pages, Netlify, Vercel or Cloudflare Pages. Upload or point the host at the repo root; there's nothing to build.

## Images

- `assets/img/`: logo, home hero, venue photos (`venues/`) and bootcamp photos (`bootcamps/`)
- `assets/uploads/<tournament-id>/`: each tournament's cover and gallery, listed in `data/tournaments.js`

Photos were copied from the old pickleaiclub.com site and resized to 1600px wide.
