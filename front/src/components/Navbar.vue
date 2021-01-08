<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark position-fixed">
      <button ref="toggler" id="toggler" class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="true" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    <router-link to="/">
    <a class="navbar-brand" href="#" v-on:click='hideMenu'>
          <img id="logo" src="../../public/receipt3.png" height="40px"/>
        Expenses Inspection
      </a>
    </router-link>
    <span class="dot" v-on:mouseover="checkServerStatus" v-bind:style="{'background-color': serverStatusColor}"></span>
      <div id="server-status" class="border rounded text-light bg-dark">{{serverStatus.message}}</div>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <router-link to="/receipts" v-if="logged">
          <li class="nav-item active">
            <a class="nav-link" href="#" v-on:click='hideMenu'>Receipts</a>
          </li>
        </router-link>
<!--        <router-link to="/expenses" v-if="logged">
          <li class="nav-item active">
            <a class="nav-link" href="#" v-on:click='hideMenu'>Expenses</a>
          </li>
        </router-link>-->
        <router-link to="/photo-receipts" v-if="logged">
          <li class="nav-item active">
            <a class="nav-link" href="#" v-on:click='hideMenu'>Photo Receipts</a>
          </li>
        </router-link>
        <router-link to="/categories" v-if="logged">
          <li class="nav-item active">
            <a class="nav-link" href="#" v-on:click='hideMenu'>Categories</a>
          </li>
        </router-link>
        <router-link to="/product-types" v-if="logged">
          <li class="nav-item active">
            <a class="nav-link" href="#" v-on:click='hideMenu'>Product Types</a>
          </li>
        </router-link>
      </ul>
      <form id="buttons" class="form-inline my-2 my-lg-0" v-if="logged">
        <input type="button" class="btn btn-outline-light my-2 my-sm-0" v-on:click="$router.push('/admin').catch(err => {})" value="Admin"
               v-if="admin">
        <input type="button" class="btn btn-outline-light" v-on:click="hideMenu(); $router.push('/settings').catch(err => {})"
               value="Settings">
        <input type="button" class="btn btn-outline-light my-2 my-sm-0" v-on:click="logout"
               value="Logout">
      </form>
    </div>
  </nav>
</template>

<script>
import axios from "axios";

export default {
  name: 'Navbar',
  props: {},
  data() {
    return {
      logged: false,
      admin: false,
      serverStatusColor: "red",
      serverStatus: "",
    }
  },
  methods: {
    checkServerStatus() {
      axios.get(this.$root.$api).then((res) => {
        this.serverStatus = res.data
        this.serverStatusColor = "#42b983"
      }).catch((error) => {
        this.serverStatusColor = "red"
        this.serverStatus = error;
        this.$root.$emit('message',{msg:"Maintenance work!",success:false})
        if(typeof error.response !== "undefined")
        this.$root.$emit('message',{msg:error.response.data.message,success:false})
      });
    },
    logout(){
      this.$ss.remove('user');
      this.logged=false;
      this.$root.$emit('message',{msg:"Logged out!",success:true})
      this.$router.push('/').catch(() => {})
    },
    hideMenu(){
      this.$refs.toggler.click()
    }
  },
  mounted() {
    this.checkServerStatus();
    this.$root.$on('login', (user) =>{
      this.logged = true;
      this.admin = user.admin;
      this.$ss.set("user", user);
      setTimeout(()=>{
        this.logout();
      }, user.expiresIn);
    })
    if(this.$ss.get('user')){
      this.logged = true;
      this.admin = this.$ss.get('user').admin;
    }
  }
}

</script>

<style>
.navbar {
  z-index: 2;
}

#logo {
  filter: invert(100%);
}

.dot {
  height: 20px;
  width: 20px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

#server-status{
  display: none;
  min-height: 50px;
  text-align: center;
  width: 250px;
  align-items: center;
  padding: 10px;
  top:10px;
  left: 10px;
  position: absolute;
}

.dot:hover~#server-status{
  display: block;
}

input[type=button]{
  margin: 2px;
}

@media screen and (max-width: 992px){
  #buttons {
    display: block;
  }
  #buttons > input {
    width: 50%;
  }
}
.position-fixed {
  width: 100%;
  top:0px;
  left: 0px;
}

</style>


<!--<router-link to="/products">
  <li class="nav-item active">
    <a class="nav-link">Products <span class="sr-only">(current)</span></a>
  </li>
</router-link>-->
<!--<router-link to="/orders" v-if="logged">
  <li class="nav-item">
    <a class="nav-link">Orders</a>
  </li>
</router-link>-->
<!--<router-link to="/cart">
  <li class="nav-item">
    <a class="nav-link" id="hey">Cart <div id="bubble">sum</div></a>
  </li>
</router-link>-->