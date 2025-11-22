# System Test Suites - Fish Market Application

**Project Name:** FISHERMEN
**Module:** Buyer Market Interface
**Tested By:** [Your Name]

---

## Test Suite 1: Search and Filter Functionality
**Objective:** Verify that users can locate specific fish products using search keywords and category filters.

| Test Case ID | Priority | Test Title | Pre-conditions | Test Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_001** | High | Verify Search by Keyword | User is logged in as Buyer and on Market page. | 1. Click on Search bar.<br>2. Type "Salmon".<br>3. Observe the product list. | Search Term: "Salmon" | The product list should update in real-time to show only items containing "Salmon". |
| **TC_002** | Medium | Verify Filtering by Multiple Criteria | User is logged in as Buyer. | 1. Select Species: "Salmon".<br>2. Select Status: "SENT FRESH".<br>3. Enter Max Price: "1000". | Species: Salmon<br>Status: SENT FRESH<br>Max Price: 1000 | Only fish matching ALL three criteria (Salmon, Sent Fresh, <= 1000) should be displayed. |
| **TC_003** | Low | Verify Reset Filters | Filters are currently active. | 1. Clear the search bar.<br>2. Set dropdowns back to "All".<br>3. Clear price inputs. | N/A | The product list should reload to show all available fish listings. |

---

## Test Suite 2: Shopping Cart Management
**Objective:** Verify that the user can add items, view the cart, and remove items correctly.

| Test Case ID | Priority | Test Title | Pre-conditions | Test Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_004** | High | Add Item to Cart | User sees a list of fish. | 1. Identify a fish card (e.g., Salmon).<br>2. Click the "Add to Cart" button. | Item: Salmon | 1. The "Your Cart" panel should appear/update.<br>2. The item name should appear.<br>3. Quantity should be "x 1". |
| **TC_005** | Medium | Update Quantity | "Salmon" is already in the cart. | 1. Click "Add to Cart" on the same item again. | Item: Salmon | In the cart panel, the quantity for Salmon should update to "x 2" and total price should double. |
| **TC_006** | High | Remove Item from Cart | Items exist in the cart. | 1. Locate the item in the cart panel.<br>2. Click the "X" (Remove) button next to the item. | N/A | The item should be removed from the list. If it was the last item, the message "Your cart is empty" should appear. |

---

## Test Suite 3: Checkout Process
**Objective:** Verify that the user can proceed from the cart to the payment screen.

| Test Case ID | Priority | Test Title | Pre-conditions | Test Steps | Test Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_007** | High | Verify Total Price Calculation | Multiple items added to cart. | 1. Add Salmon (Price 1000) x 2.<br>2. Observe "Total" at bottom of cart. | Price: 1000, Qty: 2 | The Total displayed should be exactly ฿2000.00. |
| **TC_008** | High | Proceed to Checkout | Cart is not empty. | 1. Click the "Checkout" button. | N/A | User should be redirected to the URL `/payment`. |
| **TC_009** | Medium | Checkout with Empty Cart | Cart is empty. | 1. Click the "Checkout" button (if visible) or try to navigate. | N/A | System should prevent checkout or show an alert "Your cart is empty!". |