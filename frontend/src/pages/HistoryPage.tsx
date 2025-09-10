import { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { gameApi, Game } from '../services/api'
import { CheckCircle, XCircle, Calendar, Trophy, Clock } from 'lucide-react'

const HistoryPage = () => {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useQuery(
    ['gameHistory', page],
    () => gameApi.getHistory(page, limit),
    {
      keepPreviousData: true,
    }
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGameStatus = (game: Game) => {
    if (game.isWon) return { text: 'Won', color: 'text-green-600', bg: 'bg-green-100' }
    if (game.isCompleted) return { text: 'Lost', color: 'text-red-600', bg: 'bg-red-100' }
    return { text: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-100' }
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading History</h2>
        <p className="text-gray-600">
          {(error as any)?.response?.data?.message || 'Something went wrong!'}
        </p>
      </div>
    )
  }

  const games = data?.games || []
  const pagination = data?.pagination

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-special">
          Game History
        </h1>
        <p className="text-lg text-gray-600">
          Track your album guessing progress
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20">
          <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Games Yet</h2>
          <p className="text-gray-600 mb-6">
            Start playing to see your game history here!
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card text-center"
            >
              <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
              <div className="text-2xl font-bold text-gray-800">
                {games.filter(g => g.isWon).length}
              </div>
              <div className="text-gray-600">Games Won</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card text-center"
            >
              <XCircle className="mx-auto text-red-500 mb-2" size={32} />
              <div className="text-2xl font-bold text-gray-800">
                {games.filter(g => g.isCompleted && !g.isWon).length}
              </div>
              <div className="text-gray-600">Games Lost</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card text-center"
            >
              <Clock className="mx-auto text-blue-500 mb-2" size={32} />
              <div className="text-2xl font-bold text-gray-800">
                {games.length}
              </div>
              <div className="text-gray-600">Total Games</div>
            </motion.div>
          </div>

          {/* Games List */}
          <div className="space-y-4">
            {games.map((game, index) => {
              const status = getGameStatus(game)
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={game.album.coverUrl}
                        alt={`${game.album.title} by ${game.album.artist}`}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {game.album.title}
                        </h3>
                        <p className="text-gray-600">{game.album.artist}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar size={16} />
                            <span>{formatDate(game.createdAt)}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.text}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Guesses Used</div>
                      <div className="text-lg font-bold text-gray-800">
                        {5 - game.guessesLeft} / 5
                      </div>
                      {game.guesses.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {game.guesses.slice(0, 3).map((guess, guessIndex) => (
                            <div
                              key={guess.id}
                              className={`text-xs px-2 py-1 rounded ${
                                guess.isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {guess.guess}
                            </div>
                          ))}
                          {game.guesses.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{game.guesses.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HistoryPage


