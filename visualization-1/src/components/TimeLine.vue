<template>
  <div class="timeline">
    <div class="timeline__wrapper">
      <div v-if="!timelineData">loading</div>
      <div
        class="timeline__bullet bg-color-yellow"
        v-else
        v-for="el in timelineData"
        @click="$emit('changeMap', el)"
        :key="el"
      ></div>
      <div class="timeline__bullet timeline__bullet--empty"></div>
    </div>
    <div class="timeline__wrapper timeline__wrapper--margin-top">
      <div v-for="i in 13" :key="`indicator-${i}`">
        <div class="timeline__indicator"></div>
      </div>
    </div>
    <div class="timeline__wrapper">
      <div v-for="i in 13" :key="`indicator-${i}`">
        <div v-if="i < 13">1.{{ i }}.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";

export default {
  name: "TimeLine",
  props: {
    year: {
      type: Number,
      default: 2012,
    },
  },
  setup(props) {
    const timelineData = ref({});

    watch(
      () => props.year,
      () => {
        fetch(
          `${import.meta.env.VITE_API_BASE_URL}/availableTifs/weekly/${
            props.year
          }`
        )
          .then((response) => response.json())
          .then((data) => {
            timelineData.value = data;
            console.log(data);
          });
      }
    );

    onMounted(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/availableTifs/weekly/2022`)
        .then((response) => response.json())
        .then((data) => {
          timelineData.value = data;
          console.log(data);
        });
    });
    return {
      timelineData,
      props,
    };
  },
};
</script>
