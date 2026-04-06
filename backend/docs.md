# AppifyLab Backend - The Story Behind It All

## Wait, What is This?

Hey! Welcome to the AppifyLab brief documentation. Think of this as a storybook where we share how we built this social platform, the challenges we faced, and the solutions we engineered.

AppifyLab is a lightweight social media platform where users can:
- Create posts with visibility controls
- Comment on posts with a fully nested reply system
- Like posts and comments
- Manage their own accounts securely

Let's dive in!

---

## The Architecture (The Foundation)

The application is built with minimal dependencies to ensure high performance and low overhead, making it easy to orchestrate and run. We chose the following technologies, keeping future scalability in mind:

- **Fastify** - Chosen for its incredible performance and fine-grained control over the request lifecycle.
- **SQLite** - Used for minimal dependency overhead during development, with Prisma making it effortless to swap to PostgreSQL for large-scale production later.
- **Prisma** - An ORM that makes working with relational databases a truly enjoyable and type-safe experience.

## Features We Built

### 1. Authentication
- **Registration** - Secure password hashing with bcrypt before saving user data.
- **Login** - Verification of credentials to issue secure, signed JWT tokens.
- **Protected Routes** - Middleware to ensure token validity on every secure request.

### 2. Posts
- Feed generation with intelligent pagination.
- Post creation supporting text, multiple attachments, and visibility scopes (public vs. private).
- Granular like tracking and counting.

### 3. Comments (The Deep End)
- Root comments directly attached to posts.
- Deeply nested replies capable of unlimited threaded conversations.
- Highly optimized endpoints tailored for fetching root comments, fetching full trees, or paginating specific reply threads.

### 4. Likes
- Toggle like/unlike functionality.
- Unique constraints to prevent duplicate likes and handle user-entity relationships cleanly.

---

## Engineering Solutions: Solving Real Problems

### Problem: The Bandwidth & Performance Dilemma (The 1000+ Posts Problem)

**The Issue:** 
In a social network, fetching massive amounts of data at once is detrimental. If a user loads our feed, and we return thousands of posts—each containing their full history of comments, nested replies, and complete lists of users who liked them—it would:
- Crash the server via Out-Of-Memory (OOM) errors.
- Consume excessive mobile data bandwidth.
- Freeze the frontend browser trying to render enormous DOM nodes.

**Our Solution: Intelligent Data Fetching & Strict Pagination**

To minimize payload sizes and preserve bandwidth, we engineered strict querying limits across our Domain Services (`posts.service.js`, `comments.service.js`, and `likes.service.js`):

1. **Post Feed Pagination & Truncation:**
   We use offset-based pagination (`limit` & `page`). When fetching the feed, we don't just paginate the posts; we aggressively prune the eager-loaded relationships:
   - We return a maximum of `limit=20` posts per request.
   - For each post, we fetch the **most recent 5 likers** and calculate a total `_count.likes` instead of fetching all 500 users who liked it.
   - For comments on a post, we **only fetch the top 2 root comments**. We omit their nested replies entirely, instead returning a `repliesCount` and `likesCount`.

2. **Comment & Reply Lazy-Loading:**
   When a user views a post, they don't need a thousand comments right away.
   - We provide a `getCommentsByPostId` method that fetches only the root comments, paginating them (e.g., limits of 3 to 10 at a time).
   - **Nested Replies on Demand:** To fetch replies for a specific comment, we don't load the entire tree. We use `getReplies(parentId)` which only fetches direct children paginated. This forces the frontend to explicitly request "Load more replies" or "View replies," saving colossal amounts of unnecessary bandwidth.

3. **Paginated "Likers" Lists:**
   If a user wants to see who liked a post or a comment, they hit a dedicated `getPostLikers` or `getCommentLikers` endpoint. Rather than returning a massive array, these endpoints independently paginate the like relationship `(limit = 20)`, returning just the basic user information (ID, First Name, Last Name) and a `hasMore` flag.

By decomposing these queries, we drastically reduce our JSON payload sizes, keeping the application lightning-fast and extremely bandwidth-efficient.

---

### Problem: Nested Comments Going to the Wrong Place

**The Issue:**
Imagine this conversation structure:
```
Post
├── Comment A (root)
│   ├── Comment B (reply to A)
│   │   └── Comment C (reply to B)
```
You try to reply to Comment C, but your reply magically appears under Comment A! 😱

**Root Cause:**
1. The frontend data flow was lifting the wrong identifier up the component tree.
2. Form components were capturing only the `content`, completely ignoring the context of the `replyId`.
3. The backend Fastify JSON schema was overly strict and filtering out the `parentId` from the HTTP response.

**The Fix:**
1. Added `parentId` to the Fastify response validation schemas so the frontend could actually see it.
2. Refactored the frontend to propagate the complete state `(content, replyId, replyPostId)` up through the callback chain.
3. Replying to deeply nested comments now accurately anchors to the exact parent! 🎉

---

### Problem: The Comma Operator Disaster

Code looked like this:
```javascript
onReply={(content) => {
  console.log("a"),
  console.log("b"),
  onReply?.(content)
}}
```

**The Issue:** Using commas instead of semicolons inside the block triggered the JavaScript comma operator instead of executing discrete statements, causing wildly unpredictable execution order and returned values. 
**The Fix:** Replaced them with proper semicolons. A tiny syntax mistake that caused massive chaos, firmly resolved.

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    ← Database blueprint
│   └── dev.db           ← SQLite development database
├── src/
│   ├── features/        ← Modular, feature-first architecture
│   │   ├── auth/        ← Login, register, JWT
│   │   ├── posts/       ← Post creation, feeds
│   │   ├── comments/    ← Intelligent nested comments
│   │   └── likes/       ← Like/unlike logic
│   └── plugins/         ← Fastify plugins for DB, auth decorators
├── server.js            ← Application entry point
└── Dockerfile           ← Production deployment recipe
```

---

## Quick Start

### Running Tests
```bash
npm test           # Run the entire test suite
npm run test:watch # Run tests in interactive watch mode
```

### Local Development
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev             # Server starts on http://localhost:3001
```

### Docker Deployment
```bash
docker build -t appifylab-backend .
docker run -p 3001:3001 appifylab-backend

# Or via Docker Compose for multi-container orchestration
docker-compose up --build
```

---

## The Road Ahead (Future Improvements)

1. **PostgreSQL Migration** - While SQLite is fantastic for rapid development, exchanging it for PostgreSQL will comfortably support millions of simultaneous users.
2. **Cursor-Based Pagination** - Upgrading from offset-based to cursor-based pagination will ensure zero duplicates are fetched even as the database actively mutates during infinite scrolls.
3. **Advanced Media Processing** - Implement image and video uploads with resizing and optimization pipelines.
4. **WebSockets** - Add real-time pub/sub capabilities to instantly notify users of likes and incoming replies.
5. **Redis Caching** - Pre-compute and cache the global post feed in memory for microsecond response times.

---

## Conclusion

Building AppifyLab has been a masterclass in full-stack architecture. By proactively mitigating bandwidth issues through strict pagination, solving the complexities of infinite self-referential relations, and adhering to modular code structure, we've laid a rock-solid foundation for a thriving social platform. 

Thanks for reading! 
