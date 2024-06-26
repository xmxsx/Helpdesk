<template>
  <div class="default-layout">
    <header class="header">
      <img src="/assets/images/logo.png" alt="Logo" class="logo" />
      <div class="logout">
        <button @click="logout">Log out</button>
      </div>
    </header>
    <div class="main-content">
      <NuxtPage />
    </div>
    <footer class="footer">
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  height: 40px;
}

.logout button {
  background-color: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 1px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
}

.logout button:hover {
  background-color: #444;
}

.main-content {
  flex: 1;
  padding-top: 60px; 
}

.footer {
  padding: 20px;
  background-color: #f8f8f8;
  text-align: center;
}
</style>
