<script setup lang="ts">
const { data: tasks, suspense } = useConvexQuery(convexApi.tasks.get);
const { mutate: createTask } = useConvexMutation(convexApi.tasks.create);
const { mutate: toggleTask } = useConvexMutation(convexApi.tasks.toggle);
const { mutate: removeTask } = useConvexMutation(convexApi.tasks.remove);

await suspense();

const { signOut, user } = useAuth();

const newTaskText = ref("");


function handleCreateTask() {
  createTask({ text: newTaskText.value });
  newTaskText.value = "";
}
</script>

<template>
  <header class="flex justify-between items-center p-2">
    <h1>Hello {{ user?.name }}</h1>
    <nav class="flex items-center gap-2">
      <UColorModeButton />
      <UButton @click="signOut" color="primary" variant="outline">Logout</UButton>
    </nav>
  </header>
  <form @submit.prevent="handleCreateTask">
    <UFieldGroup>
      <UInput v-model="newTaskText" name="text" label="Text" />
      <UButton type="submit">Create</UButton>
    </UFieldGroup>
  </form>
  <ul>
    <li v-for="task in tasks" :key="task._id" class="flex items-center gap-2">
      <UCheckbox v-model="task.isCompleted" @update:model-value="toggleTask({ taskId: task._id })" />
      <span>{{ task.text }}</span>
      <UButton @click="removeTask({ taskId: task._id })" icon="i-heroicons-trash" variant="ghost" color="neutral" />
    </li>
  </ul>
</template>
