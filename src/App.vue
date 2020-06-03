<template>
  <div id="app">
    <section v-if="showStart" class="application-slide" id="s1">
      <header></header>
      <main>
        <p>
          В феврале 2019 года исполнилось 5 лет с того момента, как официально
          начали строительство третьей линии метро. Что же успели сделать
          метростроители за прошедшую пятилетку?
        </p>
        <button @click="showStart = false">Поехали</button>
      </main>
      <footer></footer>
    </section>
    <section v-else class="application-slide" id="s2">
      <leaflet-map />
    </section>
  </div>
</template>

<script>
import LeafletMap from "./components/LeafletMap";

export default {
  name: "App",
  components: {
    LeafletMap
  },
  data() {
    return {
      showStart: true
    };
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
  padding: 40px 0;
  height: 100%;
  background-image: url("./assets/images/background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
