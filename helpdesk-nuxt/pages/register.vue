<template>
  <div class="register-page">
    <div class="logo">
      <img src="assets/images/logo.png" alt="Logo" />
    </div>
    <div class="login-link">
      <p>Already have an account?</p>
      <NuxtLink to="/" class="login-button"><span>Log in</span></NuxtLink>
    </div>
    <div class="welcome">
      <h1>Welcome. Let's get started.</h1>
    </div>
    <register-form />
  </div>
</template>

<script setup>
import RegisterForm from '~/components/registerForm.vue';
</script>

<style scoped lang="scss">
.register-page {
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

  .logo img {
    position: absolute;
    top: 20px;
    left: 20px;
    height: 50px;
  }

  .login-link {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 20px;

    p {
      margin: 0;
    }

    .login-button {
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
      letter-spacing: 1px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background: #444;
      }
    }
  }

  .welcome h1 {
    font-size: 55px;
    margin-top: 80px;
    margin-bottom: auto;
    margin-left: auto;
    margin-right: auto;
    font-weight: 200;
    font-family: 'Inter', sans-serif;
  }
}
</style>
