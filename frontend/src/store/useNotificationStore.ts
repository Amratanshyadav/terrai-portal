import { create } from 'zustand';

export interface ISystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'Alert' | 'System' | 'Message' | 'Task';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: Date;
  isRead: boolean;
}

interface INotificationState {
  notifications: ISystemNotification[];
  addNotification: (noti: Omit<ISystemNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<INotificationState>((set) => ({
  notifications: [],

  addNotification: (noti) => {
    const newNoti: ISystemNotification = {
      ...noti,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      isRead: false,
    };
    set((state) => ({
      notifications: [newNoti, ...state.notifications].slice(0, 50), // keep last 50
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
