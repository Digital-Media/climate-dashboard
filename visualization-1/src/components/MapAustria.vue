<template>
  <div>
    <div id="map"></div>
    <div id="controls">
      <span>{{ date.getDate() }}. {{ date.getMonth() + 1 }}. </span>
      <select name="year" id="year" v-model="year">
        <option v-for="i in 38" :value="1984 + i" :key="'option-' + i">
          {{ 1984 + i }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import { onMounted, ref, watch } from "@vue/runtime-core";
import statesGeoData from "../assets/oesterreich.json";

export default {
  name: "MapAustria",
  setup() {
    let year = ref(1985);
    let date = ref(new Date());
    let useTodaysDate = true;
    let map;
    let base_url =
      "http://localhost:8010/proxy/v1/grid/historical/winfore-v1-1d-1km"; // start proxy: lcp --proxyUrl https://dataset.api.hub.zamg.ac.at

    onMounted(() => {
      initializeMap();
    });

    watch(year, (year, prevYear) => {
      map = map.remove();
      initializeMap(); // Reinitialize map when year changes
    });

    function initializeMap() {
      // Create Map
      map = L.map("map").setView([47.59397, 14.12456], 7);

      // Add Bundesland shapes to map
      L.geoJson(statesGeoData, {
        style: polystyle,
        onEachFeature: onEachState,
      }).addTo(map);

      // Disable Zooming
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }

    function onEachState(feature, layer) {
      // TODO: Fetch multiple timedata sets and display them / the historical average
      // TODO: Fetch current dataset and display for comparison
      let dateString = useTodaysDate
        ? `${year.value}-${date.value.getMonth() + 1}-${date.value.getDate()}`
        : "1985-01-01";

      fetch(getStateUrl(feature, dateString))
        .then((response) => response.json())
        .then((data) => parseData(data))
        .then((data) => {
          layer.bindPopup(
            `
              <h3>${layer.feature.properties.name}</h3>
              <p class="text-center">${dateString}<br>
              ${data["ET0"]} kg/m&#0178;<br>
              SPEI: ${data["SPEI"]}</p>
            `
          );
          return data;
        })
        .then((data) => {
          layer.setStyle({ fillColor: getFeatureColor(data) });
        });
    }

    // Calculates BBOX for each state and returns API Url
    function getStateUrl(feature, date) {
      let [x, y] = feature.properties.bbox_point;
      let bbox = [
        y.toFixed(2),
        x.toFixed(2),
        (y + parseFloat(0.01)).toFixed(2),
        (x + parseFloat(0.01)).toFixed(2),
      ];
      let bbox_string = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;

      return `${base_url}?parameters=ET0,SPEI&start=${date}T00:00&end=${date}T01:00&bbox=${bbox_string}`;
    }

    function getFeatureColor(data) {
      const speiData = data["SPEI"];
      const colors = {
        darkBlue: "#4371a3",
        lightBlue: "#5286C1",
        green: "rgb(95, 181, 100)",
        yellow: " rgb(255, 243, 128)",
        orange: "rgb(255, 183, 58)",
        lightRed: "rgb(208, 53, 35)",
        darkRed: "rgb(130, 43, 40)",
      };
      if (speiData >= 1.5) {
        return colors.darkBlue;
      } else if (speiData >= 1) {
        return colors.lightBlue;
      } else if (speiData > 0) {
        return colors.green;
      } else if (speiData >= -1) {
        return colors.yellow;
      } else if (speiData >= -1.5) {
        return colors.orange;
      } else if (speiData >= -2) {
        return colors.lightRed;
      } else if (speiData < -2) {
        return colors.darkRed;
      }
      return "grey";
    }

    function parseData(data) {
      return { ET0: parseET0(data), SPEI: parseSPEI(data) };
    }

    // Parses API results to return ET0 data (daily reference evapotranspiration in kg m-2)
    function parseET0(data) {
      return data.features[0].properties.parameters.ET0.data[0];
    }

    // Parses API results to return SPEI data (multiscalar drought index)
    function parseSPEI(data) {
      return data.features[0].properties.parameters.SPEI.data[0];
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

    function fetchWeatherData() {
      // The following url format can be used to request historical WINFORE data from ZAMG
      // A proxy is used to bypass CORS problems (https://www.npmjs.com/package/local-cors-proxy)
      // Original URL: "https://dataset.api.hub.zamg.ac.at/v1/grid/historical/winfore-v1-1d-1km?parameters=ET0,SPEI&start=2021-12-20T00:00&end=2021-12-20T01:00&bbox=47.45,14.05,47.46,14.06"
      fetch(
        `http://localhost:8010/proxy/v1/grid/historical/winfore-v1-1d-1km?parameters=ET0,SPEI&start=2021-12-20T00:00&end=2021-12-20T01:00&bbox=47.45,14.05,47.46,14.06`
      )
        .then((response) => response.json())
        .then((data) => parseET0(data))
        .then((data) => console.log(data))
        .then(initializeMap());
    }

    /*
    function fetchAllStateData() {
      //Get API URLs for each state and save it to an array
      let urls = [];
      (Array.from(statesGeoData["features"])).forEach(feature => {
        urls.push((getStateUrl(feature)))
      });

      //Fetch URLs
      //Process state data
      //TODO: Save results with the corresponding state name somewhere
      let promises = urls.map(url => fetch(url)
        .then((response) => response.json())
        .then((data) => parseET0(data)));

      //Process all data once finished
      Promise.all(promises).then(results => {
        console.log(results);
        //TODO: Add tooltips to map here?
      });
    }

    */

    return {
      initializeMap,
      year,
      date,
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
</style>
