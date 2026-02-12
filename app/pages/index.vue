<script setup lang="ts">
const { mutate: getBookRecommendation } = useConvexMutation(
  convexApi.books.kickoffGetBookRecommendationWorkflow,
);

const { signOut, user } = useAuth();

const bookInput = ref("");

function handleGetBookRecommendation() {
  if (!bookInput.value.trim()) return;
  getBookRecommendation({ bookTitle: bookInput.value });
  bookInput.value = "";
}
</script>

<template>
  <header class="flex justify-between items-center p-2">
    <h1>Hello {{ user?.name }}</h1>
    <nav class="flex items-center gap-2">
      <UColorModeButton />
      <UButton color="primary" variant="outline" @click="signOut">
        Logout
      </UButton>
    </nav>
  </header>
  <form @submit.prevent="handleGetBookRecommendation">
    <UFieldGroup>
      <UInput
        v-model="bookInput"
        name="bookTitle"
        label="Book Title"
        placeholder="Enter a book title"
      />
      <UButton type="submit">Submit</UButton>
    </UFieldGroup>
  </form>
</template>
