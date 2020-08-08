<template>
  <div id="app" class="app">
    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
</style>
<style lang="scss">

body {
    font-family: "Exo 2", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "PingFang", "Droid Sans", "Helvetica Neue", sans-serif;
    font-weight: 500;
    color: rgb(13, 143, 52);
}

html, body {
  height: 100%;
  margin: 0;
}

.app {
  min-height: 100%;
  background: #050308 no-repeat center top;
  background-size: cover;
  .container {
    display: flex;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto 20px;
    padding-top: 100px;
    min-height: calc(100vh - 200px);
    circle {
      -webkit-transition: stroke-dasharray .25s;
      transition: stroke-dasharray .25s;
    }
  }
}
</style>
