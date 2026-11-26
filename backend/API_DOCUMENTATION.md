# WorkSpot Backend API Documentation

## 1. Project Overview

WorkSpot is a Workspace & Power Status Aggregator that helps users discover suitable workspaces based on factors such as electricity availability, internet quality, seating availability, pricing, and location.

This document describes the authentication and user management endpoints of the WorkSpot backend.

## 2. Base URL

```text
http://localhost:5000
```

## 3. Authentication

WorkSpot uses JSON Web Tokens (JWT) to authenticate users.

After successfully logging in, the API returns a token. Protected endpoints require this token in the Authorization header.

**Authorization format:**

```text
Bearer YOUR_JWT_TOKEN
```

## 4. User Roles

The system currently supports three user roles:

- `worker` – Default role assigned to newly registered users.
- `manager` – Users responsible for managing workspace information.
- `admin` – Users with administrative privileges.

## 5. User Registration

Creates a new WorkSpot user account.

**Endpoint**

```http
POST /api/auth/register
```

**Full URL**

```text
http://localhost:5000/api/auth/register
```

**Request Body**

Content-Type: `application/json`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Successful Response — 201 Created**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

**Possible Error Responses**

| Status | Meaning                            |
| ------ | ---------------------------------- |
| 400    | Required fields missing or invalid |
| 409    | Email already registered           |
| 500    | Server error                       |

Passwords are hashed using bcrypt before being stored in the database.

## 6. User Login

Authenticates an existing user and generates a JWT.

**Endpoint**

```http
POST /api/auth/login
```

**Full URL**

```text
http://localhost:5000/api/auth/login
```

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Successful Response — 200 OK**

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

**Possible Error Responses**

| Status | Meaning                   |
| ------ | ------------------------- |
| 400    | Required fields missing   |
| 401    | Invalid email or password |
| 500    | Server error              |

The JWT expires after 1 day.

## 7. Get User Profile

Retrieves the profile of the currently authenticated user.

**Endpoint**

```http
GET /api/users/profile
```

**Full URL**

```text
http://localhost:5000/api/users/profile
```

**Authorization**

Requires a valid JWT Bearer Token.

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

**Successful Response — 200 OK**

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker",
    "createdAt": "2026-11-26T10:00:00.000Z"
  }
}
```

**Possible Error Responses**

| Status | Meaning                  |
| ------ | ------------------------ |
| 401    | Missing or invalid token |
| 404    | User not found           |
| 500    | Server error             |

## 8. Update User Profile

Updates the name or email of the currently authenticated user.

**Endpoint**

```http
PUT /api/users/profile
```

**Full URL**

```text
http://localhost:5000/api/users/profile
```

**Authorization**

Requires a valid JWT Bearer Token.

**Request Body**

At least one of `name` or `email` must be provided.

Example — Update name:

```json
{
  "name": "John Smith"
}
```

Example — Update email:

```json
{
  "email": "johnsmith@example.com"
}
```

Example — Update both:

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Successful Response — 200 OK**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "USER_ID",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "worker"
  }
}
```

**Possible Error Responses**

| Status | Meaning                                       |
| ------ | --------------------------------------------- |
| 400    | Invalid input or no supported fields provided |
| 401    | Missing or invalid token                      |
| 404    | User not found                                |
| 409    | Email already registered                      |
| 500    | Server error                                  |

**Important:** Users cannot change their own role through this endpoint. Only the name and email fields are accepted for updates.

## 9. Authentication Middleware

WorkSpot uses authentication middleware to protect routes that require users to be logged in.

**Middleware file:**

```text
middleware/authMiddleware.js
```

**How it works:**

1. Reads the JWT from the Authorization header.
2. Checks whether the token exists.
3. Verifies the token using the JWT secret.
4. Retrieves the user from MongoDB using the ID stored in the token.
5. Attaches the authenticated user to `req.user`.
6. Allows the request to continue using `next()`.

**Possible Error Responses**

| Status | Meaning                  |
| ------ | ------------------------ |
| 401    | No token provided        |
| 401    | Invalid or expired token |
| 401    | User no longer exists    |

## 10. Role-Based Authorization Middleware

WorkSpot uses role-based access control (RBAC) to restrict access to certain routes based on user roles.

**Middleware file:**

```text
middleware/roleMiddleware.js
```

**Usage Example**

```javascript
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

router.get("/admin-dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    message: "Admin access granted",
  });
});
```

**How it works:**

1. `protect` verifies the user's JWT and authenticates the user.
2. `authorizeRoles()` checks whether the authenticated user's role is allowed.
3. If the role is allowed, the request continues.
4. If the role is not allowed, the API returns `403 Forbidden`.

**Possible Responses**

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| 401    | User is not authenticated                  |
| 403    | User is authenticated but lacks permission |
| 200    | Access granted                             |

## 11. Integration Notes for Other Developers

When creating protected endpoints:

- Import `protect` from `middleware/authMiddleware.js`.
- Import `authorizeRoles` from `middleware/roleMiddleware.js` when role restrictions are required.
- Always place `protect` before `authorizeRoles`.
- Use `req.user` to access the authenticated user's information.
- Never allow ordinary users to modify their own role through profile updates.

**Example:**

```javascript
router.get(
  "/manager-dashboard",
  protect,
  authorizeRoles("manager"),
  controllerFunction,
);
```

This allows only authenticated managers to access the route.
