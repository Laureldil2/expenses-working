<template>
  <div id="app">
    <Navbar />
    <vue-confirm-dialog class="dialog"></vue-confirm-dialog>
    <router-view></router-view>
    <Messenger/>
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Messenger from "./components/Messenger";

/*import axios from 'axios'*/

export default {
  name: 'app',
  components: {
    Navbar,
    Footer,
    Messenger
  },
  methods: {

  },
  mounted() {

  },
  watch: {}, //obserwowanie zmiany wartosci zmiennej
  computed: {}, //zmienne do przeliczania dynamicznego
  data() {
    return {

    }
  }
}

</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-family: 'Red Rose', cursive;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 20px;
}

.dialog > div {
  border: 1px solid rgba(0,0,0,.2);
  border-radius: .5rem;
  width: 550px;
  margin:10px;
}

.dialog > div > span {
}

.dialog > div > span > h4 {
  text-align: left;
  line-height: 2;
  font-size: 1.25rem;
  border-bottom: 1px solid lightgrey;
}

.dialog > div > span > p {
  text-align: left;
  font-size: 1rem;
}

.dialog button {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 1px solid transparent;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: .5rem;
}

.dialog > div > div{
  border-top: none;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;
  padding: 1rem;
}

.dialog button:first-child{
  color: #dc3545;
  background-color: #fff;
  border-color: #dc3545;
  margin-right: 0.25rem;
  border-radius: .5rem;
}

.dialog button:first-child:hover{
  color: #fff;
  background-color: #dc3545;
}

.dialog button:nth-child(2){
  color: #28a745;
  background-color: #fff;
  border-color: #28a745;
}

.dialog button:nth-child(2):hover{
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

.vs__dropdown-toggle {
  border: none!important;
}

.v-select {
  display: block;
  width: 100%;
  height: calc(1.5em + .75rem + 2px);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

</style>
<!--<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>-->
