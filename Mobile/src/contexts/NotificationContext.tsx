import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationContextType {
  expoPushToken: string | null;
  hasNotificationPermission: boolean;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        setHasNotificationPermission(true);
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  const requestPermission = async () => {
    await registerForPushNotifications();
  };

  const value = {
    expoPushToken,
    hasNotificationPermission,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
