import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'; 
import '@testing-library/jest-dom';
import axios from 'axios';

import Notifications from './Notification';

jest.mock('axios');

const testFishermanId = 'fisher123';

const mockNotifications = [
  { id: 'n1', message: 'You have a new order!', read: false, createdAt: '2025-11-17T10:00:00Z' },
  { id: 'n2', message: 'Your payment was processed.', read: true, createdAt: '2025-11-16T09:00:00Z' }
];

const mockNotificationUnread = [
  { id: 'n1', message: 'You have a new order!', read: false, createdAt: '2025-11-17T10:00:00Z' }
];

const mockNotificationRead = [
  { id: 'n1', message: 'You have a new order!', read: true, createdAt: '2025-11-17T10:00:00Z' }
];

const renderComponent = (id = testFishermanId) =>
  render(<Notifications fishermanId={id} />);


// --------------------------------------------------
// Suite 1: Initial render & fetch
// --------------------------------------------------
describe('Suite 1: Notifications Initial Render & Data Fetching', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  test('should render title and initial "No new notifications" message', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByRole('heading', { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  test('should fetch and display notifications on mount', async () => {
    axios.get.mockResolvedValue({ data: mockNotifications });

    await act(async () => {
      renderComponent();
    });

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:8080/api/notifications/${testFishermanId}`
    );

    expect(screen.getByText('You have a new order!')).toBeInTheDocument();
    expect(screen.getByText('Your payment was processed.')).toBeInTheDocument();
    expect(screen.queryByText('No new notifications')).not.toBeInTheDocument();
  });

  test('should keep "No new notifications" if fetch returns empty array', async () => {
    axios.get.mockResolvedValue({ data: [] });

    await act(async () => {
      renderComponent();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });
});


// --------------------------------------------------
// Suite 2: Polling logic
// --------------------------------------------------
describe('Suite 2: Notifications Polling Logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  test('should poll every 10 seconds', async () => {
    axios.get.mockResolvedValue({ data: [] });

    await act(async () => {
      renderComponent();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(9999);
    });
    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(axios.get).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test('should stop polling when component unmounts', async () => {
    axios.get.mockResolvedValue({ data: [] });

    let unmount;
    await act(async () => {
      unmount = renderComponent().unmount;
    });

    expect(axios.get).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});


// --------------------------------------------------
// Suite 3: Mark-as-read interactions
// --------------------------------------------------
describe('Suite 3: Notifications User Interaction (Mark as Read)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  test('should call post API and refetch when notification is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: mockNotificationUnread });
    axios.post.mockResolvedValue({});
    axios.get.mockResolvedValueOnce({ data: mockNotificationRead });

    await act(async () => {
      renderComponent();
    });

    const msg = screen.getByText('You have a new order!');
    const card = msg.closest('.notification-card');

    expect(card.style.opacity).toBe("1");

    await act(async () => {
      fireEvent.click(msg);
      jest.advanceTimersByTime(0);
    });

    expect(axios.post).toHaveBeenCalledWith(
      `http://localhost:8080/api/notifications/read/n1`
    );

    expect(axios.get).toHaveBeenCalledTimes(2);

    expect(card.style.opacity).toBe("0.5");
  });
});
