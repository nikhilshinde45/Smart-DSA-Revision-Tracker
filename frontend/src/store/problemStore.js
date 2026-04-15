import { create } from 'zustand';
import api from '../services/api';

const useProblemStore = create((set, get) => ({
  problems: [],
  todayRevisions: [],
  analytics: null,
  isLoading: false,
  error: null,

  // Fetch all problems
  fetchProblems: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const { data } = await api.get(`/problems?${queryString}`);
      set({ problems: data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch problems',
        isLoading: false,
      });
    }
  },

  // Add new problem
  addProblem: async (problemData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/problems', problemData);
      set((state) => ({
        problems: [data, ...state.problems],
        isLoading: false,
      }));
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to add problem';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // Delete problem
  deleteProblem: async (id) => {
    try {
      await api.delete(`/problems/${id}`);
      set((state) => ({
        problems: state.problems.filter((p) => p._id !== id),
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete problem',
      });
    }
  },

  // Toggle bookmark
  toggleBookmark: async (id) => {
    try {
      const { data } = await api.put(`/problems/${id}/bookmark`);
      set((state) => ({
        problems: state.problems.map((p) => (p._id === id ? data : p)),
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to toggle bookmark',
      });
    }
  },

  // Fetch today's revisions
  fetchTodayRevisions: async () => {
    try {
      const { data } = await api.get('/revisions/today');
      set({ todayRevisions: data });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to fetch revisions',
      });
    }
  },

  // Mark revision
  markRevision: async (id, revisionIndex, action) => {
    try {
      const { data } = await api.put(`/revisions/${id}`, {
        revisionIndex,
        action,
      });
      set((state) => ({
        todayRevisions: state.todayRevisions.filter((r) => {
          if (r._id === id && action === 'revised') return false;
          if (r._id === id && action === 'reschedule') return false;
          return true;
        }),
        problems: state.problems.map((p) => (p._id === id ? data : p)),
      }));
      return data;
    } catch (error) {
      set({
        error:
          error.response?.data?.message || 'Failed to update revision',
      });
    }
  },

  // Fetch analytics
  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/stats');
      set({ analytics: data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch analytics',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProblemStore;
