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
          <div class="tab" :class="{ active: currentTab === 'open' }" @click="changeTab('open')">Open</div>
          <div class="tab" :class="{ active: currentTab === 'in-progress' }" @click="changeTab('in-progress')">In Progress</div>
          <div class="tab" :class="{ active: currentTab === 'closed' }" @click="changeTab('closed')">Closed</div>
        </div>
        <div class="search-container">
          <i class="fa fa-search search-icon"></i>
          <input type="text" placeholder="Search by topic or ID" class="search-bar" v-model="searchQuery" @input="searchTickets" />
          <button class="search-button" :class="{ active: activeFilter === 'week' }" @click="toggleFilter('week')">WEEK</button>
          <button class="search-button" :class="{ active: activeFilter === 'month' }" @click="toggleFilter('month')">MONTH</button>
          <button class="search-button" :class="{ active: activeFilter === 'year' }" @click="toggleFilter('year')">YEAR</button>
        </div>
        <div v-if="!selectedTicket" class="table-header">
          <span class="ticket-id-header">#TICKET</span>
          <span class="topic-header">TOPIC</span>
          <span class="status-header">REQUEST STATUS</span>
          <span class="updated-header">LAST UPDATED</span>
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">
              <i class="fa-solid fa-circle-chevron-left"></i>
            </button>
            <button @click="nextPage" :disabled="endIndex >= filteredTickets.length">
              <i class="fa-solid fa-circle-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="list-container" v-if="!selectedTicket">
          <div v-for="ticket in paginatedTickets" :key="ticket._id" class="ticket-item">
            <span class="ticket-id">{{ ticket.ticketId }}</span>
            <span class="topic">{{ ticket.title }}</span>
            <span class="status">
              <button :class="statusClass(ticket.status)" class="status-button">{{ ticket.status }}</button>
            </span>
            <span class="updated">{{ new Date(ticket.updatedAt).toLocaleDateString() }}</span>
            <button @click="viewTicket(ticket)" class="view-button">View</button>
          </div>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
        <div v-else class="ticket-details">
          <div class="details-header">
            <span class="details-ticket-id" :class="ticketStatusClass(selectedTicket.status)">Ticket {{ selectedTicket.ticketId }} details</span>
          </div>
          <div class="details-body">
            <div class="details-column-left">
              <p><span>Date:</span> {{ new Date(selectedTicket.createdAt).toLocaleDateString() }}</p>
              <p><span>Last updated:</span> {{ new Date(selectedTicket.updatedAt).toLocaleDateString() }}</p>
              <p><span>Status:</span>
                <select v-model="selectedTicket.status" @change="handleStatusChange" class="status-select">
                  <option value="open">open</option>
                  <option value="in progress">in progress</option>
                  <option value="closed">closed</option>
                </select>
              </p>
            </div>
            <div class="details-column-right">
              <h3>{{ selectedTicket.title }}</h3>
              <p><span>From:</span> {{ selectedTicket.email }}</p>
              <p class="request"><span>Request:</span> {{ formattedDescription(selectedTicket.description) }}</p>
            </div>
          </div>
          <div class="details-footer">
            <div class="details-buttons">
              <button class="delete-button" @click="deleteTicket">Delete</button>
              <button v-if="selectedTicket.status !== initialStatus" class="save-button" @click="updateTicketStatus">Save</button>
              <button class="close-button" @click="closeDetails">
                <CloseArrow />
              </button>
            </div>
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

const currentSection = ref('dashboard');
const currentTab = ref('all');
const tickets = ref([]);
const filteredTickets = ref([]);
const searchQuery = ref('');
const error = ref('');
const selectedTicket = ref(null);
const currentPage = ref(1);
const itemsPerPage = 4;
const activeFilter = ref('');
const initialStatus = ref('');

const fetchTickets = async (status) => {
  try {
    const response = await fetch('http://localhost:5000/api/tickets', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching tickets');
    }

    const data = await response.json();
    tickets.value = data.filter((ticket) => {
      if (status === 'open') {
        return ticket.status === 'open';
      } else if (status === 'in-progress') {
        return ticket.status === 'in progress';
      } else if (status === 'closed') {
        return ticket.status === 'closed';
      } else {
        return true;
      }
    });
    filteredTickets.value = tickets.value;
  } catch (error) {
    error.value = 'There was a problem fetching the tickets. Please try again later.';
  }
};

const changeSection = (section) => {
  currentSection.value = section;
};

const changeTab = (tab) => {
  if (selectedTicket.value) {
    closeDetails();
  }
  currentTab.value = tab;
  currentPage.value = 1; 
  fetchTickets(tab);
};

const searchTickets = () => {
  filteredTickets.value = tickets.value.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
};

watch(searchQuery, (newValue) => {
  if (newValue && selectedTicket.value) {
    closeDetails();
  }
});

const filterTickets = (period) => {
  const now = new Date();
  filteredTickets.value = tickets.value.filter((ticket) => {
    const updatedAt = new Date(ticket.updatedAt);
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
  if (selectedTicket.value) {
    closeDetails();
  }
  if (activeFilter.value === period) {
    activeFilter.value = '';
    filteredTickets.value = tickets.value;
  } else {
    activeFilter.value = period;
    filterTickets(period);
  }
};

const viewTicket = (ticket) => {
  selectedTicket.value = { ...ticket };
  initialStatus.value = ticket.status; 
};

const closeDetails = () => {
  selectedTicket.value = null;
  initialStatus.value = '';
};

const updateTicketStatus = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket.value._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ status: selectedTicket.value.status }),
    });

    if (!response.ok) {
      throw new Error('Error updating ticket status');
    }

    const updatedTicket = await response.json();
    const index = tickets.value.findIndex(ticket => ticket._id === updatedTicket._id);
    if (index !== -1) {
      tickets.value[index] = updatedTicket;
    }
    closeDetails();
    fetchTickets(currentTab.value);
  } catch (error) {
    console.error('Error updating ticket status:', error);
  }
};

const deleteTicket = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/tickets/${selectedTicket.value._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error deleting ticket');
    }

    const index = tickets.value.findIndex(ticket => ticket._id === selectedTicket.value._id);
    if (index !== -1) {
      tickets.value.splice(index, 1);
    }
    closeDetails();
    fetchTickets(currentTab.value);
  } catch (error) {
    console.error('Error deleting ticket:', error);
  }
};

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTickets.value.slice(start, start + itemsPerPage);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredTickets.value.length));

const nextPage = () => {
  if (endIndex.value < filteredTickets.value.length) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (startIndex.value > 0) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchTickets(currentTab.value);
});

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const statusClass = (status) => {
  switch (status) {
    case 'open':
      return 'status-open';
    case 'in progress':
      return 'status-in-progress';
    case 'closed':
      return 'status-closed';
    default:
      return '';
  }
};

const ticketStatusClass = (status) => {
  switch (status) {
    case 'open':
      return 'ticket-open';
    case 'in progress':
      return 'ticket-in-progress';
    case 'closed':
      return 'ticket-closed';
    default:
      return '';
  }
};

const formattedDescription = (description) => {
  return description.match(/.{1,85}/g).join('\n');
};

const handleStatusChange = () => {
  selectedTicket.value.isStatusBeingChanged = selectedTicket.value.status !== initialStatus.value;
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
  
    .ticket-id-header {
      flex: 0;
      padding-left: 15px;
    }
  
    .topic-header {
      padding-right: 90px;
      flex: 2;
    }
  
    .status-header {
      padding-left: 80px;
      padding-right: 28px;
      flex: 1;
    }
  
    .updated-header {
      padding-right: 72px;
      flex: 1;
    }
  
    .pagination {
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
  
  .ticket-item {
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
  
    .ticket-id {
      flex: 1;
    }
  
    .topic {
      flex: 2;
    }
  
    .status {
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
  
    .status-button {
      border: none;
      padding: 5px 15px;
      border-radius: 30px;
      font-size: 12px;
      cursor: default;
      letter-spacing: 1px;
    }
  
    .status-open {
      background-color: #93A5D3; /* Blue */
      color: #ffffff;
    }
  
    .status-in-progress {
      background-color: #E0E0E0; /* Light Gray */
      color: black;
    }
  
    .status-closed {
      background-color: #666666; /* Dark Gray */
      color: white;
    }
  }
  
  .ticket-details {
    background-color: #f3f3f3;
    padding: 30px;
    border-radius: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 1290px;
    margin: 30px 130px;
  }
  
  .details-header {
    display: flex;
    align-items: center;
    padding-bottom: 30px;
    border-bottom: 1px solid #ccc;
    justify-content: space-between;
  }
  
  .details-ticket-id {
    padding: 5px 25px;
    border-radius: 40px;
    font-size: 22px;
    font-weight: 200;
  }
  
  .ticket-open {
    background-color: #93A5D3; 
    color: white;
  }
  
  .ticket-in-progress {
    background-color: #E0E0E0; 
    color: black;
  }
  
  .ticket-closed {
    background-color: #666666; 
    color: white;
  }
  
  .details-body {
    padding-top: 25px;
    display: flex;
    justify-content: space-between;
    font-weight: 200;
    font-size: 15px;
  
    span {
      font-weight: 400;
    }
  
  }
  
  .details-column-left {
    margin-top: 19px;
    flex: 1;
    padding-right: 20px;
    margin-left: 20px;
  
    p {
      padding-bottom: 10px;
    }
  }
  
  .details-column-right {
    flex: 3;
    margin-right: 20px;
  
    .request {
      padding-top: 6px;
      padding-right: 197px;
    }
  
    p {
      padding-bottom: 10px;
    }
  }
  
  .details-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .details-section {
    font-weight: 200;
    display: flex;
  }
  
  h3 {
    font-weight: 200;
    font-size: 32px;
    margin-bottom: 23px;
    padding-bottom: 10px;
  }
  
  p {
    margin-bottom: 20px;
  }
  
  .details-buttons {
    padding-top: 10px;
    display: flex;
    gap: 10px;
  }
  
  .details-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  
  }
  
  .delete-button,
  .save-button,
  .close-button {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 50px;
    cursor: pointer;
    letter-spacing: 1px;
    font-size: 14px;
    transition: background 0.3s;
    font-weight: 200;
  
    &:hover {
      background-color: #666;
    }
  }
  
  .delete-button {
    background-color: rgb(218, 99, 99);
  
    &:hover {
      background-color: rgba(192, 94, 94, 0.719);
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
  
  .status-select {
    margin-left: 15px;
    padding: 5px 15px;
    border-radius: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    background: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-down' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6'/></svg>") no-repeat right 10px center;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    font-size: 14px;
    width: 150px;
  
    &:focus {
      outline: none; 
    }
  
    &.invalid {
      box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
    }
  
    &.valid {
      box-shadow: 0 0 5px rgba(43, 255, 0, 0.5);
    }
  }
  </style>
  