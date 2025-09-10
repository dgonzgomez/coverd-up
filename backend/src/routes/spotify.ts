import express from 'express'
import { spotifyService } from '../services/spotify'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get random album from Spotify
router.get('/random', async (req, res) => {
  try {
    const albums = await spotifyService.getRandomAlbums(1)
    
    if (albums.length === 0) {
      return res.status(404).json({ message: 'No albums found' })
    }

    const album = spotifyService.convertSpotifyAlbum(albums[0])
    
    // Save to database if not exists
    const existingAlbum = await prisma.album.findUnique({
      where: { spotifyId: album.spotifyId }
    })

    if (!existingAlbum) {
      await prisma.album.create({
        data: {
          title: album.title,
          artist: album.artist,
          coverUrl: album.coverUrl,
          spotifyId: album.spotifyId
        }
      })
    }

    res.json({ album })
  } catch (error) {
    console.error('Error getting random album from Spotify:', error)
    res.status(500).json({ message: 'Failed to get random album' })
  }
})

// Search albums on Spotify
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query

    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' })
    }

    const albums = await spotifyService.searchAlbums(q as string, parseInt(limit as string))
    const convertedAlbums = albums.map(album => spotifyService.convertSpotifyAlbum(album))

    res.json({ albums: convertedAlbums })
  } catch (error) {
    console.error('Error searching albums on Spotify:', error)
    res.status(500).json({ message: 'Failed to search albums' })
  }
})

// Get album by Spotify ID
router.get('/album/:id', async (req, res) => {
  try {
    const { id } = req.params
    const spotifyAlbum = await spotifyService.getAlbumById(id)
    const album = spotifyService.convertSpotifyAlbum(spotifyAlbum)

    // Save to database if not exists
    const existingAlbum = await prisma.album.findUnique({
      where: { spotifyId: album.spotifyId }
    })

    if (!existingAlbum) {
      await prisma.album.create({
        data: {
          title: album.title,
          artist: album.artist,
          coverUrl: album.coverUrl,
          spotifyId: album.spotifyId
        }
      })
    }

    res.json({ album })
  } catch (error) {
    console.error('Error getting album by ID from Spotify:', error)
    res.status(500).json({ message: 'Failed to get album' })
  }
})

export default router


