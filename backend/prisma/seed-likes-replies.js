const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const replyContents = [
  'Great point! I agree.',
  'Totally understand what you mean.',
  'Thanks for explaining!',
  'Interesting take on this.',
  'Couldnt have said it better.',
  'This is so true!',
  'I feel the same way.',
  'Well said!',
  'Exactly my thoughts!',
  'So valid!',
  'Preach!',
  'Facts! 💯',
  'This is everything!',
  'Yesss!',
  'Right on!'
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
  'Youre spot on!'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedLikesAndReplies() {
  console.log('Getting latest posts...');
  
  const latestPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      likes: true,
      comments: {
        include: {
          author: true
        }
      }
    }
  });

  console.log(`Found ${latestPosts.length} latest posts`);

  const allUsers = await prisma.user.findMany();
  console.log(`Total users: ${allUsers.length}`);

  let totalPostLikes = 0;
  let totalCommentLikes = 0;
  let totalReplies = 0;

  for (const post of latestPosts) {
    console.log(`\nProcessing post #${post.id.slice(0, 8)}...`);
    
    console.log(`  Adding max likes to post...`);
    const likedUsers = [...allUsers].sort(() => Math.random() - 0.5);
    
    for (const user of likedUsers) {
      try {
        await prisma.like.create({
          data: { userId: user.id, postId: post.id }
        });
        totalPostLikes++;
      } catch (e) {}
    }
    console.log(`    Post likes: ${post.likes.length + totalPostLikes}`);
    
    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      include: { likes: true }
    });
    
    console.log(`  Processing ${comments.length} comments...`);
    
    for (const comment of comments) {
      const commentLikers = [...allUsers].sort(() => Math.random() - 0.5).slice(0, randomInt(3, 15));
      
      for (const liker of commentLikers) {
        try {
          await prisma.like.create({
            data: { userId: liker.id, commentId: comment.id }
          });
          totalCommentLikes++;
        } catch (e) {}
      }
      
      if (Math.random() > 0.3) {
        const replyCount = randomInt(2, 8);
        const replyAuthors = [...allUsers].sort(() => Math.random() - 0.5).slice(0, randomInt(2, 5));
        
        for (let i = 0; i < replyCount; i++) {
          const replyAuthor = randomItem(replyAuthors);
          await prisma.comment.create({
            data: {
              content: randomItem(replyContents),
              postId: post.id,
              authorId: replyAuthor.id,
              parentId: comment.id
            }
          });
          totalReplies++;
        }
      }
    }
    
    console.log(`  Added replies to comments`);
  }

  console.log('\n✅ Done!');
  console.log(`   New post likes: ${totalPostLikes}`);
  console.log(`   Comment likes: ${totalCommentLikes}`);
  console.log(`   Replies created: ${totalReplies}`);
}

seedLikesAndReplies().finally(() => prisma.$disconnect());