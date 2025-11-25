# Requirement Traceability Matrix (RTM)

**Project:** FISHERMEN
**Module:** Market Interface
**Role Scope:** Buyer
**Document Date:** 2024-11-22

| Requirement ID | Requirement Type & Description | Applicable Role | Test Cases with Status |
| :--- | :--- | :--- | :--- |
| **REQ-01** | **Functional:**<br>User shall be able to search for fish by keywords and filter by criteria (Species, Price). | Buyer | **TC_UI_001** (Pass) |
| **REQ-02** | **Functional:**<br>User shall be able to add specific products to the shopping cart. | Buyer | **TC_UI_001** (Pass) |
| **REQ-03** | **Functional:**<br>User shall be able to remove items from the shopping cart. | Buyer | **TC_UI_002** (Pass) |
| **REQ-04** | **Business Rule:**<br>The system must calculate and display the total price accurately based on item quantity. | Buyer | **TC_UI_003** (Pass) |
| **REQ-05** | **UI/Navigation:**<br>User shall be able to proceed to the payment page via the Checkout button. | Buyer | **TC_UI_003** ( Pass) |



**Project:** FISHERMEN
**Module:** Upload Fish
**Role Scope:** Fisherman
**Document Date:** 2025-11-22

| Requirement ID | Requirement Type & Description | Applicable Role | Test Cases with Status |
| :--- | :--- | :--- | :--- |
| **REQ-06** | **Functional:**<br>User shall be able to upload daily catch including location, species, weight, price, Delivery Status, Catch Date, and image. | Fisherman | **TC_UI_004 - Step 1** (Pass) |
| **REQ-07** | **Validation:**<br>Required fields (location, species, weight, price, Delivery Status, Catch Date, and image) must be filled; system shall block submission if missing. | Fisherman | **TC_UI_005 - Step 1, Step 2** (Pass) |
| **REQ-08** | **Business Rule:**<br>Weight and price must be greater than 0; system shall show alert and block invalid input. | Fisherman | **TC_UI_006 - Step 1, Step 2** (Pass) |
| **REQ-09** | **UI/Navigation:**<br>After successful upload, the system shall show confirmation popup and redirect user to /market page. | Fisherman | **TC_UI_004 - Step 1, Step 2** (Pass) |
| **REQ-10** | **Data Integration:**<br>Uploaded fish data shall be correctly stored in the backend and visible in market listings. | Fisherman | **TC_UI_004 - Step 2** (Pass) |
