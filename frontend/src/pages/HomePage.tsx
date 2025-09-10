import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Gamepad2, Users, Clock, Trophy } from 'lucide-react'

const HomePage = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-primary-600 mb-6 font-special">
            CoverdUp
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Test your music knowledge! Guess the album from a pixelated cover with 5 attempts.
            Play instantly or sign up to track your progress and play daily!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/game"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Gamepad2 size={24} />
              <span>Play Now</span>
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
                >
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
                >
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white bg-opacity-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 font-special">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 size={40} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Guess the Album</h3>
              <p className="text-gray-600">
                You'll see a heavily pixelated album cover. Use your music knowledge to guess the title!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5 Tries Per Game</h3>
              <p className="text-gray-600">
                Each wrong guess reveals more of the cover. You have 5 attempts to get it right!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Sign up to track your game history and see how many albums you've successfully guessed!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6 font-special">
            Ready to Test Your Music Knowledge?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start playing instantly or join thousands of music lovers who track their progress with CoverdUp!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/game"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Gamepad2 size={24} />
              <span>Play Now</span>
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Users size={24} />
                <span>Sign Up</span>
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default HomePage
