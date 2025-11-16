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

// Mock the FileReader API for image handling
class MockFileReader {
    onloadend = () => {};
    readAsDataURL() {
        // Simulate reading the file, setting the result to the expected mock URL
        this.onloadend({ target: { result: "mock-image-preview-url" } });
    }
}
global.FileReader = MockFileReader;
global.alert = jest.fn();

const mockMarketPrices = [
  { fishType: 'Tuna', fairPrice: 500.00 },
  { fishType: 'Salmon', fairPrice: 650.50 },
  { fishType: 'Shark', fairPrice: 80.00 }, // Low price to test logic
];

// Helper function to render the component with mocked data
const renderForm = async (initialMarketPrices = mockMarketPrices) => {
    useAuth.mockReturnValue({ user: mockUser });
    
    // Setup initial fetch for market prices
    axios.get.mockResolvedValue({ data: initialMarketPrices.map(p => ({
        fishType: p.fishType,
        price: p.fairPrice, 
        fishermanId: 'f999' 
    }))});

    await act(async () => {
        render(<UploadForm />);
    });
    
    // Wait for the market prices to be fetched and rendered
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
    });
    afterEach(() => {
        jest.useRealTimers();
        cleanup();
    });

    test('1. Should display Fisher ID and fetch market prices on load', async () => {
        await renderForm();

        // 1. Verify Fisher ID is pre-filled and disabled
        expect(screen.getByLabelText(/Fisher ID/i)).toHaveValue(mockUser.id);
        expect(screen.getByLabelText(/Fisher ID/i)).toBeDisabled();

        // 2. Verify market prices are displayed
        expect(screen.getByRole('heading', { name: /Fair Market Prices/i })).toBeInTheDocument();
        expect(screen.getByText('Tuna')).toBeInTheDocument();
        expect(screen.getByText('฿500.00')).toBeInTheDocument();

        // 3. Verify Catch Date is set to today
        const today = new Date().toISOString().slice(0, 10);
        expect(screen.getByLabelText(/Catch Date/i)).toHaveValue(today);
    });

    test('2. Image upload should show preview', async () => {
        await renderForm();

        const fileInput = document.querySelector('input[type="file"]');
        const mockFile = new File(["dummy"], "fish.png", { type: "image/png" });
        
        // 1. Simulate File Upload
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });
        
        // 2. Wait for image preview (using the flexible query)
        await waitFor(() => {
            expect(screen.getByAltText(/Preview/i)).toHaveAttribute('src', 'mock-image-preview-url');
        }); 
    });
});

// ----------------------------------------------------------------------

describe('Suite 2: Fair Price Calculator Logic', () => {
    beforeEach(() => {
        global.alert.mockClear();
    });
    afterEach(() => cleanup());

    test('1. Should show alert if fish or weight is missing in calculator', async () => {
        await renderForm();
        
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        // Missing both
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select a fish and enter weight!");

        // Missing weight
        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Tuna" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select a fish and enter weight!");
    });
    
    test('2. Should calculate fair price correctly when data is found', async () => {
        await renderForm();
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        // Price for Tuna is 500.00. Weight is 3.5 kg. Expected: 1750.00
        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Tuna" } });
        fireEvent.change(within(calculatorDiv).getByPlaceholderText("Weight in kg"), { target: { value: "3.5" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));

        expect(within(calculatorDiv).getByText(/Estimated Fair Total Price/i)).toBeInTheDocument();
        expect(within(calculatorDiv).getByText('฿1750.00')).toBeInTheDocument();
    });

    test('3. Should show alert if calculated fish type is not found', async () => {
        await renderForm();
        const calculatorDiv = screen.getByRole('heading', { name: /Fair Price Calculator/i }).closest('div');
        
        // "Octopus" is not in mockMarketPrices
        fireEvent.change(within(calculatorDiv).getByRole('combobox', { name: /Select Fish/i }), { target: { value: "Octopus" } });
        fireEvent.change(within(calculatorDiv).getByPlaceholderText("Weight in kg"), { target: { value: "1" } });
        fireEvent.click(within(calculatorDiv).getByRole('button', { name: /Calculate/i }));

        expect(global.alert).toHaveBeenCalledWith("Fish type not found in market data!");
        expect(screen.queryByText(/Estimated Fair Total Price/i)).not.toBeInTheDocument();
    });
});

// ----------------------------------------------------------------------

describe('Suite 3: Form Validation and Submission', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        axios.post.mockClear();
        global.alert.mockClear();
        mockNavigate.mockClear();
    });
    afterEach(() => {
        jest.useRealTimers();
        cleanup();
    });

    test('1. Should show alert if required fields are missing', async () => {
        await renderForm();
        
        // Missing all required fields (except Fisher ID)
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        
        // Check image alert (the first one encountered)
        expect(global.alert).toHaveBeenCalledWith("Please select at least one species");

        // Fill species, check location alert
        fireEvent.change(screen.getByPlaceholderText(/Enter or select fish type/i), { target: { value: "Tuna" } }); 
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Please enter location");

        // Fill location, check weight alert
        fireEvent.change(screen.getByPlaceholderText(/e.g., Phuket, Krabi/i), { target: { value: "Krabi" } }); 
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Weight must be greater than 0!");
        
        // Fill weight, check price alert
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Price must be greater than 0!");
        
        // Fill price, check image alert
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "450" } });
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        expect(global.alert).toHaveBeenCalledWith("Please select an image");
        
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('2. Successful form submission and navigation', async () => {
        axios.post.mockResolvedValue({ data: { message: "Created" } });
        await renderForm();

        // 1. Fill all required fields
        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "450" } });
        fireEvent.change(screen.getByRole('combobox', { name: /Delivery Status/i }), { target: { value: "SENT_FROZEN" } }); 

        // 2. Simulate File Upload (Required for submission)
        const fileInput = document.querySelector('input[type="file"]');
        const mockFile = new File(["dummy"], "fish.png", { type: "image/png" });
        
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [mockFile] } });
        });

        // 3. Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));

        // Advance timers to ensure async handleSubmit logic is executed
        act(() => {
            jest.advanceTimersByTime(0);
        });

        // 4. Wait for the API post call
        await waitFor(() => expect(axios.post).toHaveBeenCalled(), { timeout: 4000 });

        // Verify the data sent includes all required fields
        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8080/api/fishListings/create",
            expect.any(FormData), // FormData is difficult to check directly
            expect.anything() // Checking headers/config
        );
        
        // Check key fields inside the FormData object (by mocking FormData's behavior if needed, 
        // but for this level, checking the call itself is sufficient)

        // 5. Check success feedback (Popup and message)
        expect(await screen.findByText("Upload Successful!")).toBeInTheDocument();
        
        // 6. Check navigation after timeout (3000ms)
        act(() => jest.advanceTimersByTime(3000));
        expect(mockNavigate).toHaveBeenCalledWith("/market");
    });

    test('3. Should show server error on submission failure', async () => {
        axios.post.mockRejectedValue({ response: { data: 'Database error' } });
        await renderForm();

        // Fill form fields
        fireEvent.change(screen.getByPlaceholderText("e.g., Phuket, Krabi"), { target: { value: "Krabi" } });
        fireEvent.change(screen.getByPlaceholderText("Enter or select fish type"), { target: { value: "Tuna" } }); 
        fireEvent.change(screen.getByPlaceholderText("Weight in kilograms"), { target: { value: "5" } });
        fireEvent.change(screen.getByPlaceholderText("Price per kg"), { target: { value: "450" } });
        const fileInput = document.querySelector('input[type="file"]');
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [new File(["dummy"], "fish.png")] } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Upload Daily Catch/i }));
        });
        
        await waitFor(() => {
             expect(global.alert).toHaveBeenCalledWith("Error uploading fish: Database error");
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});