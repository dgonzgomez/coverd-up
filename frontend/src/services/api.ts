import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  email: string
  username: string
}

export interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
  spotifyId?: string
}

export interface Guess {
  id: string
  guess: string
  isCorrect: boolean
  createdAt: string
}

export interface Game {
  id: string
  guessesLeft: number
  pixelation: number
  isCompleted: boolean
  isWon: boolean
  album: Album
  guesses: Guess[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  message: string
}

export interface RegisterResponse {
  user: User
  token: string
  message: string
}

export interface GameResponse {
  game: Game
}

export interface GuessRequest {
  gameId: string
  guess: string
}

export interface GuessResponse {
  guess: Guess
  game: Game
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Game API
export const gameApi = {
  getTodayGame: async (): Promise<GameResponse> => {
    const response = await api.get('/game/today')
    return response.data
  },

  submitGuess: async (data: GuessRequest): Promise<GuessResponse> => {
    const response = await api.post('/game/guess', data)
    return response.data
  },

  getHistory: async (page = 1, limit = 10): Promise<{
    games: Game[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get(`/game/history?page=${page}&limit=${limit}`)
    return response.data
  },
}

// Album API
export const albumApi = {
  getAlbums: async (page = 1, limit = 20, search?: string): Promise<{
    albums: Album[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    })
    const response = await api.get(`/albums?${params}`)
    return response.data
  },

  getAlbum: async (id: string): Promise<{ album: Album }> => {
    const response = await api.get(`/albums/${id}`)
    return response.data
  },

  getRandomAlbum: async (): Promise<{ album: Album }> => {
    const response = await api.get('/albums/random/one')
    return response.data
  },
}

export default api


