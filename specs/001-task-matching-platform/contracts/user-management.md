# API Contract: User Management & Authentication

**Base URL**: `/api/v1`  
**Authentication**: JWT Bearer token (except register/login)

---

## Endpoints

### 1. POST /auth/register

**Description**: Register a new user account  
**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "raiser",  // or "solver" or "both"
  "phoneNumber": "+85291234567",
  "preferredLanguage": "en",  // "en", "zh-HK", "zh-CN"
  "languagesSpoken": ["en", "zh-CN"]
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "raiser",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpiresIn": 900  // 15 minutes
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already registered"
  }
}
```

---

### 2. POST /auth/login

**Description**: Login with email and password  
**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "raiser",
    "verificationStatus": "verified",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpiresIn": 900
  }
}
```

**Response 401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

---

### 3. POST /auth/refresh-token

**Description**: Refresh access token using refresh token  
**Authentication**: Refresh token in body

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpiresIn": 900
  }
}
```

---

### 4. GET /users/me

**Description**: Get current user profile  
**Authentication**: Required

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "raiser",
    "profilePhotoUrl": "https://s3.amazonaws.com/webond/profiles/abc123.jpg",
    "preferredLanguage": "en",
    "location": "Kowloon",
    "bio": "International student from France",
    "languagesSpoken": ["en", "zh-CN", "fr"],
    "verificationStatus": "verified",
    "accountStatus": "active",
    "createdAt": "2025-10-15T10:30:00Z"
  }
}
```

---

### 5. PUT /users/me

**Description**: Update current user profile  
**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "location": "Hong Kong Island",
  "latitude": 22.2793,
  "longitude": 114.1628,
  "languagesSpoken": ["en", "zh-CN", "fr"],
  "preferredLanguage": "zh-HK"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio",
    "updatedAt": "2025-10-20T14:25:00Z"
  }
}
```

---

### 6. POST /users/me/profile-photo

**Description**: Request signed URL for profile photo upload  
**Authentication**: Required

**Request Body**:
```json
{
  "fileName": "profile.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048576  // bytes
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/webond/...",
    "photoKey": "profiles/550e8400-e29b-41d4-a716-446655440000/profile.jpg",
    "expiresIn": 300  // 5 minutes
  }
}
```

---

### 7. GET /users/{userId}

**Description**: Get public user profile  
**Authentication**: Required

**Path Parameters**:
- `userId` (UUID): User ID

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "profilePhotoUrl": "https://s3.amazonaws.com/...",
    "location": "Kowloon",
    "bio": "International student from France",
    "languagesSpoken": ["en", "zh-CN", "fr"],
    "verificationStatus": "verified",
    "joinedDate": "2025-10-15T10:30:00Z"
  }
}
```

---

### 8. POST /solver/verification

**Description**: Submit KYC verification documents  
**Authentication**: Required (role: solver or both)

**Request Body**:
```json
{
  "idDocumentUrl": "s3://webond/kyc/abc123/id.jpg",  // S3 key after upload
  "selfieUrl": "s3://webond/kyc/abc123/selfie.jpg"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "kycStatus": "submitted",
    "message": "Verification documents submitted. Review within 24 hours."
  }
}
```

---

### 9. GET /solver/profile/{solverId}

**Description**: Get solver profile with stats  
**Authentication**: Required

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "user": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "firstName": "Alice",
      "lastName": "Wong",
      "profilePhotoUrl": "https://s3.amazonaws.com/...",
      "location": "Kowloon",
      "languagesSpoken": ["en", "zh-HK", "zh-CN"],
      "bio": "Local Hong Kong resident, happy to help!"
    },
    "kycStatus": "approved",
    "completedTaskCount": 15,
    "averageRating": 4.8,
    "totalRatingsReceived": 15,
    "tierLevel": "silver",
    "commissionRate": 20.00,
    "specializationTags": ["visa_help", "translation", "navigation"],
    "verifiedBadge": true
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | User doesn't have permission |
| USER_NOT_FOUND | 404 | User ID doesn't exist |
| EMAIL_EXISTS | 409 | Email already registered |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- **Register/Login**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per minute per user
- **File Upload URLs**: 10 requests per hour per user
