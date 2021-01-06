<template>
  <div class="container">
    <template v-for="(message) in messages">
      <Message :key="message.id" :msg=message.msg :success=message.success v-on:message-destroy="removeMessage(message.id)"></Message>
    </template>
  </div>
</template>

<script>
import Message from "@/components/Message";

export default {
  name: "Messenger",
  components: {
    Message
  },
  data() {
    return {
      messages: [],
      counter: 0
    }
  },
  methods: {
    removeMessage(id){
        this.messages = this.messages.filter(item => {
          return item.id !== id
        })
    },
    addMessage(msg){
      this.messages.push(Object.assign(msg, {id: ++this.counter}))
    }
  },
  mounted() {
    this.$root.$on('message', (msg) =>{
      this.addMessage(msg);
    })
  }
}
</script>

<style scoped>
.container {
  position: fixed;
  bottom: 5px;
  right: 5px;
  max-width: 300px;
  z-index: 1;
}
</style>