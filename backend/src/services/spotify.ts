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
  album_type?: string
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
      if (!clientId || !clientSecret) throw new Error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend/.env')
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      )

      const data: SpotifyTokenResponse = response.data
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000

      return this.accessToken
    } catch (error) {
      console.error('Spotify token request failed:', axios.isAxiosError(error) ? error.response?.status || error.code : 'unknown')
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
            limit: Math.max(1, Math.min(10, limit))
          },
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      return response.data.albums.items
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      console.error('Spotify search failed:', status || 'connection error')
      if (status === 403) throw new Error('Spotify accepts the credentials but denies catalog access (403). Check this app’s access in the Spotify Developer Dashboard.')
      if (status === 429) throw new Error('Spotify is receiving too many requests. Please wait a moment and retry.')
      throw new Error('Could not search Spotify. Check the connection and server credentials.')
    }
  }

  private albumCache = new Map<string, { expires: number; albums: SpotifyAlbum[] }>()

  async getGameAlbums(favoritesOnly = false): Promise<SpotifyAlbum[]> {
    const favorites = ['Jane Remover', 'underscores', 'Charli xcx', 'Ninajirachi', 'SOPHIE', 'Magdalena Bay', 'Caroline Polachek', 'A. G. Cook']
    const popular = ['Billie Eilish', 'SZA', 'Kendrick Lamar', 'The Weeknd', 'Olivia Rodrigo', 'Frank Ocean', 'Tyler, The Creator', 'Bad Bunny', 'Taylor Swift', 'Dua Lipa']
    const artists = favoritesOnly || Math.random() < 0.75 ? favorites : popular
    const shuffled = [...artists].sort(() => Math.random() - 0.5)
    for (const artist of shuffled.slice(0, 3)) {
      const cached = this.albumCache.get(artist)
      if (cached && cached.expires > Date.now()) return cached.albums
      const results = await this.searchAlbums(`artist:"${artist}"`, 10)
      const seen = new Set<string>()
      const albums = results.filter(album => {
        const title = album.name.toLowerCase().replace(/\s*[([][^)\]]*[)\]]/g, '').trim()
        if (album.album_type !== 'album' || !album.images.length ||
            !album.artists.some(a => a.name.toLowerCase() === artist.toLowerCase()) || seen.has(title)) return false
        seen.add(title)
        return true
      })
      if (albums.length) {
        this.albumCache.set(artist, { expires: Date.now() + 3600000, albums })
        return albums
      }
    }
    return []
  }

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
