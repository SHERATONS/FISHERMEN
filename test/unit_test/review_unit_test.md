# Review Unit Test Detailed Documentation

## Overview
This document provides a comprehensive technical breakdown of the unit tests for the `ReviewController`. The tests verify the correctness of the REST API endpoints for managing reviews, ensuring proper data handling, validation, and error responses.

**Test Class:** `src/test/java/com/example/backend/controller/ReviewControllerTest.java`
**Frameworks:** JUnit 5, Mockito, Spring MockMvc

## Test Environment Setup
The test class uses `@WebMvcTest(ReviewController.class)` to isolate the controller layer. Dependencies are mocked using `@MockBean`.

### Mocks
- **`ReviewRepo`**: Handles database operations for `Review` entities.
- **`UserRepo`**: Handles retrieval of `User` (Buyer) entities.
- **`OrderItemRepo`**: Handles retrieval of `OrderItem` entities.

### Test Data (`setUp()`)
- **Buyer**: User ID `BUY0001`, Username `test_buyer`
- **Other Buyer**: User ID `BUY0002` (used for unauthorized access tests)
- **Order Item**: ID `1L`
- **Review**: ID `1L`, Rating `5`, Comment "Great product!"

---

## Feature 1: Create Review
**Endpoint:** `POST /api/reviews/create`

### Test Cases

| Test Method | Scenario | Input Payload | Mock Behavior | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| `testCreateReview_BaseChoice_Positive` | **Success**: Valid data | `{"rating": 5, "comment": "Excellent...", "buyerId": "BUY0001", "orderItemId": 1}` | `userRepo` finds buyer<br>`orderItemRepo` finds item<br>`reviewRepo` saves review | **201 Created**<br>JSON: `rating: 5` |
| `testCreateReview_BaseChoice_Negative` | **Success**: Low rating | `{"rating": 1, ...}` | Same as above | **201 Created**<br>JSON: `rating: 1` |
| `testCreateReview_Variation_InvalidBuyer` | **Error**: Buyer not found | `{"buyerId": "INVALID", ...}` | `userRepo` returns empty | **404 Not Found**<br>Msg: "Buyer not found" |
| `testCreateReview_Variation_InvalidOrderItem` | **Error**: Item not found | `{"orderItemId": 999, ...}` | `orderItemRepo` returns empty | **404 Not Found**<br>Msg: "Order item not found" |
| `testCreateReview_Variation_ReviewExists` | **Error**: Duplicate review | Valid payload | `reviewRepo.existsByOrderItemId(1)` returns `true` | **409 Conflict**<br>Msg: "Review... already exists" |
| `testCreateReview_Variation_UnauthorizedBuyer` | **Error**: Wrong buyer | `{"buyerId": "BUY0002", ...}` | `userRepo` finds `otherBuyer` (not owner of order) | **403 Forbidden**<br>Msg: "This order item does not belong..." |

---

## Feature 2: Update Review
**Endpoint:** `PUT /api/reviews/update/{id}`

### Test Cases

| Test Method | Scenario | Input Payload | Mock Behavior | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| `testUpdateReview_BaseChoice_FullUpdate` | **Success**: Update all fields | `{"rating": 4, "comment": "Updated"}` | `reviewRepo` finds review<br>`reviewRepo` saves updated review | **200 OK**<br>JSON: `rating: 4`, `comment: "Updated"` |
| `testUpdateReview_BaseChoice_RatingOnly` | **Success**: Update rating | `{"rating": 3}` | `reviewRepo` finds review<br>Updates rating, keeps comment | **200 OK**<br>JSON: `rating: 3`, `comment: "Great product!"` |
| `testUpdateReview_BaseChoice_CommentOnly` | **Success**: Update comment | `{"comment": "Just okay"}` | `reviewRepo` finds review<br>Updates comment, keeps rating | **200 OK**<br>JSON: `rating: 5`, `comment: "Just okay"` |
| `testUpdateReview_Variation_InvalidId` | **Error**: Review not found | `{"rating": 4}` | `reviewRepo` returns empty | **404 Not Found**<br>Msg: "Review not found" |

---

## Feature 3: Delete Review
**Endpoint:** `DELETE /api/reviews/delete/{id}`

### Test Cases

| Test Method | Scenario | Mock Behavior | Expected Result |
| :--- | :--- | :--- | :--- |
| `testDeleteReview_BaseChoice_ValidId` | **Success**: Delete existing | `reviewRepo.existsById(1)` returns `true`<br>`reviewRepo.deleteById(1)` called | **200 OK**<br>Body: "Review deleted successfully" |
| `testDeleteReview_Variation_InvalidId` | **Error**: Review not found | `reviewRepo.existsById(999)` returns `false` | **404 Not Found** |

---

## Feature 4: Get Reviews
**Endpoints:**
- `GET /api/reviews/{id}`
- `GET /api/reviews/list`
- `GET /api/reviews/buyer/{buyerId}`

### Test Cases

| Test Method | Endpoint | Scenario | Mock Behavior | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| `testGetReviewById_BaseChoice_ValidId` | `/api/reviews/1` | **Success**: Found | `reviewRepo` finds review | **200 OK**<br>JSON: `id: 1` |
| `testGetReviewById_Variation_InvalidId` | `/api/reviews/999` | **Error**: Not found | `reviewRepo` returns empty | **404 Not Found** |
| `testGetAllReviews_BaseChoice` | `/api/reviews/list` | **Success**: List all | `reviewRepo.findAll()` returns list | **200 OK**<br>JSON: Array of reviews |
| `testGetReviewsByBuyerId_BaseChoice` | `/api/reviews/buyer/BUY0001` | **Success**: List by buyer | `reviewRepo.findByBuyerId(...)` returns list | **200 OK**<br>JSON: Array of reviews |

---

## Test Coverage Result

The following image shows the test coverage results, indicating the percentage of code covered by these unit tests.

![Review Test Coverage](../images/reviewTestCoverage.png)
