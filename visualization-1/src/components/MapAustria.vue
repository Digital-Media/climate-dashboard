<template>
  <div id="map"></div>
</template>

<script>
import L from "leaflet";
import { onMounted } from "@vue/runtime-core";
import statesData from "../assets/oesterreich.json";

export default {
  name: "MapAustria",
  setup() {
    let map;

    onMounted(() => {
      initializeMap();
      fetchWeatherData();
    });

    function initializeMap() {
      // Create Map
      map = L.map("map").setView([47.59397, 14.12456], 7);

      // Add Bundesland shapes to map
      L.geoJson(statesData).addTo(map);

      // Disable Zooming
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }

    function fetchWeatherData() {
      // The following url format can be used to request historical WINFORE data from ZAMG
      // A proxy is used to bypass CORS problems (https://www.npmjs.com/package/local-cors-proxy)
      // Original URL: "https://dataset.api.hub.zamg.ac.at/v1/grid/historical/winfore-v1-1d-1km?parameters=ET0,SPEI&start=2021-12-20T00:00&end=2021-12-20T01:00&bbox=47.45,14.05,47.46,14.06"
      fetch(
        `http://localhost:8010/proxy/v1/grid/historical/winfore-v1-1d-1km?parameters=ET0,SPEI&start=2021-12-20T00:00&end=2021-12-20T01:00&bbox=47.45,14.05,47.46,14.06`
      )
        .then((response) => response.json())
        .then((data) => console.log(data));
    }

    return {
      initializeMap,
    };
  },
};
</script>
<style scoped>
#map {
  height: 500px;
}
</style>
