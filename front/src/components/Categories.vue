<template>
  <div class="container jumbotron">
    <h1>Categories</h1>
    <div class="d-flex row">
      <div class="form-row mb-3 col-lg-12">
        <label>Filter by category name</label>
        <input type="text" v-model="filterName" placeholder="category name" required class="form-control" v-on:input="filter(filterName)">
      </div>
    </div>
    <table class="table table-dark table-striped table-bordered table-hover">
      <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col"><span v-on:click="sort" class="sort">Name</span><input type="text" v-model="newCategoryName" placeholder="New category name"
                                                required class="form-control"></th>
        <th scope="col"><span>Manage</span>
          <div class="add-icon-div">
            <font-awesome-icon class="add-icon" v-on:click="addNewCategory"
                               icon="plus-circle"></font-awesome-icon>
          </div>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="category in categories" v-bind:key="category.id">
        <th scope="row">{{ category.id }}</th>
        <td>
          <span v-if="!category.isEdit">{{ category.name }}</span>
          <input v-if="category.isEdit" v-model="category.name" type="text" placeholder="Category name"
                 required class="form-control">
        </td>
        <td>
<!--          <font-awesome-icon class="trash" icon="trash-alt" v-on:click="removeCategory(category.id)"/>-->
          <font-awesome-icon v-if="!category.isEdit" class="icon edit" icon="edit"
                             v-on:click="category.isEdit = true;refresh()"/>
          <font-awesome-icon v-if="category.isEdit" class="icon save" icon="save"
                             v-on:click="updateCategory(category)"/>
          <font-awesome-icon v-if="category.isEdit" class="icon exit" icon="window-close"
                             v-on:click="category.isEdit = false;refresh()"/>
          <font-awesome-icon v-if="!category.isEdit" class="icon trash" icon="trash-alt"
                             v-on:click="removeCategory(category.id)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

</template>

<script>
import axios from "axios";

export default {
  name: "Categories",
  data() {
    return {
      categoriesBase: [],
      categories: [],
      filterName: '',
      newCategoryName: '',
      sortOrder:-1
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
        this.categoriesBase = res.data.categories;
        this.categoriesBase.forEach(categories => {
          categories.isEdit = false;
        })
        this.categories = this.categoriesBase.slice()
      }).catch((error) => {
        console.log(error)
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    addNewCategory() {
      if (this.newCategoryName === '') {
        this.$root.$emit('message', {msg: 'Category name is required!', success: false})
        return;
      }
      axios.post(this.$root.$api + "categories", {
            name: this.newCategoryName
          },
          {
            headers: {
              token: this.$ss.get('user').token
            }
          }).then((res) => {
        this.$root.$emit('message', {msg: res.data.message, success: true})
        let category = {
          id: res.data.category.id,
          name: res.data.category.name,
          user_id: res.data.category.user_id
        }
        this.categories.push(category)
        this.categoriesBase.push(category)
        this.newCategoryName = ''
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
    removeCategory(id) {
      this.$confirm(
          {
            title: 'Remove operation',
            message: `Are you sure you want to delete this category? The change will be irreversible! Product types connected with this category will be marked as unassigned to any category`,
            button: {
              no: 'Cancel',
              yes: 'Delete'
            }, callback: confirm => {
              if (confirm) {
                axios.delete(this.$root.$api + "categories/" + id, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then((res) => {
                  this.$root.$emit('message', {msg: res.data.message, success: true})
                  this.categories = this.categories.filter(category => {
                    return category.id !== id
                  })
                  this.categoriesBase = this.categories.filter(category => {
                    return category.id !== id
                  })
                }).catch((error) => {
                  console.log(error)
                  this.$root.$emit('message', {msg: error.response.data.message, success: false})
                });
              }
            }
          })
    },
    filter(name) {
      this.categories = this.categoriesBase.filter(value => {
        return value.name.toLowerCase().includes(name.toLowerCase())
      })
    },
    sort() {
      this.sortOrder*=-1;
      this.categories.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name) * this.sortOrder;
      })
    },
    refresh() {
      this.categories.sort()
    },
    updateCategory(category) {
      if (category.name === '') {
        this.$root.$emit('message', {msg: 'Product type name is required!', success: false})
        return;
      }
      this.$confirm(
          {
            title: 'Update operation',
            message: `Are you sure you want to update this category?`,
            button: {
              no: 'Cancel',
              yes: 'Update'
            }, callback: confirm => {
              if (confirm) {
                axios.put(this.$root.$api + "categories/" + category.id, {
                  name: category.name,
                }, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then((res) => {
                  this.$root.$emit('message', {msg: res.data.message, success: true})
                  category.isEdit = false;
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
  },
  mounted() {
    if(!this.$root.$ss.get("user")){
      this.$router.push('/');
    }
    this.loadCategories();
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

.sort{
  cursor: pointer;
}
</style>