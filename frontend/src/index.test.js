import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';


// Mock ReactDOM and reportWebVitals BEFORE importing index.js
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

jest.mock('./reportWebVitals', () => jest.fn());

describe('Index Entry Point', () => {
  let rootElement;

  beforeEach(() => {
    // Set up a <div id="root"></div>
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('calls createRoot and renders App inside StrictMode', async () => {
    // Import AFTER mocks + DOM setup
    await import('./index');

    // 1. createRoot called with #root
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);

    // 2. render called once
    const mockRoot = ReactDOM.createRoot.mock.results[0].value;
    expect(mockRoot.render).toHaveBeenCalledTimes(1);

    const renderArg = mockRoot.render.mock.calls[0][0];

    // 3. It wrapped <App /> inside <React.StrictMode>
    expect(renderArg.type).toBe(React.StrictMode);

    // children may be array or single
    const children = Array.isArray(renderArg.props.children)
      ? renderArg.props.children
      : [renderArg.props.children];

    expect(children.some((c) => c.type === App)).toBe(true);
  });

  test('calls reportWebVitals', async () => {
    await import('./index');
    expect(reportWebVitals).toHaveBeenCalledTimes(1);
  });
});
