<template>
  <div>
    <div id="map"></div>
    <div id="controls">
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
      <div class="select-wrapper">
        <select
          v-model="selectedUrl"
          @change="initializeMap()"
          name="visualizations"
          id="visualizations"
        >
          <option v-for="el in geotiffUrls" :key="el.text" :value="el.url">
            {{ el.text }}
          </option>
        </select>
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

export default {
  name: "HeatBins",
  setup() {
    let map;
    let geotiffUrls = reactive([
      { text: "SPEI 20XX", url: "./austria_data_SPEI.tif" },
      { text: "SPEI 01.01.2023", url: "./test_1_1.tiff" },
      { text: "SPEI 07.08.2022", url: "./austria_data_SPEI_22_08_07.tif" },
    ]);
    let selectedUrl = ref("./austria_data_SPEI.tif");
    const colorScale = "RdBu";
    const colorValues = reactive(chroma.brewer[colorScale]);

    onMounted(() => {
      initializeMap();
    });

    function initializeMap() {
      if (map) {
        map.remove();
      }

      // Create Map
      map = L.map("map").setView([47.59397, 14.12456], 7);

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
      fetch(selectedUrl.value)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          parseGeoraster(arrayBuffer).then((georaster) => {
            const min = georaster.mins[0];
            const max = georaster.maxs[0];
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
                const scaledPixelValue = (pixelValue - min) / range; // (pixelValue - min) / (max - min)
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

    function polystyle(feature) {
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
      geotiffUrls,
      selectedUrl,
      colorValues,
    };
  },
};
</script>

<style scoped>
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
</style>
