# FRD: Social Interactions (Backend API)

**Assignee Details:** Backend Developer (Fastify/Node.js)

## 1. Feature Goal
Expose robust API endpoints to manage likes, comments, and replies recursively. Accurately track which specific user interacted with an item.

## 2. Data Models
### `Comment` Table
- `_id`: Integer/UUID (Primary Key)
- `content`: String
- `postId`: Integer/UUID (Ref -> `Post`, Required)
- `authorId`: Integer/UUID (Ref -> `User`, Required)
- `parentId`: Integer/UUID (Ref -> `Comment`, Optional - handles nested replies)
- `createdAt`: Date

### `Like` Table
- `_id`: Integer/UUID (Primary Key)
- `userId`: Integer/UUID (Ref -> `User`, Required)
- `entityId`: Integer/UUID (Ref -> `Post` or `Comment`, Required)
- `entityType`: String (`'post'` or `'comment'`, Required)
- `createdAt`: Date
*(CRITICAL: A Compound Unique Constraint `@@unique([userId, entityId, entityType])` must be set in your `schema.prisma`)*

## 3. Endpoints & Business Logic

### POST `/api/:entityType/:id/like` (Protected, Requires JWT)
*(Where `:entityType` maps to `posts` or `comments`)*
**Business Logic:**
1. Extract `userId` from the decoded JWT.
2. Attempt insertion using `prisma.like.create` with the corresponding `entityId` and `entityType`.
3. Prevent duplicate liking. If Prisma throws a unique constraint violation error (e.g., `P2002`), return early safely (e.g., `409 Conflict` or status `200` with message "Already liked").

### DELETE `/api/:entityType/:id/like` (Protected, Requires JWT)
**Business Logic:**
1. Use `prisma.like.deleteMany` to find and delete the record exactly matching the JWT `userId`, the URL `:id`, and the `:entityType`.

### POST `/api/posts/:id/comments` (Protected, Requires JWT)
**Request Body (`application/json`):**
```json
{ "content": "Looks great!" }
```
**Business Logic:**
1. Create record via `prisma.comment.create`.
2. Bind `postId` = `:id`, `authorId` = JWT User ID, and set `parentId` = `null`.

### POST `/api/comments/:id/replies` (Protected, Requires JWT)
**Request Body (`application/json`):**
```json
{ "content": "I completely agree." }
```
**Business Logic:**
1. Fetch the parent comment via `prisma.comment.findUnique({ where: { id } })` to verify it exists and to retrieve its structural `postId`.
2. Insert row using `prisma.comment.create`. Bind `postId` = (from parent), `authorId` = JWT User ID, and `parentId` = `:id`.

### GET `/api/posts/:id/likes` (Protected, Requires JWT)
**Business Logic:**
1. Query `prisma.like.findMany` where `entityId = :id` and `entityType = 'post'`.
2. Include the related `User` model (`include: { user: { select: { firstName: true, lastName: true } } }`) to return the names of users who liked it so the frontend can display "Liked by John DOE".
