# API Contract: Rating & Reputation System

**Base URL**: `/api/v1/ratings`  
**Authentication**: JWT Bearer token required for all endpoints

---

## Endpoints

### 1. POST /ratings

**Description**: Submit a rating after task completion  
**User Story**: US3 - Mutual Rating and Reputation Building  
**Requires**: Task must be completed, user must be raiser or solver of the task

**Request Body**:
```json
{
  "taskId": "750e8400-e29b-41d4-a716-446655440002",
  "starRating": 5,
  "comment": "Very helpful and patient! Completed the task perfectly."
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "id": "950e8400-e29b-41d4-a716-446655440004",
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "raterId": "550e8400-e29b-41d4-a716-446655440000",
    "ratedUserId": "650e8400-e29b-41d4-a716-446655440001",
    "starRating": 5,
    "comment": "Very helpful and patient! Completed the task perfectly.",
    "createdAt": "2025-10-20T15:05:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_RATED",
    "message": "You have already rated this task"
  }
}
```

**Response 403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_COMPLETED",
    "message": "Can only rate tasks that are completed"
  }
}
```

---

### 2. GET /ratings/task/{taskId}

**Description**: Get all ratings for a specific task  
**User Story**: US3 - View mutual ratings

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "ratings": [
      {
        "id": "950e8400-e29b-41d4-a716-446655440004",
        "rater": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe",
          "role": "raiser"
        },
        "ratedUser": {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "firstName": "Alice",
          "lastName": "Wong",
          "role": "solver"
        },
        "starRating": 5,
        "comment": "Very helpful and patient! Completed the task perfectly.",
        "createdAt": "2025-10-20T15:05:00Z"
      },
      {
        "id": "960e8400-e29b-41d4-a716-446655440005",
        "rater": {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "firstName": "Alice",
          "lastName": "Wong",
          "role": "solver"
        },
        "ratedUser": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe",
          "role": "raiser"
        },
        "starRating": 5,
        "comment": "Very clear communication and respectful. Great experience!",
        "createdAt": "2025-10-20T15:10:00Z"
      }
    ],
    "mutualRatingsComplete": true
  }
}
```

---

### 3. GET /ratings/user/{userId}

**Description**: Get all ratings received by a user  
**User Story**: US3 - Public rating visibility (FR-026)

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): "recent" or "rating" (default: "recent")

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "userId": "650e8400-e29b-41d4-a716-446655440001",
    "user": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "firstName": "Alice",
      "lastName": "Wong",
      "profilePhotoUrl": "https://s3.amazonaws.com/..."
    },
    "ratingsSummary": {
      "averageRating": 4.8,
      "totalRatings": 15,
      "distribution": {
        "5stars": 12,
        "4stars": 2,
        "3stars": 1,
        "2stars": 0,
        "1star": 0
      }
    },
    "ratings": [
      {
        "id": "950e8400-e29b-41d4-a716-446655440004",
        "rater": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "task": {
          "id": "750e8400-e29b-41d4-a716-446655440002",
          "title": "Help me renew my visa",
          "category": "visa_help"
        },
        "starRating": 5,
        "comment": "Very helpful and patient! Completed the task perfectly.",
        "helpfulVotes": 3,
        "createdAt": "2025-10-20T15:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 4. PUT /ratings/{ratingId}

**Description**: Update a rating (within 24 hours of creation)  
**User Story**: US3 - Allow rating edits  
**Requires**: Must be original rater

**Request Body**:
```json
{
  "starRating": 4,
  "comment": "Updated: Good service, slight delay but overall helpful"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "950e8400-e29b-41d4-a716-446655440004",
    "starRating": 4,
    "comment": "Updated: Good service, slight delay but overall helpful",
    "updatedAt": "2025-10-20T16:00:00Z"
  }
}
```

**Response 403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "EDIT_WINDOW_EXPIRED",
    "message": "Ratings can only be edited within 24 hours of creation"
  }
}
```

---

### 5. POST /ratings/{ratingId}/helpful

**Description**: Mark a rating as helpful  
**User Story**: US3 - Community engagement

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "ratingId": "950e8400-e29b-41d4-a716-446655440004",
    "helpfulVotes": 4
  }
}
```

---

### 6. POST /ratings/{ratingId}/flag

**Description**: Flag a rating as inappropriate  
**User Story**: US5 - Content moderation

**Request Body**:
```json
{
  "reason": "Contains offensive language"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "ratingId": "950e8400-e29b-41d4-a716-446655440004",
    "flagged": true,
    "message": "Rating flagged for admin review"
  }
}
```

---

### 7. GET /ratings/pending

**Description**: Get tasks awaiting rating from current user  
**User Story**: US3 - Rating reminders

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "pendingRatings": [
      {
        "taskId": "760e8400-e29b-41d4-a716-446655440006",
        "task": {
          "id": "760e8400-e29b-41d4-a716-446655440006",
          "title": "Shopping assistance at supermarket",
          "completedAt": "2025-10-19T14:00:00Z"
        },
        "userToRate": {
          "id": "670e8400-e29b-41d4-a716-446655440007",
          "firstName": "Bob",
          "lastName": "Lee",
          "role": "solver"
        },
        "daysSinceCompletion": 1
      }
    ],
    "total": 1
  }
}
```

---

## Rating Rules

### Validation
- **Star Rating**: 1-5 (integer only)
- **Comment**: Optional, 0-500 characters
- **Timing**: Can only rate after task status = "completed"
- **Uniqueness**: Each user can only rate once per task (one raiser → solver, one solver → raiser)

### Edit Window
- Ratings can be edited within 24 hours of creation
- Star rating and comment both editable
- Edit history not shown to preserve trust

### Aggregation Logic

**Average Rating Calculation**:
```javascript
newAverage = (oldAverage × oldCount + newRating) / (oldCount + 1)
```

**Tier Promotion (FR-024)**:
```javascript
if (completedTaskCount === 11) {
  tierLevel = 'silver';
  commissionRate = 20.00;
}
if (completedTaskCount === 51) {
  tierLevel = 'gold';
  commissionRate = 10.00;
}
```

**Quality Review Trigger (FR-025)**:
```javascript
if (averageRating < 3.0) {
  triggerQualityReview();
  sendWarningNotification();
}
```

---

## Rating Distribution

**Display Format**:
```
★★★★★ (5 stars): ████████████ 80% (12)
★★★★☆ (4 stars): ███░░░░░░░░░ 13% (2)
★★★☆☆ (3 stars): ██░░░░░░░░░░  7% (1)
★★☆☆☆ (2 stars): ░░░░░░░░░░░░  0% (0)
★☆☆☆☆ (1 star):  ░░░░░░░░░░░░  0% (0)
```

---

## Tier Levels & Benefits

| Tier | Tasks Completed | Commission Rate | Badge Color |
|------|----------------|-----------------|-------------|
| Bronze | 0-10 | 30% | 🥉 Bronze |
| Silver | 11-50 | 20% | 🥈 Silver |
| Gold | 50+ | 10% | 🥇 Gold |

**Auto-promotion**: Triggered immediately when task count threshold reached (FR-024)

---

## Public Visibility (FR-026)

**Public Information**:
- Star rating and comment text
- Rater first name (last name hidden for privacy)
- Task category (not full task details if sensitive)
- Rating date
- Helpful vote count

**Hidden Information**:
- Rater's full profile (unless they choose to share)
- Task-specific location details
- Payment amounts

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ALREADY_RATED | 400 | User already rated this task |
| TASK_NOT_COMPLETED | 403 | Task must be completed before rating |
| NOT_TASK_PARTICIPANT | 403 | User not involved in this task |
| EDIT_WINDOW_EXPIRED | 403 | Cannot edit rating after 24 hours |
| INVALID_RATING | 400 | Star rating must be 1-5 |
| COMMENT_TOO_LONG | 400 | Comment exceeds 500 characters |

---

## Rate Limiting

- **Submit Rating**: 20 per hour per user
- **View Ratings**: 100 per minute per user
- **Mark Helpful**: 50 per hour per user
- **Flag Rating**: 10 per hour per user (prevent abuse)
