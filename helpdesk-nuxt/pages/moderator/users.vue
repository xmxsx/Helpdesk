<template>
  <div class="moderator-page">
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
            <NuxtLink to="/moderator/dashboard" :class="{ active: currentSection === 'dashboard' }" @click="changeSection('dashboard')">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/moderator/users" :class="{ active: currentSection === 'users' }" @click="changeSection('users')">Users</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/moderator/settings" :class="{ active: currentSection === 'settings' }" @click="changeSection('settings')">Settings</NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="content">
        <div class="tabs">
          <div class="tab" :class="{ active: currentTab === 'all' }" @click="changeTab('all')">All</div>
          <div class="tab" :class="{ active: currentTab === 'user' }" @click="changeTab('user')">User</div>
          <div class="tab" :class="{ active: currentTab === 'moderator' }" @click="changeTab('moderator')">Moderator</div>
          <div class="tab" :class="{ active: currentTab === 'admin' }" @click="changeTab('admin')">Admin</div>
        </div>
        <div class="search-container">
          <i class="fa fa-search search-icon"></i>
          <input type="text" placeholder="Search by email or ID" class="search-bar" v-model="searchQuery" @input="searchUsers" />
          <button class="search-button" :class="{ active: activeFilter === 'week' }" @click="toggleFilter('week')">WEEK</button>
          <button class="search-button" :class="{ active: activeFilter === 'month' }" @click="toggleFilter('month')">MONTH</button>
          <button class="search-button" :class="{ active: activeFilter === 'year' }" @click="toggleFilter('year')">YEAR</button>
        </div>
        <div v-if="!selectedUser" class="table-header">
          <span class="user-id-header">#USER</span>
          <span class="email-header">E-MAIL</span>
          <span class="role-header">ROLE</span>
          <span class="updated-header">LAST UPDATED</span>
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">
              <i class="fa-solid fa-circle-chevron-left"></i>
            </button>
            <button @click="nextPage" :disabled="endIndex >= filteredUsers.length">
              <i class="fa-solid fa-circle-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="list-container" v-if="!selectedUser">
          <div v-for="user in paginatedUsers" :key="user._id" class="user-item">
            <span class="user-id">{{ user.userId }}</span>
            <span class="email">{{ user.email }}</span>
            <span class="role">
              <button :class="roleClass(user.role)" class="role-button">{{ user.role }}</button>
            </span>
            <span class="updated">{{ new Date(user.updatedAt).toLocaleDateString() }}</span>
            <button @click="viewUser(user)" class="view-button">View</button>
          </div>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
        <div :class="['user-details', { 'admin-confirmed': selectedUser.role === 'admin' && !isRoleBeingChanged }]" v-else>
          <div class="details-header">
            <span :class="['details-user-id', roleClass(selectedUser.role)]">User {{ selectedUser.userId }} details</span>
          </div>
          <div class="details-body">
            <h3>{{ selectedUser.email }}</h3>
            <p><strong>Created At:</strong> {{ new Date(selectedUser.createdAt).toLocaleDateString() }}</p>
            <p><strong>Updated At:</strong> {{ new Date(selectedUser.updatedAt).toLocaleDateString() }}</p>
            <p v-if="selectedUser.role !== 'admin' || isRoleBeingChanged"><strong>Role:</strong>
              <select v-model="selectedUser.role" @change="isRoleBeingChanged = true" class="role-select">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin" v-if="authStore.user.role === 'admin'">Admin</option>
              </select>
            </p>
            <p v-else><strong>Role:</strong> Admin</p>
          </div>
          <div class="button-container">
            <button v-if="selectedUser.role !== 'admin' || isRoleBeingChanged" @click="deleteUser" class="action-button delete-button">Delete</button>
            <button v-if="selectedUser.role !== initialRole" @click="updateUserRole" class="action-button">Save</button>
            <button class="close-button" @click="closeDetails">
              <CloseArrow />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';
import CloseArrow from '~/assets/icons/close-arrow.svg';

const router = useRouter();
const authStore = useAuthStore();

const currentSection = ref('users');
const currentTab = ref('all');
const users = ref([]);
const filteredUsers = ref([]);
const searchQuery = ref('');
const error = ref('');
const selectedUser = ref(null);
const currentPage = ref(1);
const itemsPerPage = 4;
const activeFilter = ref('');
const initialRole = ref('');
const isRoleBeingChanged = ref(false);

const fetchUsers = async (role) => {
  try {
    const response = await fetch('http://localhost:5000/api/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching users');
    }

    const data = await response.json();
    users.value = data.filter((user) => {
      if (role === 'user') {
        return user.role === 'user';
      } else if (role === 'moderator') {
        return user.role === 'moderator';
      } else if (role === 'admin') {
        return user.role === 'admin';
      } else {
        return true;
      }
    });
    filteredUsers.value = users.value;
  } catch (error) {
    console.error('Error fetching users:', error);
    error.value = 'There was a problem fetching the users. Please try again later.';
  }
};

const changeSection = (section) => {
  currentSection.value = section;
};

const changeTab = (tab) => {
  if (selectedUser.value) {
    closeDetails();
  }
  currentTab.value = tab;
  currentPage.value = 1; 
  fetchUsers(tab);
};

const searchUsers = () => {
  filteredUsers.value = users.value.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

watch(searchQuery, (newValue) => {
  if (newValue && selectedUser.value) {
    closeDetails();
  }
});

const filterUsers = (period) => {
  const now = new Date();
  filteredUsers.value = users.value.filter((user) => {
    const updatedAt = new Date(user.updatedAt);
    switch (period) {
      case 'week':
        return now - updatedAt <= 7 * 24 * 60 * 60 * 1000; 
      case 'month':
        return now - updatedAt <= 30 * 24 * 60 * 60 * 1000; 
      case 'year':
        return now - updatedAt <= 365 * 24 * 60 * 60 * 1000; 
      default:
        return true;
    }
  });
};

const toggleFilter = (period) => {
  if (selectedUser.value) {
    closeDetails();
  }
  if (activeFilter.value === period) {
    activeFilter.value = '';
    filteredUsers.value = users.value; 
  } else {
    activeFilter.value = period;
    filterUsers(period);
  }
};

const viewUser = (user) => {
  selectedUser.value = { ...user };
  initialRole.value = user.role; 
  isRoleBeingChanged.value = false;
};

const closeDetails = () => {
  selectedUser.value = null;
  initialRole.value = '';
  isRoleBeingChanged.value = false;
};

const updateUserRole = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${selectedUser.value._id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ role: selectedUser.value.role }),
    });

    if (!response.ok) {
      throw new Error('Error updating user role');
    }

    const updatedUser = await response.json();
    const index = users.value.findIndex(user => user._id === updatedUser._id);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
    closeDetails();
    fetchUsers(currentTab.value);
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

const deleteUser = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${selectedUser.value._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error deleting user');
    }

    const index = users.value.findIndex(user => user._id === selectedUser.value._id);
    if (index !== -1) {
      users.value.splice(index, 1);
    }
    closeDetails();
    fetchUsers(currentTab.value);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const canChangeRole = (user) => {
  if (authStore.user.role === 'admin') return true;
  if (authStore.user.role === 'moderator' && user.role === 'user') return true;
  return false;
};

const canDeleteUser = (user) => {
  if (authStore.user.role === 'admin') return true;
  if (authStore.user.role === 'moderator' && user.role === 'user') return true;
  return false;
};

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredUsers.value.length));

const nextPage = () => {
  if (endIndex.value < filteredUsers.value.length) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (startIndex.value > 0) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchUsers(currentTab.value);
});

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const roleClass = (role) => {
  switch (role) {
    case 'user':
      return 'user-user';
    case 'moderator':
      return 'user-moderator';
    case 'admin':
      return 'user-admin';
    default:
      return '';
  }
};
</script>

  
<style scoped lang="scss">
  .moderator-page {
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
  
  .search-container {
    position: relative;
    width: 1290px;
    margin: 60px 127px 20px;
    display: flex;
    align-items: center;
    background-color: #f3f3f3;
    border-radius: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 7px 0px;
    padding-right: 25px;
    padding-left: 5px;
  }
  
  .search-icon {
    position: absolute;
    left: 25px;
    font-size: 16px;
    color: #666;
  }
  
  .search-bar {
    width: 100%;
    padding: 10px 20px 10px 50px;
    border: none;
    border-radius: 40px;
    background-color: transparent;
  
    &:focus {
      outline: none; 
    }
  }
  
  .search-button {
    margin-left: 10px;
    padding: 10px 20px;
    border: none;
    background-color: #e0e0e0;
    border-radius: 50px;
    cursor: pointer;
    font-size: 13px;
    letter-spacing: 1px;
    transition: background 0.3s;
  
    &.active {
      background-color: #d0d0d0;
    }
  
    &:hover {
      background-color: #d0d0d0;
    }
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
  
    .arrow {
      margin-left: 5px;
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
    justify-content: center;
    margin-top: 40px;
    margin-right: 161px;
  
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
  
  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    margin-left: 127px;
    margin-right: 127px;
    width: 1290px;
  
    span {
      font-weight: bold;
      color: #444;
      font-size: 14px;
    }
  
    .user-id-header {
      flex: 0;
      padding-left: 15px;
    }
  
    .email-header {
      margin-left: 7px;
      margin-right: 79px;
      flex: 2;
    }
  
    .role-header {
      padding-left: 30px;
      padding-right: 55px;
      flex: 1;
    }
  
    .updated-header {
      padding-right: 57px;
      flex: 1;
    }
  
    .pagination {
      margin-left: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      margin-right: 5px; 
    }
  
    button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 30px;
      padding: 5px;
      letter-spacing: 1px;
    }
  
    span {
      text-align: center;
    }
  }
  
  .list-container {
    background-color: transparent;
    padding: 0;
    border-radius: 50px;
    width: 1290px;
    margin-left: 127px;
    margin-right: 127px;
  }
  
  .user-item {
    background-color: #f3f3f3;
    padding: 14px;
    border-radius: 40px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
  
    span {
      padding: 0 20px;
    }
  
    .user-id {
      flex: 1;
    }
  
    .email {
      flex: 2;
    }
  
    .role {
      flex: 1;
    }
  
    .updated {
      flex: 1;
    }
  
    .view-button {
      background-color: #000;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 40px;
      cursor: pointer;
      margin-right: 10px;
      letter-spacing: 2px;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: background 0.3s;
      text-transform: uppercase;
  
      &:hover {
        background-color: #666;
      }
    }
  
    .role-button {
      border: none;
      padding: 5px 15px;
      border-radius: 30px;
      font-size: 12px;
      cursor: default;
      letter-spacing: 1px;
    }
  
    .role-user {
      background-color: #93A5D3; 
      color: #ffffff;
    }
  
    .role-moderator {
      background-color: #E0E0E0; 
      color: black;
    }
  
    .role-admin {
      background-color: #666666; 
      color: white;
    }
  }
  
  .user-details {
    background-color: #f3f3f3;
    padding: 30px 20px;
    padding-right: 25px;
    border-radius: 50px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 1290px;
    margin: 30px 130px;
    font-weight: 200;
  
    &.admin-confirmed {
      height: 390px;
  
      h3 {
        margin-bottom: 20px;
      }
    }
  
    h3 {
      padding-bottom: 15px;
      font-weight: 200;
      font-size: 32px;
      letter-spacing: 1px;
      padding-left: 20px;
    }
    p {
      padding-bottom: 10px;
      font-size: 15px;
      padding-left: 20px;
    }
  
    .role-select {
      margin-top: 10px;
      margin-left: 10px;
      padding: 5px 30px 5px 15px;
      border-radius: 20px;
      border: 1px solid #ccc;
      background-color: #fff;
      background: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6'/></svg>") no-repeat right 10px center;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      font-size: 14px;
  
      &:focus {
      outline: none; 
    }
    }
  }
  
  .option {
    border: 1px solid #ccc; 
  }
  
  .button-container {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: -40px;
    margin-right: 10px;
    
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
    }
    .close-button {
    height: 40px;
    width: 40px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    color: #000;
    border-radius: 50%;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
  
    &:hover {
      color:#666;
      background-color: transparent;
    }
  }
  
    .delete-button {
      background-color: rgb(218, 99, 99);
  
      &:hover {
        background-color: rgba(192, 94, 94, 0.719);
      }
    }
  }
  
  .details-header {
    display: flex;
    align-items: center;
    padding-bottom: 30px;
    border-bottom: 1px solid #ccc;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-left: 10px;
    margin-right: 10px;
  }
  
  .details-user-id {
    padding: 5px 25px;
    border-radius: 40px;
    font-size: 22px;
    font-weight: 200;
  }
  
  .user-user {
    background-color: #93A5D3; 
    color: white;
  }
  
  .user-moderator {
    background-color: #E0E0E0; 
    color: black;
  }
  
  .user-admin {
    background-color: #666666; 
    color: white;
  }
  
  .details-body {
    padding-bottom: 20px;
  }
  </style>
  