import Vue from "vue";
import App from "./App.vue";
import VueSocialSharing from "vue-social-sharing";
import VueResizeObserver from "vue-resize-observer";

Vue.use(require("vue-shortkey"));
Vue.use(VueResizeObserver);
Vue.use(VueSocialSharing);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
