<template>
  <div class="container jumbotron">
    <h1>Product Types</h1>
    <div class="d-flex row">
      <div class="form-row mb-3 col-lg-6">
        <label>Filter by product type name</label>
        <input type="text" v-model="filterProductTypeName" placeholder="product type name" required class="form-control"
               v-on:input="filter(filterProductTypeName, filterCategoryId)">
      </div>
      <div class="form-row mb-3 col-lg-6">
        <label>Filter by category name</label>
        <v-select class="select"
                  :options="categories" v-model="filterCategoryId" :reduce="categories => categories.id" label="name"
                  placeholder="Select category" v-on:input="filter(filterProductTypeName, filterCategoryId)"></v-select>
        <!--<input type="text" v-model="filterCategoryName" placeholder="category name" required class="form-control" v-on:input="filter(filterProductTypeName, filterCategoryName)">-->
      </div>
    </div>
    <table class="table table-dark table-striped table-bordered table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">
          <span class="sort" v-on:click="sortByName">Name</span>
          <input type="text" v-model="newProductTypeName" placeholder="New product type name" required
                 class="form-control">
        </th>
        <th scope="col">
          <span class="sort" v-on:click="sortByCategory">Category</span>
          <v-select class="select"
                    :options="categories" v-model="newProductTypeCategory" :reduce="categories => categories.id"
                    label="name"
                    placeholder="Select category"></v-select>
        </th>
        <th scope="col"><span>Manage</span>
          <div class="add-icon-div">
            <font-awesome-icon class="add-icon" icon="plus-circle" v-on:click="addNewProductType"/>
          </div>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(productType) in productTypes" v-bind:key="productType.id">
        <th scope="row" style="width:10%">{{ productType.id }}</th>
        <td style="width:45%">
          <span v-if="!productType.isEdit">{{ productType.name }}</span>
          <input v-if="productType.isEdit" v-model="productType.name" type="text" placeholder="New product type name"
                 required class="form-control">
        </td>
        <td style="width:30%">
          <span v-if="!productType.isEdit">{{ categoriesMap.get(productType.category_id) }}</span>
          <v-select v-if="productType.isEdit" class="select" v-model="productType.category_id"
                    :options="categories" :reduce="categories => categories.id" label="name"
                    placeholder="Select category"></v-select>
        </td>
        <td>
          <font-awesome-icon v-if="!productType.isEdit" class="icon edit" icon="edit"
                                   v-on:click="productType.isEdit = true;refresh()"/>
          <font-awesome-icon v-if="productType.isEdit" class="icon save" icon="save"
                             v-on:click="updateProductType(productType)"/>
          <font-awesome-icon v-if="productType.isEdit" class="icon exit" icon="window-close"
                             v-on:click="productType.isEdit = false;refresh()"/>
          <font-awesome-icon v-if="!productType.isEdit" class="icon trash" icon="trash-alt"
                             v-on:click="removeProductType(productType.id)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductTypes",
  data() {
    return {
      categories: [],
      productTypesBase: [],
      productTypes: [],
      categoriesMap: new Map(),
      isEdit: false,
      newProductTypeName: '',
      newProductTypeCategory: null,
      filterCategoryId: '',
      filterProductTypeName: '',
      sortOrder: -1
    }
  },
  methods: {
    loadCategories() {
      return axios.get(this.$root.$api + 'categories/?user_id=' + this.$ss.get('user').id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.categories = res.data.categories;
        this.categories.forEach(category => {
          this.categoriesMap.set(category.id, category.name);
        })
        this.categoriesMap.set("1","soki")
      }).catch((error) => {
        console.log(error)
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
        this.productTypesBase = res.data.productTypes;
        this.productTypesBase.forEach(productType => {
          productType.isEdit = false;
        })
        this.productTypes = this.productTypesBase.slice();
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    addNewProductType() {
      if (this.newProductTypeName === '') {
        this.$root.$emit('message', {msg: 'Product type name is required!', success: false})
        return;
      }
      if (this.newProductTypeCategory === null) {
        this.$root.$emit('message', {msg: 'Product type category is required!', success: false})
        return;
      }
      axios.post(this.$root.$api + "product-types", {
            name: this.newProductTypeName,
            categoryID: this.newProductTypeCategory
          },
          {
            headers: {
              token: this.$ss.get('user').token
            }
          }).then((res) => {
        this.$root.$emit('message', {msg: res.data.message, success: true})
        let productType = {
          id: res.data.productType.id,
          name: res.data.productType.name,
          user_id: res.data.productType.user_id,
          category_id: res.data.productType.category_id
        }
        this.productTypes.push(productType)
        this.productTypesBase.push(productType)
        this.newProductTypeName = '';
        this.newProductTypeCategory = null
      }).catch((error) => {
        console.log(error)
        if (typeof error.response.data.message !== "undefined")
          this.$root.$emit('message', {msg: error.response.data.message, success: false})
        else
          error.response.data.errors.forEach(error => {
            this.$root.$emit('message', {msg: error.msg, success: false})
          })
      });
    },
    updateProductType(productType) {
      if (productType.name === '') {
        this.$root.$emit('message', {msg: 'Product type name is required!', success: false})
        return;
      }
      if (productType.category_id === null) {
        this.$root.$emit('message', {msg: 'Product type category is required!', success: false})
        return;
      }
      this.$confirm(
          {
            title: 'Update operation',
            message: `Are you sure you want to update this product type?`,
            button: {
              no: 'Cancel',
              yes: 'Update'
            }, callback: confirm => {
              if (confirm) {
                axios.put(this.$root.$api + "product-types/" + productType.id, {
                  name: productType.name,
                  categoryID: productType.category_id
                }, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then((res) => {
                  this.$root.$emit('message', {msg: res.data.message, success: true})
                  productType.isEdit = false;
                  this.refresh();
                }).catch((error) => {
                  console.log(error)
                  if (typeof error.response.data.message !== "undefined")
                    this.$root.$emit('message', {msg: error.response.data.message, success: false})
                  else
                    error.response.data.errors.forEach(error => {
                      this.$root.$emit('message', {msg: error.msg, success: false})
                    })
                });
              }
            }
          })
    },
    removeProductType(id) {
      this.$confirm(
          {
            title: 'Remove operation',
            message: `Are you sure you want to delete this product type? The change will be irreversible! You can only delete product types, that are not connected with any product.`,
            button: {
              no: 'Cancel',
              yes: 'Delete'
            }, callback: confirm => {
              if (confirm) {
                axios.delete(this.$root.$api + "product-types/" + id, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then((res) => {
                  this.$root.$emit('message', {msg: res.data.message, success: true})
                  this.productTypes = this.productTypes.filter(productType => {
                    return productType.id !== id
                  })
                  this.productTypeBase = this.productTypeBase.filter(productType => {
                    return productType.id !== id
                  })
                }).catch((error) => {
                  console.log(error)
                  this.$root.$emit('message', {msg: error.response.data.message, success: false})
                });
              }
            }
          })
    },
    refresh() {
      this.productTypes.sort()
    },
    filter(filterProductTypeName, filterCategoryId) {
      this.productTypes = this.productTypesBase.filter(value => {
        if (filterCategoryId != null)
          return value.name.toLowerCase().includes(filterProductTypeName.toLowerCase()) && value.category_id === filterCategoryId
        else
          return value.name.toLowerCase().includes(filterProductTypeName.toLowerCase())
      })
    },
    sortByCategory() {
      this.sortOrder *= -1;
      this.productTypes.sort((a, b) => {
        let nameA = this.categoriesMap.get(a.category_id) || ''
        let nameB = this.categoriesMap.get(b.category_id) || ''
        return ('' + nameA).localeCompare(nameB) * this.sortOrder;
      })
    },
    sortByName() {
      this.sortOrder *= -1;
      this.productTypes.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name) * this.sortOrder;
      })
    }
  },
  mounted() {
    if(!this.$root.$ss.get("user")){
      this.$router.push('/');
    }
    this.loadCategories();
    this.loadProductTypes();
  }
}
</script>

<style scoped>
.container {
  border: 1px solid grey;
  margin-top: 1rem;
}

.add-icon {
  font-size: 30px;
  cursor: pointer;
}

.add-icon:hover, .save:hover {
  color: #28a745;
}

.icon {
  font-size: 20px;
  margin: 5px;
  cursor: pointer;
}

.edit:hover {
  color: yellow;
}

.trash:hover, .exit:hover {
  color: red;
}

.sort {
  cursor: pointer;
}

.add-icon-div {
  height: calc(1.5em + .75rem + 2px);
  line-height: calc(1.5em + .75rem);
  padding: .375rem .75rem;
}
</style>