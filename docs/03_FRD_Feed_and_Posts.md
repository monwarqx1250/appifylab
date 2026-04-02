# FRD: Feed & Post Creation (Backend API)

**Assignee Details:** Backend Developer (Fastify/Node.js)

## 1. Feature Goal
Provide RESTful endpoints for fetching the global feed and creating new posts. Submitting image files to local disk storage is required.

## 2. Data Models
### `Post` Table
- `_id`: Integer/UUID (Primary Key)
- `content`: String
- `visibility`: String (`'public'` or `'private'`)
- `authorId`: Integer/UUID (Foreign Key -> `User`)
- `createdAt`: Date

### `PostAttachment` Table
- `_id`: Integer/UUID (Primary Key)
- `postId`: Integer/UUID (Foreign Key -> `Post`)
- `fileUrl`: String
- `fileType`: String
- `createdAt`: Date

## 3. Endpoints & Business Logic

### POST `/api/posts` (Protected Route: Requires JWT)
**Request Payload (`multipart/form-data`):**
- `content`: String
- `visibility`: String (Enum: `public`/`private`)
- `file`: File upload field (Optional)

**Business Logic:**
1. Verify the JWT and extract `authorId` from the active token session.
2. Insert the `Post` record containing `content`, `visibility`, and `authorId` using `prisma.post.create`.
3. If an image file was included in the payload:
   - Save/stream it to the `/storage` or `/uploads` local disk directory.
   - Insert a `PostAttachment` record mapping the generated `fileUrl` back to the new `postId` using `prisma.postAttachment.create`.
**Response (`201 Created`):**
```json
{
  "message": "Post created successfully",
  "postId": 1
}
```

### GET `/api/posts` (Protected Route: Requires JWT)
**Business Logic:**
1. Fetch posts via `prisma.post.findMany`. Ensure they are sorted `orderBy: { createdAt: 'desc' }`.
2. Use Prisma `include` to eagerly load the `author` (User table) to attach `firstName` and `lastName`.
3. Use Prisma `include` to eagerly load `attachments` (PostAttachment table) to include any uploaded files.
*(Note: Do not worry about Public/Private security filtering yet. That is assigned to the Visibility FRD).*

**Response Schema (`200 OK`):**
```json
[
  {
    "id": 1,
    "content": "Hello World",
    "visibility": "public",
    "author": {
      "id": 99,
      "firstName": "John",
      "lastName": "Doe"
    },
    "attachments": [
      {
        "fileUrl": "/uploads/image-123.jpg",
        "fileType": "image/jpeg"
      }
    ],
    "createdAt": "2026-04-01T12:00:00Z"
  }
]
```
