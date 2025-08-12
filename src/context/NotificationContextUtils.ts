import { createContext, useContext } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export type NotificationAction = {
  label: string;
  onClick: () => void;
};

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  action?: NotificationAction;
  notificationType?: string;
}

export const NotificationContext = createContext<Notification | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 