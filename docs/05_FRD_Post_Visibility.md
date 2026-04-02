# FRD: Post Visibility Queries (Backend Database Logic)

**Assignee Details:** Backend Developer (Fastify / SQLite)

## 1. Feature Goal
Strictly enforce application privacy. A completely decoupled backend means no UI is responsible for hiding items; all data filtering must happen identically at the SQLite query level. 

## 2. Business Logic Modification (`GET /api/posts`)

This FRD intercepts the main Feed query logic documented in `03_FRD_Feed_and_Posts.md`.

### Core Data Security Requirement
When an HTTP request triggers the fetching of posts for the feed, the `WHERE` clause must evaluate the active user's authorization dynamically.

### Required Prisma ORM Structure
```javascript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { visibility: 'public' },
      { 
        visibility: 'private', 
        authorId: currentSessionUserId 
      }
    ]
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

**Implementation Steps:**
1. Middleware extracts the `currentSessionUserId` natively from the authenticated JWT.
2. Pass this ID into the Prisma `where` filtering array as shown above.
3. **Important Check**: If a post belongs to `private` functionality, it MUST be omitted entirely from the JSON payload unless the `authorId` perfectly matches the session token.

## 3. Strict Rules
- The backend must NOT deliver a payload array containing private posts belonging to other users. 
- You must NOT rely on the frontend to map over an array and hide items based on logic. Privacy is executed and enforced by the query engine.
