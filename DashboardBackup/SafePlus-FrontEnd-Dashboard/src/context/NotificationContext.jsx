import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const sendNotification = ({ id, message, onClick, remove }) => {
    if (remove) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      return;
    }
    if (!notifications.some((n) => n.id === id)) {
      setNotifications((prev) => [...prev, { id, message, onClick }]);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, sendNotification }}>
      {children}
      <div className="notification-panel" style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 999,
      }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="notification"
            onClick={() => n.onClick?.()}
            style={{
              background: "#ffc",
              padding: "10px",
              border: "1px solid #999",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
