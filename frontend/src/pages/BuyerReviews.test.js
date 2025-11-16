/**
 * BuyerReviews.test.js
 *
 * Full, drop-in test suite for BuyerReviews.js
 *
 * - Mocks useAuth to provide a logged-in buyer
 * - Mocks global.fetch to return user details, orders, and reviews
 * - Uses RTL + act + waitFor to reliably wait for async updates
 * - Uses tight text matchers to avoid "multiple elements" errors
 *
 * Assumes the component uses the endpoints:
 *  GET /api/users/:id
 *  GET /api/orders/buyer/:id
 *  GET /api/reviews/buyer/:id
 *  POST /api/reviews/create
 *  PUT  /api/reviews/update/:id
 */

 import React from "react";
 import {
   render,
   screen,
   fireEvent,
   waitFor,
   cleanup,
   act,
   within,
 } from "@testing-library/react";
 import "@testing-library/jest-dom";
 import BuyerReviews from "./BuyerReviews";
 
 // --- Mock AuthContext BEFORE any code that might import it ---
 jest.mock("../AuthContext", () => ({
   useAuth: jest.fn(),
 }));
 import { useAuth } from "../AuthContext";
 
 // --- Global mocks ---
 global.fetch = jest.fn();
 global.alert = jest.fn();
 
 // --- Mock data that matches the shape you confirmed ---
 // buyer id is 10 in these tests (consistent with the component)
 const mockUser = { id: 10, firstName: "Test", lastName: "User" };
 const mockUserDetails = {
   id: 10,
   firstName: "Testy",
   lastName: "McTestFace",
 };
 
 const mockOrders = [
   {
     id: 1,
     status: "SHIPPED",
     items: [
       {
         id: 101,
         quantity: 1,
         fishListing: {
           fishType: "Salmon",
           price: 100,
           fisherman: { firstName: "Sam", lastName: "Fisher" },
         },
       },
       {
         id: 102,
         quantity: 2,
         fishListing: {
           fishType: "Tuna",
           price: 150,
           fisherman: { firstName: "Tom", lastName: "Fisher" },
         },
       },
     ],
   },
   {
     id: 2,
     status: "PENDING",
     items: [
       {
         id: 103,
         quantity: 1,
         fishListing: {
           fishType: "Cod",
           price: 80,
           fisherman: { firstName: "Chris", lastName: "" },
         },
       },
     ],
   },
 ];
 
 const mockExistingReviews = [
   {
     id: "review-1",
     rating: 5,
     comment: "Great fish!",
     reviewDate: new Date().toISOString(),
     orderItem: { id: 101 },
   },
 ];
 
 const mockCreateReviewResponse = {
   id: "review-2",
   rating: 4,
   comment: "Very fresh",
   buyerId: 10,
   orderItemId: 102,
   reviewDate: new Date().toISOString(),
 };
 
 const mockUpdatedReviewResponse = {
   id: "review-1",
   rating: 3,
   comment: "Updated comment",
   buyerId: 10,
   orderItemId: 101,
   reviewDate: new Date().toISOString(),
 };
 
 // Helper: configure fetch behaviour
 // Sequence: userDetails -> orders -> reviews (for initial load)
 function setupFetchSequence(responses = []) {
   let call = 0;
   fetch.mockImplementation((url) => {
     // Simple URL routing for the endpoints used in the component
     if (url.includes("/api/users/")) {
       return Promise.resolve({
         ok: true,
         json: () => Promise.resolve(responses[call++] || mockUserDetails),
       });
     }
     if (url.includes("/api/orders/buyer/")) {
       return Promise.resolve({
         ok: true,
         json: () => Promise.resolve(responses[call++] || mockOrders),
       });
     }
     if (url.includes("/api/reviews/buyer/")) {
       return Promise.resolve({
         ok: true,
         json: () => Promise.resolve(responses[call++] || mockExistingReviews),
       });
     }
     // create or update endpoints (POST/PUT) - tests will replace this when needed
     if (url.includes("/api/reviews/create") || url.includes("/api/reviews/update")) {
       // Default fallback for unexpected calls
       return Promise.resolve({
         ok: true,
         json: () => Promise.resolve(mockCreateReviewResponse),
       });
     }
     return Promise.resolve({ ok: false, status: 404 });
   });
 }
 
 // Small utility matcher to find the exact <p> that displays "Product: <Type>"
 const productParagraphMatcher = (type) => {
   return (_, el) =>
     el.tagName === "P" && /product:/i.test(el.textContent) && new RegExp(type, "i").test(el.textContent);
 };
 
 // Utility to render component with mocked useAuth + fetch
 const renderComponent = async (fetchResponses = []) => {
   // Ensure useAuth returns the logged-in buyer
   useAuth.mockReturnValue({ user: mockUser });
 
   setupFetchSequence(fetchResponses);
 
   await act(async () => {
     render(<BuyerReviews />);
   });
 };
 
 afterEach(() => {
   jest.clearAllMocks();
   cleanup();
 });
 
 // ---------------------- Suite 1: Initial Render & Data Fetch ----------------------
 describe("Suite 1: BuyerReviews Initial Render & Data Fetching", () => {
   beforeEach(() => {
     // default behavior per test will set up fetch
     useAuth.mockClear();
     fetch.mockClear();
     global.alert.mockClear();
   });
 
   test("1. shows loading initially", async () => {
     // Make fetch hang to simulate loading
     fetch.mockImplementation(() => new Promise(() => {}));
     useAuth.mockReturnValue({ user: mockUser });
 
     render(<BuyerReviews />);
 
     expect(screen.getByText("Loading...")).toBeInTheDocument();
   });
 
   test("2. fetches and displays buyer info and not-reviewed items by default", async () => {
     await renderComponent(); // uses default responses
 
     // Wait for component to finish initial fetches (3 calls)
     await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
 
     // Buyer name should show from userDetails (mockUserDetails)
     expect(await screen.findByText(/Testy McTestFace/i)).toBeInTheDocument();
 
     // The Tuna product should be present (we target exact <p> with Product: Tuna)
     const tunaP = await screen.findByText(productParagraphMatcher("Tuna"));
     expect(tunaP).toBeInTheDocument();
 
     // Salmon (id 101) has an existing review in mockExistingReviews — should NOT appear under Not Reviewed
     expect(screen.queryByText(productParagraphMatcher("Salmon"))).not.toBeInTheDocument();
   });
 
   test("3. if all items reviewed show 'No items to display.'", async () => {
     // Simulate reviews covering both order items
     const allReviewed = [
       [
         /* userDetails */ mockUserDetails,
         /* orders */ [{ id: 1, status: "SHIPPED", items: [{ id: 101, quantity: 1, fishListing: { fishType: "Salmon", price: 100, fisherman: { firstName: "Sam" } } }] }],
         /* reviews */ [{ id: "r1", orderItemId: 101, orderItem: { id: 101 } }],
       ],
     ].flat();
 
     // Instead of fancy sequence, directly set fetch to return specific sets depending on the URL
     fetch.mockImplementation((url) => {
       if (url.includes("/api/users/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
       }
       if (url.includes("/api/orders/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, status: "SHIPPED", items: [{ id: 101, quantity: 1, fishListing: { fishType: "Salmon", price: 100 } }] }]) });
       }
       if (url.includes("/api/reviews/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: "r1", orderItemId: 101, orderItem: { id: 101 } }]) });
       }
       return Promise.resolve({ ok: false });
     });
 
     useAuth.mockReturnValue({ user: mockUser });
 
     await act(async () => {
       render(<BuyerReviews />);
     });
 
     expect(await screen.findByText("No items to display.")).toBeInTheDocument();
   });
 });
 
 // ---------------------- Suite 2: Filtering Logic ----------------------
 describe("Suite 2: BuyerReviews Filtering Logic", () => {
   beforeEach(async () => {
     useAuth.mockClear();
     fetch.mockClear();
     global.alert.mockClear();
     // Render with default dataset
     await renderComponent();
     // Ensure loaded
     await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
   });
 
   afterEach(() => cleanup());
 
   test("1. can switch to Reviewed filter and show reviewed items", async () => {
     // Click Reviewed tab
     await act(async () => {
       fireEvent.click(screen.getByRole("button", { name: "Reviewed" }));
     });
 
     // Salmon (reviewed) should appear
     const salmonP = await screen.findByText(productParagraphMatcher("Salmon"));
     expect(salmonP).toBeInTheDocument();
 
     // Tuna should not be visible under Reviewed (it's not reviewed in mockExistingReviews)
     expect(screen.queryByText(productParagraphMatcher("Tuna"))).not.toBeInTheDocument();
 
     // Check the displayed rating and comment for Salmon
     expect(screen.getByText(/Your Rating:/i)).toBeInTheDocument();
     expect(screen.getByText(/Great fish!/i)).toBeInTheDocument();
   });
 
   test("2. can switch back to Not Reviewed", async () => {
     // Switch to Reviewed then back to Not Reviewed
     await act(async () => {
       fireEvent.click(screen.getByRole("button", { name: "Reviewed" }));
     });
 
     expect(await screen.findByText(productParagraphMatcher("Salmon"))).toBeInTheDocument();
 
     await act(async () => {
       fireEvent.click(screen.getByRole("button", { name: "Not Reviewed" }));
     });
 
     // Tuna returns
     expect(await screen.findByText(productParagraphMatcher("Tuna"))).toBeInTheDocument();
     expect(screen.queryByText(productParagraphMatcher("Salmon"))).not.toBeInTheDocument();
   });
 });
 
 // ---------------------- Suite 3: Review Form & Submit/Edit ----------------------
 describe("Suite 3: Review Submission and Editing Logic", () => {
   beforeEach(async () => {
     useAuth.mockClear();
     fetch.mockClear();
     global.alert.mockClear();
     // Initial render with default data
     await renderComponent();
     await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
   });
 
   afterEach(() => cleanup());
 
   test("1. shows validation alert if submit without rating/comment", async () => {
     // Find Tuna card and click Rate
     const tunaP = await screen.findByText(productParagraphMatcher("Tuna"));
     const tunaCard = tunaP.closest(".order-card");
     expect(tunaCard).toBeInTheDocument();
 
     await act(async () => {
       fireEvent.click(within(tunaCard).getByRole("button", { name: "Rate" }));
     });
 
     // Click Submit without selecting rating/comment
     await act(async () => {
       fireEvent.click(within(tunaCard).getByRole("button", { name: "Submit Review" }));
     });
 
     expect(global.alert).toHaveBeenCalledWith("Please select a rating and write a comment!");
   });
 
   test("2. successfully creates a new review and removes item from Not Reviewed list", async () => {
     // Make the create endpoint respond with our expected new review
     fetch.mockImplementation((url, opts) => {
       if (url.includes("/api/users/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
       }
       if (url.includes("/api/orders/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
       }
       if (url.includes("/api/reviews/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExistingReviews) });
       }
       if (url.includes("/api/reviews/create")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateReviewResponse) });
       }
       return Promise.resolve({ ok: false });
     });
 
     // Re-render with the new fetch behavior
     useAuth.mockReturnValue({ user: mockUser });
     await act(async () => {
       render(<BuyerReviews />);
     });
 
     await waitFor(() => expect(fetch).toHaveBeenCalled());
 
     // Find the Tuna card
     const tunaP = await screen.findByText(productParagraphMatcher("Tuna"));
     const tunaCard = tunaP.closest(".order-card");
 
     // Open Rate form
     await act(async () => {
       fireEvent.click(within(tunaCard).getByRole("button", { name: "Rate" }));
     });
 
     // Click 5th star (stars are rendered as text "★", so we find them)
     const stars = within(tunaCard).getAllByText("★");
     // click the 5th (index 4)
     await act(async () => {
       fireEvent.click(stars[4]);
     });
 
     // Enter comment
     await act(async () => {
       fireEvent.change(within(tunaCard).getByPlaceholderText("Write your review..."), {
         target: { value: "Very fresh" },
       });
     });
 
     // Submit
     await act(async () => {
       fireEvent.click(within(tunaCard).getByRole("button", { name: "Submit Review" }));
     });
 
     // The create endpoint should have been called (component uses fetch)
     await waitFor(() => {
       // We expect at least one call to the create endpoint
       expect(
         fetch.mock.calls.some((call) => call[0].includes("/api/reviews/create"))
       ).toBeTruthy();
     });
 
     // Alert success
     await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Review submitted successfully!"));
 
     // After submission, Tuna should be removed from Not Reviewed list
     expect(screen.queryByText(productParagraphMatcher("Tuna"))).not.toBeInTheDocument();
   });
 
   test("3. editing an existing review pre-fills the form and updates on submit", async () => {
     // Make update endpoint respond with updated review
     fetch.mockImplementation((url, opts) => {
       if (url.includes("/api/users/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
       }
       if (url.includes("/api/orders/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
       }
       if (url.includes("/api/reviews/buyer/")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExistingReviews) });
       }
       if (url.includes("/api/reviews/update/review-1")) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUpdatedReviewResponse) });
       }
       return Promise.resolve({ ok: false });
     });
 
     // Render again so spy is in place
     useAuth.mockReturnValue({ user: mockUser });
     await act(async () => {
       render(<BuyerReviews />);
     });
 
     await waitFor(() => expect(fetch).toHaveBeenCalled());
 
     // Switch to Reviewed tab
     await act(async () => {
       fireEvent.click(screen.getByRole("button", { name: "Reviewed" }));
     });
 
     // Find the Salmon card (which has the existing review)
     const salmonP = await screen.findByText(productParagraphMatcher("Salmon"));
     const salmonCard = salmonP.closest(".order-card");
 
     // Click Edit Review
     await act(async () => {
       fireEvent.click(within(salmonCard).getByRole("button", { name: "Edit Review" }));
     });
 
     // The textarea should be prefilled with "Great fish!"
     const textarea = await within(salmonCard).findByPlaceholderText("Write your review...");
     expect(textarea).toHaveValue("Great fish!");
 
     // Change rating to 3 stars and update comment
     const stars = within(salmonCard).getAllByText("★");
     await act(async () => {
       fireEvent.click(stars[2]); // 3rd star
       fireEvent.change(textarea, { target: { value: "Updated comment" } });
     });
 
     // Click Update Review
     await act(async () => {
       fireEvent.click(within(salmonCard).getByRole("button", { name: "Update Review" }));
     });
 
     // The update endpoint should have been called
     await waitFor(() => {
       expect(
         fetch.mock.calls.some((call) => call[0].includes("/api/reviews/update/review-1"))
       ).toBeTruthy();
     });
 
     // Alert update success
     await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Review updated successfully!"));
 
     // The updated rating/comment should appear in the UI
     expect(screen.getByText(/Your Rating:/i)).toBeInTheDocument();
     expect(screen.getByText(/Your Comment: Updated comment/i)).toBeInTheDocument();
     expect(screen.getByText(/Your Rating: ★★★ \(3\/5\)/i)).toBeInTheDocument();
   });
 });
 