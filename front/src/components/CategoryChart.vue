<script>
import {Bar} from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    dataSet: Object
  },
  data() {
    return {
      gradient: null,
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
    render: function () {
      this.renderChart(
          {
            labels: this.dataSet.labels,
            datasets: [
              {
                label: this.dataSet.label,
                backgroundColor: this.gradient,
                borderWidth: 1,
                data: this.dataSet.data
              }
            ]
          },
          {
            title: {
              display:true,
              text:this.dataSet.title,
              fontSize: 20
            },
            responsive: true, maintainAspectRatio: false,
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.dataSet.axisY,
                  fontSize:15,
                },
                ticks: {
                  beginAtZero: true,
                },
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: this.dataSet.axisX,
                  fontSize:15
                }
              }]
            }
          }
      )
    }
  },
  mounted() {
    this.gradient = this.$refs.canvas
        .getContext("2d")
        .createLinearGradient(0, 0, 0, 450);
    this.gradient.addColorStop(0, "rgba(255, 0,0, 0.5)");
    this.gradient.addColorStop(0.5, "rgba(255, 0, 0, 0.25)");
    this.gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
  }
}
</script>

<style scoped>

</style>