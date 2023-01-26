// Defining a WebComponent for integrating the visualization into other pages and environments
// See https://vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue

import { defineCustomElement } from "vue";
import HumidityMap from "./components/HumidityMap.ce.vue";

export const HumidityMapComponent = defineCustomElement(HumidityMap);

export function register(tagName = "humidity-map") {
  customElements.define(tagName, HumidityMapComponent);
}
