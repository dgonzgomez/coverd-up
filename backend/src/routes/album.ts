import express from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all albums (public endpoint)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { artist: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const albums = await prisma.album.findMany({
      where,
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        spotifyId: true
      },
      orderBy: { title: 'asc' },
      skip,
      take: limit
    });

    const total = await prisma.album.count({ where });

    res.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get album by ID
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const album = await prisma.album.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        spotifyId: true,
        createdAt: true
      }
    });

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json({ album });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get random album (for testing or admin purposes)
router.get('/random/one', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const albumCount = await prisma.album.count();
    const randomOffset = Math.floor(Math.random() * albumCount);
    
    const album = await prisma.album.findFirst({
      skip: randomOffset,
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        spotifyId: true
      }
    });

    if (!album) {
      return res.status(404).json({ message: 'No albums available' });
    }

    res.json({ album });
  } catch (error) {
    console.error('Get random album error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


