import React, { createContext, useContext, useState } from "react";
import Notification from "../components/Notification";

type NotificationType = {
  id: string;
  message: string;
};

interface NotificationContextType {
  addNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = (message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
