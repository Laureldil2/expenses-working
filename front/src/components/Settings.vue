<template>
  <div class="container">
    <form id="form" class=" jumbotron">
      <h1>Settings</h1>
      <hr/>
      <h2>Change password</h2>
      <div class="form-row mb-3">
        <label>Old password</label>
        <input type="password" v-model="oldPassword" placeholder="old password" required class="form-control">
      </div>
      <div class="form-row mb-3">
        <label>New password</label>
        <input type="password" v-model="newPassword" placeholder="new password" required class="form-control">
      </div>
      <div class="form-row mb-3">
        <label>Password confirm</label>
        <input type="password" v-model="passwordConfirm" placeholder="password confirm" required class="form-control">
      </div>
      <input type="submit" class="btn btn-outline-secondary" value="Change password" v-on:click="changePassword">
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Settings",
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      passwordConfirm: '',
    }
  },
  methods: {
    changePassword(form) {
      form.preventDefault();
      axios.put(this.$root.$api + "users/" + this.$ss.get('user').id, {
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
            passwordConfirm: this.passwordConfirm
          },
          {
            headers: {
              token: this.$ss.get('user').token,
            }
          }).then(() => {
        this.$root.$emit('message', {msg: "Password changed!", success: true})
        this.oldPassword = '';
        this.newPassword = '';
        this.passwordConfirm = '';
      }).catch((error) => {
        console.log(error)
/*        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(error => {
            if (error.param === "username") {
              this.errorsName.push(error.msg)
            } else if (error.param === "email") {
              this.errorsEmail.push(error.msg)
            } else if (error.param === "password") {
              this.errorsPassword.push(error.msg)
            } else if (error.param === "passwordConfirm") {
              this.errorsPasswordConfirm.push(error.msg)
            } else this.errors.push(error.msg)
          })
        }*/
        if (typeof error.response.data.message !== "undefined") {
          this.$root.$emit('message', {msg: error.response.data.message, success: false})
        }
      });
    },
  },
  mounted() {
    if (!this.$root.$ss.get("user")) {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
}
</style>