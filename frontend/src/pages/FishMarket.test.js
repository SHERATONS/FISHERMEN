import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'; // Import cleanup
import '@testing-library/jest-dom';
import FishMarket from './FishMarket';
import { useAuth } from "../AuthContext"; // Correct path based on your structure
import { useNavigate } from 'react-router-dom';

// --- Mock Setup ---

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <span>CheckCircle</span>,
  User: () => <span>User</span>,
  Mail: () => <span>Mail</span>,
  Lock: () => <span>Lock</span>,
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Import and spread original module
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext (using the correct path)
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fish data
const mockFishList = [
  { id: 1, fishType: "Salmon", status: "Fresh", price: 150.00, location: "Norway", catchDate: "2025-11-15T08:00:00Z", photoUrl: "salmon.jpg", weightInKg: 1 },
  { id: 2, fishType: "Tuna", status: "Frozen", price: 200.00, location: "Japan", catchDate: "2025-11-14T08:00:00Z", photoUrl: "tuna.jpg", weightInKg: 1.5 },
  { id: 3, fishType: "Cod", status: "Fresh", price: 80.50, location: "Alaska", catchDate: "2025-11-15T10:00:00Z", photoUrl: "cod.jpg", weightInKg: 0.8 },
];

// Helper function to render the component with a specific user role
const renderComponent = (role = "BUYER") => {
  useAuth.mockImplementation(() => ({
    login: jest.fn(),
    user: { role: role },
  }));

  render(<FishMarket />);
};

// --- Test Suites ---
// Suite 1: FishMarket Data Fetching and Initial Render
// Suite 2: FishMarket Filtering Logic
// Suite 3: Cart and User Role Logic

describe('Suite 1: FishMarket Data Fetching and Initial Render', () => {
  beforeEach(() => {
    // Reset mocks before each test
    global.fetch = jest.fn();
    mockNavigate.mockClear();
    useAuth.mockClear();
    cleanup(); // Clean up DOM before each test
  });

  // Test case 1.1: Should display a loading message initially.
  test('should display a loading message initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Keep it pending
    renderComponent("BUYER");
    expect(screen.getByText(/loading fresh catches/i)).toBeInTheDocument();
  });

  // Test case 1.2: Should fetch and display fish listings successfully.
  test('should fetch and display fish listings successfully', async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(mockFishList),
    });
    renderComponent("BUYER");

    // Wait for the fish to appear
    expect(await screen.findByRole('heading', { name: 'Salmon' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Tuna' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Cod' })).toBeInTheDocument();
  });

  // Test case 1.3: Should display 'No fish listings found' if fetch returns an empty array.
  test("should display 'No fish listings found' if fetch returns an empty array", async () => {
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve([]),
    });
    renderComponent("BUYER");
    
    // It will be loading first, then show the empty message
    expect(await screen.findByText('No fish listings found.')).toBeInTheDocument();
  });

  // Test case 1.4: Should handle fetch error (and show 'No fish listings found').
  test('should handle fetch error', async () => {
    // Mock console.error to avoid logging during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch.mockRejectedValue(new Error('API is down'));
    renderComponent("BUYER");

    // The component catches the error and sets loading to false,
    // resulting in an empty list.
    expect(await screen.findByText('No fish listings found.')).toBeInTheDocument();
    
    // Restore console.error
    console.error.mockRestore();
  });
});

describe('Suite 2: FishMarket Filtering Logic', () => {
  beforeEach(async () => {
    // Load the component with data before each filter test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockFishList),
      })
    );
    renderComponent("BUYER");
    
    // Wait for all items to be loaded
    await screen.findByRole('heading', { name: 'Salmon' });
    await screen.findByRole('heading', { name: 'Tuna' });
    await screen.findByRole('heading', { name: 'Cod' });
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
  });

  // Test case 2.1: Should filter by search term (case-insensitive).
  test('should filter by search term (case-insensitive)', () => {
    const searchInput = screen.getByPlaceholderText(/search for fish/i);
    fireEvent.change(searchInput, { target: { value: 'salmon' } });

    expect(screen.getByRole('heading', { name: 'Salmon' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tuna' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cod' })).not.toBeInTheDocument();
  });

  // Test case 2.2: Should filter by selected species.
  test('should filter by selected species', () => {
    // FIX: Find selects by role because <label> is not associated
    const allSelects = screen.getAllByRole('combobox');
    const speciesSelect = allSelects[0]; // First select is Species
    
    fireEvent.change(speciesSelect, { target: { value: 'Tuna' } });

    expect(screen.getByRole('heading', { name: 'Tuna' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Salmon' })).not.toBeInTheDocument();
  });

  // Test case 2.3: Should filter by selected freshness/status.
  test('should filter by selected freshness/status', () => {
    // FIX: Find selects by role because <label> is not associated
    const allSelects = screen.getAllByRole('combobox');
    const statusSelect = allSelects[1]; // Second select is Status

    fireEvent.change(statusSelect, { target: { value: 'Frozen' } });

    expect(screen.getByRole('heading', { name: 'Tuna' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Salmon' })).not.toBeInTheDocument();
  });

  // Test case 2.4: Should filter by minimum and maximum price.
  test('should filter by minimum and maximum price', () => {
    const minPriceInput = screen.getByPlaceholderText('Min');
    const maxPriceInput = screen.getByPlaceholderText('Max');

    // Set min price to 100
    fireEvent.change(minPriceInput, { target: { value: '100' } });
    
    // FIX: Use getByRole to avoid "multiple elements" error
    expect(screen.getByRole('heading', { name: 'Salmon' })).toBeInTheDocument(); // 150
    expect(screen.getByRole('heading', { name: 'Tuna' })).toBeInTheDocument(); // 200
    expect(screen.queryByRole('heading', { name: 'Cod' })).not.toBeInTheDocument(); // 80.50

    // Set max price to 160
    fireEvent.change(maxPriceInput, { target: { value: '160' } });
    expect(screen.getByRole('heading', { name: 'Salmon' })).toBeInTheDocument(); // 150
    expect(screen.queryByRole('heading', { name: 'Tuna' })).not.toBeInTheDocument(); // 200
  });

  // Test case 2.5: Should show 'No fish listings' when filters match nothing.
  test("should show 'No fish listings' when filters match nothing", () => {
    const searchInput = screen.getByPlaceholderText(/search for fish/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Fish' } });

    expect(screen.getByText('No fish listings found.')).toBeInTheDocument();
  });
});


describe('Suite 3: Cart and User Role Logic', () => {
  beforeEach(async () => {
    // Load the component with data before each cart test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockFishList),
      })
    );
    // Mock window.alert
    global.alert = jest.fn();

    renderComponent("BUYER");
    
    await screen.findByRole('heading', { name: 'Salmon' });
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
  });
  
  // Test case 3.1: Should add a new item to the cart (hits 'else' branch of addToCart).
  test('should add a new item to the cart', () => {
    const salmonAddToCart = screen.getAllByText('Add to Cart').find(btn => btn.closest('.fish-card').textContent.includes('Salmon'));
    fireEvent.click(salmonAddToCart);

    // Check if item is in the cart panel
    const cartPanel = screen.getByText('🛒 Your Cart').closest('div');
    expect(cartPanel).toHaveTextContent('Salmon (1kg) x 1 - ฿150.00');
    expect(cartPanel).toHaveTextContent('Total: ฿150.00');
  });
  
  // Test case 3.2: Should increment quantity for an existing item (hits 'if' branch of addToCart).
  test('should increment quantity for an existing item in the cart', () => {
    const salmonAddToCart = screen.getAllByText('Add to Cart').find(btn => btn.closest('.fish-card').textContent.includes('Salmon'));
    
    // Click twice
    fireEvent.click(salmonAddToCart);
    fireEvent.click(salmonAddToCart);

    const cartPanel = screen.getByText('🛒 Your Cart').closest('div');
    expect(cartPanel).toHaveTextContent('Salmon (1kg) x 2 - ฿300.00');
    expect(cartPanel).toHaveTextContent('Total: ฿300.00');
  });

  // Test case 3.3: Should remove an item from the cart.
  test('should remove an item from the cart', async () => {
    const salmonAddToCart = screen.getAllByText('Add to Cart').find(btn => btn.closest('.fish-card').textContent.includes('Salmon'));
    fireEvent.click(salmonAddToCart);

    // Ensure it's in the cart
    const cartPanel = screen.getByText('🛒 Your Cart').closest('div');
    expect(cartPanel).toHaveTextContent('Salmon');

    // Click remove button
    const removeButton = screen.getByText('✕');
    fireEvent.click(removeButton);

    expect(cartPanel).not.toHaveTextContent('Salmon');
    expect(cartPanel).toHaveTextContent('Your cart is empty.');
  });
  
  // Test case 3.4: Should navigate to payment on checkout (hits 'else' branch of handleCheckout).
  test('should navigate to payment on checkout with correct total', () => {
    const salmonAddToCart = screen.getAllByText('Add to Cart').find(btn => btn.closest('.fish-card').textContent.includes('Salmon'));
    const tunaAddToCart = screen.getAllByText('Add to Cart').find(btn => btn.closest('.fish-card').textContent.includes('Tuna'));
    
    fireEvent.click(salmonAddToCart); // 150
    fireEvent.click(tunaAddToCart);   // 200
    // Total = 350

    const checkoutButton = screen.getByText('Checkout');
    fireEvent.click(checkoutButton);

    expect(mockNavigate).toHaveBeenCalledWith("/payment", { state: { totalAmount: 350 } });
  });

  // Test case 3.5: FIX: Should NOT display checkout button if cart is empty
  test('should NOT display checkout button if cart is empty', () => {
    // This test starts with an empty cart (from beforeEach)
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    
    // Assert that the checkout button is NOT visible
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
  });
  
  // Test case 3.6: Should hide cart and 'Add to Cart' buttons for non-BUYER roles.
  test('should hide cart and "Add to Cart" buttons for non-BUYER users', async () => {
    cleanup(); // FIX: Clean up the 'BUYER' render from beforeEach
    
    // Re-render as a FISHERMAN
    renderComponent("FISHERMAN");

    // Wait for data to load
    await screen.findByRole('heading', { name: 'Salmon' });

    // Check that cart-related UI is hidden
    expect(screen.queryByText('🛒 Your Cart')).not.toBeInTheDocument();
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
    expect(screen.queryAllByText('Add to Cart').length).toBe(0);
    
    // Check that the layout class is applied
    // FIX: Use getAllByText[0] to avoid multiple "Filters" error
    const container = screen.getAllByText('Filters')[0].closest('.fish-list-container');
    expect(container).toHaveClass('full-width-display');
  });
});