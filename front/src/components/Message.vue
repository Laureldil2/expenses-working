<template>
  <div class="alert"
       v-bind:class="{'alert-danger': !success, 'alert-success': success}"
       v-bind:style="{ opacity:this.opacity }">
    {{ msg }}
    <span v-on:click="destroy">X</span>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    msg: String,
    success: Boolean,
    id: Number
  },
  data() {
    return {
      opacity: 0
    }
  },
  methods: {
    destroy() {
      this.opacity = 0;
      setTimeout(() => {
        this.$emit('message-destroy', this.id);
      }, 300)
    }
  },
  mounted() {
    setTimeout(() => {
      this.opacity = 1
    }, 1)
    setTimeout(() => {
      this.destroy()
    }, 15000)
  }
}
</script>

<style scoped>
div {
  opacity: 0;
  transition: 300ms;
}

span {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>