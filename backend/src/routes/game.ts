import express from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get today's game for user (anonymous or authenticated)
router.get('/today', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let game = null;

    // If user is authenticated, check for existing game
    if (userId) {
      game = await prisma.game.findFirst({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          album: true,
          guesses: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    }

    // If no game exists (or user is anonymous), create a new one
    if (!game) {
      // Get a random album
      const albumCount = await prisma.album.count();
      const randomOffset = Math.floor(Math.random() * albumCount);
      
      const randomAlbum = await prisma.album.findFirst({
        skip: randomOffset
      });

      if (!randomAlbum) {
        return res.status(404).json({ message: 'No albums available' });
      }

      // For anonymous users, we'll create a temporary game that's not saved to DB
      // For authenticated users, save to DB
      if (userId) {
        game = await prisma.game.create({
          data: {
            userId,
            albumId: randomAlbum.id,
            guessesLeft: 5,
            pixelation: 7
          },
          include: {
            album: true,
            guesses: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
      } else {
        // Create a temporary game object for anonymous users
        game = {
          id: `temp_${Date.now()}`,
          userId: null,
          albumId: randomAlbum.id,
          guessesLeft: 5,
          pixelation: 7,
          isCompleted: false,
          isWon: false,
          album: randomAlbum,
          guesses: []
        };
      }
    }

    res.json({
      game: {
        id: game.id,
        guessesLeft: game.guessesLeft,
        pixelation: game.pixelation,
        isCompleted: game.isCompleted,
        isWon: game.isWon,
        album: {
          id: game.album.id,
          title: game.album.title,
          artist: game.album.artist,
          coverUrl: game.album.coverUrl
        },
        guesses: game.guesses.map(guess => ({
          id: guess.id,
          guess: guess.guess,
          isCorrect: guess.isCorrect,
          createdAt: guess.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get today\'s game error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit a guess (works for both anonymous and authenticated users)
router.post('/guess', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { gameId, guess } = req.body;

    if (!gameId || !guess) {
      return res.status(400).json({ message: 'Game ID and guess are required' });
    }

    // Check if this is a temporary game (anonymous user)
    if (gameId.startsWith('temp_')) {
      // For anonymous users, we need to get the album from the request
      // This is a simplified approach - in production you might want to store temp games in memory/cache
      const { album } = req.body;
      
      if (!album) {
        return res.status(400).json({ message: 'Album data required for anonymous games' });
      }

      // Check if guess is correct
      const isCorrect = album.title.toLowerCase() === guess.toLowerCase();
      
      // Create a temporary guess record
      const guessRecord = {
        id: `temp_guess_${Date.now()}`,
        guess,
        isCorrect,
        createdAt: new Date().toISOString()
      };

      res.json({
        guess: guessRecord,
        message: 'Guess processed (anonymous game)'
      });
    } else {
      // Authenticated user - use database
      const game = await prisma.game.findFirst({
        where: {
          id: gameId,
          userId,
          isCompleted: false
        },
        include: {
          album: true
        }
      });

      if (!game) {
        return res.status(404).json({ message: 'Game not found or already completed' });
      }

      if (game.guessesLeft <= 0) {
        return res.status(400).json({ message: 'No guesses left' });
      }

      // Check if guess is correct
      const isCorrect = game.album.title.toLowerCase() === guess.toLowerCase();
      const newGuessesLeft = game.guessesLeft - 1;
      const newPixelation = Math.max(1, game.pixelation - 1);

      // Create guess record
      const guessRecord = await prisma.guess.create({
        data: {
          gameId,
          userId: userId!,
          guess,
          isCorrect
        }
      });

      // Update game state
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          guessesLeft: newGuessesLeft,
          pixelation: newPixelation,
          isCompleted: isCorrect || newGuessesLeft <= 0,
          isWon: isCorrect
        },
        include: {
          album: true,
          guesses: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      res.json({
        guess: {
          id: guessRecord.id,
          guess: guessRecord.guess,
          isCorrect: guessRecord.isCorrect,
          createdAt: guessRecord.createdAt
        },
        game: {
          id: updatedGame.id,
          guessesLeft: updatedGame.guessesLeft,
          pixelation: updatedGame.pixelation,
          isCompleted: updatedGame.isCompleted,
          isWon: updatedGame.isWon,
          album: {
            id: updatedGame.album.id,
            title: updatedGame.album.title,
            artist: updatedGame.album.artist,
            coverUrl: updatedGame.album.coverUrl
          },
          guesses: updatedGame.guesses.map(g => ({
            id: g.id,
            guess: g.guess,
            isCorrect: g.isCorrect,
            createdAt: g.createdAt
          }))
        }
      });
    }
  } catch (error) {
    console.error('Submit guess error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get game history for user
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const games = await prisma.game.findMany({
      where: { userId },
      include: {
        album: true,
        guesses: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.game.count({
      where: { userId }
    });

    res.json({
      games: games.map(game => ({
        id: game.id,
        isCompleted: game.isCompleted,
        isWon: game.isWon,
        createdAt: game.createdAt,
        album: {
          id: game.album.id,
          title: game.album.title,
          artist: game.album.artist,
          coverUrl: game.album.coverUrl
        },
        guesses: game.guesses.map(guess => ({
          id: guess.id,
          guess: guess.guess,
          isCorrect: guess.isCorrect,
          createdAt: guess.createdAt
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
