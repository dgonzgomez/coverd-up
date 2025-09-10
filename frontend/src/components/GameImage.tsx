import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Album } from '../services/api'

interface GameImageProps {
  album: Album
  pixelation: number
  isCompleted: boolean
}

const GameImage = ({ album, pixelation, isCompleted }: GameImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!album.coverUrl) return

    setIsLoading(true)
    
    if (isCompleted || pixelation <= 1) {
      setImageSrc(album.coverUrl)
      setIsLoading(false)
      return
    }

    // Create pixelated version
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        setImageSrc(album.coverUrl)
        setIsLoading(false)
        return
      }

      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      const blockSize = pixelation * 3
      const smallWidth = Math.max(1, Math.floor(canvas.width / blockSize))
      const smallHeight = Math.max(1, Math.floor(canvas.height / blockSize))
      
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, smallWidth, smallHeight)
      ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, canvas.width, canvas.height)
      
      setImageSrc(canvas.toDataURL())
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setImageSrc(album.coverUrl)
      setIsLoading(false)
    }
    
    img.src = album.coverUrl
  }, [album.coverUrl, pixelation, isCompleted])

  return (
    <div className="relative w-full max-w-md mx-auto">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <img
          src={imageSrc}
          alt={isCompleted ? `${album.title} by ${album.artist}` : 'Mystery Album'}
          className={`w-full h-auto rounded-xl shadow-2xl border-4 border-white ${
            !isCompleted ? 'pixelated' : ''
          }`}
          style={{
            filter: isCompleted ? 'none' : `blur(${Math.max(0, pixelation - 1)}px)`,
          }}
        />
        
        {!isCompleted && (
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold mb-2">🎵</div>
              <div className="text-sm font-medium">Guess the Album!</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default GameImage


