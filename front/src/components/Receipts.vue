<template>
  <div class="container jumbotron">
    <h1 v-if="!preview">Receipts</h1>
    <vue-good-table
        v-if="!preview"
        :columns="columns"
        :rows="rows"
        compact-mode
        @on-row-click="loadSingleReceipt"
        :sort-options="{
    enabled: true,
    initialSortBy: {field: 'date', type: 'desc'}
    }"
        :pagination-options="{
    enabled: true,
    mode: 'pages',
    perPage: 10,
    rowsPerPageLabel: 'Receipts per page',
  }"
    >
      <div slot="selected-row-actions">
        <button>Action 1</button>
      </div>
      <div slot="emptystate">
        No matching receipts
      </div>
    </vue-good-table>
    <Receipt :id=selectedReceipt v-if="preview" v-on:close-delete="closePreviewWithDelete" v-on:close-preview="closePreview"></Receipt>
  </div>
</template>

<script>
import axios from "axios";
import Receipt from "@/components/Receipt";

export default {
  name: "Receipts",
  components: {
    Receipt
  },
  data() {
    return {
      preview: false,
      selectedReceipt: 0,
      columns: [
        {
          label: 'Shop name',
          field: 'shop_name',
          filterOptions: {
            enabled: true, // enable filter for this column
            placeholder: 'Shop name', // placeholder for filter input
          },
        },
        {
          label: 'NIP',
          field: 'NIP',
          filterOptions: {
            enabled: true, // enable filter for this column
            placeholder: 'NIP', // placeholder for filter input
          },
        },
        {
          label: 'Date',
          field: 'date',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd-MM-yyyy',
          filterOptions: {
            enabled: true, // enable filter for this column
            inputType: 'date',
            filterFn: this.dateFilter, //custom filter function that
          },
        },
        {
          label: 'Products',
          field: 'num_of_products',
          type: 'number',
          filterOptions: {
            enabled: true, // enable filter for this column
            placeholder: 'Number of products', // placeholder for filter input
          },
        },
        {
          label: 'Total amount',
          field: 'sum',
          type: 'number',
          formatFn: this.formatSum,
          filterOptions: {
            enabled: true, // enable filter for this column
            placeholder: 'Value +-1', // placeholder for filter input
            filterFn: this.sumFilter, //custom filter function that
          },
        },
      ],
      rows: [],
    };
  },
  methods: {
    closePreviewWithDelete(id){
      this.closePreview();
      this.rows = this.rows.filter(row => {
        return parseInt(row.id) !== parseInt(id);
      })
    },
    sumFilter(data, value) {
      return data > value - 1 && data < parseInt(value) + 1.0;
    },
   dateFilter(data, value) {
      return data===value //&& value>=date;
    },
    formatSum(value) {
      return value + ' zł'
    },
    loadReceipts() {
      return axios.get(this.$root.$api + 'receipts/?user_id=' + this.$ss.get('user').id, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.rows = this.rows.concat(res.data.receipts);
      }).catch((error) => {
        console.log(error)
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    loadSingleReceipt(params){
      this.selectedReceipt = parseInt(params.row.id)
      this.preview = true;
      console.log(params.row.id)
    },
    closePreview(){
      this.preview = false;
    }
  },
  mounted() {
    if(!this.$root.$ss.get("user")){
      this.$router.push('/');
    }
    this.loadReceipts();
    document.getElementsByClassName("vgt-input")[2].type='date';
    document.getElementsByClassName("vgt-input")[3].type='number';
    document.getElementsByClassName("vgt-input")[3].min = '0';
    document.getElementsByClassName("vgt-input")[4].type='number';
    document.getElementsByClassName("vgt-input")[4].min = '0';
/*    document.getElementsByClassName("vgt-input")[2].type='date';
    var element = document.querySelector(".filter-th:nth-child(3) div")
    var input = document.createElement("input");
    input.type="date";
    input.classList.add("vgt-input")
    input.id = "date-to"
    element.append(input);
    document.getElementsByClassName("vgt-input")[4].type='number';
    document.getElementsByClassName("vgt-input")[4].min = '0';
    element = document.querySelector(".filter-th:nth-child(4) div")
    input = document.createElement("input");
    input.type="number";
    input.classList.add("vgt-input");
    input.id = "products-to"
    input.placeholder = 'To'
    element.append(input);
    document.getElementsByClassName("vgt-input")[6].type='number';
    document.getElementsByClassName("vgt-input")[6].min = '0';
    element = document.querySelector(".filter-th:nth-child(5) div")
    input = document.createElement("input");
    input.type="number";
    input.classList.add("vgt-input");
    input.id = "sum-to"
    input.placeholder = 'To'
    element.append(input);*/
  }

}
</script>

<style scoped>
.container {
  border:1px solid grey;
  margin-top: 1rem;
}
</style>

<!--
<div class="container jumbotron">
<div>
  <h1>Filters</h1>
</div>
<h1>Receipts</h1>
<table class="table table-striped table-bordered table-hover table-dark">
  <thead>
  <tr>
    <th scope="col">Shop name</th>
    <th scope="col" v-if="isDesktop">NIP</th>
    <th scope="col">Date</th>
    <th scope="col" v-if="isDesktop">Products</th>
    <th scope="col">Total amount</th>
  </tr>
  </thead>
  <tbody>
  <tr v-for="receipt in receipts" v-bind:key="receipt.id">
    <th scope="row">{{receipt.shop_name}}</th>
    <td v-if="isDesktop">{{receipt.NIP}}</td>
    <td>{{receipt.date|moment("DD-MM-YYYY") }}</td>
    <td v-if="isDesktop">{{receipt.num_of_products}}</td>
    <td>{{receipt.sum}} <font-awesome-icon icon="receipt" v-if="receipt.file!==null"></font-awesome-icon></td>
  </tr>
  </tbody>
</table>
<input type="submit" class="btn btn-outline-secondary" value="More receipts" v-if="isMoreReceipts" v-on:click="loadReceipts">
<input type="submit" class="btn btn-outline-secondary" disabled value="No more receipts available" v-if="!isMoreReceipts">
</div>-->


<!--
data() {
return {
receipts: [],
stringParams:"",
offset: 0,
perPage: 1000,
numOfReceipts:0,
}
},
computed:{
isDesktop() {
return window.innerWidth > 1200;
},
isMoreReceipts() {
if(this.offset < this.numOfReceipts) return true
return false;
}
},-->
