import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LogOut, User, Gamepad2, History } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-primary-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="CoverdUp" className="h-8 w-8" />
            <span className="text-white text-xl font-bold font-special">
              CoverdUp
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/game"
              className="flex items-center space-x-1 text-white hover:text-primary-200 transition-colors"
            >
              <Gamepad2 size={20} />
              <span>Play</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/history"
                  className="flex items-center space-x-1 text-white hover:text-primary-200 transition-colors"
                >
                  <History size={20} />
                  <span>History</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-white" />
                  <span className="text-white text-sm">{user?.username}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-white hover:text-primary-200 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-primary-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
