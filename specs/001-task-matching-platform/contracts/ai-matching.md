# API Contract: AI Matching & Recommendations

**Base URL**: `/api/v1/ai`  
**Authentication**: JWT Bearer token required for all endpoints

---

## Endpoints

### 1. POST /ai/match

**Description**: Generate AI-powered solver recommendations for a task  
**User Story**: US4 - AI Matching Optimization  
**Note**: Results cached for 5 minutes

**Request Body**:
```json
{
  "taskId": "750e8400-e29b-41d4-a716-446655440002"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "recommendations": [
      {
        "rank": 1,
        "solver": {
          "id": "650e8400-e29b-41d4-a716-446655440001",
          "firstName": "Alice",
          "lastName": "Wong",
          "profilePhotoUrl": "https://s3.amazonaws.com/...",
          "averageRating": 4.8,
          "completedTaskCount": 15,
          "tierLevel": "silver",
          "languagesSpoken": ["en", "zh-HK", "zh-CN"],
          "location": "Kowloon",
          "verifiedBadge": true
        },
        "matchScore": 87.5,
        "scores": {
          "proximity": 92.0,
          "rating": 96.0,
          "experience": 75.0,
          "language": 100.0
        },
        "explanation": "Nearby (2.3 km) + High rating (4.8★) + 5 visa tasks completed + Speaks Cantonese",
        "distanceKm": 2.3,
        "relevantTasksCompleted": 5,
        "aiConfidence": 85.0
      },
      {
        "rank": 2,
        "solver": {
          "id": "750e8400-e29b-41d4-a716-446655440005",
          "firstName": "David",
          "lastName": "Chan",
          "profilePhotoUrl": "https://s3.amazonaws.com/...",
          "averageRating": 4.6,
          "completedTaskCount": 8,
          "tierLevel": "bronze",
          "languagesSpoken": ["en", "zh-HK"],
          "location": "Hong Kong Island",
          "verifiedBadge": true
        },
        "matchScore": 78.2,
        "scores": {
          "proximity": 65.0,
          "rating": 92.0,
          "experience": 60.0,
          "language": 100.0
        },
        "explanation": "Medium distance (8.5 km) + Good rating (4.6★) + 3 visa tasks completed + Speaks Cantonese",
        "distanceKm": 8.5,
        "relevantTasksCompleted": 3,
        "aiConfidence": 75.0
      }
    ],
    "totalRecommendations": 5,
    "generatedAt": "2025-10-20T10:35:00Z",
    "cachedUntil": "2025-10-20T10:40:00Z"
  }
}
```

---

### 2. GET /ai/match/{taskId}

**Description**: Get cached AI recommendations for a task  
**User Story**: US4 - AI Matching Optimization

**Query Parameters**:
- `refresh` (boolean): Force regenerate recommendations (default: false)

**Response 200 OK**: Same as POST /ai/match

**Response 404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NO_RECOMMENDATIONS",
    "message": "No recommendations found. Generate new recommendations."
  }
}
```

---

### 3. POST /ai/explain-match

**Description**: Get detailed explanation for a specific solver match  
**User Story**: US4 - AI transparency

**Request Body**:
```json
{
  "taskId": "750e8400-e29b-41d4-a716-446655440002",
  "solverId": "650e8400-e29b-41d4-a716-446655440001"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "solverId": "650e8400-e29b-41d4-a716-446655440001",
    "matchScore": 87.5,
    "breakdown": {
      "proximity": {
        "score": 92.0,
        "weight": 30,
        "contribution": 27.6,
        "details": {
          "distanceKm": 2.3,
          "maxDistanceKm": 50,
          "calculation": "(1 - 2.3/50) × 100 = 95.4, capped proximity bonus"
        }
      },
      "rating": {
        "score": 96.0,
        "weight": 30,
        "contribution": 28.8,
        "details": {
          "averageRating": 4.8,
          "totalRatings": 15,
          "calculation": "(4.8/5.0) × 100 = 96.0"
        }
      },
      "experience": {
        "score": 75.0,
        "weight": 25,
        "contribution": 18.75,
        "details": {
          "totalTasksCompleted": 15,
          "relevantCategory": "visa_help",
          "relevantTasksCompleted": 5,
          "calculation": "min((5/10) × 100 + bonus, 100) = 75.0"
        }
      },
      "language": {
        "score": 100.0,
        "weight": 15,
        "contribution": 15.0,
        "details": {
          "taskPreferredLanguage": "zh-HK",
          "solverLanguages": ["en", "zh-HK", "zh-CN"],
          "exactMatch": true,
          "calculation": "Exact match = 100"
        }
      }
    },
    "totalScore": 87.5,
    "aiConfidence": 85.0,
    "recommendation": "Highly recommended match"
  }
}
```

---

### 4. GET /ai/solver-stats/{solverId}

**Description**: Get solver's AI matching statistics  
**User Story**: US4 - Transparency for solvers

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "solverId": "650e8400-e29b-41d4-a716-446655440001",
    "totalRecommendations": 45,
    "totalAccepted": 15,
    "acceptanceRate": 33.3,
    "averageMatchScore": 82.5,
    "categoryExpertise": [
      {
        "category": "visa_help",
        "tasksCompleted": 5,
        "averageRating": 4.9
      },
      {
        "category": "translation",
        "tasksCompleted": 7,
        "averageRating": 4.7
      }
    ],
    "improvementSuggestions": [
      "Complete 1 more task to reach Silver tier (20% commission)",
      "Expand service areas to increase proximity scores"
    ]
  }
}
```

---

## Matching Algorithm Details

### Score Calculation Formula

```
matchScore = (proximityScore × 0.30) + 
             (ratingScore × 0.30) + 
             (experienceScore × 0.25) + 
             (languageScore × 0.15)
```

### Component Scoring

#### 1. Proximity Score (30% weight)
```
distanceKm = haversine(task.location, solver.location)
proximityScore = (1 - distanceKm / maxDistance) × 100
maxDistance = 50 km (Hong Kong)
```

#### 2. Rating Score (30% weight)
```
ratingScore = (averageRating / 5.0) × 100
If totalRatings < 3: apply new solver penalty (-10%)
```

#### 3. Experience Score (25% weight)
```
relevantTasks = tasks completed in same category
experienceScore = min((relevantTasks / 10) × 100 + bonuses, 100)

Bonuses:
- High completion rate (>90%): +10
- Fast average completion time: +5
- Zero disputes: +5
```

#### 4. Language Score (15% weight)
```
if exactMatch(task.preferredLanguage, solver.languages):
  languageScore = 100
elif partialMatch(task.preferredLanguage, solver.languages):
  languageScore = 70
else:
  languageScore = 0
```

### AI Confidence Calculation

```
confidence = base_confidence × data_quality_factor

base_confidence = matchScore

data_quality_factor adjustments:
- Solver has < 3 ratings: × 0.8
- Task location missing: × 0.9
- Solver last active > 30 days ago: × 0.85
```

### Fallback Behavior

**If AI confidence < 60%**:
- Include manual search option (FR-015)
- Show broader range of solvers (top 10 instead of top 5)
- Display confidence warning to user

---

## Caching Strategy

- **Cache Key**: `ai:recommendations:{taskId}`
- **TTL**: 5 minutes
- **Invalidation Triggers**:
  - Task details updated (location, category, language)
  - New solver completes KYC verification nearby
  - Solver rating updated
- **Regeneration**: Automatic on cache miss or manual refresh

---

## Performance Requirements

- **Response Time**: < 3 seconds (SC-009)
- **Recommendation Count**: 3-5 solvers (FR-012)
- **Cache Hit Rate**: Target 70%+ (reduces AI service load)

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NO_SOLVERS_AVAILABLE | 404 | No verified solvers match criteria |
| LOW_CONFIDENCE | 200 | Recommendations generated but confidence < 60% |
| AI_SERVICE_UNAVAILABLE | 503 | Python ML service down |
| TASK_NOT_FOUND | 404 | Task ID doesn't exist |

---

## Rate Limiting

- **Generate Recommendations**: 20 per hour per user
- **Get Cached Recommendations**: 100 per minute per user
- **Explain Match**: 30 per hour per user
