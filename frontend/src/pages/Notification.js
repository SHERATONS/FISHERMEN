import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications({ fishermanId }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await axios.get(`http://localhost:8080/api/notifications/${fishermanId}`);
    setNotifications(res.data);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await axios.post(`http://localhost:8080/api/notifications/read/${id}`);
    fetchNotifications();
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h2>Notifications</h2>
      {notifications.length === 0 && <p>No new notifications</p>}
      {notifications.map(n => (
        <div
          key={n.id}
          className="notification-card"
          onClick={() => markRead(n.id)}
          style={{ opacity: n.read ? 0.5 : 1 }}
        >
          <p>{n.message}</p>
          <small>{new Date(n.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
