<template>
  <div class="container">
    <form id="form" class="jumbotron">
      <h1>Login</h1>
      <div v-if="errors.length" class="text-danger">
        Please correct the following error(s):
      <ul>
        <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
      </ul>
      </div>
      <div class="form-row mb-3">
        <label>Name</label>
        <input type="text" v-model="name" placeholder="name" required class="form-control">
      </div>
      <div class="form-row mb-3">
        <label>Password</label>
        <input type="password" v-model="password" placeholder="password" required class="form-control">
      </div>
      <div class="form-row mb-3 text-centre">
        <label id="register-label" @click="$router.push('/register').catch(err => {})">"Don't have an account yet?  Sign Up now"</label>
      </div>

      <div class="form-row mb-3">
      <input type="submit" class="btn btn-outline-dark" value="Sign in" v-on:click="checkForm">
      </div>

    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: 'Login',
  props: {},
  data() {
    return {
        name: "",
        password: "",
        errors: []
      }
  },
  methods: {
    login(){
      axios.post(this.$root.$api + "users/login", {
        username: this.name,
        password: this.password,
      }).then((res) => {
        this.$root.$emit('message',{msg:res.data.message,success:true})
        this.sendStatusToNav(res.data.user);
        this.$router.push('/dashboard');
      }).catch((error) => {
        if(typeof error.response !== "undefined")
        this.errors.push(error.response.data.message)
        else this.$root.$emit('message',{msg:"Maintenance work!",success:false})
      });
    },
    checkForm(e) {
      this.errors = [];

      if (!this.name) {
        this.errors.push('Name required.');
      }
      if (!this.password) {
        this.errors.push('Password required.');
      }
      e.preventDefault();

      if(!this.errors.length){
        this.login()
      }
    },
    sendStatusToNav(user){
      this.$root.$emit('login', user)
    }
  },
  mounted() {
    if(this.$root.$ss.get("user")){
      this.$router.push('/dashboard');
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

input[type=submit] {
  width: 100%;
}

.jumbotron {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.container{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
}

#register-label {
  cursor: pointer;
}
</style>