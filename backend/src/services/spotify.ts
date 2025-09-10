import axios from 'axios'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  images: Array<{
    url: string
    height: number
    width: number
  }>
  external_urls: {
    spotify: string
  }
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[]
  }
}

class SpotifyService {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.clientId = ''
    this.clientSecret = ''
  }

  private getCredentials() {
    if (!this.clientId || !this.clientSecret) {
      this.clientId = process.env.SPOTIFY_CLIENT_ID || ''
      this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
    }
    return { clientId: this.clientId, clientSecret: this.clientSecret }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const { clientId, clientSecret } = this.getCredentials()
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      )

      const data: SpotifyTokenResponse = response.data
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer

      return this.accessToken
    } catch (error) {
      console.error('Error getting Spotify access token:', error)
      throw new Error('Failed to get Spotify access token')
    }
  }

  async searchAlbums(query: string, limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getAccessToken()
      
      const response = await axios.get<SpotifySearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: query,
            type: 'album',
            limit
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.albums.items
    } catch (error) {
      console.error('Error searching Spotify albums:', error)
      throw new Error('Failed to search albums on Spotify')
    }
  }

  async getRandomAlbums(limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getAccessToken()
      
      // Get popular albums by searching for well-known artists and popular terms
      const popularArtists = [
        'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'Queen', 'The Rolling Stones',
        'AC/DC', 'Nirvana', 'Radiohead', 'U2', 'Coldplay', 'Adele', 'Taylor Swift',
        'Drake', 'Kanye West', 'Eminem', 'Jay-Z', 'Kendrick Lamar', 'Billie Eilish',
        'Ed Sheeran', 'Bruno Mars', 'Ariana Grande', 'Justin Bieber', 'Rihanna',
        'Beyoncé', 'Lady Gaga', 'Katy Perry', 'Miley Cyrus', 'Selena Gomez',
        'Michael Jackson', 'Prince', 'David Bowie', 'Elton John', 'Bob Dylan',
        'The Beach Boys', 'Fleetwood Mac', 'Eagles', 'Aerosmith', 'Guns N\' Roses',
        'Metallica', 'Red Hot Chili Peppers', 'Pearl Jam', 'Foo Fighters', 'Green Day'
      ];
      
      const popularGenres = [
        'rock', 'pop', 'hip-hop', 'electronic', 'jazz', 'classical', 'country',
        'blues', 'folk', 'reggae', 'r&b', 'soul', 'funk', 'disco', 'punk'
      ];
      
      // Create search queries for popular content
      const searchQueries = [
        // Popular artists
        ...popularArtists.slice(0, 15).map(artist => `artist:"${artist}"`),
        // Popular genres with recent years
        ...popularGenres.slice(0, 8).map(genre => `genre:"${genre}" year:2015-2024`),
        // Popular albums by decade
        'album:year:2020-2024', // Recent popular albums
        'album:year:2015-2019', // Popular albums from recent years
        'album:year:2010-2014', // Popular albums from mid-2010s
        'album:year:2005-2009', // Popular albums from late 2000s
        'album:year:2000-2004', // Popular albums from early 2000s
        'album:year:1995-1999', // Popular albums from late 90s
        'album:year:1990-1994', // Popular albums from early 90s
        'album:year:1985-1989', // Popular albums from late 80s
        'album:year:1980-1984', // Popular albums from early 80s
        'album:year:1975-1979', // Popular albums from late 70s
        'album:year:1970-1974', // Popular albums from early 70s
        'album:year:1965-1969', // Popular albums from late 60s
        'album:year:1960-1964', // Popular albums from early 60s
      ];
      
      // Pick a random search query
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)]
      
      const response = await axios.get<SpotifySearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: randomQuery,
            type: 'album',
            limit: Math.min(limit, 50) // Spotify API limit
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.albums.items
    } catch (error) {
      console.error('Error getting popular albums from Spotify:', error)
      throw new Error('Failed to get popular albums from Spotify')
    }
  }

  async getAlbumById(id: string): Promise<SpotifyAlbum> {
    try {
      const token = await this.getAccessToken()
      
      const response = await axios.get<SpotifyAlbum>(
        `https://api.spotify.com/v1/albums/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Error getting album by ID from Spotify:', error)
      throw new Error('Failed to get album from Spotify')
    }
  }

  // Get albums that would likely be on Billboard Top 200 charts
  async getTopAlbums(limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getAccessToken()
      
      // Focus on Billboard-chart-worthy albums by searching for the most popular artists
      const billboardArtists = [
        // Current Billboard chart-toppers
        'Taylor Swift', 'Drake', 'Bad Bunny', 'The Weeknd', 'Ariana Grande',
        'Billie Eilish', 'Olivia Rodrigo', 'Dua Lipa', 'Ed Sheeran', 'Bruno Mars',
        'Post Malone', 'Travis Scott', 'Kendrick Lamar', 'SZA', 'Doja Cat',
        'Lil Nas X', 'Megan Thee Stallion', 'Cardi B', 'Nicki Minaj', 'Lizzo',
        'Harry Styles', 'Adele', 'Beyoncé', 'Rihanna', 'Justin Bieber',
        'BTS', 'Blackpink', 'Coldplay', 'Imagine Dragons', 'Maroon 5',
        'Luke Combs', 'Morgan Wallen', 'Zach Bryan', 'Jason Aldean', 'Kane Brown',
        'Future', 'Lil Baby', 'Gunna', '21 Savage', 'Lil Durk',
        'The Kid LAROI', 'Jack Harlow', 'Lil Tjay', 'Polo G', 'Lil Uzi Vert'
      ];
      
      // Search for albums by these artists (most likely to be on Billboard charts)
      const searchQueries = billboardArtists.map(artist => `artist:"${artist}"`);
      
      // Pick a random artist to search for
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)]
      
      const response = await axios.get<SpotifySearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: randomQuery,
            type: 'album',
            limit: Math.min(limit, 50)
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.albums.items
    } catch (error) {
      console.error('Error getting Billboard-style albums from Spotify:', error)
      throw new Error('Failed to get Billboard-style albums from Spotify')
    }
  }

  // Get albums from Spotify's New Releases (most current)
  async getNewReleases(limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getAccessToken()
      
      const response = await axios.get<{albums: {items: SpotifyAlbum[]}}>(
        'https://api.spotify.com/v1/browse/new-releases',
        {
          params: {
            limit: Math.min(limit, 50)
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.albums.items
    } catch (error) {
      console.error('Error getting new releases from Spotify:', error)
      throw new Error('Failed to get new releases from Spotify')
    }
  }

  // Get albums from Spotify's Featured Playlists (often contains Billboard hits)
  async getFeaturedPlaylistAlbums(limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getAccessToken()
      
      // Get featured playlists first
      const playlistsResponse = await axios.get<{playlists: {items: Array<{id: string, name: string}>}}>(
        'https://api.spotify.com/v1/browse/featured-playlists',
        {
          params: {
            limit: 20
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const playlists = playlistsResponse.data.playlists.items;
      if (playlists.length === 0) {
        return [];
      }

      // Pick a random featured playlist
      const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];
      
      // Get tracks from that playlist
      const tracksResponse = await axios.get<{items: Array<{track: {album: SpotifyAlbum}}>}>(
        `https://api.spotify.com/v1/playlists/${randomPlaylist.id}/tracks`,
        {
          params: {
            limit: Math.min(limit, 50)
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      // Extract albums from tracks
      const albums = tracksResponse.data.items
        .map(item => item.track?.album)
        .filter(album => album) // Remove null/undefined albums
        .slice(0, limit);

      return albums as SpotifyAlbum[];
    } catch (error) {
      console.error('Error getting featured playlist albums from Spotify:', error)
      throw new Error('Failed to get featured playlist albums from Spotify')
    }
  }

  // Convert Spotify album to our format
  convertSpotifyAlbum(spotifyAlbum: SpotifyAlbum) {
    return {
      id: spotifyAlbum.id,
      title: spotifyAlbum.name,
      artist: spotifyAlbum.artists[0]?.name || 'Unknown Artist',
      coverUrl: spotifyAlbum.images[0]?.url || '',
      spotifyId: spotifyAlbum.id,
      spotifyUrl: spotifyAlbum.external_urls.spotify
    }
  }
}

export const spotifyService = new SpotifyService()
export default spotifyService
