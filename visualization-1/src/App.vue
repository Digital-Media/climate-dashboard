<template>
  <div>
    <heat-bins></heat-bins>

    <!-- <map-austria></map-austria> -->
    <!--
      <line-chart></line-chart>
    -->
  </div>
</template>

<script>
import LineChart from "./components/LineChart.vue";
// import MapAustria from "./components/MapAustria.vue";
import HeatBins from "./components/HeatBins.vue";

export default {
  name: "App",
  components: {
    LineChart,
    // MapAustria,
    HeatBins,
  },
};
</script>

<style scoped></style>
