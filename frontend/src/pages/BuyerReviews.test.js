import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BuyerReviews from './BuyerReviews';
import { useAuth } from "../AuthContext"; // ตรวจสอบ Path

// --- Mock Setup ---
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));
global.fetch = jest.fn();
global.alert = jest.fn();

// --- Mock Data ---
const mockUser = { 
  id: 'buyer123', 
  firstName: 'Test', 
  lastName: 'User' 
};
const mockUserDetails = {
  id: 'buyer123',
  firstName: 'Testy',
  lastName: 'McTestFace'
};
const mockOrders = [
  { 
    id: 'order-001', 
    status: 'SHIPPED',
    items: [
      { id: 'item-1', fishListing: { fishType: 'Salmon', price: 100, fisherman: { firstName: 'Sam' } }, quantity: 1 },
      { id: 'item-2', fishListing: { fishType: 'Tuna', price: 150, fisherman: { firstName: 'Tom' } }, quantity: 2 }
    ]
  },
  {
    id: 'order-002',
    status: 'PENDING',
    items: [
      { id: 'item-3', fishListing: { fishType: 'Cod', price: 80, fisherman: { firstName: 'Chris' } }, quantity: 1 }
    ]
  }
];
const mockExistingReviews = [
  {
    id: 'review-1',
    rating: 5,
    comment: 'Great fish!',
    reviewDate: new Date().toISOString(),
    orderItemId: 'item-1',
    orderItem: { id: 'item-1' }
  }
];
const mockCreateReviewResponse = {
  id: 'review-2',
  rating: 4,
  comment: 'Very fresh',
  buyerId: 'buyer123',
  orderItemId: 'item-2',
  reviewDate: new Date().toISOString()
};

// Helper function
const renderComponent = () => {
  // === FIX WAS APPLIED HERE ===
  // Mock useAuth *นอก* implementation ของ fetch
  useAuth.mockReturnValue({ user: mockUser });

  global.fetch.mockImplementation((url) => {
    if (url.includes('/api/users/buyer123')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
    }
    if (url.includes('/api/orders/buyer/buyer123')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOrders) });
    }
    if (url.includes('/api/reviews/buyer/buyer123')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([...mockExistingReviews]) }); // Send a copy
    }
    if (url.includes('/api/reviews/create')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateReviewResponse) });
    }
    if (url.includes('/api/reviews/update/review-1')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...mockExistingReviews[0], comment: 'Updated comment', rating: 3 }) });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });

  return render(<BuyerReviews />);
};

// --- Test Suites ---

describe('Suite 1: BuyerReviews Initial Render & Data Fetching', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch.mockClear();
    global.alert.mockClear();
    useAuth.mockClear();
    
    // === FIX WAS APPLIED HERE ===
    // Mock useAuth ใน beforeEach *ทุกครั้ง*
    useAuth.mockReturnValue({ user: mockUser });
  });
  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  // Test case 1.1: Should show loading state initially
  test('should show loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    render(<BuyerReviews />); // ไม่ต้องใช้ helper
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  // Test case 1.2: Should fetch all data and display "Not Reviewed" items by default
  test('should fetch all data and display "Not Reviewed" items by default', async () => {
    await act(async () => {
      renderComponent();
    });

    expect(await screen.findByText('Testy McTestFace')).toBeInTheDocument();

    // === FIX WAS APPLIED HERE ===
    // ใช้ Regex /Product:\s*Tuna/i (มี \s* (whitespace))
    expect(await screen.findByText(/Product:\s*Tuna/i)).toBeInTheDocument();
    
    expect(screen.queryByText(/Product:\s*Salmon/i)).not.toBeInTheDocument();
  });

  // Test case 1.3: Should display "No items to display" if all items are reviewed
  test('should display "No items to display" if all items are reviewed', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/orders/buyer/buyer123')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([mockOrders[0]]) });
      }
      if (url.includes('/api/reviews/buyer/buyer123')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([
          { id: 'r1', orderItemId: 'item-1', orderItem: { id: 'item-1' } },
          { id: 'r2', orderItemId: 'item-2', orderItem: { id: 'item-2' } }
        ]) });
      }
      if (url.includes('/api/users/buyer123')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUserDetails) });
      }
      return Promise.resolve({ ok: false });
    });
    
    await act(async () => {
      render(<BuyerReviews />); // ไม่ต้องใช้ helper, useAuth mock แล้ว
    });
    
    expect(await screen.findByText('No items to display.')).toBeInTheDocument();
  });
});

describe('Suite 2: BuyerReviews Filtering Logic', () => {
  beforeEach(async () => {
    // === FIX WAS APPLIED HERE ===
    useAuth.mockReturnValue({ user: mockUser });
    await act(async () => {
      renderComponent();
    });
    await screen.findByText(/Product:\s*Tuna/i); // รอให้โหลดเสร็จ
  });
  afterEach(() => cleanup());

  // Test case 2.1: Should switch to "Reviewed" filter and show reviewed items
  test('should switch to "Reviewed" filter and show reviewed items', async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reviewed' }));
    });
    
    // === FIX WAS APPLIED HERE ===
    expect(await screen.findByText(/Product:\s*Salmon/i)).toBeInTheDocument();
    expect(screen.getByText('Your Rating: ★★★★★ (5/5)')).toBeInTheDocument();
    expect(screen.queryByText(/Product:\s*Tuna/i)).not.toBeInTheDocument();
  });

  // Test case 2.2: Should switch back to "Not Reviewed" filter
  test('should switch back to "Not Reviewed" filter', async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reviewed' }));
    });
    // === FIX WAS APPLIED HERE ===
    expect(await screen.findByText(/Product:\s*Salmon/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Not Reviewed' }));
    });

    // === FIX WAS APPLIED HERE ===
    expect(await screen.findByText(/Product:\s*Tuna/i)).toBeInTheDocument();
    expect(screen.queryByText(/Product:\s*Salmon/i)).not.toBeInTheDocument();
  });
});

describe('Suite 3: Review Submission and Editing Logic', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    global.fetch.mockClear();
    global.alert.mockClear();
    
    // === FIX WAS APPLIED HERE ===
    useAuth.mockReturnValue({ user: mockUser });
    await act(async () => {
      renderComponent();
    });
    await screen.findByText(/Product:\s*Tuna/i); // รอให้โหลดเสร็จ
  });
  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  // Test case 3.1: Should show validation alert if form is incomplete
  test('should show validation alert if form is incomplete', async () => {
    // === FIX WAS APPLIED HERE ===
    const tunaCard = screen.getByText(/Product:\s*Tuna/i).closest('.order-card');
    
    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole('button', { name: 'Rate' }));
    });
    
    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole('button', { name: 'Submit Review' }));
    });

    expect(global.alert).toHaveBeenCalledWith('Please select a rating and write a comment!');
  });

  // Test case 3.2: Should successfully create a new review
  test('should successfully create a new review', async () => {
    // === FIX WAS APPLIED HERE ===
    const tunaCard = screen.getByText(/Product:\s*Tuna/i).closest('.order-card');

    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole('button', { name: 'Rate' }));
    });

    await act(async () => {
      fireEvent.click(within(tunaCard).getAllByText('★')[4]); // คลิกดาวดวงที่ 5
      fireEvent.change(within(tunaCard).getByPlaceholderText('Write your review...'), {
        target: { value: 'Very fresh' }
      });
    });

    await act(async () => {
      fireEvent.click(within(tunaCard).getByRole('button', { name: 'Submit Review' }));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/reviews/create',
      expect.objectContaining({ method: 'POST' })
    );
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Review submitted successfully!');
    });
    
    // === FIX WAS APPLIED HERE ===
    expect(screen.queryByText(/Product:\s*Tuna/i)).not.toBeInTheDocument();
  });

  // Test case 3.3: Should edit an existing review
  test('should edit an existing review', async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reviewed' }));
    });

    // === FIX WAS APPLIED HERE ===
    const salmonCard = await screen.findByText(/Product:\s*Salmon/i);
    const card = salmonCard.closest('.order-card');

    await act(async () => {
      fireEvent.click(within(card).getByRole('button', { name: 'Edit Review' }));
    });

    expect(await within(card).findByPlaceholderText('Write your review...')).toHaveValue('Great fish!');

    await act(async () => {
      fireEvent.click(within(card).getAllByText('★')[2]); // คลิกดาวดวงที่ 3
      fireEvent.change(within(card).getByPlaceholderText('Write your review...'), {
        target: { value: 'Updated comment' }
      });
    });

    await act(async () => {
      fireEvent.click(within(card).getByRole('button', { name: 'Update Review' }));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/reviews/update/review-1',
      expect.objectContaining({ method: 'PUT' })
    );
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Review updated successfully!');
    });

    expect(screen.queryByPlaceholderText('Write your review...')).not.toBeInTheDocument();
    expect(screen.getByText('Your Rating: ★★★ (3/5)')).toBeInTheDocument();
    expect(screen.getByText('Your Comment: Updated comment')).toBeInTheDocument();
  });
});