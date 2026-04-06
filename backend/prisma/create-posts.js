const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const postContents = [
  'Just had an amazing day! Feeling grateful for everything.',
  'Coffee and vibes ☕️',
  'Working on something exciting. Stay tuned!',
  'Life is short, make it sweet.',
  'New week, new opportunities!',
  'Sometimes the best things in life are free.',
  'Grateful for another day to be awesome.',
  'Just another post to add to the feed.',
  'If you love it, let it go. If it comes back, its yours.',
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

async function createPosts() {
  const users = await prisma.user.findMany();
  for (let i = 0; i < 100; i++) {
    await prisma.post.create({
      data: {
        content: postContents[i % postContents.length] + ' #' + (i + 1),
        visibility: 'public',
        authorId: users[i % users.length].id
      }
    });
  }
  console.log('Created 100 posts');
}

createPosts().finally(() => prisma.$disconnect());
