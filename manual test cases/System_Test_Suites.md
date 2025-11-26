# System Test Suite 1 - Fish Market Application

**Project Name:** FISHERMEN
**Document Date:** 2024-11-22

---

## Task 1: Search, Filter and Add to Cart

**Test Case ID:** TC_UI_001
**Test Designed by:** Nichakul Kongnual
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2024-11-22
**Module Name:** Market Interface (Buyer)
**Test Executed by:** Nichakul Kongnual
**Test Title:** Verify search, advanced filters, and adding item to cart
**Test Execution date:** 2024-11-22

**Description:** 
Verify that the user can search, filter by criteria, and add the filtered item to the cart.

**Pre-conditions:**
1. User is logged in as "Buyer".
2. User is on the /market page.

**Dependencies:**
- Login module functional.

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Type "Salmon" in Search bar | Keyword: "Salmon" | List updates to show "Salmon". | List updated | Pass | Auto: Scenario 1 |
| 2 | Clear search, then Select Filters (Species, Status, Price) | Species: Salmon<br>Status: SENT FRESH<br>Price: 1000 | List shows items matching ALL criteria. | Filter logic worked | Pass | Auto: Scenario 2 |
| 3 | Click "Add to Cart" on the filtered item | Item: Salmon | The item is added to the cart state. | Item added | Pass | Auto: Scenario 2 |

**Post-conditions:**
The item is successfully added to the cart, ready for verification in the next task.

---

## Task 2: Shopping Cart Management (Verify & Remove)

**Test Case ID:** TC_UI_002
**Test Designed by:** Nichakul Kongnual
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2024-11-22
**Module Name:** Market Interface (Buyer)
**Test Executed by:** Nichakul Kongnual
**Test Title:** Verify cart contents and remove item
**Test Execution date:** 2024-11-22

**Description:** 
Verify that the cart displays the correct item quantity (x1) from the previous step and allows removal.

**Pre-conditions:**
1. Item ("Salmon") was added to the cart in the previous task.

**Dependencies:**
- TC_UI_001 must be completed.

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Scroll up to view "Your Cart" panel | N/A | Cart panel is visible. | Visible | Pass | Auto: Scenario 3 |
| 2 | Verify item quantity | N/A | Item should show Quantity **"x 1"**. | Qty is x 1 | Pass | (Matches Code) |
| 3 | Click the "Remove" (X) button | N/A | The item is removed. Message "Your cart is empty" appears. | Item removed | Pass | Auto: Scenario 3 |

**Post-conditions:**
The cart is empty, and the state is reset.

---

## Task 3: Checkout and Payment Flow

**Test Case ID:** TC_UI_003
**Test Designed by:** Nichakul Kongnual
**Test Priority (Low/Medium/High):** Critical
**Test Designed date:** 2024-11-22
**Module Name:** Market Interface (Buyer)
**Test Executed by:** Nichakul Kongnual
**Test Title:** Verify Total Price Calculation and Checkout
**Test Execution date:** 2024-11-22

**Description:** Verify that the system calculates the total price correctly and allows the user to proceed to the payment page.

**Pre-conditions:**
1. User is logged in as "Buyer".
2. The cart is currently empty (due to Task 2 removal).

**Dependencies:**
- Cart functionality must be working.

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Re-add "Salmon" to cart | Item: Salmon | Item added to cart again. | Success | Pass | Auto: Scenario 4 |
| 2 | Scroll up and Verify "Total" | N/A | Total displays "฿1000.00" (matches item price). | Price correct | Pass | Auto: Scenario 4 |
| 3 | Click "Checkout" button | N/A | User is redirected to the `/payment` page URL. | Redirection success | Pass | Auto: Scenario 4 |

**Post-conditions:**
User is navigated to the Payment screen.






# System Test Suite 2 - Upload Fish 

**Project Name:** FISHERMEN
**Document Date:** 2025-11-22

---


## Task 4: Upload Fish Successfully

**Test Case ID:** TC_UI_004
**Test Designed by:** Manasawan Pewnoul
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2025-11-22
**Module Name:** Upload Fish
**Test Executed by:** Manasawan Pewnoul
**Test Title:** Verify Upload Fish Functionality
**Test Execution date:** 2025-11-22

**Description:** 
Verify that the user can upload fish successfully and that the uploaded fish appears on the market page.


**Pre-conditions:**  
1. User is logged in.  
2. User is on the /upload page.  

**Dependencies:**  
- Backend and database must be running.  

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Fill all required fields, upload image, click Upload | Location: Phuket<br>Species: Anchovy<br>Weight: 2<br>Price: 20<br>Image: anchovy.jpg | Upload success popup shown | Upload success popup shown | Pass | Happy path scenario |
| 2 | Verify uploaded fish appears in market page | - | Uploaded fish visible in /market | Uploaded fish visible in /market | Pass | Data persistence check |

---

## Task 5: Validate Required Fields

**Test Case ID:** TC_UI_005
**Test Designed by:** Manasawan Pewnoul
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2025-11-22
**Module Name:** Upload Fish
**Test Executed by:** Manasawan Pewnoul
**Test Title:** Verify Required Field Validation
**Test Execution date:** 2025-11-22

**Description:** 
Ensure the system blocks uploads if required fields are empty.


**Pre-conditions:**  
1. User is logged in.  
2. User is on the /upload page.  

**Dependencies:**  
- Backend and database must be running.  

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Leave location empty, click Upload | Location: empty | Alert "Please enter location", upload blocked | Alert shown, upload blocked | Pass | Required field validation |
| 2 | Leave species empty, click Upload | Species: empty | Alert "Please select fish species", upload blocked | Alert shown, upload blocked | Pass | Required field validation |


---

## Task 6: Invalid Inputs

**Test Case ID:** TC_UI_006
**Test Designed by:** Manasawan Pewnoul
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2025-11-22
**Module Name:** Upload Fish
**Test Executed by:** Manasawan Pewnoul
**Test Title:** Verify System Handles Invalid Input
**Test Execution date:** 2025-11-22

**Description:** 
Check system response to invalid weight and price inputs.


**Pre-conditions:**  
1. User is logged in.  
2. User is on the /upload page.  

**Dependencies:**  
- Backend and database must be running.  

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Enter negative weight, click Upload | Weight: -1 | Alert "Weight must be greater than 0!", upload blocked | Alert shown, upload blocked | Pass | Invalid weight scenario |
| 2 | Enter negative price, click Upload | Price: -5 | Alert "Price must be greater than 0!", upload blocked | Alert shown, upload blocked | Pass | Invalid price scenario |

# System Test Suite 3 - Buyer Reviews Module

**Project Name:** FISHERMEN
**Document Date:** 2025-11-26

---

## Task 7: View Review Dashboard & Navigation

**Test Case ID:** TC_UI_007
**Test Designed by:** Jinnipa Leepong
**Test Priority (Low/Medium/High):** Medium
**Test Designed date:** 2025-11-26
**Module Name:** Buyer Reviews Interface
**Test Executed by:** Jinnipa Leepong
**Test Title:** Verify navigation to Reviews and "Not Reviewed" filter
**Test Execution date:** 2025-11-26

**Description:**
Verify that the user can navigate to the reviews page, view their profile information, and see the list of items waiting to be reviewed.

**Pre-conditions:**
1. User is logged in as "Alice" (Buyer).
2. User is on the /market page.

**Dependencies:**
- User must have past orders (API: /api/orders/buyer/*).

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Click "Reviews" in the navigation bar | Link: Reviews | URL includes `/reviews`. API calls for User, Orders, and Reviews are triggered. | URL correct, APIs triggered | Pass | Auto: Step 1 |
| 2 | Verify Page Components | N/A | "My Reviews", User "Alice", and Filter tabs are visible. | All components visible | Pass | Auto: Step 2 |
| 3 | Verify "Not Reviewed" tab is active | Default State | "Not Reviewed" tab is active. Cards with "Rate" button are visible. | Tab active, Rate buttons shown | Pass | Auto: Step 3 |

**Post-conditions:**
User is on the Reviews page with the "Not Reviewed" list displayed.

---

## Task 8: Submit New Review

**Test Case ID:** TC_UI_008
**Test Designed by:** Jinnipa Leepong
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2025-11-26
**Module Name:** Buyer Reviews Interface
**Test Executed by:** Jinnipa Leepong
**Test Title:** Verify creation of a new review
**Test Execution date:** 2025-11-26

**Description:**
Verify that the user can open the rating form for an unreviewed item, fill in the details, and submit a review successfully.

**Pre-conditions:**
1. User is on the Reviews page (Task 7 completed).
2. At least one "Not Reviewed" item exists.

**Dependencies:**
- API endpoint `/api/reviews/create` must be functional.

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Click "Rate" button on the first item | N/A | Review form opens with Star rating and Textarea. | Form opened | Pass | Auto: Step 4 |
| 2 | Select Rating and Type Comment | Rating: 5 Stars<br>Comment: "Very fresh fish! Highly recommended." | 5 Stars highlighted. Text area populated. | Input captured | Pass | Auto: Step 5 |
| 3 | Click "Submit Review" | N/A | Form closes. API returns 201 (Created). Alert handled. | Review created (201) | Pass | Auto: Step 5 |

**Post-conditions:**
The review is saved to the database.

---

## Task 9: Filter & Edit Review

**Test Case ID:** TC_UI_009
**Test Designed by:** Jinnipa Leepong
**Test Priority (Low/Medium/High):** High
**Test Designed date:** 2025-11-26
**Module Name:** Buyer Reviews Interface
**Test Executed by:** Jinnipa Leepong
**Test Title:** Verify "Reviewed" filter and Edit functionality
**Test Execution date:** 2025-11-26

**Description:**
Verify that the submitted review appears under the "Reviewed" tab and that the user can edit the rating and comment.

**Pre-conditions:**
1. A review was successfully submitted in Task 8.

**Dependencies:**
- API endpoint `/api/reviews/update/*` must be functional.

| Step | Test Steps | Test Data | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Switch to "Reviewed" Filter | Click "Reviewed" Tab | Active tab changes. The card with "Very fresh fish..." appears. | Filter works, Card found | Pass | Auto: Step 6 |
| 2 | Verify Review Details | N/A | Rating shows (5/5). Comment matches input. | Details match | Pass | Auto: Step 7 |
| 3 | Click "Edit Review" and Update | Rating: 4 Stars<br>Comment: "Good quality fish, will buy again!" | Review updates. API returns 200 (OK). | Update success (200) | Pass | Auto: Step 8 & 9 |

**Post-conditions:**
The review is updated in the system with the new rating and comment.