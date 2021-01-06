<script>
import {Line} from "vue-chartjs";

export default {
  extends: Line,
  props: {
    dataSet: Object
  },
  data() {
    return {
      gradient: null,
      gradient2: null
    };
  },
  watch: {
    dataSet: {
      handler(){
        this.render()
      },
      deep:true
    }
  },
  methods: {
    render: function(){
      this.renderChart(
          {
            labels: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ],
            datasets: [
              {
                label: "2020",
                borderColor: "#FC2525",
                //pointBackgroundColor: "white",
                borderWidth: 1,
                //pointBorderColor: "white",
                backgroundColor: this.gradient,
                data: this.dataSet.previousYear,//[40, 39, 10, 40, 39, 80, 40, 40, 30, 20, 10, 15]
              },
              {
                label: "2021",
                borderColor: "#05CBE1",
                //pointBackgroundColor: "white",
                //pointBorderColor: "white",
                borderWidth: 1,
                backgroundColor: this.gradient2,
                data: this.dataSet.currentYear, //[60, 55, 32, 10, 2, 12, 53, 70, 10, 40, 60, 10]
              }
            ]
          },
          {
            title: {
              display:true,
              text:"Expenses",
              fontSize: 20
            },
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: "Expenses in zł",
                  fontSize:15,
                },
                ticks: {
                  beginAtZero: true,
                },
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: "Months",
                  fontSize:15
                }
              }]
            },
            responsive: true,
            maintainAspectRatio: false}
      );
    }
  },
  mounted() {
    this.gradient = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
    this.gradient2 = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);

    this.gradient.addColorStop(0, "rgba(255, 0,0, 0.5)");
    this.gradient.addColorStop(0.5, "rgba(255, 0, 0, 0.25)");
    this.gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

    this.gradient2.addColorStop(0, "rgba(0, 231, 255, 0.9)");
    this.gradient2.addColorStop(0.5, "rgba(0, 231, 255, 0.25)");
    this.gradient2.addColorStop(1, "rgba(0, 231, 255, 0)");
  }
};
</script>
