import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Manage from './Manage'; // ตรวจสอบว่า path ถูกต้อง

// --- Mock Setup ---

// Mock `fetch` ของ browser
global.fetch = jest.fn();

// Mock ข้อมูล Order ที่จะใช้ทดสอบ
const mockOrders = [
  {
    id: "order-111",
    status: "PENDING",
    orderDate: "2025-11-17T10:00:00Z",
    totalPrice: 250.00,
    buyer: { username: "buyer_a" },
    items: [
      { fishName: "Salmon", quantity: 1, priceAtPurchase: 150.00, photoUrl: "salmon.jpg" },
      { fishName: "Tuna", quantity: 1, priceAtPurchase: 100.00, photoUrl: "tuna.jpg" }
    ]
  },
  {
    id: "order-222",
    status: "UNSHIPPED",
    orderDate: "2025-11-16T11:00:00Z",
    totalPrice: 180.50,
    buyer: { username: "buyer_b" },
    items: [
      { fishName: "Cod", quantity: 2, priceAtPurchase: 90.25, photoUrl: "cod.jpg" }
    ]
  },
  {
    id: "order-333",
    status: "SHIPPED",
    orderDate: "2025-11-15T12:00:00Z",
    totalPrice: 300.00,
    buyer: { username: "buyer_c" },
    items: [
      { fishName: "Mackerel", quantity: 3, priceAtPurchase: 100.00, photoUrl: null }
    ]
  }
];

// Helper function สำหรับ render พร้อม mock ที่สมบูรณ์
const renderComponent = (mockData) => {
  global.fetch.mockResolvedValue({
    json: () => Promise.resolve(mockData),
  });
  render(<Manage />);
};

// --- Test Suites ---

describe('Suite 1: Manage Component Initial Render & Data Fetching', () => {

  beforeEach(() => {
    global.fetch.mockClear();
    // ใช้ fake timers เพื่อควบคุม setTimeout ของ Toasts
    jest.useFakeTimers();
  });

  afterEach(() => {
    // คืนค่า timers กลับเป็นปกติ
    jest.useRealTimers();
  });

  // Test case 1.1: Should render the main title
  test('should render the main title', () => {
    renderComponent([]); // Render ด้วยข้อมูลว่างเปล่าก่อน
    expect(screen.getByRole('heading', { name: /Order Management/i })).toBeInTheDocument();
  });

  // Test case 1.2: Should fetch orders on mount and display them
  test('should fetch orders on mount and display them as cards', async () => {
    renderComponent(mockOrders);

    // ต้องใช้ `findBy` เพื่อ "รอ" ให้ fetch (async) ทำงานเสร็จ
    expect(await screen.findByText('order-111')).toBeInTheDocument();
    expect(screen.getByText('order-222')).toBeInTheDocument();
    expect(screen.getByText('order-333')).toBeInTheDocument();
    
    // ตรวจสอบว่า fetch ถูกเรียกด้วย URL ที่ถูกต้อง
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/orders/list-dto');
  });

  // Test case 1.3: Should display "No orders found" if fetch returns an empty array
  test('should display "No orders found" if fetch returns an empty array', async () => {
    renderComponent([]); // ส่งข้อมูลว่างเปล่า
    
    expect(await screen.findByText('No orders found')).toBeInTheDocument();
  });

  // Test case 1.4: Should handle fetch error gracefully
  test('should handle fetch error and display "No orders found"', async () => {
    // Mock console.error เพื่อไม่ให้แสดง error ใน log ตอนรันเทส
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch.mockRejectedValue(new Error('API is down'));
    render(<Manage />);

    // เมื่อ fetch พัง, component ควรแสดง "No orders"
    expect(await screen.findByText('No orders found')).toBeInTheDocument();
    // และควร log error นั้นไว้
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching orders:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});

describe('Suite 2: Manage Component Filtering and Searching Logic', () => {

  // ใน suite นี้ เราจะ render component พร้อมข้อมูล mock ใน beforeEach
  // เพื่อให้ทุกเทสมีข้อมูลพร้อมให้กรอง
  beforeEach(async () => {
    renderComponent(mockOrders);
    // รอจนกว่าข้อมูลจะโหลดเสร็จ
    await screen.findByText('order-111');
  });

  // Test case 2.1: Should filter orders by status (e.g., PENDING)
  test('should filter orders by status "PENDING"', () => {
    // 1. คลิกที่แท็บ "PENDING"
    fireEvent.click(screen.getByRole('button', { name: 'PENDING' }));

    // 2. ควรเห็นเฉพาะ order-111 (Pending)
    expect(screen.getByText('order-111')).toBeInTheDocument();
    
    // 3. ไม่ควรเห็น order อื่น
    expect(screen.queryByText('order-222')).not.toBeInTheDocument();
    expect(screen.queryByText('order-333')).not.toBeInTheDocument();
  });

  // Test case 2.2: Should filter orders by status (e.g., UNSHIPPED)
  test('should filter orders by status "UNSHIPPED"', () => {
    fireEvent.click(screen.getByRole('button', { name: 'UNSHIPPED' }));
    
    expect(screen.getByText('order-222')).toBeInTheDocument();
    expect(screen.queryByText('order-111')).not.toBeInTheDocument();
    expect(screen.queryByText('order-333')).not.toBeInTheDocument();
  });

  // Test case 2.3: Should filter by search term (Order ID)
  test('should filter orders by search term', () => {
    const searchInput = screen.getByPlaceholderText(/Search by Order ID.../i);
    
    // 1. ค้นหา "order-333"
    fireEvent.change(searchInput, { target: { value: 'order-333' } });

    // 2. ควรเห็นเฉพาะ order-333
    expect(screen.getByText('order-333')).toBeInTheDocument();
    expect(screen.queryByText('order-111')).not.toBeInTheDocument();
    expect(screen.queryByText('order-222')).not.toBeInTheDocument();
  });

  // Test case 2.4: Should show "No orders found" when filters match nothing
  test('should show "No orders found" when filters match nothing', () => {
    const searchInput = screen.getByPlaceholderText(/Search by Order ID.../i);
    
    // 1. ค้นหา "non-existent-id"
    fireEvent.change(searchInput, { target: { value: 'non-existent-id' } });

    // 2. ควรแสดงข้อความ "No orders found"
    expect(screen.getByText('No orders found')).toBeInTheDocument();
  });
});

describe('Suite 3: Manage Component User Actions and UI Interactions', () => {

  beforeEach(async () => {
    jest.useFakeTimers(); // สำคัญมากสำหรับ Toasts
    renderComponent(mockOrders);
    // รอจนกว่าข้อมูลจะโหลดเสร็จ
    await screen.findByText('order-111');
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  // Test case 3.1: Should cancel a PENDING order
  test('should cancel a PENDING order, show toast, and update status', async () => {
    // 1. หา Card "order-111" (PENDING)
    const card111 = screen.getByText('order-111').closest('.order-card');
    
    // 2. หาปุ่ม "Cancel Order" *ภายใน* card นั้น
    const cancelButton = within(card111).getByRole('button', { name: /Cancel Order/i });

    // 3. คลิกปุ่ม
    fireEvent.click(cancelButton);

    // 4. ตรวจสอบ Toast (ต้อง `await findBy` เพราะมันโผล่มาแบบ async)
    expect(await screen.findByText('Order order-111 has been cancelled')).toBeInTheDocument();
    
    // 5. ตรวจสอบว่า Status Badge เปลี่ยนเป็น "CANCELLED"
    expect(within(card111).getByText('CANCELLED')).toBeInTheDocument();
    
    // 6. ตรวจสอบว่าปุ่ม "Cancel" หายไป (เพราะ status ไม่ใช่ PENDING แล้ว)
    expect(cancelButton).not.toBeInTheDocument();
  });

  // Test case 3.2: Should confirm shipment for an UNSHIPPED order
  test('should confirm shipment for an UNSHIPPED order and update UI', async () => {
    // 1. หา Card "order-222" (UNSHIPPED)
    const card222 = screen.getByText('order-222').closest('.order-card');
    
    // 2. หาปุ่ม "Confirm Shipment"
    const confirmButton = within(card222).getByRole('button', { name: /Confirm Shipment/i });

    // 3. คลิกปุ่ม
    fireEvent.click(confirmButton);

    // 4. ตรวจสอบ Toast
    expect(await screen.findByText('Shipment confirmed for order order-222')).toBeInTheDocument();

    // 5. ตรวจสอบว่า Status Badge เปลี่ยนเป็น "Shipped" (จากโค้ดคือ 'SHIPPED')
    expect(within(card222).getByText('Shipped')).toBeInTheDocument();

    // 6. ตรวจสอบว่าปุ่ม "Confirm Shipment" และ "Cancel Order" หายไป
    expect(confirmButton).not.toBeInTheDocument();
    expect(within(card222).queryByRole('button', { name: /Cancel Order/i })).not.toBeInTheDocument();
  });
  
  // Test case 3.3: Should expand and collapse order items
  test('should expand and collapse order items', async () => {
    // 1. หา Card "order-111" (ที่มี 2 items)
    const card111 = screen.getByText('order-111').closest('.order-card');
    
    // 2. ตรวจสอบว่า item ที่ 2 (Tuna) ถูกซ่อนอยู่
    expect(screen.queryByText('Tuna')).not.toBeInTheDocument();

    // 3. หาปุ่ม "expand" (มีข้อความ "+ 1 more item(s)")
    const expandButton = within(card111).getByRole('button', { name: /\+ 1 more item\(s\)/i });
    fireEvent.click(expandButton);

    // 4. ตรวจสอบว่า "Tuna" (item ที่ 2) แสดงขึ้นมา
    expect(await screen.findByText('Tuna')).toBeInTheDocument();
    
    // 5. ตรวจสอบว่าปุ่มเปลี่ยนข้อความเป็น "Hide"
    expect(expandButton).toHaveTextContent('Hide');

    // 6. คลิก "Hide" อีกครั้ง
    fireEvent.click(expandButton);

    // 7. ตรวจสอบว่า "Tuna" หายไป
    // ต้องใช้ `await waitFor` เพื่อรอให้มันหายไป
    await waitFor(() => {
      expect(screen.queryByText('Tuna')).not.toBeInTheDocument();
    });
  });

  // Test case 3.4: Should show a toast and then remove it after timeout
  test('should show a toast and remove it after timeout', async () => {
    // 1. ทำ action ให้เกิด Toast (เช่น cancel order-111)
    const card111 = screen.getByText('order-111').closest('.order-card');
    const cancelButton = within(card111).getByRole('button', { name: /Cancel Order/i });
    fireEvent.click(cancelButton);

    // 2. ตรวจสอบว่า Toast แสดงขึ้นมา
    const toastMessage = await screen.findByText('Order order-111 has been cancelled');
    expect(toastMessage).toBeInTheDocument();
    
    // 3. เร่งเวลาไป 4000ms (timeout ในโค้ดคือ 3500ms)
    jest.advanceTimersByTime(4000);

    // 4. ตรวจสอบว่า Toast หายไป
    // `waitFor` จะรอจนกว่า query ข้างในจะไม่ throw error (หรือไม่เจอ)
    await waitFor(() => {
      expect(screen.queryByText('Order order-111 has been cancelled')).not.toBeInTheDocument();
    });
  });
});