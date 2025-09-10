import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleAlbums = [
  {
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    coverUrl: "https://miro.medium.com/v2/resize:fit:1400/1*8FkvzbSdSJ4HNxtuZo5kLg.jpeg"
  },
  {
    title: "Abbey Road",
    artist: "The Beatles",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg"
  },
  {
    title: "Rumours",
    artist: "Fleetwood Mac",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG"
  },
  {
    title: "Back in Black",
    artist: "AC/DC",
    coverUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png"
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
  },
  {
    title: "Thriller",
    artist: "Michael Jackson",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    title: "Nevermind",
    artist: "Nirvana",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg"
  },
  {
    title: "The Wall",
    artist: "Pink Floyd",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/0/0e/PinkFloydWallCoverOriginalNoText.jpg"
  },
  {
    title: "Led Zeppelin IV",
    artist: "Led Zeppelin",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg"
  },
  {
    title: "Born to Run",
    artist: "Bruce Springsteen",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Born_to_Run_%28Bruce_Springsteen_album_-_cover_art%29.jpg"
  },
  {
    title: "Purple Rain",
    artist: "Prince",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Prince_Purple_Rain.jpg"
  },
  {
    title: "Appetite for Destruction",
    artist: "Guns N' Roses",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/6/60/Guns_N%27_Roses_Appetite_for_Destruction.png"
  },
  {
    title: "OK Computer",
    artist: "Radiohead",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png"
  },
  {
    title: "The Joshua Tree",
    artist: "U2",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/2f/U2_The_Joshua_Tree.png"
  },
  {
    title: "Sgt. Pepper's Lonely Hearts Club Band",
    artist: "The Beatles",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/5/50/Sgt._Pepper%27s_Lonely_Hearts_Club_Band.jpg"
  },
  {
    title: "Kind of Blue",
    artist: "Miles Davis",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg"
  },
  {
    title: "Pet Sounds",
    artist: "The Beach Boys",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/2e/PetSoundsCover.jpg"
  },
  {
    title: "What's Going On",
    artist: "Marvin Gaye",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/8/8e/Marvin_Gaye_-_What%27s_Going_On.jpg"
  },
  {
    title: "Exile on Main St.",
    artist: "The Rolling Stones",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/4/4f/Exile_on_Main_St._cover.jpg"
  },
  {
    title: "London Calling",
    artist: "The Clash",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/London_Calling_cover.jpg"
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.guess.deleteMany();
  await prisma.game.deleteMany();
  await prisma.album.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create albums
  for (const albumData of sampleAlbums) {
    await prisma.album.create({
      data: albumData
    });
  }

  console.log(`✅ Created ${sampleAlbums.length} albums`);

  // Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.5.6.7' // password: "password"
    }
  });

  console.log('✅ Created test user (email: test@example.com, password: password)');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


