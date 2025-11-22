import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'; // 1. Import 'act'
import '@testing-library/jest-dom';
import axios from 'axios';
import { useAuth } from "../AuthContext"; // Path to your AuthContext
import { useNavigate } from 'react-router-dom';
import LoginRegisPage from './LoginRegisPage';

// --- Mock Setup ---
jest.mock('lucide-react', () => ({
  CheckCircle: (props) => <svg {...props}>CheckCircle</svg>,
  User: (props) => <svg {...props}>User</svg>,
  Mail: (props) => <svg {...props}>Mail</svg>,
  Lock: (props) => <svg {...props}>Lock</svg>,
}));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
const mockLogin = jest.fn();
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('axios');
global.alert = jest.fn();

// --- Helper Function ---
const renderComponent = (loggedInUser = null) => {
  useAuth.mockImplementation(() => ({
    user: loggedInUser,
    login: mockLogin,
  }));
  render(<LoginRegisPage />);
};

// --- Test Suites ---
describe('Suite 1: LoginRegisPage Initial Render and Redirects', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
    useAuth.mockClear();
    cleanup();
  });

  // Test case 1.1: Should render the Login form by default
  test('should render the Login form by default', () => {
    renderComponent(null);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username or Email/i)).toBeInTheDocument();
  });
  
  // Test case 1.2: Should switch to Register form when "Register" is clicked
  test('should switch to Register form when "Register" is clicked', async () => {
    renderComponent(null);
    // 2. ใช้ 'act' ห่อ 'click' ที่ทำให้ state เปลี่ยน
    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
  });

  // Test case 1.3: Should redirect to /market if a BUYER is already logged in
  test('should redirect to /market if a BUYER is already logged in', () => {
    renderComponent({ role: 'BUYER', id: 'b1' });
    expect(mockNavigate).toHaveBeenCalledWith('/market');
  });

  // Test case 1.4: Should redirect to /upload if a FISHERMAN is already logged in
  test('should redirect to /upload if a FISHERMAN is already logged in', () => {
    renderComponent({ role: 'FISHERMAN', id: 'f1' });
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });
});

describe('Suite 2: Login Logic and Validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    axios.post.mockClear();
    renderComponent(null);
  });
  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  // Test case 2.1: Should login successfully as BUYER (with Object response)
  test('should login successfully as BUYER (with Object response)', async () => {
    const mockUserResponse = { id: 'b1', role: 'BUYER', username: 'buyer1' };
    axios.post.mockResolvedValue({ data: mockUserResponse });

    fireEvent.change(screen.getByPlaceholderText(/Username or Email/i), { target: { value: 'buyer@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    
    // 3. ใช้ 'act' ห่อ 'click' ที่เป็น async (handleSubmit)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/users/login",
      { username: 'buyer@test.com', password: 'password123' }
    );
    expect(mockLogin).toHaveBeenCalledWith(mockUserResponse);
    
    // 4. ใช้ 'act' ห่อการเร่งเวลา
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/market');
  });

  // Test case 2.2: Should login successfully as FISHERMAN (with String response)
  test('should login successfully as FISHERMAN (with String response)', async () => {
    const mockStringResponse = 'Login success: {"id":"f1", "role":"FISHERMAN"}';
    axios.post.mockResolvedValue({ data: mockStringResponse });
    
    fireEvent.change(screen.getByPlaceholderText(/Username or Email/i), { target: { value: 'fisher1' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    
    expect(mockLogin).toHaveBeenCalledWith({ role: 'FISHERMAN', id: 'f1' });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  // Test case 2.3: Should show validation error for empty fields
  test('should show validation error for empty fields', async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    expect(await screen.findByText('Username/email and password are required')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
  
  // Test case 2.4: Should show server error on login failure
  test('should show server error on login failure', async () => {
    axios.post.mockRejectedValue({ response: { data: 'Invalid credentials' } });
    fireEvent.change(screen.getByPlaceholderText(/Username or Email/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpass' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    
    expect(await screen.findByText('Login failed: Invalid credentials')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe('Suite 3: Registration Logic and Validation', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    axios.post.mockClear();
    
    renderComponent(null);
    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });
    await screen.findByRole('heading', { name: /Register/i });
  });
  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  // Test case 3.1: Should register successfully
  test('should register successfully and show popup', async () => {
    axios.post.mockResolvedValue({ data: { message: 'User registered' } });

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'New' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buyer' }));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/users/register",
      expect.objectContaining({ role: 'BUYER' })
    );

    // 5. 'act' warnings หายไปเพราะ 'findByText' ทำหน้าที่รอ
    expect(await screen.findByText('Registration Successful!')).toBeInTheDocument();
    
    // 6. 'act' warnings หายไปเพราะ 'waitFor' ทำหน้าที่รอ
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/First Name/i)).toHaveValue('');
    });
  });

  // Test case 3.2: Should show validation error for password mismatch
  test('should show validation error for password mismatch', async () => {
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'pass456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buyer' }));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });

    expect(await screen.findByText(/check password confirmation/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
  
  // Test case 3.3: Should show validation error if role is not selected
  test('should show validation error if role is not selected', async () => {
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'pass123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });

    expect(await screen.findByText(/Please select your role/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  // Test case 3.4: Should show server error on registration failure
  test('should show server error on registration failure', async () => {
    axios.post.mockRejectedValue({ response: { data: 'Username already exists' } });

    // === FIX WAS APPLIED HERE ===
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'existinguser' } });
    // 1. แก้ไข Password ให้ตรงกัน
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'pass123' } }); 
    fireEvent.click(screen.getByRole('button', { name: 'Buyer' }));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });

    expect(await screen.findByText('Registration failed: Username already exists')).toBeInTheDocument();
  });
});