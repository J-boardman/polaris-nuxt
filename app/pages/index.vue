<script setup lang="ts">
const { data: tasks } = useConvexQuery(convexApi.tasks.get);

</script>

<template>
  <div>
    <h1>Hello World</h1>
    <UColorModeButton />
    <pre>{{ tasks }}</pre>
  </div>
</template>