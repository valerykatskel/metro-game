<template>
  <a
    class="button"
    :disabled="isDisabled"
    @click="onClick"
    :class="buttonClass"
  >
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: "UiButton",
  props: {
    buttonClass: String,
    isDisabled: Boolean
  },
  methods: {
    onClick() {
      if (!this.isDisabled) {
        this.$emit("click");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.button {
  box-sizing: border-box;
  background: #84b132;
  border: none;
  display: inline-block;
  padding: 0 25px;
  height: 50px;
  font-family: Arial;
  font-size: 15px;
  line-height: 50px;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;

  &[disabled] {
    background: rgba(132, 177, 50, 0.5);
    cursor: default;
  }

  &.light {
    background: #f2f2f2;
    color: #1d1d1f;
  }

  &.start {
    background: #fb6483;
  }
}
</style>
