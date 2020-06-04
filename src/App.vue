<template>
  <div id="app">
    <leaflet-map />
  </div>
</template>

<script>
import LeafletMap from "./components/LeafletMap";

export default {
  name: "App",
  components: {
    LeafletMap
  }
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}
body {
  margin: 0;
}
#app {
  margin: 0;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
