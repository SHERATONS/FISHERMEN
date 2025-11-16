import reportWebVitals from './reportWebVitals';

// Mock the web-vitals module BEFORE importing reportWebVitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

// Import the mocked functions
import {
  getCLS,
  getFID,
  getFCP,
  getLCP,
  getTTFB
} from 'web-vitals';

describe("reportWebVitals", () => {

  test("does nothing when onPerfEntry is undefined", () => {
    reportWebVitals(undefined);

    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
  });

  test("does nothing when onPerfEntry is not a function", () => {
    reportWebVitals(123);

    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
  });

  test("imports web-vitals and calls all metric functions", async () => {
    const callback = jest.fn();

    // Call function (returns a Promise because of import)
    const result = reportWebVitals(callback);

    // Wait microtask queue to resolve the dynamic import
    await Promise.resolve();

    expect(getCLS).toHaveBeenCalledWith(callback);
    expect(getFID).toHaveBeenCalledWith(callback);
    expect(getFCP).toHaveBeenCalledWith(callback);
    expect(getLCP).toHaveBeenCalledWith(callback);
    expect(getTTFB).toHaveBeenCalledWith(callback);
  });

});
