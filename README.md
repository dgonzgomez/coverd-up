# coverdup

Guess the album from its pixelated cover. You get five attempts; each miss or skip makes it clearer.

Albums and search come from Spotify. The rotation leans toward music I personally prefer with some popular albums mixed in. 

## Deployment

The frontend is deployed with GitHub Pages. The Spotify API server runs separately because Pages only serves static files.

## Structure

- `frontend/src/Game.tsx` — the game screen and round state
- `frontend/src/lib/game.ts` — mosaic stages and title matching
- `backend/src/index.ts` — album and search endpoints
- `backend/src/services/spotify.ts` — Spotify auth, artist rotation, and caching

React and Vite on the frontend, Express on the backend. No database or login yet. I'm thinking of adding competitive aspects later.
