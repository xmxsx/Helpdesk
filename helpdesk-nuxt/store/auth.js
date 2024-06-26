import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
    token: typeof window !== 'undefined' ? Cookies.get('token') : null,
    tickets: typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('tickets')) : [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email, password) {
      const config = useRuntimeConfig();
      try {
        const response = await fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        this.token = data.token;
        this.user = data.user;

        Cookies.set('token', data.token, { secure: true, sameSite: 'Strict' });

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    },
    async register(email, password, role) {
      const config = useRuntimeConfig();
      try {
        const response = await fetch(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        this.token = data.token;
        this.user = data.user;

        Cookies.set('token', data.token, { secure: true, sameSite: 'Strict' });

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error registering:', error);
        throw error;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      this.tickets = [];
      Cookies.remove('token');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('tickets');
      }
    },
    async fetchUser() {
      if (!this.token) return;
      const config = useRuntimeConfig();
      try {
        const response = await fetch(`${config.public.apiBase}/auth/user`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Fetching user failed');
        }

        this.user = await response.json();

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        this.logout();
      }
    },
    saveTickets(tickets) {
      this.tickets = tickets;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tickets', JSON.stringify(tickets));
      }
    },
    initializeStore() {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        const token = Cookies.get('token');
        const tickets = sessionStorage.getItem('tickets');

        this.user = user ? JSON.parse(user) : null;
        this.token = token || null;
        this.tickets = tickets ? JSON.parse(tickets) : [];
      }
    }
  },
});
