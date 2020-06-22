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
@import "../node_modules/leaflet/dist/leaflet.css";
html,
body {
  height: 100%;
}
body {
  margin: 0;
}
#app {
  margin: 0 auto;
  height: 100%;
  padding: 15px;
  max-width: 720px;
  box-sizing: content-box;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #fff;
  color: #2c3e50;
}

@media (min-width: 481px) {
  #app {
    padding: 30px;
  }
}
</style>
