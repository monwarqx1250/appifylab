const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Steven', 'Ashley', 'Paul', 'Dorothy', 'Andrew', 'Kimberly', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
  'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie',
  'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen',
  'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen', 'Benjamin', 'Samantha'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

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
  'The best is yet to come.',
  'Happiness is a choice.',
  'Today is a gift, thats why its called the present.',
  'Create your own sunshine.',
  'Stay wild, moon child.',
  'Do it for your future self.',
  'Progress, not perfection.',
  'Make it happen.',
  'Chase your dreams.',
  'You are capable of amazing things.',
  'Rise and shine!'
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
  'Couldnt agree more.',
  'This made my day!',
  'Very inspiring.',
  'Love the vibe.',
  'Exactly what I needed to hear.',
  'Youre spot on!',
  'This is gold! 🌟',
  'Cant stop thinking about this.',
  'So much wisdom here.',
  'This hits different.',
  'Take my like! 😊',
  'Amazing!',
  'Wow, just wow!',
  'This is everything!',
  'Preach! 📢',
  'Facts!',
  'Right on!',
  'Iconic behavior.',
  'Yes queen! 👑',
  'King behavior! 👑',
  'Mood.'
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

  console.log('Creating 75 users...');
  const users = [];
  for (let i = 0; i < 75; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / 30) % lastNames.length];
    const email = `user${i + 1}@test.com`;
    
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
  console.log(`   Created ${users.length} users`);

  console.log('Creating 220 posts...');
  const allPosts = [];
  for (let i = 0; i < 220; i++) {
    const author = users[randomInt(0, users.length - 1)];
    const post = await prisma.post.create({
      data: {
        content: `${randomItem(postContents)} #${i + 1}`,
        visibility: 'public',
        authorId: author.id
      }
    });
    allPosts.push(post);
  }
  console.log(`   Created ${allPosts.length} posts`);

  console.log('Creating comments and likes...');
  let totalComments = 0;
  let totalLikes = 0;

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    const commentCount = randomInt(30, 70);
    
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const commentAuthors = shuffledUsers.slice(0, randomInt(5, 15));
    
    for (let j = 0; j < commentCount; j++) {
      const commenter = randomItem(commentAuthors);
      await prisma.comment.create({
        data: {
          content: randomItem(commentContents),
          postId: post.id,
          authorId: commenter.id
        }
      });
    }
    totalComments += commentCount;

    const likeCount = randomInt(5, 20);
    const likedUsers = shuffledUsers.slice(0, randomInt(5, Math.min(25, users.length)));
    
    for (const liker of likedUsers.slice(0, likeCount)) {
      try {
        await prisma.like.create({
          data: {
            userId: liker.id,
            postId: post.id
          }
        });
        totalLikes++;
      } catch (e) {}
    }

    if ((i + 1) % 50 === 0) {
      console.log(`   Processed ${i + 1}/${allPosts.length} posts...`);
    }
  }

  console.log('');
  console.log('✅ Seeding complete!');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${allPosts.length}`);
  console.log(`   Comments: ${totalComments}`);
  console.log(`   Post Likes: ${totalLikes}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });