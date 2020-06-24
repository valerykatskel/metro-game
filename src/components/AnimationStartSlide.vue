<template>
  <div
    class="section-image start-animation-metro"
    :style="{ height: ratioHeight }"
    v-resize="onResize"
  >
    <div class="metro-bg-01">
      <img
        src="https://img.tyt.by/news/special/metro-game/tunnel-inner.svg"
        alt
      />
    </div>
    <div class="metro-bg-02">
      <img src="https://img.tyt.by/news/special/metro-game/tunnel.svg" alt />
    </div>
    <div class="metro-bg-03">
      <img src="https://img.tyt.by/news/special/metro-game/metro.svg" alt />
    </div>
  </div>
</template>

<script>
export default {
  name: "AnimationStartSlide",
  data() {
    return {
      ratioHeight: "340px"
    };
  },
  methods: {
    onResize({ width }) {
      const value = width / 1.7647;
      this.ratioHeight = `${value}px`;
    }
  },
  mounted() {
    this.ratioHeight = `${this.$el.offsetWidth / 1.7647}px`;
  }
};
</script>

<style lang="scss">
.start-animation-metro {
  position: relative;
  height: 340px;
  // ratio = 1,7647
  margin: 0;
  overflow: hidden;
  margin-bottom: 20px;

  .metro-bg-01,
  .metro-bg-02,
  .metro-bg-03 {
    position: absolute;
    left: 0;
    bottom: -1px;
    top: 0;
    img {
      vertical-align: bottom;
      height: 100%;
      width: auto !important;
    }
  }

  .metro-bg-01 {
    z-index: 1;
    opacity: 1;
  }
  .metro-bg-02 {
    left: 0;
    z-index: 10;
  }
  .metro-bg-03 {
    left: -600px;
    top: 18%;
    z-index: 5;
    transition: left 1500ms cubic-bezier(0.24, 0.65, 0.53, 0.96);
  }
}
@media (min-width: 481px) {
  .start-animation-metro {
    margin: 0 60px;
    margin-bottom: 30px;
  }
}
</style>
