import { apiClient } from './client';

export interface UserModel {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  gender: string;
  collegeName: string;
  rollNumber: string;
  role: string;
  approved: boolean;
  blocked: boolean;
}

export interface RegisterProfileRequest {
  fullName: string;
  gender: string;
  collegeName: string;
  rollNumber: string;
}

export const getMyProfile = async (): Promise<UserModel> => {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
};

export const registerProfile = async (data: RegisterProfileRequest): Promise<UserModel> => {
  const res = await apiClient.post('/auth/register-profile', data);
  return res.data.data;
};

export const updateProfile = async (data: Partial<RegisterProfileRequest>): Promise<UserModel> => {
  const res = await apiClient.patch('/auth/me', data);
  return res.data.data;
};
