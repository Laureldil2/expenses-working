<template>
  <div class="container jumbotron">
    <div class="row" v-if="!isEditor">
      <div class="col-12 d-flex justify-content-center">
        <h1>Photo receipts</h1>
        <button ref="addtoggler" id="addtoggler" class="navbar-toggler" type="button" data-toggle="collapse"
                data-target="#form-container" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
          <font-awesome-icon class="add-icon"
                             icon="plus-circle"></font-awesome-icon>
        </button>
      </div>
      <div id="form-container" class="collapse navbar-collapse col-12">
        <hr/>
        <h2>Add new photo receipt</h2>
        <div class="form-row mb-3 justify-content-center d-block">
          <input type="file" ref="file" id="file-input" name="files" accept="image/*"/>
          <label for="file-input" ref="fileLabel" id="file-label">Select receipt from your device. Click here!</label>
        </div>
        <div class="form-row mb-3 justify-content-center">
          <input type="submit" class="btn btn-outline-success col-md-7 mb-3" value="Add photo receipt"
                 v-on:click="uploadReceipt()">
          <input type="button" class="btn btn-outline-success col-md-7" value="Add receipt manually"
                 v-on:click="runEditor('')">
        </div>
        <hr/>
      </div>
    </div>
    <div class="row" v-if="!isEditor">
      <h2 class="col-12">Your photo receipts</h2>
      <div class="photoReceipt col-sm-12 col-md-6 col-lg-4" v-for="(photoReceipt) of photoReceipts"
           v-bind:key="photoReceipt.name">
        <div class="img-container ">
          <font-awesome-icon class="trash" icon="trash-alt" v-on:click="deletePhotoReceipt(photoReceipt.name) "/>
          <img v-bind:src="photoReceipt.url"/>
        </div>
        <div class="alert process" v-on:click="runEditor(photoReceipt.name)"><h4>Process</h4></div>
      </div>
    </div>
      <ReceiptEditor :receiptFilename=currentReceipt v-if="isEditor" v-on:close-editor="closeEditor"></ReceiptEditor>
  </div>
</template>

<script>
import axios from "axios";
import ReceiptEditor from "@/components/ReceiptEditor";

export default {
  name: "PhotoReceipts",
  components: {
    ReceiptEditor
  },
  data() {
    return {
      photoReceipts: [],
      isEditor: false,
      currentReceipt: ""
    }
  },
  methods: {
    closeEditor(receiptName){
      this.isEditor=false;
      this.photoReceipts = this.photoReceipts.filter(photoReceipt => {
        return photoReceipt.name !== receiptName;
      })
    },
    getPhotoReceiptNames() {
      this.photoReceipts = [];
      axios.get(this.$root.$api + "photo-receipt/" + this.$ss.get('user').username, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        let photoReceiptNames = JSON.parse(res.data.photoReceiptNames);
        photoReceiptNames.forEach(async photoReceiptName => {
          let tmp = await this.getPhotoReceiptFile(photoReceiptName);
          this.photoReceipts.push({
            name: photoReceiptName,
            url: tmp
          })
        })
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
        window.console.log(error)
      });
    },
    getPhotoReceiptFile(name) {
      return axios.get(this.$root.$api + "photo-receipt/file/" + this.$ss.get('user').username + '-' + name, {
            headers: {
              token: this.$ss.get('user').token,
            },
            responseType: 'blob'
          }
      ).then((res) => {
        window.console.log(res)
        return window.URL.createObjectURL(new Blob([res.data]));
      }).catch((error) => {
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
        window.console.log(error)
        window.console.log(error.response)
        window.console.log(error.response.data)
        window.console.log(error.response.data.message)
      });
    },
    deletePhotoReceipt(photoReceiptName) {
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
                axios.delete(this.$root.$api + "photo-receipt/" + this.$ss.get('user').username + '-' + photoReceiptName, {
                  headers: {
                    token: this.$ss.get('user').token,
                  }
                }).then(() => {
                  this.photoReceipts = this.photoReceipts.filter(photoReceipt => {
                    return photoReceipt.name !== photoReceiptName;
                  })
                  this.$root.$emit('message', {msg: "Successfully deleted!", success: true})
                }).catch((error) => {
                  this.$root.$emit('message', {msg: error.response.data.message, success: false})
                  window.console.log(error)
                })
              }
            }
          }
      )
    },
    uploadReceipt() {
      if (this.$refs.file.files.length) {
        const form_data = new FormData();
        form_data.append("photoReceipt", this.$refs.file.files[0]);
        axios.post(this.$root.$api + "photo-receipt",
            form_data
            , {
              headers: {
                token: this.$ss.get('user').token,
              }
            }).then(async (res) => {
          this.$root.$emit('message', {msg: res.data.message, success: true})
          let tmp = await this.getPhotoReceiptFile(res.data.photoReceiptName);
          this.photoReceipts.push({
            name: res.data.photoReceiptName,
            url: tmp
          })
          this.$refs.addtoggler.click()
          this.$refs.fileLabel.textContent = "Select receipt from your device. Click here!"
        }).catch((error) => {
          window.console.log(error)
          this.$root.$emit('message', {msg: error.response.data.message, success: false})
        })
      } else {
        this.$root.$emit('message', {msg: "First you need to select a receipt from your device!", success: false})
      }
    },
    runEditor(receiptFilename) {
      this.currentReceipt = receiptFilename;
      this.isEditor = true;
    }
  },
  mounted() {
    if (!this.$root.$ss.get("user")) {
      this.$router.push('/');
    }
    this.getPhotoReceiptNames();
    this.$refs.file.addEventListener('change', (e) => {
      if (e.target.value !== "") {
        this.$refs.fileLabel.textContent = "Your receipt: " + e.target.value.split("\\").splice(-1, 1)[0]
      } else {
        this.$refs.fileLabel.textContent = "Select receipt from your device. Click here!";
      }
    })
  }
}
</script>

<style scoped>

.img-container {
  height: 500px;
  position: relative;
  justify-content: center;
  display: flex;
  align-items: center;
}

img {
  max-width: 100%;
  padding: 10px;
  object-fit: cover;
  max-height: 500px;
  width: auto;
  height: auto;
}

.row {
  justify-content: center;
}

.photoReceipt {
  outline-offset: -5px;
  outline: 1px solid;
}

.process {
  cursor: pointer;
  color: #202020;
  border-color: dimgrey;
}

.process:hover {
  background-color: #28a745;
  cursor: pointer;
  color: white;
}

.trash {
  position: absolute;
  right: 0;
  top: 15px;
  font-size: 30px;
  line-height: 1em;
  cursor: pointer;
}

.trash:hover {
  color: red;
}

.add-icon {
  font-size: 35px;
  cursor: pointer;
}

.add-icon:hover {
  color: #28a745;
}

#file-label {
  cursor: pointer;
}

#file-input {
  display: none;
}

#addtoggler:focus {
  outline: none;
}

.container {
  border:1px solid grey;
  margin-top: 1rem;
}

</style>