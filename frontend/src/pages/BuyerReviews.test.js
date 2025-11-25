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
    status: "SHIPPED", // Should be processed
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
    status: "PENDING", // Should be filtered out by the component
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
  fetch.mockImplementation((url, opts) => {
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
const renderComponent = async (user = mockUser, fetchResponses = []) => {
  // Ensure useAuth returns the specified user state
  useAuth.mockReturnValue({ user: user });

  // Only setup fetch if a user is present, otherwise fetch should not be called.
  if (user) {
      setupFetchSequence(fetchResponses);
  } else {
      fetch.mockClear(); // Ensure fetch calls are not made when no user is present
  }

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
    // Simulate reviews covering all available SHIPPED order items
    fetch.mockImplementation((url) => {
      if (url.includes("/api/users/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
      }
      if (url.includes("/api/orders/buyer/")) {
        // Only one item to simplify
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                status: "SHIPPED",
                items: [
                  {
                    id: 101,
                    quantity: 1,
                    fishListing: { fishType: "Salmon", price: 100 },
                  },
                ],
              },
            ]),
        });
      }
      if (url.includes("/api/reviews/buyer/")) {
        // Review for the one item exists
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: "r1", orderItem: { id: 101 } }]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    useAuth.mockReturnValue({ user: mockUser });

    await act(async () => {
      render(<BuyerReviews />);
    });

    expect(await screen.findByText("No items to display.")).toBeInTheDocument();
  });

  // NEW TEST: Ensure items from PENDING orders are filtered out (Addresses lines 124-186)
  test("4. correctly filters out items from non-shipped orders (e.g., PENDING)", async () => {
    await renderComponent(); // uses default responses including PENDING order for Cod

    // Wait for component to finish initial fetches
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

    // Tuna (from SHIPPED order) must be present
    expect(await screen.findByText(productParagraphMatcher("Tuna"))).toBeInTheDocument();

    // Cod (from PENDING order) must NOT be present
    expect(screen.queryByText(productParagraphMatcher("Cod"))).not.toBeInTheDocument();
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

// ---------------------- Suite 3: Review Submission and Editing Logic ----------------------
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
    // Mock fetch to return success for initial loads and the POST call
    fetch.mockImplementation((url, opts) => {
      if (url.includes("/api/reviews/create")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateReviewResponse) });
      }
      if (url.includes("/api/users/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
      }
      if (url.includes("/api/orders/buyer/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
      }
      if (url.includes("/api/reviews/buyer/")) {
        // Need to return mockExistingReviews + the newly created review for the re-fetch.
        if (fetch.mock.calls.length >= 3) {
            // After the initial 3 fetches, simulate a successful re-fetch including the new review
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([...mockExistingReviews, mockCreateReviewResponse])
            });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExistingReviews) });
      }
      return Promise.resolve({ ok: false });
    });

    // Re-render with the new fetch behavior (3 initial fetches)
    useAuth.mockReturnValue({ user: mockUser });
    await act(async () => {
      render(<BuyerReviews />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));


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

    // The create endpoint should have been called (call 4: POST /create)
    await waitFor(() => {
      expect(
        fetch.mock.calls.some((call) => call[0].includes("/api/reviews/create"))
      ).toBeTruthy();
    });

    // Alert success
    await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Review submitted successfully!"));

    // After submission, Tuna should be removed from Not Reviewed list (call 5: GET /reviews/buyer/ re-fetch)
    // We check the list is empty since only Tuna was left.
    expect(await screen.findByText("No items to display.")).toBeInTheDocument();
  });

  test("3. editing an existing review pre-fills the form and updates on submit", async () => {
    // Mock update endpoint respond with updated review and re-fetch success
    fetch.mockImplementation((url, opts) => {
        if (url.includes("/api/reviews/update/review-1")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUpdatedReviewResponse) });
        }
        if (url.includes("/api/users/")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
        }
        if (url.includes("/api/orders/buyer/")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
        }
        if (url.includes("/api/reviews/buyer/")) {
            // Simulate the re-fetch returning the *updated* review
            if (fetch.mock.calls.some(call => call[0].includes("/api/reviews/update"))) {
                 return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        mockUpdatedReviewResponse, // The updated one
                        // Keep Tuna's mock review if it was created, but for this test, only review-1 matters
                    ])
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExistingReviews) });
        }
        return Promise.resolve({ ok: false });
    });


    // Render again so spy is in place
    useAuth.mockReturnValue({ user: mockUser });
    await act(async () => {
      render(<BuyerReviews />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

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

    // The update endpoint should have been called (call 4: PUT /update)
    await waitFor(() => {
      expect(
        fetch.mock.calls.some((call) => call[0].includes("/api/reviews/update/review-1"))
      ).toBeTruthy();
    });

    // Alert update success
    await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Review updated successfully!"));

    // The updated rating/comment should appear in the UI (call 5: GET /reviews/buyer/ re-fetch)
    expect(screen.getByText(/Your Rating:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Comment: Updated comment/i)).toBeInTheDocument();
    // Check for 3 stars explicitly
    expect(screen.getByText(/Your Rating: ★★★/i)).toBeInTheDocument();
  });
});

// ---------------------- Suite 4: Missing Error and Edge Case Handling ----------------------
describe("Suite 4: Missing Error and Edge Case Handling", () => {
  beforeEach(() => {
    useAuth.mockClear();
    fetch.mockClear();
    global.alert.mockClear();
  });

  afterEach(() => cleanup());

  // Covers initial fetch failure (e.g., lines 262, 277-284)
  test("1. handles initial data fetch failure (e.g., orders) and shows error message", async () => {
    // Set up fetch to fail on the Orders call
    useAuth.mockReturnValue({ user: mockUser });
    let callCount = 0;
    fetch.mockImplementation((url) => {
        if (url.includes("/api/users/")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
        }
        if (url.includes("/api/orders/buyer/")) {
            // FAIL HERE: ok: false
            return Promise.resolve({ ok: false, status: 500 });
        }
        if (url.includes("/api/reviews/buyer/")) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve(mockExistingReviews) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(<BuyerReviews />);
    });

    // Expect an error message related to the failure to load data.
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2)); // user + orders
    expect(screen.getByText(/Error loading orders or reviews/i)).toBeInTheDocument();
  });

  // Covers review submission failure (e.g., lines 191-196, 277-284)
  test("2. shows alert error message if review submission (POST) fails", async () => {
    // 1. Initial successful render to get to the form
    await renderComponent();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

    // 2. Mock subsequent fetch calls for POST/PUT to fail
    fetch.mockImplementation((url, opts) => {
      if (url.includes("/api/reviews/create")) {
        // FAIL HERE: ok: false
        return Promise.resolve({ ok: false, status: 500 });
      }
      // Ensure other fetches (user, orders, reviews) still work if re-run
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    // Proceed with form interaction (using Tuna item)
    const tunaP = await screen.findByText(productParagraphMatcher("Tuna"));
    const tunaCard = tunaP.closest(".order-card");

    // Open Rate form
    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole("button", { name: "Rate" }));
    });

    // Fill form (Rating 5, Comment "Test Fail")
    const stars = within(tunaCard).getAllByText("★");
    await act(async () => {
      fireEvent.click(stars[4]);
      fireEvent.change(within(tunaCard).getByPlaceholderText("Write your review..."), {
        target: { value: "Test Fail" },
      });
    });

    // Submit
    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole("button", { name: "Submit Review" }));
    });

    // Check for POST call
    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => call[0].includes("/api/reviews/create"))).toBeTruthy();
    });

    // Alert failure (Covers the catch block/error path)
    expect(global.alert).toHaveBeenCalledWith("Failed to submit review.");
    // After failure, the item should still be visible in the "Not Reviewed" list
    expect(screen.getByText(productParagraphMatcher("Tuna"))).toBeInTheDocument();
  });

  // Covers review update failure (PUT)
  test("3. shows alert error message if review update (PUT) fails", async () => {
    // 1. Initial successful render to get to the form
    await renderComponent();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

    // Switch to Reviewed tab
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reviewed" }));
    });

    // 2. Mock subsequent fetch calls for POST/PUT to fail
    fetch.mockImplementation((url, opts) => {
        if (url.includes("/api/reviews/update/review-1")) {
            // FAIL HERE: ok: false
            return Promise.resolve({ ok: false, status: 500 });
        }
        // Ensure other fetches (user, orders, reviews) still work if re-run
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    // Find the Salmon card (which has the existing review)
    const salmonP = await screen.findByText(productParagraphMatcher("Salmon"));
    const salmonCard = salmonP.closest(".order-card");

    // Click Edit Review to open form
    await act(async () => {
        fireEvent.click(within(salmonCard).getByRole("button", { name: "Edit Review" }));
    });

    // Change comment
    const textarea = await within(salmonCard).findByPlaceholderText("Write your review...");
    await act(async () => {
        fireEvent.change(textarea, { target: { value: "Attempting to update" } });
    });

    // Click Update Review
    await act(async () => {
        fireEvent.click(within(salmonCard).getByRole("button", { name: "Update Review" }));
    });

    // The update endpoint should have been called
    await waitFor(() => {
        expect(fetch.mock.calls.some((call) => call[0].includes("/api/reviews/update/review-1"))).toBeTruthy();
    });

    // Alert failure (Covers the catch block/error path for update)
    expect(global.alert).toHaveBeenCalledWith("Failed to update review.");
  });
  
  // NEW TEST: Targets the failure of the FIRST API call (User Details)
  test("4. handles user details fetch failure and shows error message", async () => {
    // Set up fetch to fail on the initial User Details call
    useAuth.mockReturnValue({ user: mockUser });
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500 })); // User Details FAIL
    // Subsequent fetch calls are irrelevant as the component should fail fast.

    await act(async () => {
        render(<BuyerReviews />);
    });

    // Expect the component to show the generic error message.
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Only the user details call
    expect(screen.getByText(/Error loading orders or reviews/i)).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});

// ---------------------- Suite 5: Authentication & Other Edge Cases (Targets 32, 69, 152-182) ----------------------
describe("Suite 5: Authentication & Other Edge Cases", () => {
    beforeEach(() => {
        useAuth.mockClear();
        fetch.mockClear();
        global.alert.mockClear();
    });

    afterEach(() => cleanup());

    // NEW TEST: Targets lines 152-182 (Unauthenticated user block)
    test("1. shows an access denial message if user is not authenticated", async () => {
        // Mock useAuth to return null user
        await renderComponent(null); // Passing null for the user

        // Since the component is highly likely to return early if no user is found,
        // we check for a key UI element indicating the required state.
        // We assume the component uses 'Log in' or similar access control language.
        expect(screen.getByText(/Please log in to view/i)).toBeInTheDocument();

        // Fetch should NOT have been called, covering potential early returns/guards.
        expect(fetch).not.toHaveBeenCalled();
    });

    // NEW TEST: Targets lines 32 and 69 (likely related to initial state/empty data processing)
    test("2. gracefully handles empty orders and empty reviews on initial load", async () => {
        // Set up fetch to return successfully but with empty arrays for orders and reviews
        const emptyResponses = [
            mockUserDetails, // User details
            [],              // Empty orders
            [],              // Empty reviews
        ];

        await renderComponent(mockUser, emptyResponses);

        // Wait for all 3 successful fetches
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

        // Expect the component to show the "No items to display" message
        // This execution path should hit initialization code (L32) and the data filtering/check (L69)
        expect(screen.getByText("No items to display.")).toBeInTheDocument();
        expect(screen.queryByText(productParagraphMatcher("Tuna"))).not.toBeInTheDocument();
    });
});
