import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { spotifyService } from './services/spotify'
import { parseAlbumQuery } from './services/search-query'

dotenv.config()
const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.get('/api/spotify/random', async (req, res) => {
  try {
    const albums = await spotifyService.getGameAlbums(req.query.mix === 'favorites')
    if (!albums.length) return res.status(404).json({ message: 'No albums found. Try another record.' })
    const eligible = albums.filter(a => a.id !== req.query.exclude)
    const pool = eligible.length ? eligible : albums
    res.json({ album: spotifyService.convertSpotifyAlbum(pool[Math.floor(Math.random() * pool.length)]) })
  } catch (error) {
    res.status(503).json({ message: error instanceof Error ? error.message : 'Could not reach Spotify. Try again.' })
  }
})
app.get('/api/spotify/suggestions', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 150) : ''
  if (query.length < 2) return res.json({ suggestions: [] })
  try {
    const albums = await spotifyService.searchAlbums(parseAlbumQuery(query), 8)
    res.json({ suggestions: albums.map(a => spotifyService.convertSpotifyAlbum(a)) })
  } catch {
    res.status(503).json({ message: 'Spotify search is unavailable. You can still type an album title.' })
  }
})
app.listen(process.env.PORT || 3001, () => console.log('CoverdUp API ready on port ' + (process.env.PORT || 3001)))
