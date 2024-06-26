<template>
  <div class="user-page">
    <header class="header">
      <img src="assets/images/logo.png" alt="Logo" class="logo" />
      <div class="logout">
        <button @click="logout">Log out</button>
      </div>
    </header>
    <div class="main-content">
      <nav class="sidebar">
        <ul>
          <li>
            <NuxtLink to="/user/dashboard" :class="{ active: currentSection === 'dashboard' }" @click="changeSection('dashboard')">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/addTicket" :class="{ active: currentSection === 'addticket' }" @click="changeSection('addticket')">Add ticket</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/user/settings" :class="{ active: currentSection === 'settings' }" @click="changeSection('settings')">Settings</NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="content">
        <div class="tabs">
          <div class="tab" :class="{ active: currentTab === 'deleteAccount' }" @click="changeTab('deleteAccount')">Delete Account</div>
        </div>
        <div class="delete-container" v-if="currentTab === 'deleteAccount'">
          <header class="delete-header">
            <h3>Your account {{ authStore.user.userId }} deletion</h3>
          </header>
          <p>This action is irreversible. Are you sure you want to delete your account?</p>
          <div class="confirmation-container">
            <label for="delete-confirm">To confirm deletion, type “delete” below:</label>
            <input type="text" id="delete-confirm" v-model="confirmationText" placeholder="delete" />
          </div>
          <footer class="delete-footer">
            <div class="button-container">
              <button @click="deleteOwnAccount" class="action-button delete-button" :disabled="confirmationText !== 'delete'">Delete Account</button>
            </div>
          </footer>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const currentSection = ref('settings');
const currentTab = ref('deleteAccount');
const error = ref('');
const confirmationText = ref('');

const changeSection = (section) => {
  currentSection.value = section;
};

const changeTab = (tab) => {
  currentTab.value = tab;
};

const deleteOwnAccount = async () => {
  if (confirmationText.value !== 'delete') {
    error.value = 'You must type "delete" to confirm';
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/users/${authStore.user._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error deleting account');
    }

    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    error.value = 'There was a problem deleting your account. Please try again later.';
  }
};

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
  .user-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: url('~/assets/images/background.png') no-repeat center center fixed;
    background-size: cover;
  }
  
  .header {
    width: 100%;
    padding: 20px;
    background-color: transparent;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    height: 50px;
  }
  
  .logout button {
    background-color: #000000;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 50px;
    cursor: pointer;
    letter-spacing: 1px;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background 0.3s;
  
    &:hover {
      background-color: #444;
    }
  }
  
  .main-content {
    display: flex;
    width: 100%;
  }
  
  .sidebar {
    margin-top: 340px;
    width: 200px;
    padding: 30px;
  
    ul {
      list-style-type: none;
      padding: 0;
  
      li {
        margin-bottom: 60px;
  
        a {
          color: #000;
          text-decoration: none;
          font-size: 20px;
          position: relative;
  
          &.active {
            text-decoration: underline;
            text-decoration-color: #000;
            text-underline-offset: 10px;
          }
  
          &:hover {
            text-decoration: none;
          }
  
          &.active:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .content {
    flex-grow: 1;
    padding: 20px;
  }
  
  .tabs {
    display: flex;
    justify-content: left;
    margin-top: 40px;
    margin-right: 122px;
    margin-left: 45px;
  
    .tab {
      margin: 10px 110px;
      font-size: 55px;
      text-decoration: none;
      color: #666;
      border-bottom: 2px solid transparent;
      font-weight: 200;
      cursor: pointer;
  
      &.active {
        color: #000;
        border-bottom: 2px solid #000;
      }
    }
  }
  
  .delete-container {
    background-color: #f3f3f3;
    padding: 30px 40px;
    border-radius: 50px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 1290px;
    margin: 60px 130px;
    display: flex;
    flex-direction: column;
  
    .delete-header {
      display: flex;
      justify-content: flex-start;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
    }
  
    h3 {
      margin-bottom: 20px;
      letter-spacing: 1px;
      color: white;
      background-color: #666;
      padding: 10px 25px;
      border-radius: 40px;
      font-size: 22px;
      font-weight: 200;
    }
  
    p {
      font-size: 32px;
      padding-left: 20px;
      font-weight: 200;
      text-align: center; 
      padding-top: 30px;
      padding-bottom: 5px;
    }
  
    .confirmation-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px;
  
      label {
        font-size: 22px;
        margin-bottom: 30px;
        font-weight: 100;
      }
  
      input {
        padding: 10px 15px;
        border-radius: 40px;
        border: 1px solid #ccc;
        width: 600px;
        outline: none; 
      }
  
      input:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
      }
    
  
    .delete-footer {
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    .action-button {
      background-color: #000;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      cursor: pointer;
      letter-spacing: 1px;
      transition: background 0.3s;
      font-size: 14px;
      &:hover {
        background-color: #666;
      }
  
      &:disabled {
        background-color: #ca7777;
        cursor: not-allowed;
      }
    }
  
    .delete-button {
      background-color: rgb(218, 99, 99);
  
      &:hover {
        background-color: rgba(192, 94, 94, 0.719);
      }
    }
  }
  
  .error {
    color: red;
    margin-top: 20px;
    text-align: center;
  }
  </style>
  