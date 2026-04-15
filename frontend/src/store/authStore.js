import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
          });
          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
              streak: data.streak,
            },
            token: data.token,
            isLoading: false,
          });
          return data;
        } catch (error) {
          const message =
            error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
              streak: data.streak,
            },
            token: data.token,
            isLoading: false,
          });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'dsa-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
