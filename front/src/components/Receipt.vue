<template>
  <div class="receipt">
    <div class="row">
      <div class="col-12 d-flex justify-content-center">
        <h1>Receipt<!--<span class='close-preview' v-on:click="close()">X</span>--></h1>
        <font-awesome-icon class="close-preview" icon="times" v-on:click="close()"/>
      </div>
    </div>
    <div v-if="!isLoaded">
      <div class="lds-ripple">
        <div></div>
      </div>
      <h2>Loading...</h2>
    </div>
    <div v-if="isLoaded">
      <div class="d-flex row">
        <div class="form-row mb-3 col-lg-12">
          <label>Shop name</label>
          <input disabled type="text" v-model="shopName" placeholder="shop name" required class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-3">
          <label>NIP</label>
          <input disabled type="number" v-model="NIP" placeholder="NIP" required class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-3">
          <label>Date</label>
          <input disabled type="date" v-model="date" required class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-3">
          <label>Sum</label>
          <input disabled type="text" v-model.number="sum" placeholder="sum" class="form-control">
        </div>
        <div class="form-row mb-3 col-lg-3">
          <label>Products</label>
          <input disabled type="text" v-model.number="numOfProducts" placeholder="sum" class="form-control">
        </div>
      </div>
      <div>
        <h2>Products</h2>
        <template v-for="(product) in products">
          <div class="d-flex row mb-3 product" v-bind:key="product.id">
            <div class="form-row mb-3 col-lg-6">
              <label>Product</label>
              <input disabled type="text" v-model="product.name"   class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-6">
              <label>Product type</label>
              <input disabled type="text" v-model="product.productType"   class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-2">
              <label>Quantity</label>
              <input disabled type="text" v-model="product.quantity"   class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-2">
              <label>Unit price</label>
              <input disabled type="text" v-model="product.unitPrice"  class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-3">
              <label>Normal price</label>
              <input disabled type="text" v-model="product.normalPrice"  class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-2">
              <label>Discount</label>
              <input disabled type="text" v-model="product.discount" class="form-control">
            </div>
            <div class="form-row mb-3 col-lg-3">
              <label>Total price</label>
              <input disabled type="text" v-model="product.totalPrice"   class="form-control">
            </div>
          </div>
        </template>
      </div>
      <div class="mb-3" v-if="file!=null">
        <h2>Preview</h2>
        <img v-bind:src="receiptSrc"/>
      </div>
      <div class="form-row mb-3">
        <input type="submit" class="btn btn-outline-danger" value="Delete" v-on:click="deleteReceipt(id)">
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Receipt",
  props: {
    id: Number
  },
  data() {
    return {
      isLoaded: false,
      shopName: '',
      NIP: '',
      date: '',
      sum: 0,
      file: '',
      numOfProducts: 0,
      products: [],
      receiptSrc: '',
      productTypes: new Map()
    }
  },
  methods: {
    close() {
      this.$emit('close-preview');
    },
    loadReceipt() {
      return axios.get(this.$root.$api + "receipts/" + this.id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.isLoaded = true;
        let receipt = res.data;
        this.shopName = receipt.shop_name;
        this.NIP = receipt.NIP;
        this.date = receipt.date;
        this.sum = receipt.sum;
        this.file = receipt.file;
        this.numOfProducts = receipt.num_of_products;
        receipt.products.forEach(product => {
          this.products.push({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            unitPrice: product.unit_price,
            normalPrice: product.normal_price,
            totalPrice: Math.round((product.normal_price + product.discount)*100)/100,
            discount: product.discount,
            productTypeId: product.product_type_id,
            productType: this.productTypes.get(parseInt(product.product_type_id))
          })
        })
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
        this.close();
      });
    },
    loadReceiptPreview(){
      return axios.get(this.$root.$api + "receipts/"+this.id+"/file/" + this.file, {
            headers: {
              token: this.$ss.get('user').token,
            },
            responseType: 'blob'
          }
      ).then((res) => {
        window.console.log(res)
        return window.URL.createObjectURL(new Blob([res.data]));
      }).catch(async (error) => {
        let data = '';
/*        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
          const text = e.srcElement.result;
          console.log(text);
        });
        reader.readAsText(error.response.data)*/
        function readFile(file){
          return new Promise((resolve) => {
            var fr = new FileReader();
            fr.onload = () => {
              resolve(fr.result )
            };
            fr.readAsText(file);
          });
        }
        /*const reader = new FileReader();
        reader.onload = function(){
          const text = JSON.parse(this.result);
          console.log(text);
          data = text.message;
          console.log(data)
        };*/
        data = JSON.parse(await readFile(error.response.data))
        this.$root.$emit('message', {msg: data.message, success: false})
/*        window.console.log(error)
        window.console.log(error.response)
        window.console.log(error.response.data)
        window.console.log(error.response.data.message)*/
      });
    },
    deleteReceipt(id){
      this.$confirm(
          {
            title: 'Remove operation',
            message: `Are you sure you want to delete this receipt? The change will be irreversible!`,
            button: {
              no: 'Cancel',
              yes: 'Delete'
            },
            callback: confirm => {
              if (confirm) {
                axios.delete(this.$root.$api + "receipts/" + id, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then(() => {
                  this.$root.$emit('message', {msg: "Successfully deleted!", success: true})
                  this.$emit('close-delete', id);
                }).catch((error) => {
                  this.$root.$emit('message', {msg: error.response.data.message, success: false})
                  window.console.log(error)
                })
              }
            }
          }
      )
    },
    loadProductTypes() {
      return axios.get(this.$root.$api + "product-types/?user_id=" + this.$ss.get('user').id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        res.data.productTypes.forEach(product=>{
          this.productTypes.set(parseInt(product.id), product.name)
        })
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
  },
  async mounted() {
    await this.loadProductTypes();
    await this.loadReceipt();
    if(this.file!==null)
      this.receiptSrc = await this.loadReceiptPreview()
  }
}
</script>

<style scoped>
.close-preview {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 35px;
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

.product{
  border: 1px solid grey;
  border-radius: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem
}

.receipt {
  border: 1px solid grey;
  border-radius: 0.5rem;
  padding: 2rem;
}

.close-preview:hover {
  color: red;
}

img {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid grey;
  padding: 10px;
}

input[type=submit] {
  width: 100%;
}
input[disabled] {
  background-color: white;
}
</style>