import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { gameApi, Game, Guess } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import GameImage from '../components/GameImage'
import { CheckCircle, XCircle, RotateCcw, UserPlus } from 'lucide-react'

const GamePage = () => {
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [localGame, setLocalGame] = useState<Game | null>(null)
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  // Fetch today's game
  const { data: gameData, isLoading, error } = useQuery(
    'todayGame',
    gameApi.getTodayGame,
    {
      refetchOnWindowFocus: false,
    }
  )

  // Update local game state when data changes
  useEffect(() => {
    if (gameData?.game) {
      setLocalGame(gameData.game)
    }
  }, [gameData])

  // Submit guess mutation
  const submitGuessMutation = useMutation(gameApi.submitGuess, {
    onSuccess: (data) => {
      if (data.game) {
        // Authenticated user - update with server response
        setLocalGame(data.game)
        setMessage(
          data.guess.isCorrect
            ? `🎉 Correct! The album is "${data.game.album.title}" by ${data.game.album.artist}`
            : `❌ Wrong! You have ${data.game.guessesLeft} guesses left.`
        )
      } else {
        // Anonymous user - handle locally
        if (localGame) {
          const isCorrect = data.guess.isCorrect
          const newGuessesLeft = localGame.guessesLeft - 1
          const newPixelation = Math.max(1, localGame.pixelation - 1)
          
          const updatedGame = {
            ...localGame,
            guessesLeft: newGuessesLeft,
            pixelation: newPixelation,
            isCompleted: isCorrect || newGuessesLeft <= 0,
            isWon: isCorrect,
            guesses: [...localGame.guesses, data.guess]
          }
          
          setLocalGame(updatedGame)
          setMessage(
            isCorrect
              ? `🎉 Correct! The album is "${localGame.album.title}" by ${localGame.album.artist}`
              : `❌ Wrong! You have ${newGuessesLeft} guesses left.`
          )
        }
      }
      
      setShowResult(true)
      setGuess('')
      
      if (localGame?.isCompleted) {
        setTimeout(() => {
          queryClient.invalidateQueries('todayGame')
        }, 2000)
      }
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || 'Something went wrong!')
      setShowResult(true)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localGame || !guess.trim() || localGame.isCompleted) return

    if (isAuthenticated) {
      // Authenticated user - use API
      submitGuessMutation.mutate({
        gameId: localGame.id,
        guess: guess.trim()
      })
    } else {
      // Anonymous user - include album data
      submitGuessMutation.mutate({
        gameId: localGame.id,
        guess: guess.trim(),
        album: localGame.album
      })
    }
  }

  const handlePlayAgain = () => {
    setMessage('')
    setShowResult(false)
    setGuess('')
    setLocalGame(null)
    queryClient.invalidateQueries('todayGame')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <XCircle size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Game</h2>
        <p className="text-gray-600 mb-6">
          {(error as any)?.response?.data?.message || 'Something went wrong!'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!localGame) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Game Available</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-special">
          Today's Challenge
        </h1>
        <div className="flex justify-center items-center space-x-8 text-lg">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Guesses Left:</span>
            <span className={`px-3 py-1 rounded-full ${
              localGame.guessesLeft > 2 ? 'bg-green-100 text-green-800' :
              localGame.guessesLeft > 0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {localGame.guessesLeft}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Clarity:</span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {Math.round(((7 - localGame.pixelation) / 6) * 100)}%
            </span>
          </div>
        </div>
        
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <UserPlus size={20} />
              <span className="text-sm">
                <Link to="/register" className="font-medium underline hover:text-blue-900">
                  Sign up
                </Link> to track your progress and play daily!
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Game Image */}
      <div className="mb-8">
        <GameImage
          album={localGame.album}
          pixelation={localGame.pixelation}
          isCompleted={localGame.isCompleted}
        />
      </div>

      {/* Game Form */}
      {!localGame.isCompleted && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="text-center mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Guess the album title..."
              className="input-field flex-1"
              disabled={submitGuessMutation.isLoading}
            />
            <button
              type="submit"
              disabled={!guess.trim() || submitGuessMutation.isLoading}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitGuessMutation.isLoading ? 'Guessing...' : 'Submit'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Previous Guesses */}
      {localGame.guesses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Previous Guesses</h3>
          <div className="space-y-2 max-w-md mx-auto">
            {localGame.guesses.map((guess: Guess) => (
              <motion.div
                key={guess.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  guess.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="font-medium">{guess.guess}</span>
                {guess.isCorrect ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Game Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center mb-8"
          >
            <div className={`p-6 rounded-xl ${
              localGame.isWon ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="text-lg font-semibold mb-4">{message}</p>
              {localGame.isCompleted && (
                <div className="space-y-4">
                  <button
                    onClick={handlePlayAgain}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <RotateCcw size={20} />
                    <span>Play Again</span>
                  </button>
                  {!isAuthenticated && (
                    <div className="text-center">
                      <p className="text-sm mb-2">Want to track your progress?</p>
                      <Link
                        to="/register"
                        className="btn-secondary inline-flex items-center space-x-2"
                      >
                        <UserPlus size={16} />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Complete Info */}
      {localGame.isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white bg-opacity-50 p-6 rounded-xl"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {localGame.isWon ? '🎉 Congratulations!' : '😔 Better luck next time!'}
          </h3>
          <p className="text-gray-600 mb-4">
            The album was <strong>"{localGame.album.title}"</strong> by <strong>{localGame.album.artist}</strong>
          </p>
          <p className="text-sm text-gray-500">
            {isAuthenticated ? 'Come back tomorrow for a new challenge!' : 'Sign up to play daily and track your progress!'}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default GamePage
