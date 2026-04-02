# Central Application Goal Document

## Purpose
This document serves as the single source of truth for the vision, objectives, and architectural foundation of **Buddy Script**. It provides all team members with a clear understanding of the application structure, enabling parallel feature development without blockers.

## Application Vision
**Buddy Script** is a modern social media application. The core platform allows users to create accounts, authenticate securely, and share media-rich posts (text and image attachments). The application fosters community interaction through a recursive commenting system, threaded replies, and robust like/unlike toggles. A fundamental feature of Buddy Script is user privacy, natively supporting public and private post visibility controls.

## Core Objectives
1. **Dynamic Social Feed:** Deliver a chronological global feed of user-generated content.
2. **Rich Interactions:** Provide seamless mechanisms for liking, commenting, and nested replying to posts.
3. **Strict Data Privacy:** Enforce user privacy settings directly at the database query level so private posts are completely secure.
4. **Security & UX:** Implement industry-standard security (JWT Authentication, strict route guarding) while prioritizing a premium, seamless User Experience.

## Target Tech Stack
- **Frontend Framework:** Next.js (with React)
- **Styling:** Vanilla CSS (Ported smoothly from the provided HTML/CSS mockups)
- **Backend Framework:** Node.js with Fastify 
- **Database:** SQLite (managed via Prisma ORM)
- **Authentication:** JSON Web Tokens (JWT)
- **File Storage:** local disk (for post images)

## Application Flow
1. **Unauthenticated User Entry:** Directs to the `/login` or `/register` route. Access to `/feed` is protected and redirects back to login.
2. **Authentication Flow:** User submits credentials to `/api/auth/register` or `/login`. Backend generates a JWT and returns it to the client.
3. **Feed Initialization:** User navigates to `/feed`. The frontend fetches `GET /api/posts`, attaching the JWT in the `Authorization` header.
4. **Visibility Filtering:** The backend reads the JWT, identifies the user, and queries the database for all `public` posts AND any `private` posts owned by the authenticated user.
5. **Interactive Flow (Likes/Comments):** The user views the feed (sorted newest first). Clicking "Like", "Comment", or "Reply" triggers specific API endpoints which update the DB models and sync the new state back to the frontend.

## Centralized Data Model (ERD)
This is the source of truth for our database. All feature teams must shape their Prisma `schema.prisma` models according to these definitions:

### 1. `User` Model
- `id`: Int (Autoincrement @id) or String (@id @default(uuid()))
- `firstName`: String (Required)
- `lastName`: String (Required)
- `email`: String (Required, Unique, Indexed)
- `password`: String (Hashed via bcrypt)
- `createdAt`: Date

### 2. `Post` Model
- `id`: Int/UUID (@id)
- `content`: String (Text content)
- `visibility`: String (Enum: `['public', 'private']`, Default: `'public'`)
- `authorId`: Int/UUID (Relation -> `User`)
- `createdAt`: Date (Used for descending sorting on the Feed)


### 2.1 `PostAttachment` Model
*(Note: Supports one-to-many relationship for multiple attachments per post)*
- `id`: Int/UUID (@id)
- `postId`: Int/UUID (Relation -> `Post`, Required)
- `fileUrl`: String (Local path or URL to the uploaded file)
- `fileType`: String (e.g., 'image/png', 'image/jpeg')
- `createdAt`: Date

### 3. `Comment` Model
*(Note: Handles both root Comments and nested Replies via `parentId`)*
- `id`: Int/UUID (@id)
- `content`: String (Required)
- `postId`: Int/UUID (Relation -> `Post`, Required)
- `authorId`: Int/UUID (Relation -> `User`, Required)
- `parentId`: Int/UUID (Relation -> `Comment`, Optional - for nested replies)
- `createdAt`: Date

### 4. `Like` Model
- `id`: Int/UUID (@id)
- `userId`: Int/UUID (Relation -> `User`, Required)
- `entityId`: Int/UUID (Relation -> `Post` or `Comment`, Required)
- `entityType`: String (Enum: `['post', 'comment']`, Required)
- `createdAt`: Date
*(Note: A compound unique index on `[userId, entityId, entityType]` enforces that a user can only like an item once)*

## Documentation Index
To start coding on your specific feature right away, refer to your assigned Functional Requirements Document (FRD). The work has been structured to prevent blocking between teams.

1. **[Project Plan & Checklist](./01_Project_Plan_and_Checklist.md)**: Overall transition timeline and checklist.
2. **[FRD - Authentication](./02_FRD_Authentication.md)**: Registration & Login flows.
3. **[FRD - Feed & Posts](./03_FRD_Feed_and_Posts.md)**: Displaying and creating posts.
4. **[FRD - Social Interactions](./04_FRD_Social_Interactions.md)**: Likes, Comments, and Replies.
5. **[FRD - Post Visibility](./05_FRD_Post_Visibility.md)**: Public vs. Private posts.
