import { render, screen } from '@testing-library/react';
import App from './App';

// ---- Mock Setup ----
// 1. เราต้อง Mock Page ทั้งหมดที่ App.js import เพื่อป้องกัน lỗi SyntaxError จาก axios
jest.mock('./pages/UploadForm', () => () => <div>Mock UploadForm</div>);
jest.mock('./pages/Payment', () => () => <div>Mock Payment</div>);
jest.mock('./pages/FishMarket', () => () => <div>Mock FishMarket</div>);
jest.mock('./pages/FishDetailPage', () => () => <div>Mock FishDetailPage</div>);
jest.mock('./pages/Manage', () => () => <div>Mock Manage</div>);
jest.mock('./pages/BuyerReviews', () => () => <div>Mock BuyerReviews</div>);
jest.mock('./pages/LoginRegisPage', () => () => <div>Mock LoginRegisPage</div>);
jest.mock('./Navbar', () => () => <div>Mock Navbar</div>);

// 2. เราต้อง Mock AuthContext เพื่อควบคุมค่า isLoading ให้เป็น false
jest.mock('./AuthContext', () => ({
  // Mock ตัว Provider ให้แค่ render ลูกๆ ออกมา
  AuthProvider: ({ children }) => <>{children}</>,
  // Mock ตัว Hook ให้ return ค่าว่า "โหลดเสร็จแล้ว"
  useAuth: () => ({
    isLoading: false,
    user: null, 
  }),
}));

// ---- The Test ----

test('renders the home page welcome message', () => {
  render(<App />);
  
  // 3. เปลี่ยนไปค้นหาข้อความที่ถูกต้อง "Welcome to Fish Market!"
  const welcomeElement = screen.getByText(/Welcome to Fish Market!/i);
  expect(welcomeElement).toBeInTheDocument();

  const linkElement = screen.queryByText(/learn react/i);
  expect(linkElement).not.toBeInTheDocument();
});