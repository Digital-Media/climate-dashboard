<template>
  <div>
    <div id="map" ref="mapElement"></div>
    <div id="controls">
      <time-line :year="year" @change-map="(url) => switchMap(url)"></time-line>
      <div class="select-wrapper">
        <select v-model="year" name="visualizations" id="visualizations">
          <option v-for="el in availableYears" :key="el" :value="el">
            {{ el }}
          </option>
        </select>
      </div>
      <div class="color-scale-wrapper">
        trocken
        <div class="color-scale">
          <div
            v-for="colorValue in colorValues"
            :key="colorValue"
            :style="`background-color: ${colorValue}`"
            class="legend-square"
          ></div>
        </div>
        feucht
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import { onMounted, reactive, ref } from "vue";
import statesGeoData from "../assets/oesterreich.json";
import borderGeoData from "../assets/austria_border.json";

import "georaster";
import "georaster-layer-for-leaflet";

import chroma from "chroma-js";

import TimeLine from "./TimeLine.vue";

export default {
  name: "HumidityMap",
  components: {
    TimeLine,
  },
  setup() {
    let map;
    const mapElement = ref(null);
    const selectedUrl = ref("./austria_data_SPEI.tif");
    const availableYears = ref([]);
    const year = ref(1963);
    const colorScale = "RdBu";
    const colorValues = reactive(chroma.brewer[colorScale]);

    onMounted(() => {
      loadAvailableYears();
      initializeMap();
    });

    function loadAvailableYears() {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/availableTifs/weekly`)
        .then((response) => response.json())
        .then((data) => {
          availableYears.value = data;
        });
    }

    function initializeMap() {
      if (map) {
        map.remove();
      }

      // Create Map
      map = L.map(mapElement.value).setView([47.59397, 14.12456], 7);

      // Initialize panes for proper layering
      map.createPane("top");
      map.getPane("top").style.zIndex = "380";

      map.createPane("bottom");
      map.getPane("bottom").style.zIndex = "340";

      // Add Bundesland shapes to map
      let geoJsonLayer = L.geoJson(statesGeoData, {
        pane: "bottom",
        style: polystyle,
      }).addTo(map);
      geoJsonLayer.setZIndex(400);

      // Fetch GeoTiff file and render on GeoRasterLayer
      fetch(`${import.meta.env.VITE_API_BASE_URL}/getTif/${selectedUrl.value}`)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          parseGeoraster(arrayBuffer).then((georaster) => {
            // const min = georaster.mins[0];
            // const max = georaster.maxs[0];
            const minFixed = -25;
            const maxFixed = 25;
            const range = georaster.ranges[0];

            console.log(chroma.brewer);
            var scale = chroma.scale(colorScale);

            var layer = new GeoRasterLayer({
              georaster: georaster,
              mask: borderGeoData,
              mask_strategy: "outside",
              opacity: 0.7,
              resolution: 200, // optional parameter for adjusting display resolution
              pane: "top",
              pixelValuesToColorFn: function (pixelValues) {
                const pixelValue = pixelValues[0];

                // Pixels with value -999 have no valid data
                if (pixelValue === -999) return null;

                // scale to 0 - 1 used by chroma
                const scaledPixelValue =
                  (pixelValue - minFixed) / (maxFixed - minFixed); //(pixelValue - min) / range;
                let color = scale(scaledPixelValue).hex();

                return color;
              },
            });
            layer.addTo(map);

            map.fitBounds(layer.getBounds());
          });
        });

      // Disable Zooming
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }

    function switchMap(url) {
      selectedUrl.value = url;
      initializeMap();
    }

    function polystyle() {
      return {
        fillColor: "grey",
        weight: 2,
        opacity: 1,
        color: "white", //Outline color
        fillOpacity: 1,
      };
    }

    return {
      initializeMap,
      switchMap,
      selectedUrl,
      colorValues,
      year,
      availableYears,
      mapElement,
    };
  },
};
</script>

<style>
@import "../assets/main.css";

#map {
  height: 500px;
}

#controls {
  margin-top: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 1rem;
}

.text-center {
  text-align: center;
}

.leaflet-heatmap-layer {
  z-index: 500;
}
.color-scale-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-scale {
  display: inline-block;
  margin: 0 1rem;
}

.legend-square {
  display: inline-block;
  width: 25px;
  height: 25px;
}

.select-wrapper {
  width: 100%;
}

.timeline {
  width: 100%;
}
.timeline__wrapper {
  display: flex;
  justify-content: space-between;
}

.timeline__wrapper--margin-top {
  margin-top: 1rem;
}

.timeline__bullet {
  width: 12px;
  height: 12px;
  background-color: grey;
  border-radius: 50%;
  cursor: pointer;
}

.timeline__bullet--empty {
  background: none;
}

.timeline__indicator {
  height: 15px;
  width: 2px;
  background-color: black;
}
</style>
