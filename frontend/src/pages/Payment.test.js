import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'; // 1. Import 'act'
import '@testing-library/jest-dom';
import Payment from './Payment';
import { useLocation, useNavigate } from 'react-router-dom';

// --- Mock Setup ---
jest.mock('lucide-react', () => ({
  CreditCard: () => <span>CreditCard</span>,
  Smartphone: () => <span>Smartphone</span>,
  Wallet: () => <span>Wallet</span>,
  QrCode: () => <span>QrCode</span>,
  CheckCircle: () => <span>CheckCircle</span>,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));
const mockUseLocation = jest.requireMock('react-router-dom').useLocation;
global.alert = jest.fn();

// Helper function
const renderComponent = (amount = 123.45) => {
  mockUseLocation.mockReturnValue({
    state: { totalAmount: amount },
  });
  render(<Payment />);
};

// --- Test Suites ---

describe('Suite 1: Payment Page Initial Render and Data Display', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseLocation.mockClear();
  });

  // Test case 1.1: Should display the total amount from location state
  test('should display the total amount from location state', () => {
    renderComponent(500.75);
    // 2. แก้ไข: เจาะจง level 2 (h2)
    expect(screen.getByRole('heading', { name: /Payment/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText('฿500.75')).toBeInTheDocument();
  });

  // Test case 1.2: Should display 0.00 if total amount is not provided
  test('should display 0.00 if total amount is not provided', () => {
    mockUseLocation.mockReturnValue({ state: null });
    render(<Payment />);
    expect(screen.getByText('฿0.00')).toBeInTheDocument();
  });

  // Test case 1.3: Should display all payment method buttons
  test('should display all payment method buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Credit \/ Debit Card/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mobile Banking/i })).toBeInTheDocument();
  });
});

describe('Suite 2: Payment Form Validation (Unhappy Path)', () => {
  beforeEach(() => {
    global.alert.mockClear();
    renderComponent();
  });

  // Test case 2.1: Should alert if no payment method is selected
  test('should alert if no payment method is selected on submit', () => {
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));
    expect(global.alert).toHaveBeenCalledWith('Please select a payment method.');
  });

  // Test case 2.2: Should alert if card number is invalid
  test('should alert if card number is invalid (less than 16 digits)', () => {
    fireEvent.click(screen.getByRole('button', { name: /Credit \/ Debit Card/i }));
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByPlaceholderText('CVC'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));
    expect(global.alert).toHaveBeenCalledWith('Please enter a valid 16-digit card number.');
  });

  // Test case 2.3: Should alert if card expiry is invalid (bad format)
  test('should alert if card expiry is invalid (bad format)', () => {
    fireEvent.click(screen.getByRole('button', { name: /Credit \/ Debit Card/i }));
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), { target: { value: '1234 5678 9012 3456' } });
    // 3. แก้ไข: ใช้ '12/2' (format ผิด) แทน '1225' (ซึ่งถูก auto-format)
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/2' } }); 
    fireEvent.change(screen.getByPlaceholderText('CVC'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));
    expect(global.alert).toHaveBeenCalledWith('Expiry must be in MM/YY format.');
  });
});

describe('Suite 3: Successful Payment Flow (Happy Path)', () => {
  
  beforeEach(() => {
    jest.useFakeTimers();
    global.alert.mockClear();
    mockNavigate.mockClear();
    renderComponent();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test case 3.1: Should successfully "pay" with Credit Card
  test('should successfully "pay" with Credit Card and navigate', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Credit \/ Debit Card/i }));
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), { target: { value: '1234 5678 9012 3456' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByPlaceholderText('CVC'), { target: { value: '123' } });
    
    // 4. ห่อ (wrap) 'click' ด้วย 'act'
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));
    });

    expect(global.alert).not.toHaveBeenCalled();
    expect(await screen.findByText('Payment Successful')).toBeInTheDocument();

    // === FIX WAS APPLIED HERE ===
    // 5. "รอ" ให้ช่อง CVC "หายไป" (queryBy)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('CVC')).not.toBeInTheDocument();
    });
    
    // 6. ห่อ 'timer' ด้วย 'act'
    await act(async () => {
      jest.advanceTimersByTime(3200);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Test case 3.2: Should successfully "pay" with Mobile Banking
  test('should successfully "pay" with Mobile Banking and navigate', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Mobile Banking/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SCB' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Confirm Payment/i }));
    });
    
    expect(await screen.findByText('Payment successful by SCB')).toBeInTheDocument();
    
    // === FIX WAS APPLIED HERE ===
    // 7. "รอ" ให้ combobox "หายไป" (queryBy)
    await waitFor(() => {
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
    
    await act(async () => {
      jest.advanceTimersByTime(3200);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});