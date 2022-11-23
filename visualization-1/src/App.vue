<template>
  <div>
    <line-chart></line-chart>
    <map-austria></map-austria>
  </div>
</template>

<script>
import LineChart from "./components/LineChart.vue";
import MapAustria from "./components/MapAustria.vue";

export default {
  name: "App",
  components: {
    LineChart,
    MapAustria,
  },
};
</script>

<style scoped></style>
