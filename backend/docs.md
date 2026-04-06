# AppifyLab Backend - The Story Behind It All

## Wait, What is This?

Hey! Welcome to the AppifyLab backend documentation. Think of this as a storybook where I tell you how we built this social platform, what went wrong, and how we fixed it.

So AppifyLab is basically a mini social media where users can:
- Create posts
- Comment on posts (and reply to comments... and reply to those replies...)
- Like posts and comments
- Have their own accounts

Let's dive in!

---

## The Architecture (The Foundation)

### Why These Technologies?

We chose:
- **Fastify** - It's like Express but way faster
- **SQLite** - Simplest database, just a file (great for development)
- **Prisma** - Makes database work actually enjoyable

### How Requests Flow

```
You click "Like" → Fastify catches it → Routes to the right place → Service does the work → Prisma saves to DB → Response comes back
```

We used the **Service Layer Pattern**. Routes (HTTP handlers) don't do heavy lifting - they just pass requests to "services" that handle all the logic. This makes code:
- Easier to test
- Easier to understand
- Easier to fix when things break

---

## The Database (Where Data Lives)

### Our 5 Main Models

**1. User** - Has name, email, and hashed password

**2. Post** - What you write. Has `visibility` (public/private)

**3. Comment** - The interesting one! Uses self-reference to allow nesting:
```prisma
parentId  String?  // Points to the comment this replies to
```

Infinite nesting! 🎉

**4. Like** - Polymorphic - can be for a post OR a comment, not both

**5. PostAttachment** - For file uploads (future feature)

---

## Features We Built

### 1. Authentication
- **Register** - Hash password with bcrypt, save user
- **Login** - Verify credentials, return JWT token
- **Protected Routes** - Token verified on every request

### 2. Posts
- Create posts with text and visibility
- Pagination for the feed
- Who liked each post

### 3. Comments
- Root comments (directly on posts)
- Nested replies (reply to any comment)
- Three endpoints: root comments only, all comments, or replies to specific comment

### 4. Likes
- Toggle like/unlike
- Unique constraints (can't double-like)

---

## Solving Real Problems

### Problem: What If We Have 1000 Posts? How Do We Load Them?

**The Question:** If we have thousands of posts, loading them all at once would:
- Make the app super slow
- Use tons of data
- Crash the browser

**Our Solution: Pagination**

We added offset-based pagination:
```javascript
// Get page 1, 20 posts per page
GET /api/posts?page=1&limit=20
```

The API returns `hasMore: true/false` so the frontend knows if there are more posts to load. When user scrolls to the bottom, we fetch the next page!

**UX Consideration:** We also:
- Show only the first 2 comments under each post (not all 50)
- Load replies on-demand when user clicks "View replies"
- This keeps the initial load fast even with tons of data

---

### Problem: Nested Comments Going to Wrong Place

**The Issue:**
You have this conversation:
```
Post
├── Comment A (root)
│   ├── Comment B (reply to A)
│   │   └── Comment C (reply to B)
```

You try to reply to Comment C, but your reply appears under Comment A! 😱

**Root Cause:**
1. Frontend was passing wrong ID up the chain
2. Some components only captured `content`, ignoring the actual reply ID
3. Backend was filtering out `parentId` from response (Fastify schema)

**The Fix:**
1. Added `parentId` to response schemas
2. Fixed frontend to pass `(content, replyId, replyPostId)` through the whole chain
3. Now when you reply to Comment C, it correctly goes under Comment C! 🎉

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

Those commas instead of semicolons made JavaScript behave weird! Fixed by using proper semicolons. Small thing, big chaos.

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    ← Database blueprint
│   └── dev.db          ← SQLite file
├── src/
│   ├── features/       ← Each feature in its own folder
│   │   ├── auth/      ← Login, register
│   │   ├── posts/     ← Posts CRUD
│   │   ├── comments  ← Comments & replies
│   │   └── likes/     ← Like/unlike
│   └── plugins/       ← Database, JWT, etc
├── server.js          ← Entry point
└── Dockerfile         ← Docker recipe
```

---

## Testing

Run tests with:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

---

## Running the App

### Local Development
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev             # Starts at localhost:3001
```

### With Docker
```bash
docker build -t appifylab-backend ./backend
docker run -p 3001:3001 appifylab-backend

# Or use docker-compose
docker-compose up --build
```

---

## Future Improvements

1. **PostgreSQL** - SQLite is great for dev, but PostgreSQL handles millions of users
2. **Cursor Pagination** - Better for infinite scroll with huge datasets
3. **Image Upload** - Allow attaching photos to posts
4. **WebSockets** - Real-time notifications when someone likes your post
5. **Redis Caching** - Make the feed load faster

---

## The End

That's the story of AppifyLab! We built a social platform from scratch, dealt with nested comment chaos, and learned a ton.

Key lessons:
- Always verify data is flowing correctly
- Pagination is crucial for UX
- Self-referential relations are powerful but tricky

Thanks for reading! 🚀
