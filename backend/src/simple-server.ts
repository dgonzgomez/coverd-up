import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spotifyService } from './services/spotify';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get random album from Spotify (now focuses on Billboard Top 200 style albums)
app.get('/api/spotify/random', async (req, res) => {
  try {
    // Multi-tier approach to get Billboard-style albums
    let albums;
    
    // Try different methods in order of preference
    const methods = [
      () => spotifyService.getFeaturedPlaylistAlbums(20), // Featured playlists often have Billboard hits
      () => spotifyService.getTopAlbums(20), // Billboard-chart-worthy artists
      () => spotifyService.getNewReleases(20) // New releases as fallback
    ];
    
    for (const method of methods) {
      try {
        albums = await method();
        if (albums.length > 0) {
          console.log(`Successfully got ${albums.length} albums using ${method.name}`);
          break;
        }
      } catch (error) {
        console.log(`${method.name} failed, trying next method...`);
        continue;
      }
    }
    
    if (!albums || albums.length === 0) {
      return res.status(404).json({ message: 'No albums found' });
    }

    // Randomly select one album from the results
    const randomIndex = Math.floor(Math.random() * albums.length);
    const album = spotifyService.convertSpotifyAlbum(albums[randomIndex]);
    res.json({ album });
  } catch (error) {
    console.error('Error getting Billboard-style album from Spotify:', error);
    res.status(500).json({ message: 'Failed to get Billboard-style album' });
  }
});

// Search albums on Spotify
app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const albums = await spotifyService.searchAlbums(q as string, parseInt(limit as string));
    const convertedAlbums = albums.map(album => spotifyService.convertSpotifyAlbum(album));

    res.json({ albums: convertedAlbums });
  } catch (error) {
    console.error('Error searching albums on Spotify:', error);
    res.status(500).json({ message: 'Failed to search albums' });
  }
});

// Get album suggestions for autofill
app.get('/api/spotify/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const albums = await spotifyService.searchAlbums(q as string, parseInt(limit as string));
    const suggestions = albums.map(album => ({
      id: album.id,
      title: album.name,
      artist: album.artists[0]?.name || 'Unknown Artist',
      displayText: `${album.name} - ${album.artists[0]?.name || 'Unknown Artist'}`
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    // Return empty suggestions on error to not break the frontend
    res.json({ suggestions: [] });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 Spotify API: http://localhost:${PORT}/api/spotify/random`);
});
