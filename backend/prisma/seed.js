const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const postContents = [
  'Just had an amazing day! Feeling grateful for everything.',
  'Coffee and vibes ☕️',
  'Working on something exciting. Stay tuned!',
  'Life is short, make it sweet.',
  'New week, new opportunities!',
  'Sometimes the best things in life are free.',
  'Grateful for another day to be awesome.',
  'Just another post to add to the feed.',
  'If you love it, let it go. If it comes back, it\'s yours.',
  'Dream big, work hard, stay focused.',
  'Doing great things today!',
  'The secret to success is consistency.',
  'Every moment counts.',
  'Living my best life! ✨',
  'Making memories that last forever.',
  'Success is a journey, not a destination.',
  'Positive vibes only.',
  'Another day, another blessing.',
  'Keep pushing forward.',
  'The best is yet to come.'
];

const commentContents = [
  'Great post! 👍',
  'Love this! ❤️',
  'So true!',
  'Interesting perspective.',
  'Totally agree with you.',
  'This is awesome!',
  'Keep it up!',
  'Thanks for sharing!',
  'Well said!',
  'Couldn\'t agree more.',
  'This made my day!',
  'Very inspiring.',
  'Love the vibe.',
  'Exactly what I needed to hear.',
  'You\'re spot on!',
  'This is gold! 🌟',
  'Can\'t stop thinking about this.',
  'So much wisdom here.',
  'This hits different.',
  'Take my like! 😊'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🌱 Seeding database...');

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postAttachment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating 30 users...');
  const users = [];
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@test.com`;
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: bcrypt.hashSync('password123', 10)
      }
    });
    users.push(user);
  }

  console.log('Creating posts, comments, and likes...');
  const allPosts = [];

  for (const user of users) {
    const postCount = randomInt(3, 8);
    
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          content: randomItem(postContents),
          visibility: 'public',
          authorId: user.id
        }
      });
      allPosts.push(post);
    }
  }

  for (const post of allPosts) {
    const commentCount = randomInt(0, 15);
    const commentedUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, randomInt(1, 5));
    
    for (let i = 0; i < commentCount; i++) {
      const commenter = randomItem(commentedUsers);
      await prisma.comment.create({
        data: {
          content: randomItem(commentContents),
          postId: post.id,
          authorId: commenter.id
        }
      });
    }

    const likeCount = randomInt(0, 20);
    const likedUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, randomInt(1, Math.min(10, users.length)));
    
    for (const liker of likedUsers.slice(0, likeCount)) {
      try {
        await prisma.like.create({
          data: {
            userId: liker.id,
            postId: post.id
          }
        });
      } catch (e) {
        // Skip duplicates
      }
    }
  }

  console.log('✅ Seeding complete!');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${allPosts.length}`);
  
  const commentCount = await prisma.comment.count();
  const likeCount = await prisma.like.count();
  console.log(`   Comments: ${commentCount}`);
  console.log(`   Likes: ${likeCount}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
