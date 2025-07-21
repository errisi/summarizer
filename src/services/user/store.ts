import { create } from 'zustand';
import { IUser } from './types';

export interface IUserStore {
  user: IUser | null;
  isLoading: boolean;
}

export const userStore = create<IUserStore>(() => ({
  user: null,
  isLoading: false,
}));

export const useUserStore = userStore;
