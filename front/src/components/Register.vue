<template>
  <div class="container">
    <form id="form" target="dummyframe" class=" jumbotron">
      <h1>Register</h1>
      <div class="form-row mb-3">
        <label>Name</label>
        <input type="text" v-model="name" placeholder="name" required class="form-control" v-on:change="errorsName=[]">
      </div>
      <div v-if="errorsName.length" class="text-danger">
        <ul>
          <li v-for="error in errorsName" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
      <div class="form-row mb-3">
        <label>E-mail</label>
        <input type="text" v-model="email" placeholder="email" required class="form-control"
               v-on:change="errorsEmail=[]"></div>
      <div v-if="errorsEmail.length" class="text-danger">
        <ul>
          <li v-for="error in errorsEmail" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
      <div class="form-row mb-3">
        <label>Password</label>
        <input type="password" v-model="password" placeholder="password" required class="form-control"
               v-on:change="errorsPassword=[]"></div>
      <div v-if="errorsPassword.length" class="text-danger">
        <ul>
          <li v-for="error in errorsPassword" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
      <div class="form-row mb-3">
        <label>Password confirm</label>
        <input type="password" v-model="passwordConfirm" placeholder="password confirm" required class="form-control"
               v-on:change="errorsPasswordConfirm=[]"></div>
      <div v-if="errorsPasswordConfirm.length" class="text-danger">
        <ul>
          <li v-for="error in errorsPasswordConfirm" v-bind:key="error">{{ error }}</li>
        </ul>
      </div>
      <input type="submit" class="btn btn-outline-secondary" value="Sign up" v-on:click="register" :disabled=isDisabled>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  data() {
    return {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      errorsName: [],
      errorsEmail: [],
      errorsPassword: [],
      errorsPasswordConfirm: []
    }
  },
  methods: {
    register(form) {
      form.preventDefault();
      axios.post(this.$root.$api + "users", {
        username: this.name,
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm
      }).then((res) => {
        this.$root.$emit('message',{msg:"Account created!",success:true})
        this.sendStatusToNav(res.data.user);
        this.$router.push('/dashboard');
      }).catch((error) => {
        if (Array.isArray(error.response.data.errors)) {
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
        }
        if (typeof error.response.data.message !== "undefined") {
          this.$root.$emit('message',{msg:error.response.data.message,success:false})
        }
      });
    },
    sendStatusToNav(user) {
      this.$root.$emit('login', user)
    }
  },
  computed:{
    isDisabled() {
      if(this.errorsName.length) return true;
      if(this.errorsEmail.length) return true;
      if(this.errorsPassword.length) return true;
      if(this.errorsPasswordConfirm.length) return true;
      return false;
    }
  },
  mounted() {
    if (this.$root.$ss.get("user")) {
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

.jumbotron {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.container{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
}
</style>