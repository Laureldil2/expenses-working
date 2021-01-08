<template>
  <form id="form">
    <div class="row">
      <div class="col-12 d-flex justify-content-center">
        <h1>Receipt editor<!--<span class='close-editor' v-on:click="close()">X</span>--></h1>
        <font-awesome-icon class="close-editor" icon="times" v-on:click="close()"/>
      </div>
    </div>
    <div v-if="!isLoaded">
      <div class="lds-ripple">
        <div></div>
      </div>
      <h2>Processing...</h2>
    </div>

    <div v-if="isLoaded">
      <div class="d-flex row">
        <div class="form-row mb-3 col-lg-4">
          <label>Shop name</label>
          <input type="text" v-model="shopName" placeholder="shop name" required class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-2">
          <label>NIP</label>
          <input type="number" v-model.number="NIP" placeholder="NIP" required class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-3">
          <label>Date</label>
          <input type="date" v-model="date" required class="form-control">
        </div>
        <div class="form-row mb-3 col-11 col-lg-2">
          <label>Sum</label>
          <input type="text" v-model.number="sum" placeholder="sum" required class="form-control" v-on:change="checkSum">
        </div>
        <div class="form-row mb-3 col-1">
          <font-awesome-icon class="icon icon-failure"
                             icon="times-circle" v-if="!isValid"></font-awesome-icon>
          <font-awesome-icon class="icon icon-success"
                             icon="check-circle" v-if="isValid"></font-awesome-icon>
        </div>
        <div v-if="errors.length" class="text-danger">
          <ul>
            <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
          </ul>
        </div>
      </div>
      <hr/>
      <template v-for="(product, index) in products">
        <div v-bind:key="index" class="position-relative">
          <!--<span class="remove-product" v-on:click="removeProduct(index)">X</span>-->
          <font-awesome-icon class="remove-product" icon="times" v-on:click="removeProduct(index)"/>
          <div class="d-flex flex-wrap mb-3">
            <div class="form-row mb-3 col-lg-6">
              <label>Product</label>
              <input type="product" v-model="product.name" placeholder="product" required class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-3">
              <label>Product type</label>
              <v-select class="select" :options="product.productTypes" :reduce="productTypes => productTypes.id"
                        label="name"
                        placeholder="Select product type" v-model="product.productTypeId"></v-select>
            </div>
            <div class="form-row mb-3 col-lg-3">
              <label>Category</label>
              <v-select class="select" v-model="product.currentCategory" v-on:input="updateProductTypes(index)"
                        :options="categories" :reduce="categories => categories.id" label="name"
                        placeholder="Only for filtering product types"></v-select>
            </div>
            <div class="form-row mb-3 col-lg-2">
              <label>Quantity</label>
              <input type="number" v-model.number="product.quantity" placeholder="quantity" required class="form-control" v-on:change="checkTotalPrice(index)">
            </div>
            <div class="form-row mb-3 col-lg-2">
              <label>Unit price</label>
              <input type="number" v-model.number="product.unitPrice" placeholder="unit price" required class="form-control" v-on:change="checkTotalPrice(index)">
            </div>
            <div class="form-row mb-3 col-lg-4">
              <label>Discount</label>
              <input type="number" v-model.number="product.discount" placeholder="discount" required class="form-control" v-on:change="checkSum">
            </div>
            <div class="form-row mb-3 col-11 col-lg-3">
              <label>Normal price</label>
              <input type="number" v-model.number="product.normalPrice" placeholder="normal price" required class="form-control" v-on:change="checkSum();checkTotalPrice(index)">
            </div>
            <div class="form-row mb-3 col-1">
              <font-awesome-icon class="icon icon-failure"
                                 icon="times-circle" v-if="!product.isValid"></font-awesome-icon>
              <font-awesome-icon class="icon icon-success"
                                 icon="check-circle" v-if="product.isValid"></font-awesome-icon>
            </div>
            <div v-if="product.errors.length" class="text-danger">
              <ul>
                <li v-for="error in product.errors" v-bind:key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
          <hr/>
        </div>
      </template>
      <div class="form-row mb-3">
        <input type="button" class="btn btn-outline-dark" value="Add next product" v-on:click="addProduct">
      </div>
      <div v-if="hasFile" class="form-check mb-3">
        <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" v-model="saveCheckbox">
        <label class="form-check-label">
          SAVE RECEIPT: Check if you want to save a photo of the receipt. It may be useful during a product complaint
        </label>
      </div>
      <div class="form-row mb-3">
        <input type="submit" class="btn btn-outline-success" value="Save" :disabled="this.isDisabled" v-on:click="saveReceipt">
      </div>
      <div class="form-row mb-3 text-center">
        <h2>Preview</h2>
        <img v-bind:src="receiptURL"/>
      </div>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  name: "ReceiptEditor",
  props: {
    receiptFilename: String,
    receiptURL: String
  },
  data() {
    return {
      shopName: "",
      NIP: "",
      date: "",
      sum: 0,
      isValid: false,
      products: [],
      savePhoto: false,
      isLoaded: false,
      categories: [],
      productTypes: [],
      receiptName: '',
      saveCheckbox: false,
      errors:[],
      hasFile: true
    }
  },
  watch: {
    saveCheckbox: function(val){
      if(!val) {
        console.log("empty")
        this.receiptName = ''
      } else {
        this.receiptName = this.receiptFilename;
      }
    }
  },
  computed:{
    isDisabled(){
      let flag = false;
      if(!this.isValid) flag = true;
      //if(this.errors.length) flag = true;
      this.products.forEach(product => {
        if(!product.isValid) flag = true;
        //if(product.errors.length) flag = true;
      })
      console.log(flag)
      return flag;
    }
  },
  methods: {
    close() {
      this.$confirm(
          {
            title: 'Closing editor',
            message: `Are you sure you want to close editor? The changes will be lost!`,
            button: {
              no: 'Cancel',
              yes: 'Close'
            },
            callback: confirm => {
              if (confirm) {
                this.$emit('close-editor');
              }
            }
          })
    },
    loadCategories() {
      return axios.get(this.$root.$api + "categories/?user_id=" + this.$ss.get('user').id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.categories = res.data.categories;
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    loadProductTypes() {
      return axios.get(this.$root.$api + "product-types/?user_id=" + this.$ss.get('user').id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.productTypes = res.data.productTypes;
        this.products.forEach(product => {
          product.productTypes = this.productTypes;
        })
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    readReceipt() {
      return axios.get(this.$root.$api + "photo-receipt/" + this.$ss.get('user').username + "-" + this.receiptFilename, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.isLoaded = true;
        let receipt = res.data.receipt;
        this.shopName = receipt.shop_name;
        this.NIP = receipt.NIP;
        this.date = receipt.date;
        this.sum = receipt.sum;
        this.isValid = receipt.isValid;
        console.log(receipt.errors)
        receipt.products.forEach(product => {
          this.products.push({
            name: product.name,
            quantity: product.quantity,
            unitPrice: product.unit_price,
            normalPrice: product.total_price,
            discount: product.discount,
            isValid: product.isValid,
            productTypeId: "",
            currentCategory: "",
            productTypes: [],
            errors: []
          })
        })
      }).catch((error) => {
        window.console.log(error)
        window.console.log(error.response)
        window.console.log(error.response.data)
        window.console.log(error.response.data.message)
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
        this.$emit('close-editor');
      });
    },
    updateProductTypes(index) {
      if (isNaN(parseInt(this.products[index].currentCategory))) this.products[index].productTypes = this.productTypes;
      else
        axios.get(this.$root.$api + "product-types/?user_id=" + this.$ss.get('user').id + '&category_id=' + this.products[index].currentCategory, {
              headers: {
                token: this.$ss.get('user').token
              }
            }
        ).then((res) => {
          console.log(res.data)
          this.products[index].productTypes = res.data.productTypes;
          if (res.data.productTypes.length === 0) {
            this.products[index].productTypes = this.productTypes;
            this.$root.$emit('message', {msg: 'Empty category. Loading all product types', success: false})
          }
        }).catch((error) => {
          this.$root.$emit('message', {msg: error.response.data.message, success: false})
        })
    },
    checkSum() {
      let sum = 0;
      this.products.forEach(product => {
        sum += product.normalPrice + product.discount
      })
      this.isValid = Math.round(sum * 100) / 100 === this.sum;
    },
    checkTotalPrice(index) {
      let sum = 0;
      let products = this.products[index];
      sum = products.quantity * products.unitPrice
      this.products[index].isValid = Math.round(sum * 100) / 100 === products.normalPrice
    },
    removeProduct(index) {
      this.products.splice(index, 1)
      this.checkSum()
    },
    addProduct() {
      this.products.push({
        name: '',
        quantity: '',
        unitPrice: '',
        normalPrice: '',
        discount: '',
        isValid: '',
        productTypeId: "",
        currentCategory: "",
        productTypes: this.productTypes,
        errors:[]
      })
      this.checkSum()
    },
    saveReceipt(e) {
      this.errors = []
      this.products.forEach(product => {
        product.errors = []
      })
      e.preventDefault()
      axios.post(this.$root.$api + "receipts",  {
        NIP: this.NIP,
        sum: this.sum,
        date: this.date,
        shopName: this.shopName,
        receiptName: this.receiptFilename,
        save: this.saveCheckbox,
        products: this.products,

      }, {
        headers: {
          token: this.$ss.get('user').token
        }
      }).then(() => {
        this.$root.$emit('message', {msg: "Receipt saved!", success: true})
        this.$emit('close-editor', this.receiptFilename);
      }).catch((error) => {
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            let indexes = err.param.match(/(?<=\[)\d+(?=])/gi)
            console.log(err.msg)
            if (indexes !== null) {
                this.products[indexes[0]].errors.push(err.msg)
            } else {
                this.errors.push(err.msg)
            }
          })
        }
        if (typeof error.response.data.message !== "undefined") {
          this.$root.$emit('message',{msg:error.response.data.message,success:false})
        }
      })
    }
  },
  async mounted() {
    await this.loadCategories()
    if(this.receiptFilename === ''){
      this.isLoaded = true;
      this.hasFile = false;
    } else {
      await this.readReceipt()
    }
    await this.loadProductTypes()

  },
}
</script>

<style scoped>
h2 {
  width: 100%;
}
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

.close-editor {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 35px;
  margin:5px
}

.close-editor:hover, .remove-product:hover{
  color: red;
}

.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.lds-ripple div {
  position: absolute;
  border: 4px solid #42b983;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}

@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

input[type=submit] {
  width: 100%;
}

.icon {
  font-size: 35px;
  margin: auto auto 2px;
}

.icon-success {
  color: #28a745;
}

.icon-failure {
  color: #ae3030;
}

.remove-product {
  position: absolute;
  right: 0px;
  cursor: pointer;
  z-index: 1;
}

.btn:focus {
  outline: none;
  box-shadow: none;
}

input[type='submit']:disabled {
  color:grey;
  border-color:grey;
}

img {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid grey;
  padding: 10px;
}
</style>