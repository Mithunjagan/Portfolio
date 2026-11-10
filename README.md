# Mithun Kumar J — Portfolio

A responsive, dependency-free frontend with CSS/SVG engineering visuals, project filters, feedback, and a server-side Gemini portfolio assistant. No runtime CDNs, font downloads, videos, frame sequences, scroll libraries, or React bundles are loaded by the page.

## Develop

Use Node 24 LTS and npm 11 (verified).

```sh
npm ci
npm run build
npm test
npm start
```

The app runs on port 8080. `npm run build` compiles the portfolio knowledge source and retained legacy components; the current frontend is plain HTML/CSS/JS. Legacy media are retained in Git but are not requested by the page.

## Connect Gemini

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` securely. Optionally set `GEMINI_MODEL` to an available Gemini model; the default is `gemini-2.5-flash`. `.env` is ignored. For Vercel, configure these variables in project settings. Do not put keys in frontend files or chat messages. The backend calls `generativelanguage.googleapis.com`; allow that hostname if outbound access is restricted. Without a key the page remains functional and the assistant explains it is disconnected.

`api/chat.js` is shared by Express and Vercel. It bounds input/history, filters conversation roles, enforces a 20-second provider timeout, and has a basic per-process request throttle. Add shared rate limiting and usage controls at the hosting edge for public production traffic. Automated tests mock Gemini; a live response requires credentials and network access.

Local reviews use `data/reviews.json`; Vercel uses the existing `api/reviews.js` implementation and needs JSONBin configuration for persistent writes. Avoid writing test reviews into production data.

## Content

`data/portfolioKnowledge.ts` is the public assistant record; rebuild after editing it. HTML carries the visible portfolio content. Update both together. See `data/content-sources.md` for provenance. New project repository URLs were not guessed; supply them to add direct source links. The downloadable résumé is updated from `data/resume.html` using Chromium print-to-PDF.

## Performance and accessibility

The first view needs just HTML, CSS, and JavaScript. No artificial preloader or continual JavaScript animation loop. The chip illustration uses a single transform animation, disabled for reduced motion. Keyboard focus, a skip link, semantic landmarks, labeled forms, accessible filter states, mobile layout, and chat status/error handling are included. Validate real-device performance and deployed API limits before making production performance claims.
