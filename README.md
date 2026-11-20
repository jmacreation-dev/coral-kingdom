# Coral Kingdom (mobile front-end)

Portrait mobile game shell: **Express** serves a static **AngularJS 1.x** UI styled with **SCSS**. No MongoDB required for the screen.

## Run locally

```bash
cd ~/JMacreation-sync/coral-kingdom
npm install
npm start
```

Open **http://localhost:3000**

Optional: `PORT=4000 npm start`

## Stack notes

- `server/index.js` — Express static server + `/api/health` (Mongo placeholder only)
- `public/` — AngularJS app (`index.html`, `js/app.js`)
- `scss/` — source styles; `npm start` compiles to `public/css/main.css`

Land view is a **plain top-down 2D hex sand grid** (CSS `clip-path` hexes). Bubbles and seaweed are SCSS animations. No bitmap image assets in the UI.
