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
          <div class="tab" :class="{ active: currentTab === 'add' }" @click="changeTab('add')">Add Ticket</div>
        </div>
        <div class="form-container">
          <header class="form-header">
            <h3>Add New Ticket</h3>
          </header>
          <form @submit.prevent="submitTicket" novalidate>
            <div class="form-group">
              <label for="title">Write a descriptive title</label>
              <input type="text" id="title" v-model="title" :class="{ invalid: titleError, valid: !titleError && titleTouched }" @blur="validateTitle" required />
              <span class="error-message" v-if="titleError">{{ titleError }}</span>
            </div>
            <div class="form-group">
              <label for="description" class="large-padding-top">Explain the problem</label>
              <textarea id="description" v-model="description" :class="{ invalid: descriptionError, valid: !descriptionError && descriptionTouched }" @blur="validateDescription" required></textarea>
              <span class="error-message" v-if="descriptionError">{{ descriptionError }}</span>
            </div>
            <div class="button-container">
              <button type="submit" class="action-button">Submit</button>
            </div>
            <div v-if="error" class="error">{{ error }}</div>
          </form>
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

const currentSection = ref('addticket');
const currentTab = ref('add');
const title = ref('');
const description = ref('');
const email = ref(authStore.user.email);
const error = ref('');
const titleError = ref('');
const descriptionError = ref('');
const titleTouched = ref(false);
const descriptionTouched = ref(false);

const changeSection = (section) => {
  currentSection.value = section;
};

const changeTab = (tab) => {
  currentTab.value = tab;
};

const validateTitle = () => {
  titleTouched.value = true;
  titleError.value = '';
  if (title.value.trim() === '') {
    titleError.value = 'Title is required.';
  }
};

const validateDescription = () => {
  descriptionTouched.value = true;
  descriptionError.value = '';
  if (description.value.trim() === '') {
    descriptionError.value = 'Description is required.';
  }
};

const validateForm = () => {
  validateTitle();
  validateDescription();
  return !titleError.value && !descriptionError.value;
};

const submitTicket = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        title: title.value,
        description: description.value,
        email: email.value,
        userId: authStore.user._id,
      }),
    });

    if (!response.ok) {
      throw new Error('Error creating ticket');
    }

    router.push('/user/dashboard');
  } catch (error) {
    console.error('Error creating ticket:', error);
    error.value = 'There was a problem creating the ticket. Please try again later.';
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

.form-container {
  background-color: #f3f3f3;
  padding: 30px 40px;
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 1290px;
  margin: 60px 130px;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
  margin-bottom: 22px;
}

.form-header h3 {
  color: #ffffff;
  font-size: 22px;
  font-weight: 200;
  letter-spacing: 1px;
  background-color: #666;
  padding: 10px 25px;
  border-radius: 40px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;

  label {
    display: block;
    margin-bottom: 10px;
    font-size: 17px;
    font-weight: 100;
    padding-left: 20px;
  }

  .large-padding-top {
    padding-top: 10px;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 15px;
    border-radius: 20px;
    border: 1px solid #ccc;
    outline: none;
    background-color: #fff;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 15px;
    border-radius: 20px;
    border: 1px solid #ccc;
    outline: none;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;

    &:focus {
      outline: none;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    &.invalid {
      box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
    }
  }

  .error-message {
    color: #e74c3c;
    font-size: 12px;
    position: absolute;
    bottom: -22px;
    left: 15px;
  }
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .action-button {
    background-color: #93A5D3;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 50px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: background 0.3s;
    font-size: 14px;
    &:hover {
      background-color: #606b88;
    }
  }
}

.error {
  color: red;
  margin-top: 20px;
  text-align: center;
}
</style>
