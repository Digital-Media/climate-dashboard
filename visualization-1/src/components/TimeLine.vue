<template>
  <div class="timeline">
    <div class="timeline-wrapper">
      <div v-if="!timelineData">loading</div>
      <div
        class="timeline__bullet"
        v-else
        v-for="el in timelineData"
        :key="el"
      ></div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";

export default {
  name: "TimeLine",
  setup() {
    let timelineData = ref({});

    onMounted(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/availableTifs/weekly/1963/`)
        .then((response) => response.json())
        .then((data) => {
          timelineData.value = data;
          console.log(data);
        });
    });
    return {
      timelineData,
    };
  },
};
</script>

<style scoped>
.timeline {
  width: 100%;
}
.timeline-wrapper {
  display: flex;
  justify-content: space-between;
}

.timeline__bullet {
  width: 4px;
  height: 4px;
  background-color: coral;
}
</style>
