<template>
  <div class="chart-wrapper">
    <v-chart class="chart" :option="option" />
  </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, defineComponent } from "vue";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

export default defineComponent({
  name: "AppComp",
  components: {
    VChart,
  },
  provide: {
    [THEME_KEY]: "light",
  },
  setup() {
    const option = ref({
      legend: {
        // Try 'horizontal'
        orient: "horizontal",
        top: "bottom",
        data: [
          {
            name: "Current",
            icon: "rect",
          },
          {
            name: "Historic",
            icon: "circle",
          },
        ],
      },
      xAxis: {
        data: ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"],
      },
      yAxis: {},
      series: [
        {
          name: "Historic",
          data: [10, 22, 28, 23, 19],
          type: "line",
          areaStyle: {},
        },
        {
          name: "Current",
          data: [25, 14, 23, 35, 10],
          type: "line",
          areaStyle: {},
        },
      ],
    });

    return { option };
  },
});
</script>

<style scoped>
.chart {
  height: 100vh;
}
.chart-wrapper {
  width: 100%;
}
</style>
