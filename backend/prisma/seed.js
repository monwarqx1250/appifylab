const {faker} = require("@faker-js/faker")
const { PrismaClient } = require('@prisma/client');
const {type} = require("arktype")
const prisma = new PrismaClient();


const UserType = type({
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    password: 'string'
})

const Post = type({
    content: 'string',
    authorId: 'number',
    visibility: 'string'
})

const Like = type({
    postId: 'string',
    commentId: 'string',
    userId: 'string',
})
function generateRandomUser() {
    const users = [];
    for (let i = 0; i < 1000000; i++) {
        const user = UserType({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: `user${i}_${faker.string.uuid()}@test.com`,
            password: faker.internet.password()
        })
        users.push(user);
    }
    return users;
}

function countUsers() {
    return prisma.user.count();
}

async function CreatePosts() {
    const users = await prisma.user.findMany({
        select: { id: true },
        take: 100,
        orderBy: { createdAt: 'desc' }
    });

    const BATCH_SIZE = 10000;
    const TOTAL = 1_000_000;

    let batch = [];

    for (let i = 0; i < TOTAL; i++) {
        const user = users[Math.floor(Math.random() * users.length)];

        batch.push({
            content: faker.lorem.paragraph(),
            authorId: user.id,
            visibility: faker.helpers.arrayElement(['public', 'private'])
        });

        if (batch.length === BATCH_SIZE) {
            await prisma.post.createMany({
                data: batch
            });

            batch = [];
        }
    }

    // flush remaining
    if (batch.length > 0) {
        await prisma.post.createMany({ data: batch });
    }
}

async function ReactPosts() {
    const posts = await prisma.post.findMany({
        select: { id: true },
        take: 10,
        orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' }
        ]
    });

    const users = await prisma.user.findMany({
        select: { id: true },
        take: 100000,
        orderBy: { createdAt: 'desc' }
    });

    const BATCH_SIZE = 10000;

    for (const post of posts) {
        const reactionCount = Math.floor(
            Math.random() * (100000 - 10000 + 1) + 10000
        );

        // shuffle users once per post
        const shuffledUsers = users.sort(() => Math.random() - 0.5);

        const limit = Math.min(reactionCount, shuffledUsers.length);

        let batch = [];

        for (let i = 0; i < limit; i++) {
            batch.push({
                postId: post.id,
                commentId: null,
                userId: shuffledUsers[i].id
            });

            if (batch.length === BATCH_SIZE) {
                await prisma.like.createMany({
                    data: batch,
                    skipDuplicates: true
                });
                batch = [];
            }
        }

        if (batch.length > 0) {
            await prisma.like.createMany({
                data: batch,
                skipDuplicates: true
            });
        }
    }
}

async function getLastPost() {
    return await prisma.post.findFirst({
        orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' }
        ]
    });
}
async function lastPosts(n) {
    return await prisma.post.findMany({
        orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' }
        ],
        take: n
    });
}

async function createComments() {
    const posts = await lastPosts(100);

    const users = await prisma.user.findMany({
        select: { id: true },
        take: 10000,
        orderBy: { createdAt: 'desc' }
    });

    const BATCH_SIZE = 1000;

    const TOTAL_COMMENTS = 1_000_000;

    let batch = [];

    for (let i = 0; i < TOTAL_COMMENTS; i++) {
        const post = posts[Math.floor(Math.random() * posts.length)];
        const user = users[Math.floor(Math.random() * users.length)];

        const comment = {
            content: faker.lorem.sentence(),
            authorId: user.id,
            postId: post.id,
        };

        batch.push(comment);

        if (batch.length === BATCH_SIZE) {
            await prisma.comment.createMany({
                data: batch
            });

            batch = [];
        }
    }

    if (batch.length > 0) {
        await prisma.comment.createMany({
            data: batch
        });
    }
}
async function main() {
    const startTime = Date.now();
    await createComments()
    const endTime = Date.now();
    console.log(`Time taken : ${(endTime - startTime) / 1000} seconds`);
    
}

main()