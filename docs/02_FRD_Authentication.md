# FRD: Authentication & Authorization (Backend API)

**Assignee Details:** Backend Developer (Fastify/Node.js)

## 1. Feature Goal
Implement secure API endpoints for user registration and login. The backend must be completely decoupled from the frontend, meaning no UI logic, redirects, or views should be handled here.

## 2. Data Model
### `User` Table
- `_id`: Integer (Primary Key) or UUID
- `firstName`: String (Required)
- `lastName`: String (Required)
- `email`: String (Required, Unique, Indexed)
- `password`: String (Hashed)
- `createdAt`: Date

## 3. Endpoints & Business Logic

### POST `/api/auth/register`
**Request Body (`application/json`):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Business Logic:**
1. **Validation**: Check that all 4 fields are present.
2. **Conflict Check**: Use Prisma to query if the `email` already exists (`prisma.user.findUnique`). If yes, return `409 Conflict`.
3. **Security**: Hash the `password` using `bcrypt` (salt rounds: 10).
4. **Persistence**: Insert the new user via `prisma.user.create`.
**Response (`201 Created`):**
```json
{
  "message": "User successfully registered",
  "userId": 1
}
```

### POST `/api/auth/login`
**Request Body (`application/json`):**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Business Logic:**
1. Fetch user from DB using `prisma.user.findUnique({ where: { email } })`. If none found, return `401 Unauthorized`.
2. Compare the provided `password` string with the stored hash using `bcrypt`.
3. Upon success, generate a JSON Web Token (JWT) payload containing `{ id: user._id }`.
**Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR... (JWT encoded string)",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## 4. JWT Middleware Requirement
- Create a reusable middleware for Fastify that extracts the `Bearer <token>` from the HTTP `Authorization` header.
- Decode the JWT, verify the signature, and attach the decoded `id` to the request object (`req.user`) for downstream use in protected routes.
