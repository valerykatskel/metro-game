<template>
  <div class="app-loader-overlay">
    <img
      src="https://img.tyt.by/i/by4/ajax-loader.gif"
      class="app-loader"
      style="
"
    />
  </div>
</template>

<script>
export default {
  name: "AppLoader",
  components: {}
};
</script>

<style lang="scss">
.app-loader-overlay {
  position: fixed;
  display: flex;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}
</style>
