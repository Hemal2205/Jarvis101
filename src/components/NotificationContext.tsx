// NOTE: If you see errors about missing types for 'react', run:
//   npm install --save-dev @types/react
import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';

// Firebase imports for push notifications (optional)
// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: '<YOUR_FIREBASE_API_KEY>',
  authDomain: '<YOUR_FIREBASE_AUTH_DOMAIN>',
  projectId: '<YOUR_FIREBASE_PROJECT_ID>',
  messagingSenderId: '<YOUR_FIREBASE_MESSAGING_SENDER_ID>',
  appId: '<YOUR_FIREBASE_APP_ID>',
};

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
  notificationType?: string; // e.g., 'system_alert', 'reminder', etc.
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, action?: NotificationAction, notificationType?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export function registerWebPush(userId: number) {
  try {
    // const app = initializeApp(firebaseConfig);
    // const messaging = getMessaging(app);
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // getToken(messaging, { vapidKey: '<YOUR_FIREBASE_VAPID_KEY>', serviceWorkerRegistration: window.navigator.serviceWorker.ready })
        //   .then((currentToken: string | null) => {
        //     if (currentToken) {
        //       fetch('/api/devices/register', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //           user_id: userId,
        //           device_type: 'web',
        //           push_token: currentToken,
        //         }),
        //       }).catch((error: unknown) => {
        //         console.error('Failed to register device:', error);
        //       });
        //     }
        //   }).catch((error: unknown) => {
        //     console.error('Failed to get push token:', error);
        //   });
      }
    }).catch((error: unknown) => {
      console.error('Failed to request notification permission:', error);
    });
    // Listen for foreground messages
    // onMessage(messaging, (payload: unknown) => {
    //   // Optionally, show a toast or in-app notification
    //   const notification = payload as { notification?: { title?: string; body?: string } };
    //   alert(notification.notification?.title + ': ' + notification.notification?.body);
    // });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    // Ignore errors if Firebase is not configured
  }
}

// Helper to log suggestion analytics
const logSuggestionAnalytics = async (type: 'accepted' | 'ignored', suggestion: unknown, action?: string) => {
  try {
    await fetch('/api/analytics/suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        suggestion,
        action,
        username: localStorage.getItem('jarvis_user')
      })
    });
  } catch (error) {
    console.error('Failed to log suggestion analytics:', error);
  }
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const counter = useRef(0);
  // Get settings from localStorage or context
  const settings = JSON.parse(localStorage.getItem('jarvis_settings') || '{}');

  useEffect(() => {
    // Example: get userId from localStorage or context after login
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      registerWebPush(userId);
    }
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info', action?: NotificationAction, notificationType?: string) => {
    // Determine delivery mode
    const mode = settings?.notification_preferences?.[notificationType || ''] || settings?.notification_mode || 'toast';
    if (mode === 'push') {
      // Do not show in-app notification, rely on push
      return;
    }
    // For 'sound', play a sound (simple beep for now)
    if (mode === 'sound') {
      try { 
        new Audio('/notification.mp3').play(); 
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }
    }
    // For 'modal', you could implement a modal notification (not shown here)
    // For 'toast', show as usual
    const id = ++counter.current;
    setNotifications((prev: Notification[]) => [...prev, { id, message, type, action, notificationType }]);
    setTimeout(() => {
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id));
      // If it's a suggestion, log as ignored
      if (notificationType === 'suggestion') logSuggestionAnalytics('ignored', message);
    }, 4000);
  }, [settings]);

  const handleAction = async (n: Notification) => {
    if (!n.action) return;
    n.action.onClick();
    setNotifications((prev: Notification[]) => prev.filter((notif) => notif.id !== n.id));
    logSuggestionAnalytics('accepted', n.message, n.action.label);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toasts */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col space-y-2"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        tabIndex={-1}
      >
        {notifications.map((n: Notification) => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded-lg shadow-xl text-white animate-fade-in-up transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400
              ${n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
            `}
            tabIndex={0}
            aria-label={`Notification: ${n.message}`}
            role="alert"
            onKeyDown={e => { if (e.key === 'Escape') setNotifications(prev => prev.filter(x => x.id !== n.id)); }}
          >
            <div className="flex items-center justify-between">
              <span>{n.message}</span>
              {n.action && (
                <button
                  className="ml-4 px-2 py-1 bg-cyan-700 rounded text-xs hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => handleAction(n)}
                  aria-label={n.action.label}
                >
                  {n.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 