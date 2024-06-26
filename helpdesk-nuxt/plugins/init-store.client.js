import { useAuthStore } from '~/store/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore(nuxtApp.$pinia);
  authStore.initializeStore();
});
