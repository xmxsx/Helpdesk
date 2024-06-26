<template>
  <div class="register-container">
    <p class="form-title">Please enter your details to sign up.</p>
    <div class="error-container">
      <span class="error-message register-error" v-if="errorMessage">{{ errorMessage }}</span>
    </div>
    <form @submit.prevent="register" novalidate>
      <div class="form-group">
        <input v-model="email" :class="{ invalid: emailError, valid: !emailError && emailTouched }" @input="clearRegisterError" @blur="validateEmail" type="email" placeholder="E-mail" required />
        <span class="error-message" v-if="emailError">{{ emailError }}</span>
      </div>
      <div class="form-group">
        <input v-model="password" :class="{ invalid: passwordError, valid: !passwordError && passwordTouched }" @input="clearRegisterError" @blur="validatePassword" type="password" placeholder="Password" required minlength="6" />
        <span class="error-message" v-if="passwordError">{{ passwordError }}</span>
      </div>
      <button type="submit">Sign up</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const emailError = ref('');
const passwordError = ref('');
const isChecked = ref(false);
const emailTouched = ref(false);
const passwordTouched = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const validateEmail = () => {
  emailTouched.value = true;
  emailError.value = '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.match(emailPattern)) {
    emailError.value = 'Enter a valid email address.';
  }
};

const validatePassword = () => {
  passwordTouched.value = true;
  passwordError.value = '';
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long.';
  }
};

const validateForm = () => {
  clearRegisterError(); 
  validateEmail();
  validatePassword();
  return !emailError.value && !passwordError.value;
};

const clearRegisterError = () => {
  errorMessage.value = '';
};

const register = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    await authStore.register(email.value, password.value, 'user');
    router.push('/user/dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
    if (error.response && error.response.status === 400) {
      errorMessage.value = 'User already exists.';
    } else {
      errorMessage.value = error.message || 'Registration failed';
    }
  }
};
</script>

<style scoped lang="scss">
.register-container {
  background: transparent;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  margin: 2% auto;

  .form-title {
    margin-bottom: 10px;
    color: #666;
    font-family: 'Inter', sans-serif;
    font-weight: 200;
    font-size: 25px;
    text-align: center;
  }

  .error-container {
    min-height: 20px; 
    margin-bottom: 20px; 
  }

  .form-group {
    margin-bottom: 30px;
    position: relative;

    input {
      width: 100%;
      padding: 10px 15px;
      border: none;
      border-radius: 30px;
      background-color: #f3f3f3;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;

      &:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      }

      &.invalid {
        box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
      }

      &.valid {
        box-shadow: 0 0 5px rgba(43, 255, 0, 0.5);
      }
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      position: absolute;
      bottom: -20px;
      left: 15px;
    }
  }

  .remember-me {
    display: flex;
    align-items: center;
    font-size: 15px;

    input {
      display: none;
    }

    label {
      display: flex;
      align-items: center;
      font-family: 'Inter', sans-serif;
      color: #666;
      cursor: pointer;
      margin-left: 5px;
    }

    .custom-checkbox {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 1px solid #aaaaaa;
      border-radius: 50%;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f3f3;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s, border-color 0.3s;
      transform: translateY(-1.5px);

      i {
        color: #666;
        font-size: 14px;
      }
    }

    input:checked + label .custom-checkbox {
      border-color: #000;
    }

    input:checked + label .custom-checkbox i {
      color: #000;
      font-size: 18px;
    }
  }

  button {
    margin-top: 20px;
    background: #000;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    letter-spacing: 1px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    transition: background 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    &:hover {
      background: #444;
    }
  }

  .register-error {
    display: block;
    color: #e74c3c;
    font-size: 12px;
    text-align: center;
  }
}
</style>
