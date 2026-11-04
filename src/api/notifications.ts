import { apiClient } from './client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'QUIZ' | 'RESULT' | 'CONTEST' | 'ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface NotificationsPage {
  data: NotificationItem[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsPage> => {
  const res = await apiClient.get('/notifications', { params: { page, limit } });
  return res.data;
};

export const markAllRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
