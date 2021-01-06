import VueRouter from 'vue-router'
import VueMoment from 'vue-moment'
import App from './App.vue'
import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret, faTrashAlt, faPlusCircle,faTimesCircle, faCheckCircle, faReceipt, faEdit, faSave, faWindowClose,faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueConfirmDialog from 'vue-confirm-dialog'
import vSelect from 'vue-select'
import lsWatcher from "vue-storage-watcher"
import 'vue-select/dist/vue-select.css';
import VueGoodTablePlugin from "vue-good-table";
import 'vue-good-table/dist/vue-good-table.css'

import Login from './components/Login.vue'
import Register from "./components/Register";
import PhotoReceipts from "@/components/PhotoReceipts";
import Receipts from "@/components/Receipts";
import Categories from "@/components/Categories";
import ProductTypes from "@/components/ProductTypes";
import Dashboard from "@/components/Dashboard";
import PageNotFound from "@/components/PageNotFound";
import Settings from "@/components/Settings";

library.add(faUserSecret)
library.add(faTrashAlt)
library.add(faPlusCircle)
library.add(faTimesCircle)
library.add(faCheckCircle)
library.add(faReceipt)
library.add(faEdit)
library.add(faSave)
library.add(faWindowClose)
library.add(faTimes)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('v-select', vSelect)
Vue.component('vue-confirm-dialog', VueConfirmDialog.default)
Vue.use(VueConfirmDialog)
Vue.use(VueRouter);
Vue.use(VueMoment);
Vue.use(VueGoodTablePlugin)
Vue.use({ ...lsWatcher }, { prefix: "myproject_ss_", storage: "session" })

Vue.config.productionTip = false
Vue.prototype.$api = "http://192.168.100.79:3000/api/"

const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/register',
    component: Register
  },
  {
    path:'/photo-receipts',
    component: PhotoReceipts
  },
  {
    path: '/receipts',
    component: Receipts
  },
  {
    path: '/categories',
    component: Categories
  },
  {
    path: '/product-types',
    component: ProductTypes
  },
  {
    path: '/dashboard',
    component: Dashboard
  },
  {
    path:'/settings',
    component: Settings
  },
  {
    path: '*',
    component: PageNotFound
  }
]

const router = new VueRouter({
  routes, // short for `routes: routes`
  mode: 'history',
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
