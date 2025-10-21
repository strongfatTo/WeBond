# API Contract: Payment & Escrow

**Base URL**: `/api/v1/payments`  
**Authentication**: JWT Bearer token required for all endpoints

---

## Endpoints

### 1. POST /payments/create

**Description**: Create payment transaction for task (moves to escrow)  
**User Story**: US2 - Secure Payment and Escrow  
**Requires**: Must be task raiser, task status must be in_progress

**Request Body**:
```json
{
  "taskId": "750e8400-e29b-41d4-a716-446655440002",
  "paymentMethod": "fps",  // or "payme"
  "returnUrl": "webond://payment-success"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "transactionId": "850e8400-e29b-41d4-a716-446655440003",
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "grossAmount": 200.00,
    "platformCommissionRate": 30.00,
    "platformCommissionAmount": 60.00,
    "netAmountToSolver": 140.00,
    "paymentProviderUrl": "https://fps.hkma.gov.hk/pay/abc123",
    "status": "pending",
    "expiresAt": "2025-10-20T12:00:00Z"
  }
}
```

---

### 2. GET /payments/breakdown

**Description**: Get payment breakdown before creating transaction  
**User Story**: US2 - Secure Payment and Escrow (Transparent pricing)

**Query Parameters**:
- `taskId` (UUID): Task ID
- `solverId` (UUID): Solver ID (to calculate tier-based commission)

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "taskReward": 200.00,
    "solverTier": "bronze",
    "platformCommissionRate": 30.00,
    "platformCommissionAmount": 60.00,
    "netAmountToSolver": 140.00,
    "currency": "HKD",
    "breakdown": [
      {
        "item": "Task Reward",
        "amount": 200.00
      },
      {
        "item": "Platform Fee (Bronze tier: 30%)",
        "amount": -60.00
      },
      {
        "item": "Solver Receives",
        "amount": 140.00
      }
    ]
  }
}
```

---

### 3. POST /payments/{transactionId}/confirm

**Description**: Confirm payment was completed with payment provider  
**User Story**: US2 - Secure Payment and Escrow

**Request Body**:
```json
{
  "paymentProviderReference": "FPS-20251020-ABC123",
  "paymentStatus": "success"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "transactionId": "850e8400-e29b-41d4-a716-446655440003",
    "status": "escrowed",
    "escrowedAt": "2025-10-20T11:35:00Z",
    "message": "Payment successfully moved to escrow. Funds will be released when task is completed."
  }
}
```

---

### 4. POST /payments/{transactionId}/release

**Description**: Release escrowed funds to solver (auto-called when task marked complete)  
**User Story**: US2 - Secure Payment and Escrow  
**Internal**: Triggered by task completion, not directly called by user

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "transactionId": "850e8400-e29b-41d4-a716-446655440003",
    "status": "released",
    "releasedAt": "2025-10-20T15:00:05Z",
    "netAmountToSolver": 140.00,
    "message": "Payment released to solver successfully"
  }
}
```

---

### 5. POST /payments/{transactionId}/refund

**Description**: Refund payment to task raiser (auto after 14 days if incomplete)  
**User Story**: US2 - Edge case handling

**Request Body**:
```json
{
  "reason": "Task not completed within deadline"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "transactionId": "850e8400-e29b-41d4-a716-446655440003",
    "status": "refunded",
    "refundedAt": "2025-11-03T10:00:00Z",
    "refundAmount": 200.00,
    "message": "Payment refunded to task raiser"
  }
}
```

---

### 6. GET /payments/transactions

**Description**: Get user's payment history  
**Query Parameters**:
- `role` (string): "payer" or "payee"
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "850e8400-e29b-41d4-a716-446655440003",
        "task": {
          "id": "750e8400-e29b-41d4-a716-446655440002",
          "title": "Help me renew my visa"
        },
        "grossAmount": 200.00,
        "platformCommissionAmount": 60.00,
        "netAmountToSolver": 140.00,
        "status": "released",
        "createdAt": "2025-10-20T11:30:00Z",
        "releasedAt": "2025-10-20T15:00:05Z"
      }
    ],
    "summary": {
      "totalPaid": 600.00,
      "totalReceived": 420.00,
      "pendingEscrow": 0.00
    },
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

### 7. GET /payments/{transactionId}

**Description**: Get transaction details  
**Requires**: Must be payer or payee

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "850e8400-e29b-41d4-a716-446655440003",
    "taskId": "750e8400-e29b-41d4-a716-446655440002",
    "payer": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe"
    },
    "payee": {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "firstName": "Alice",
      "lastName": "Wong"
    },
    "grossAmount": 200.00,
    "platformCommissionRate": 30.00,
    "platformCommissionAmount": 60.00,
    "netAmountToSolver": 140.00,
    "paymentProviderReference": "FPS-20251020-ABC123",
    "status": "released",
    "createdAt": "2025-10-20T11:30:00Z",
    "escrowedAt": "2025-10-20T11:35:00Z",
    "releasedAt": "2025-10-20T15:00:05Z"
  }
}
```

---

## Payment Status Flow

```
pending → escrowed → released
                 → refunded
                 → failed
```

## Commission Tiers

| Tier | Completed Tasks | Commission Rate | Solver Receives (from HKD 200) |
|------|----------------|-----------------|-------------------------------|
| Bronze | 0-10 | 30% | HKD 140 |
| Silver | 11-50 | 20% | HKD 160 |
| Gold | 50+ | 10% | HKD 180 |

## Escrow Rules

1. **Hold Period**: Funds held until task marked complete by raiser
2. **Auto-Refund**: After 14 days of no activity, auto-refund to raiser
3. **Dispute Hold**: If dispute raised, funds frozen until resolution
4. **Release Time**: Within 5 seconds of task completion (SC-010)

## Security Requirements

- All payment requests validated with CSRF token
- Payment provider reference must be unique
- Transaction records immutable once released/refunded
- Audit logs for all payment status changes
- TLS 1.3 for all payment API calls

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| PAYMENT_ALREADY_EXISTS | 409 | Transaction already created for this task |
| INSUFFICIENT_ESCROW | 400 | Not enough funds in escrow |
| PAYMENT_PROVIDER_ERROR | 502 | FPS/PayMe API error |
| TRANSACTION_IMMUTABLE | 403 | Cannot modify completed transaction |
| UNAUTHORIZED_ACCESS | 403 | Not payer or payee |

## Rate Limiting

- **Create Payment**: 5 per hour per user
- **Payment Breakdown**: 20 per minute per user
- **Transaction History**: 10 per minute per user
