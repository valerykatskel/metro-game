<template>
  <transition name="modal">
    <div class="app-modal-mask">
      <div class="app-modal-wrapper">
        <div class="app-modal-container">
          <a href="#" @click="$emit('onClosePopup')" class="icon-close">
            <icon-base>
              <icon-close />
            </icon-base>
          </a>
          <img
            class="app-modal-header-image"
            :src="require('../assets/images/popup-header-image.png')"
            alt
          />
          <div class="app-modal-header">
            <slot name="header"></slot>
          </div>

          <div class="app-modal-body">
            <slot name="body"></slot>
          </div>

          <div class="app-modal-footer">
            <ui-button @click="$emit('onShowResult')">
              <slot name="button"></slot>
            </ui-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import UiButton from "./ui/UiButton";
import IconBase from "./icons/IconBase";
import IconClose from "./icons/IconClose";
export default {
  name: "PopupModal",
  components: {
    UiButton,
    IconBase,
    IconClose
  }
};
</script>

<style lang="scss">
.app-modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.app-modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  position: relative;
}

.icon-close {
  opacity: 0.3;
  position: absolute;
  right: 15px;
  top: 15px;
  cursor: pointer;
}

.app-modal-container {
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  flex-direction: column;
}

.app-modal-header-image {
  width: 102px;
  margin-top: -79px;
  align-self: center;
  height: 116px;
}

.app-modal-header {
  margin-top: 12px;
  p {
    margin: 0 0 15px 0;
    font-size: 17px;
    line-height: 23px;
    font-weight: bold;
    color: #1d1d1f;
  }
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-leave-active .app-modal-container {
  -webkit-transform: scale(1.5);
  transform: scale(1.5);
  opacity: 0;
}
.app-modal-footer {
  .button {
    width: 100%;
  }
}
</style>
