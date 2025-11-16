import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; 
import Navbar from './Navbar';
import { useAuth } from "./AuthContext"; // Path นี้ถูกต้องเมื่อไฟล์อยู่ที่ src/
import { useNavigate } from "react-router-dom";

// --- Mock Setup ---
jest.mock('./AuthContext', () => ({ // Path นี้ถูกต้อง
  useAuth: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
const mockIsSessionExpired = jest.fn();

// --- Helper Function ---
const renderComponent = (user, isExpired = false) => {
  useAuth.mockReturnValue({
    user: user,
    logout: mockLogout,
    isSessionExpired: mockIsSessionExpired,
  });
  useNavigate.mockReturnValue(mockNavigate);
  mockIsSessionExpired.mockReturnValue(isExpired);

  act(() => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  });
};

// --- Test Suites ---

describe('Suite 1: Navbar Conditional Rendering (Role-Based UI)', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockNavigate.mockClear();
    mockIsSessionExpired.mockClear();
    useAuth.mockClear();
  });

  // Test case 1.1: Should render correctly for a Guest (user is null)
  test('should render correctly for a Guest (user is null)', () => {
    renderComponent(null);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload Fish')).not.toBeInTheDocument();
  });

  // Test case 1.2: Should render correctly for a BUYER
  test('should render correctly for a BUYER', () => {
    renderComponent({ role: 'BUYER' });
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  // Test case 1.3: Should render correctly for a FISHERMAN
  test('should render correctly for a FISHERMAN', () => {
    renderComponent({ role: 'FISHERMAN' });
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Upload Fish')).toBeInTheDocument();
    expect(screen.getByText('Manage Orders')).toBeInTheDocument();
  });
});

describe('Suite 2: Navbar User Actions (Logout)', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockNavigate.mockClear();
  });

  // Test case 2.1: Should call logout and navigate when "Logout" button is clicked
  test('should call logout and navigate when "Logout" button is clicked', () => {
    renderComponent({ role: 'BUYER' });
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    act(() => {
      fireEvent.click(logoutButton);
    });
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('Suite 3: Navbar Session Management (useEffect)', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockNavigate.mockClear();
    mockIsSessionExpired.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    console.log.mockRestore();
  });

  // Test case 3.1: Should NOT logout if user exists and session is valid
  test('should NOT logout if user exists and session is valid', () => {
    renderComponent({ role: 'BUYER' }, false);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  // Test case 3.2: Should automatically logout if session is expired
  test('should automatically logout if session is expired', () => {
    renderComponent({ role: 'BUYER' }, true);
    expect(console.log).toHaveBeenCalledWith("Session expired, logging out user");
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});