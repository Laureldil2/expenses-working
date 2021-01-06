<template>
  <div class="container jumbotron">
    <h1>Dashboard</h1>
    <div class="chart mb-3">
      <AreaChart v-bind:data-set="expensesYearsSet"/>
    </div>
    <hr/>
    <div class="chart mb-3">
      <BarChart v-bind:data-set="categorySet"/>
    </div>
    <hr/>
    <div class="chart mb-3">
      <BarChart v-bind:data-set="categoryProductSet"/>
    </div>
    <hr/>
    <div class="d-flex row">
      <div class="form-row mb-3 col-lg-12"><h5 class="text-center">Filter</h5></div>
      <div class="form-row mb-3 col-lg-6">
        <label>Date from</label>
        <input type="date" v-model="dateFrom" v-on:input="loadStats" class="form-control">
      </div>
      <div class="form-row mb-3 col-lg-6">
        <label>Date to</label>
        <input type="date" v-model="dateTo" v-on:input="loadStats" class="form-control">
      </div>
      <div class="form-row mb-3 col-lg-12">
        <label>Expense name filter</label>
        <input type="text" v-model="nameFilter" v-on:input="filter(nameFilter)" placeholder="Expense name" class="form-control">
      </div>
    </div>
    <div>
      <h3>Raport</h3>
      <table class="table table-dark table-striped table-bordered table-hover">
        <thead>
        <tr>
          <th scope="col" v-on:click="sortName">Expense name</th>
          <th scope="col" v-on:click="sortQuantity">Quantity</th>
          <th scope="col" v-on:click="sortSum">Sum</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="expense in expenses" v-bind:key="expense.name">
          <th scope="col">{{ expense.name }}</th>
          <th scope="col">{{ expense.quantity }}</th>
          <th scope="col">{{ expense.sum }}</th>
        </tr>
        </tbody>
      </table>
      <div class="form-row mb-3 col-12">
        <input type="button" class="btn btn-outline-dark" value="Download as CSV file" v-on:click="download">
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from "@/components/CategoryChart";
import AreaChart from '@/components/AreaChart'
import axios from "axios";

export default {
  name: "Dashboard",
  components: {
    BarChart: BarChart,
    AreaChart: AreaChart
  },
  data() {
    return {
      dateTo: null,
      dateFrom: null,
      nameFilter: '',
      expenses: [],
      expensesBase: [],
      sortOrder:-1,
      categorySet: {
        labels: [],
        data: [],
        title: 'Expenses per category',
        axisX: 'Categories',
        axisY: 'Expenses in zł',
        label: 'zł'
      },
      categoryProductSet: {
        labels: [],
        data: [],
        title: 'Products per category',
        axisX: 'Categories',
        axisY: 'Number of products',
        label: 'products'
      },
      expensesYearsSet:{
        currentYear: [],
        previousYear: []
      }
    }
  },
  methods: {
    loadStats() {
      return axios.get(this.$root.$api + "stats/?user_id=" + this.$ss.get('user').id + '&date_from='+this.dateFrom+'&date_to='+this.dateTo, {
            headers: {
              token: this.$ss.get('user').token
            }
          }
      ).then((res) => {
        this.categorySet.labels = []
        this.categorySet.data = []
        this.categoryProductSet.labels = []
        this.categoryProductSet.data = []
        res.data.categorySet.forEach(element => {
          this.categorySet.labels.push(element.category);
          this.categoryProductSet.labels.push(element.category);
          this.categorySet.data.push(element.quantity)
          this.categoryProductSet.data.push(element.total_price)
        });
        this.expensesBase = []
        res.data.productSet.forEach(element => {
          element.sum = Math.round(element.sum * 100)/100;
          element.quantity = Math.round(element.quantity * 1000)/1000;
          this.expensesBase.push(element)
        })
        this.expenses = this.expensesBase.slice()
        this.filter(this.nameFilter)
        this.expensesYearsSet.currentYear = Array(12).fill(0);
        this.expensesYearsSet.previousYear = Array(12).fill(0);
        let currentYear = parseInt(this.$moment(this.$moment.now()).format('YYYY'));
        let currentMonth = parseInt(this.$moment(this.$moment.now()).format('MM'));
        res.data.expensesYearsSet.forEach(element => {
          if(parseInt(element.year) === currentYear){
            this.expensesYearsSet.currentYear[element.month -1] = Math.round(element.sum * 100)/100;
          } else if(parseInt(element.year) === currentYear-1) {
            this.expensesYearsSet.previousYear[element.month -1] = Math.round(element.sum * 100)/100;
          }
        })
        if(currentMonth === 1 ) currentMonth+=1;
        this.expensesYearsSet.currentYear = this.expensesYearsSet.currentYear.slice(0,currentMonth);
      }).catch((error) => {
        console.log(error)
        this.$root.$emit('message', {msg: error.response.data.message, success: false})
      })
    },
    filter(name) {
      this.expenses = this.expensesBase.filter(value => {
        return value.name.toLowerCase().includes(name.toLowerCase())
      })
    },
    sortName() {
      this.sortOrder*=-1;
      this.expenses.sort((a, b) => {
        return ('' + a.name).localeCompare(b.name) * this.sortOrder;
      })
    },
    sortQuantity() {
      this.sortOrder*=-1;
      this.expenses.sort((a, b) => {
        if(a.quantity <= b.quantity) return -1*this.sortOrder;
        if(a.quantity === b.quantity) return 0;
        return this.sortOrder
      })
    },
    sortSum() {
      this.sortOrder*=-1;
      this.expenses.sort((a, b) => {
        if(a.sum <= b.sum) return -1*this.sortOrder;
        if(a.sum === b.sum) return 0;
        return this.sortOrder
      })
    },
    download(){
      let universalBOM = "\uFEFF";
      let csvContent = "data:text/csv;charset=utf-8," +universalBOM;
      csvContent += "Expense name, Quantity, Sum\r\n";
      this.expenses.forEach(function(expense) {
        let row = expense.name + ',' + expense.quantity + ',' + expense.sum;
        csvContent += row + "\r\n";
      });
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download",
          "Expenses_Inspection_"+
          this.$root.$ss.get("user").username+"_"+
          this.$moment(this.$moment.now()).format('YYYY-MM-DD hh_mm_ss')+
          ".csv"
      );
      document.body.appendChild(link);
      link.click();
    }
  },
  mounted() {
    if (!this.$root.$ss.get("user")) {
      this.$router.push('/');
    }
    this.loadStats();
  }
}
</script>

<style scoped>
.container {
  border: 1px solid grey;
  margin-top: 1rem;
}

input[type=button] {
  width: 100%;
}

</style>