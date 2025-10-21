# API Contract: Task Management

**Base URL**: `/api/v1/tasks`  
**Authentication**: JWT Bearer token required for all endpoints

---

## Endpoints

### 1. POST /tasks

**Description**: Create a new task (draft or active)  
**User Story**: US1 - Task Posting and Discovery  
**Requires**: Role raiser or both

**Request Body**:
```json
{
  "title": "Help me renew my visa at Immigration Office",
  "description": "I need someone to accompany me to the Immigration Office in Wan Chai to help with visa renewal. Need translation from English to Cantonese.",
  "category": "visa_help",
  "location": "Immigration Tower, Wan Chai",
  "latitude": 22.2777,
  "longitude": 114.1722,
  "rewardAmount": 200.00,
  "preferredLanguage": "zh-HK",
  "preferredCompletionDate": "2025-10-25T14:00:00Z",
  "status": "active"  // or "draft"
}
```

**Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "raiserId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Help me renew my visa at Immigration Office",
    "description": "I need someone to accompany me...",
    "category": "visa_help",
    "location": "Immigration Tower, Wan Chai",
    "latitude": 22.2777,
    "longitude": 114.1722,
    "rewardAmount": 200.00,
    "preferredLanguage": "zh-HK",
    "preferredCompletionDate": "2025-10-25T14:00:00Z",
    "status": "active",
    "flaggedContent": false,
    "postedAt": "2025-10-20T10:30:00Z",
    "createdAt": "2025-10-20T10:30:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Reward amount must be between HKD 50 and HKD 5000",
    "fields": {
      "rewardAmount": "Value 30 is below minimum 50"
    }
  }
}
```

---

### 2. GET /tasks

**Description**: Browse available tasks (for solvers) or own tasks (for raisers)  
**User Story**: US1 - Task Posting and Discovery

**Query Parameters**:
- `status` (string): Filter by status (active, in_progress, completed)
- `category` (string): Filter by category
- `minReward` (number): Minimum reward amount
- `maxReward` (number): Maximum reward amount
- `language` (string): Preferred language
- `latitude` (number): User location latitude
- `longitude` (number): User location longitude
- `radius` (number): Search radius in km (default: 10)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Example Request**:
```
GET /tasks?status=active&category=visa_help&latitude=22.2777&longitude=114.1722&radius=5&page=1&limit=20
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "title": "Help me renew my visa at Immigration Office",
        "description": "I need someone to accompany me...",
        "category": "visa_help",
        "location": "Immigration Tower, Wan Chai",
        "rewardAmount": 200.00,
        "preferredLanguage": "zh-HK",
        "preferredCompletionDate": "2025-10-25T14:00:00Z",
        "status": "active",
        "distanceKm": 2.3,
        "raiser": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "firstName": "John",
          "lastName": "Doe",
          "profilePhotoUrl": "https://s3.amazonaws.com/...",
          "languagesSpoken": ["en", "zh-CN"]
        },
        "postedAt": "2025-10-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 3. GET /tasks/{taskId}

**Description**: Get task details  
**User Story**: US1 - Task Posting and Discovery

**Path Parameters**:
- `taskId` (UUID): Task ID

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "raiserId": "550e8400-e29b-41d4-a716-446655440000",
    "solverId": null,
    "title": "Help me renew my visa at Immigration Office",
    "description": "I need someone to accompany me to the Immigration Office...",
    "category": "visa_help",
    "location": "Immigration Tower, Wan Chai",
    "latitude": 22.2777,
    "longitude": 114.1722,
    "rewardAmount": 200.00,
    "preferredLanguage": "zh-HK",
    "preferredCompletionDate": "2025-10-25T14:00:00Z",
    "status": "active",
    "raiser": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "profilePhotoUrl": "https://s3.amazonaws.com/...",
      "languagesSpoken": ["en", "zh-CN"],
      "verificationStatus": "verified"
    },
    "recommendedSolvers": [
      {
        "solverId": "650e8400-e29b-41d4-a716-446655440001",
        "matchScore": 87.5,
        "explanation": "Nearby (2.3 km) + High rating (4.8★) + 5 visa tasks completed + Speaks Cantonese",
        "distanceKm": 2.3
      }
    ],
    "postedAt": "2025-10-20T10:30:00Z",
    "createdAt": "2025-10-20T10:30:00Z"
  }
}
```

---

### 4. PUT /tasks/{taskId}

**Description**: Update task details (only if status = draft or active, and no solver assigned)  
**User Story**: US1 - Task Posting and Discovery  
**Requires**: Must be task raiser

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "rewardAmount": 250.00,
  "preferredCompletionDate": "2025-10-26T14:00:00Z"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "title": "Updated title",
    "rewardAmount": 250.00,
    "updatedAt": "2025-10-20T11:00:00Z"
  }
}
```

**Response 403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_EDITABLE",
    "message": "Cannot edit task after solver has been assigned"
  }
}
```

---

### 5. POST /tasks/{taskId}/accept

**Description**: Solver accepts a task  
**User Story**: US1 - Task Posting and Discovery  
**Requires**: Role solver or both, KYC status = approved

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "solverId": "650e8400-e29b-41d4-a716-446655440001",
    "status": "in_progress",
    "acceptedAt": "2025-10-20T11:30:00Z",
    "message": "Task accepted. Task raiser will be notified to proceed with payment."
  }
}
```

**Response 403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "KYC_REQUIRED",
    "message": "You must complete identity verification before accepting tasks"
  }
}
```

---

### 6. POST /tasks/{taskId}/complete

**Description**: Task raiser marks task as complete  
**User Story**: US2 - Secure Payment and Escrow  
**Requires**: Must be task raiser, status must be in_progress

**Request Body**:
```json
{
  "completionNotes": "Solver was very helpful and patient. Task completed successfully."
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "status": "completed",
    "completedAt": "2025-10-20T15:00:00Z",
    "paymentReleased": true,
    "message": "Task marked complete. Payment released to solver."
  }
}
```

---

### 7. POST /tasks/{taskId}/cancel

**Description**: Cancel a task  
**Requires**: Must be task raiser, status must be draft or active (not in_progress)

**Request Body**:
```json
{
  "reason": "No longer needed"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "status": "cancelled",
    "message": "Task cancelled successfully"
  }
}
```

---

### 8. GET /tasks/my-tasks

**Description**: Get tasks created or assigned to current user  
**Query Parameters**:
- `role` (string): "raiser" or "solver"
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "title": "Help me renew my visa",
        "status": "in_progress",
        "rewardAmount": 200.00,
        "solver": {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "firstName": "Alice",
          "lastName": "Wong",
          "profilePhotoUrl": "https://s3.amazonaws.com/..."
        },
        "postedAt": "2025-10-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

## Task Categories

```javascript
const TASK_CATEGORIES = [
  "translation",
  "visa_help",
  "navigation",
  "shopping",
  "admin_help",
  "other"
];
```

## Task Status Flow

```
draft → active → in_progress → completed
                       ↓
                   disputed → resolved → completed
                       ↓
                   cancelled
```

## Validation Rules

- **Title**: 5-200 characters
- **Description**: 20-2000 characters
- **Reward Amount**: HKD 50 - HKD 5000
- **Location**: Required for active tasks
- **Prohibited Content**: Violence, illegal activities, adult content (auto-flagged)

## Rate Limiting

- **Create Task**: 10 per hour per user
- **Browse Tasks**: 100 per minute per user
- **Accept Task**: 5 per hour per user (prevent spam accepts)
