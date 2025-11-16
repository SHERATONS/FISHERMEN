// reportWebVitals.test.js

import * as rpt from "./reportWebVitals";

describe("reportWebVitals", () => {
  const mockGetCLS = jest.fn();
  const mockGetFID = jest.fn();
  const mockGetFCP = jest.fn();
  const mockGetLCP = jest.fn();
  const mockGetTTFB = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock loadWebVitals to resolve immediately
    jest.spyOn(rpt, "loadWebVitals").mockResolvedValue({
      getCLS: mockGetCLS,
      getFID: mockGetFID,
      getFCP: mockGetFCP,
      getLCP: mockGetLCP,
      getTTFB: mockGetTTFB,
    });
  });

  test("does nothing with invalid callback", async () => {
    rpt.default(null);
    rpt.default(123);
    rpt.default({});
    rpt.default(undefined);

    await Promise.resolve();

    expect(mockGetCLS).not.toHaveBeenCalled();
  });

  test("calls all metrics when callback is provided", async () => {
    const cb = jest.fn();

    rpt.default(cb);

    // Wait for promise chain
    await Promise.resolve();

    expect(mockGetCLS).toHaveBeenCalledWith(cb);
    expect(mockGetFID).toHaveBeenCalledWith(cb);
    expect(mockGetFCP).toHaveBeenCalledWith(cb);
    expect(mockGetLCP).toHaveBeenCalledWith(cb);
    expect(mockGetTTFB).toHaveBeenCalledWith(cb);
  });
});
