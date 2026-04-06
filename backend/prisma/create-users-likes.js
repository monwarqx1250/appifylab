const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Cameron', 'Skyler', 'Dakota', 'Reese', 'Finley', 'Sage', 'River', 'Phoenix', 'Hayden', 'Emery', 'Blake', 'Charlie', 'Ellis', 'Jamie', 'Kendall', 'Lane', 'Marley', 'Nico', 'Oakley', 'Payton', 'Remy', 'Shay'];
const lastNames = ['Adams', 'Baker', 'Carter', 'Davis', 'Evans', 'Foster', 'Garcia', 'Hill', 'Irving', 'James', 'Kelly', 'Larson', 'Mitchell', 'Nelson', 'Owens', 'Parker', 'Quinn', 'Ross', 'Stewart', 'Turner', 'Underwood', 'Vance', 'West', 'Xavier', 'Young', 'Zimmerman', 'Anderson', 'Bennett', 'Cole', 'Diaz'];

async function createUsersAndLikes() {
  const latestPost = await prisma.post.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!latestPost) {
    console.log('No posts found');
    return;
  }

  console.log('Creating 100 users...');
  const users = [];
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const email = `user${i + 1}@example.com`;
    
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

  console.log('Liking latest post...');
  for (const user of users) {
    try {
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: latestPost.id
        }
      });
    } catch (e) {
      // Skip duplicates
    }
  }

  console.log('Created 100 users and they all liked post:', latestPost.id);
}

createUsersAndLikes().finally(() => prisma.$disconnect());
