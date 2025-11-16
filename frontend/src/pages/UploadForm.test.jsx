import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import UploadForm from './UploadForm';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Mock Setup ---
jest.mock('axios');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
const mockUser = { id: 'fisher123', role: 'FISHERMAN' };
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the FileReader API for image handling (Success version)
class MockFileReader {
    onloadend = () => {};
    readAsDataURL() {
        // Simulate reading the file successfully
        this.onloadend({ target: { result: "mock-image-preview-url" } });
    }
}
// Mock the FileReader API for image handling (Error version - Covers Lines 475-497)
class MockFileReaderWithError {
    onerror = () => {};
    readAsDataURL() {
        this.onerror();
    }
}

// Mock FormData to check appended values (Covers Lines 294-364)
const mockFormDataAppend = jest.fn();
global.FormData = class MockFormData {
    append = mockFormDataAppend;
};

global.FileReader = MockFileReader;
global.alert = jest.fn();
global.confirm = jest.fn(() => true); // Mock window.confirm to return true by default

const mockMarketPrices = [
  { fishType: 'Tuna', fairPrice: 500.00 },
  { fishType: 'Salmon', fairPrice: 650.50 },
  { fishType: 'Shark', fairPrice: 80.00 },
];

// Helper function to render the component with mocked data
const renderForm = async (initialMarketPrices = mockMarketPrices, shouldFetchSucceed = true) => {
    useAuth.mockReturnValue({ user: mockUser });
    
    if (shouldFetchSucceed) {
        // Setup initial fetch for market prices
        axios.get.mockResolvedValue({ data: initialMarketPrices.map(p => ({
            fishType: p.fishType,
            price: p.fairPrice, 
            fishermanId: 'f999' 
        }))});
    } else {
        axios.get.mockRejectedValue({ response: { data: 'Error fetching market data' } });
    }

    await act(async () => {
        render(<UploadForm />);
    });
    
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("http://localhost:8080/api/fishListings/list"));
};

// --- Test Suites ---

describe('Suite 1: UploadForm Initial Render and Data Fetching', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        axios.get.mockClear();
        useAuth.mockClear();
        global.alert.mockClear();
        mockNavigate.mockClear();
        global.FileReader = MockFileReader;
    });
    afterEach(() => {
        jest.useRealTimers();
        cleanup();
    });

    test('1. Should display Fisher ID and fetch market prices on load', async () => {
        await renderForm();

        expect(screen.getByLabelText(/Fisher ID/i)).toHaveValue(mockUser.id);
        expect(screen.getByRole('heading', { name: /Fair Market Prices/i })).toBeInTheDocument();
    });

    test('2. Image upload should show preview', async () => {
        await renderForm();
        const fileInput = document.querySelector('input[type="file"]');
        const mockFile = new File(["dummy"], "fish.png", { type: "image/png" });
        
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });
        
        await waitFor(() => {
            expect(screen.getByAltText(/Preview/i)).toHaveAttribute('src', 'mock-image-preview-url');
        }); 
    });
    
    // Covers image state reset (Line 459, part of 475-497 reset logic)
    test('3. Should clear image preview when file input is cleared', async () => {
        await renderForm();
        const fileInput = document.querySelector('input[type="file"]');
        
        await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } }); });
        await waitFor(() => expect(screen.getByAltText(/Preview/i)).toBeInTheDocument());

        await act(async () => { fireEvent.change(fileInput, { target: { files: [] } }); });
        expect(screen.queryByAltText(/Preview/i)).not.toBeInTheDocument();
    });

    // Covers fetch error handling
    test('4. Should show alert if market prices fail to fetch', async () => {
        await renderForm(mockMarketPrices, false); 
        
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Error fetching market data"));
        expect(screen.queryByRole('heading', { name: /Fair Market Prices/i })).not.toBeInTheDocument();
    });

    // Covers Delivery Status state update (Lines 170-180)
    test('5. Should handle and update Delivery Status field', async () => {
        await renderForm();
        const deliverySelect = screen.getByRole('combobox', { name: /Delivery Status/i });
        
        fireEvent.change(deliverySelect, { target: { value: "SENT_CHILLED" } });
        expect(deliverySelect).toHaveValue("SENT_CHILLED");
    });
    
    // Covers unauthorized user check (Lines 224, 248)
    test('6. Should navigate to login if user is not authenticated', async () => {
        useAuth.mockReturnValue({ user: null }); 
        
        await act(async () => {
            render(<UploadForm />);
        });
        
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login")); 
    });

    // Covers Image Read Error (Lines 475-497 catch block)
    test('7. Should show alert if image reading fails', async () => {
        global.FileReader = MockFileReaderWithError; 
        await renderForm();
        
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "error.png")] } });
        });
        
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("Error reading image"))); 
    });
});

// ----------------------------------------------------------------------

describe('Suite 2: Fair Price Calculator Logic', () => {
    beforeEach(() => { global.alert.mockClear(); });
    afterEach(() => cleanup());

    test('1. Should show alert if fish or weight is missing in calculator', async () => {
        await renderForm();
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select a fish and enter weight!");

        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Tuna" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select a fish and enter weight!");
    });
    
    test('2. Should calculate fair price correctly when data is found', async () => {
        await renderForm();
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Tuna" } });
        fireEvent.change(within(calculatorDiv).getByPlaceholderText("Weight in kg"), { target: { value: "3.5" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));

        expect(within(calculatorDiv).getByText('฿1750.00')).toBeInTheDocument();
    });

    test('3. Should show alert if calculated fish type is not found', async () => {
        await renderForm();
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Octopus" } });
        fireEvent.change(within(calculatorDiv).getByPlaceholderText("Weight in kg"), { target: { value: "1" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));

        expect(global.alert).toHaveBeenCalledWith("Fish type not found in market data!");
    });
});

// ----------------------------------------------------------------------

describe('Suite 3: Form Validation and Submission', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        axios.post.mockClear();
        global.alert.mockClear();
        mockNavigate.mockClear();
        global.confirm.mockClear();
        global.confirm.mockReturnValue(true); 
        mockFormDataAppend.mockClear(); 
    });
    afterEach(() => {
        jest.useRealTimers();
        cleanup();
    });

    test('1. Should show alert if required fields are missing or invalid (Negative/Zero checks)', async () => {
        await renderForm();
        fireEvent.change(screen.getByPlaceholderText(/Enter or select fish type/i), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText(/e.g., Phuket, Krabi/i), { target: { value: "Krabi" } }); 

        // Test Negative Weight (Covers relevant branch)
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "-5" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Weight must be greater than 0!");
        
        // Test Zero Weight
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "0" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Weight must be greater than 0!");
        
        // Fill weight, check Negative Price
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } }); 
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "-10" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Price must be greater than 0!");

        // Test Zero Price
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "0" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Price must be greater than 0!");
	
        // Test missing image (from original test)
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "450" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select an image");
    });

    // Covers successful submission (price is fair, no confirm needed)
    test('2. Successful form submission and navigation', async () => {
        axios.post.mockResolvedValue({ data: { message: "Created" } });
        await renderForm();

        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "500" } }); 
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } }); });

        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));

        act(() => { jest.advanceTimersByTime(0); });
        await waitFor(() => expect(axios.post).toHaveBeenCalled(), { timeout: 4000 });

        expect(await screen.findByText("Upload Successful!")).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(3000));
        expect(mockNavigate).toHaveBeenCalledWith("/market");
    });

    // Covers server error handling
    test('3. Should show server error on submission failure', async () => {
        axios.post.mockRejectedValue({ response: { data: 'Database error' } });
        await renderForm();

        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "450" } });
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } }); });

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i })); });
        
        await waitFor(() => {
             expect(global.alert).toHaveBeenCalledWith("Error uploading fish: Database error");
        });
    });

    // Covers Low Price Warning + Cancellation (Branch 294-364: IF condition is true, confirm is false)
    test('4. Should show warning and stop if price is too low and user cancels', async () => {
        axios.post.mockResolvedValue({ data: { message: "Created" } });
        global.confirm.mockReturnValue(false); // User clicks CANCEL

        // Tuna Fair Price = 500.00. Set price to 100. (Too Low)
        await renderForm();
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "100" } }); 
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } }); });

        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));

        expect(global.confirm).toHaveBeenCalledWith(expect.stringContaining("The price you set")); 
        expect(axios.post).not.toHaveBeenCalled();
    });

    // Covers Low Price Warning + Confirmation (Branch 294-364: IF condition is true, confirm is true)
    test('5. Should show warning but proceed with submission if price is too low and user confirms', async () => {
        axios.post.mockResolvedValue({ data: { message: "Created" } });
        global.confirm.mockReturnValue(true); // User clicks OK (Submit anyway)

        // Tuna Fair Price = 500.00. Set price to 100. (Too Low)
        await renderForm();
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "100" } }); 
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => { fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } }); });

        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));

        expect(global.confirm).toHaveBeenCalled(); 
        await waitFor(() => expect(axios.post).toHaveBeenCalled());
    });
    
    // Covers FormData Content Verification (Lines 294-364: Check all appends)
    test('6. Successful submission should append all correct data to FormData object', async () => {
        axios.post.mockResolvedValue({ data: { message: "Created" } });
        await renderForm();
        mockFormDataAppend.mockClear(); 

        const mockFile = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
        const today = new Date().toISOString().slice(0, 10);

        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Chonburi" } });
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Salmon" } }); 
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "1.25" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "600.75" } });
        fireEvent.change(screen.getByRole('combobox', { name: /Delivery Status/i }), { target: { value: "SENT_CHILLED" } }); 
        fireEvent.change(screen.getByLabelText(/Catch Date/i), { target: { value: today } });

        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => { fireEvent.change(fileInput, { target: { files: [mockFile] } }); });

        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        
        act(() => { jest.advanceTimersByTime(0); });
        await waitFor(() => expect(axios.post).toHaveBeenCalled());

        // Verify Append calls
        expect(mockFormDataAppend).toHaveBeenCalledWith("fisherId", "fisher123");
        expect(mockFormDataAppend).toHaveBeenCalledWith("fishType", "Salmon");
        expect(mockFormDataAppend).toHaveBeenCalledWith("location", "Chonburi");
        expect(mockFormDataAppend).toHaveBeenCalledWith("weight", "1.25"); 
        expect(mockFormDataAppend).toHaveBeenCalledWith("price", "600.75");
        expect(mockFormDataAppend).toHaveBeenCalledWith("deliveryStatus", "SENT_CHILLED");
        expect(mockFormDataAppend).toHaveBeenCalledWith("catchDate", today);
        expect(mockFormDataAppend).toHaveBeenCalledWith("image", mockFile); 
    });
});
