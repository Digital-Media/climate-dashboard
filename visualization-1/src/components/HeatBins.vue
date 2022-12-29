<template>
  <div>
    <div id="map"></div>
    <div id="controls"></div>
  </div>
</template>

<script>
import L from "leaflet";
import { onMounted, ref, watch } from "@vue/runtime-core";
import statesGeoData from "../assets/oesterreich.json";

import "georaster";
import "georaster-layer-for-leaflet";

import chroma from "chroma-js";

export default {
  name: "HeatBins",
  setup() {
    let map;

    onMounted(() => {
      initializeMap();
    });

    function initializeMap() {
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

      var url_to_geotiff_file = "./austria_data_SPEI.tif";

      // Fetch GeoTiff file and render on GeoRasterLayer
      fetch(url_to_geotiff_file)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          parseGeoraster(arrayBuffer).then((georaster) => {
            console.log("georaster:", georaster);
            const min = georaster.mins[0];
            const max = georaster.maxs[0];
            const range = georaster.ranges[0];

            console.log(chroma.brewer);
            var scale = chroma.scale("RdYlGn");

            var layer = new GeoRasterLayer({
              georaster: georaster,
              opacity: 0.7,
              resolution: 64, // optional parameter for adjusting display resolution
              pane: "top",
              pixelValuesToColorFn: function (pixelValues) {
                const pixelValue = pixelValues[0]; // there's just one band in this raster

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
}

.text-center {
  text-align: center;
}

.leaflet-heatmap-layer {
  z-index: 500;
}
</style>
