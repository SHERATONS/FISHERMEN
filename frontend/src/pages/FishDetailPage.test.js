import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FishDetailPage from './FishDetailPage';
import { useParams, useNavigate } from 'react-router-dom';

// --- Mock Setup ---

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Import ของจริง
  useNavigate: () => mockNavigate, // แต่ override useNavigate
  useParams: jest.fn(), // และ override useParams
}));
// สร้างตัวแปรสำหรับ useParams ที่เราจะ mock
const mockUseParams = jest.requireMock('react-router-dom').useParams;

// --- Helper Function ---

// Helper function สำหรับ render component พร้อม props และ params ที่เรากำหนด
const renderComponent = (params, cartProps = [], setCartProps = jest.fn()) => {
  // 1. Mock ค่า ID จาก URL
  mockUseParams.mockReturnValue(params);
  
  // 2. Render component พร้อม mock props
  render(<FishDetailPage cart={cartProps} setCart={setCartProps} />);
};

// --- Test Suites ---

describe('Suite 1: FishDetailPage Rendering Logic', () => {

  beforeEach(() => {
    // ล้าง mock ก่อนทุกเทส
    mockUseParams.mockClear();
    mockNavigate.mockClear();
  });

  // Test case 1.1: Should render fish details when a valid ID is provided
  test('should render fish details when a valid ID is provided', () => {
    // 1. Render โดยใช้ ID: 1 (Salmon)
    renderComponent({ id: '1' });

    // 2. ตรวจสอบว่า `useParams` ถูกเรียกด้วย ID "1" (จาก MOCK_FISH_DATA)
    expect(mockUseParams).toHaveBeenCalled();
    
    // 3. ตรวจสอบว่าข้อมูล "Salmon Fillet" แสดงบนจอ
    expect(screen.getByRole('heading', { name: 'Salmon Fillet' })).toBeInTheDocument();
    expect(screen.getByText('$12.99/lb')).toBeInTheDocument();
    
    // === FIX WAS APPLIED HERE ===
    // ใช้ Regex (/.../i) เพื่อหา "ส่วนหนึ่ง" ของข้อความ
    expect(screen.getByText(/Freshly caught wild salmon/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
  });

  // Test case 1.2: Should render "Fish not found" message for an invalid ID
  test('should render "Fish not found" message for an invalid ID', () => {
    // 1. Render โดยใช้ ID: 99 (ซึ่งไม่มีใน MOCK_FISH_DATA)
    renderComponent({ id: '99' });

    // 2. ตรวจสอบว่าแสดงข้อความ "Not Found"
    expect(screen.getByText('Fish not found! 🐟')).toBeInTheDocument();
    
    // 3. ตรวจสอบว่า "ไม่แสดง" ปุ่ม Add to Cart
    expect(screen.queryByRole('button', { name: /Add to Cart/i })).not.toBeInTheDocument();
  });
});

describe('Suite 2: FishDetailPage Navigation', () => {

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // Test case 2.1: Should navigate back when "Back to Market" button is clicked
  test('should navigate back when "Back to Market" button is clicked', () => {
    // 1. Render หน้าปลา (ID ไหนก็ได้)
    renderComponent({ id: '1' });

    // 2. หาปุ่ม "Back"
    const backButton = screen.getByRole('button', { name: /← Back to Market/i });
    
    // 3. คลิก
    fireEvent.click(backButton);

    // 4. ตรวจสอบว่า `Maps(-1)` (คำสั่ง "ย้อนกลับ") ถูกเรียก
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe('Suite 3: FishDetailPage Cart Logic', () => {
  
  const mockSetCart = jest.fn();

  beforeEach(() => {
    mockSetCart.mockClear();
  });

  // Test case 3.1: Should add a new item to an empty cart
  test('should add a new item to an empty cart', () => {
    const initialCart = []; // ตะกร้าว่าง
    
    // 1. Render หน้าปลา ID 2 (Tuna)
    renderComponent({ id: '2' }, initialCart, mockSetCart);

    // 2. คลิก "Add to Cart"
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    // 3. ตรวจสอบว่า `setCart` ถูกเรียก 1 ครั้ง
    expect(mockSetCart).toHaveBeenCalledTimes(1);

    // 4. (ขั้นสูง) ตรวจสอบ Logic ของ state update function
    // ดึง "function" ที่ถูกส่งเข้าไปใน `setCart`
    const stateUpdateFunction = mockSetCart.mock.calls[0][0]; 
    // จำลองการรัน function นั้น (โดยส่ง 'initialCart' เข้าไปเป็น 'prev')
    const newState = stateUpdateFunction(initialCart); 

    // 5. ตรวจสอบผลลัพธ์ (Branch "New Item")
    expect(newState).toHaveLength(1);
    expect(newState[0].id).toBe(2); // ID 2 (Tuna)
    expect(newState[0].quantity).toBe(1);
  });

  // Test case 3.2: Should increment quantity of an existing item in the cart
  test('should increment quantity of an existing item in the cart', () => {
    // 1. ตะกร้าเริ่มต้น: มี Salmon (ID 1) อยู่แล้ว 3 ชิ้น
    const initialCart = [
      { id: 1, name: 'Salmon Fillet', quantity: 3 }
    ];
    
    // 2. Render หน้าปลา ID 1 (Salmon)
    renderComponent({ id: '1' }, initialCart, mockSetCart);

    // 3. คลิก "Add to Cart"
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    // 4. ตรวจสอบว่า `setCart` ถูกเรียก 1 ครั้ง
    expect(mockSetCart).toHaveBeenCalledTimes(1);

    // 5. ดึง state update function มาทดสอบ
    const stateUpdateFunction = mockSetCart.mock.calls[0][0];
    const newState = stateUpdateFunction(initialCart);

    // 6. ตรวจสอบผลลัพธ์ (Branch "Existing Item")
    expect(newState).toHaveLength(1); // ตะกร้ายังมี 1 รายการ
    expect(newState[0].id).toBe(1);
    expect(newState[0].quantity).toBe(4); // Quantity ควรเพิ่มจาก 3 เป็น 4
  });
});