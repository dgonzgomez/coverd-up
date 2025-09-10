import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import axios from 'axios'
import AutocompleteInput from '../components/AutocompleteInput'

interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
}

interface Guess {
  id: string
  guess: string
  isCorrect: boolean
  createdAt: string
}

interface Game {
  id: string
  guessesLeft: number
  pixelation: number
  isCompleted: boolean
  isWon: boolean
  album: Album
  guesses: Guess[]
}

const SimpleGamePage = () => {
  const [game, setGame] = useState<Game | null>(null)
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('')
  const [showResult, setShowResult] = useState(false)

  // Sample albums for placeholder
  const sampleAlbums: Album[] = [
    {
      id: '1',
      title: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      coverUrl: 'https://miro.medium.com/v2/resize:fit:1400/1*8FkvzbSdSJ4HNxtuZo5kLg.jpeg'
    },
    {
      id: '2',
      title: 'Abbey Road',
      artist: 'The Beatles',
      coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg'
    },
    {
      id: '3',
      title: 'Rumours',
      artist: 'Fleetwood Mac',
      coverUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG'
    },
    {
      id: '4',
      title: 'Back in Black',
      artist: 'AC/DC',
      coverUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png'
    },
    {
      id: '5',
      title: 'Hotel California',
      artist: 'Eagles',
      coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg'
    }
  ]

  const getRandomAlbum = async (): Promise<Album> => {
    try {
      // Try to get album from Spotify API first
      const response = await axios.get('http://localhost:3001/api/spotify/random')
      return response.data.album
    } catch (error) {
      console.warn('Spotify API not available, using sample albums:', error)
      // Fallback to sample albums if Spotify API is not available
      const randomIndex = Math.floor(Math.random() * sampleAlbums.length)
      return sampleAlbums[randomIndex]
    }
  }

  const createNewGame = async (): Promise<Game> => {
    const album = await getRandomAlbum()
    return {
      id: `game_${Date.now()}`,
      guessesLeft: 5,
      pixelation: 7,
      isCompleted: false,
      isWon: false,
      album,
      guesses: []
    }
  }

  const applyPixelation = (imageUrl: string, pixelation: number): string => {
    // For now, we'll use CSS filters to simulate pixelation
    // In a real implementation, you'd use canvas to create actual pixelation
    return imageUrl
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!game || !guess.trim() || game.isCompleted) return

    const isCorrect = game.album.title.toLowerCase() === guess.toLowerCase()
    const newGuessesLeft = game.guessesLeft - 1
    const newPixelation = Math.max(1, game.pixelation - 1)

    const newGuess: Guess = {
      id: `guess_${Date.now()}`,
      guess: guess.trim(),
      isCorrect,
      createdAt: new Date().toISOString()
    }

    const updatedGame: Game = {
      ...game,
      guessesLeft: newGuessesLeft,
      pixelation: newPixelation,
      isCompleted: isCorrect || newGuessesLeft <= 0,
      isWon: isCorrect,
      guesses: [...game.guesses, newGuess]
    }

    setGame(updatedGame)
    setMessage(
      isCorrect
        ? `🎉 Correct! The album is "${game.album.title}" by ${game.album.artist}`
        : `❌ Wrong! You have ${newGuessesLeft} guesses left.`
    )
    setShowResult(true)
    setGuess('')

    if (updatedGame.isCompleted) {
      setTimeout(() => {
        setShowResult(false)
      }, 3000)
    }
  }

  const handleNewGame = async () => {
    const newGame = await createNewGame()
    setGame(newGame)
    setMessage('')
    setShowResult(false)
    setGuess('')
  }

  useEffect(() => {
    if (!game) {
      handleNewGame()
    }
  }, [])

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4 relative">
      {/* Branding */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/20"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            CoverdUp
          </h1>
          <p className="text-xs text-gray-500 -mt-1">Album Guessing Game</p>
        </motion.div>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Album Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden"
        >
          <img
            src={game.album.coverUrl}
            alt={game.isCompleted ? `${game.album.title} by ${game.album.artist}` : 'Mystery Album'}
            className={`w-full h-auto rounded-xl shadow-2xl border-4 border-white transition-all duration-500 ease-in-out relative ${
              game.isCompleted 
                ? '' 
                : `pixelated-${Math.max(1, Math.min(7, game.pixelation))}`
            }`}
            style={{
              imageRendering: game.isCompleted ? 'auto' : 'pixelated',
              transformOrigin: 'center'
            }}
          />
          
          {!game.isCompleted && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl font-bold mb-2">🎵</div>
                <div className="text-sm font-medium">Guess the Album!</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Game Stats */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-800">
              Guesses: {5 - game.guessesLeft}/5
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary-100 text-secondary-800">
              Clarity: {Math.round(((7 - game.pixelation) / 6) * 100)}%
            </span>
          </div>
        </div>

        {/* Guess Form */}
        {!game.isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <AutocompleteInput
              value={guess}
              onChange={setGuess}
              onSubmit={(value) => {
                if (value.trim()) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                }
              }}
              placeholder="Guess the album title..."
              disabled={game.isCompleted}
            />
            <button
              onClick={() => {
                if (guess.trim()) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                }
              }}
              disabled={!guess.trim()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Guess
            </button>
          </motion.div>
        )}

        {/* Previous Guesses */}
        {game.guesses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 text-center">Previous Guesses</h3>
            <div className="space-y-1">
              {game.guesses.map((guess) => (
                <motion.div
                  key={guess.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    guess.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span className="font-medium">{guess.guess}</span>
                  {guess.isCorrect ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Game Result */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 rounded-xl bg-white shadow-lg"
          >
            <p className="text-lg font-semibold mb-4">{message}</p>
            {game.isCompleted && (
              <button
                onClick={handleNewGame}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center space-x-2 transition-colors duration-200"
              >
                <RotateCcw size={16} />
                <span>New Game</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Game Complete Info */}
        {game.isCompleted && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-xl bg-white shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {game.isWon ? '🎉 Congratulations!' : '😔 Better luck next time!'}
            </h3>
            <p className="text-gray-600 mb-4">
              The album was <strong>"{game.album.title}"</strong> by <strong>{game.album.artist}</strong>
            </p>
            <button
              onClick={handleNewGame}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center space-x-2 transition-colors duration-200"
            >
              <RotateCcw size={16} />
              <span>Play Again</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SimpleGamePage
