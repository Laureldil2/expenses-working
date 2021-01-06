<template>
  <footer class="footer footer-expand-lg footer-dark bg-dark">
      Copyright &copy; {{ new Date().getFullYear() }}  Laureldil2
  </footer>
</template>

<script>
export default {
name: "Footer"
}
</script>

<style scoped>
 footer{
   position: relative;
   bottom: 0;
   right: 0;
   left: 0;
   text-align: center;
   color: white;
   height: 50px;
 }
</style>