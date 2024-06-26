<template>
  <div class="login-page">
    <div class="logo">
      <img src="assets/images/logo.png" alt="Logo" />
    </div>
    <div class="signup-link">
      <p>Don't you have an account?</p>
      <NuxtLink to="/register" class="signup-button"><span>Sign up</span></NuxtLink>
    </div>
    <div class="welcome">
      <h1>Welcome back to your helpdesk.</h1>
    </div>
    <login-form />
  </div>
</template>

<script setup>
import LoginForm from '~/components/loginForm.vue';
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: url('assets/images/background.png') no-repeat center center fixed;
  background-size: cover;
  text-align: center;
  padding: 20px;
  position: relative;
}

.logo img {
  position: absolute;
  top: 20px;
  left: 20px;
  height: 50px;
}

.signup-link {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 20px;

  p {
    margin: 0;
  }

  .signup-button {
    color: #fff;
    text-decoration: none;
    background: #000;
    padding: 10px 20px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    letter-spacing: 1px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    transition: background 0.3s;

    &:hover {
      background: #444;
    }
  }
}

.welcome h1 {
  font-size: 55px;
  margin-top: 80px;
  margin-bottom: 0px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 200;
  font-family: 'Inter', sans-serif;
  text-align: center;
}
</style>
