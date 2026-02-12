<script setup lang="ts">
const { authClient } = useAuth();

const signInWithGithub = () => {
  authClient.signIn.social({
    provider: "github",
    callbackURL: "/auth/callback",
  });
};
</script>

<template>
  <div>
    <h1>Sign In</h1>
    <UButton
      color="primary"
      variant="outline"
      icon="i-simple-icons-github"
      @click="signInWithGithub"
    >
      Sign In with Github
    </UButton>
  </div>
</template>
