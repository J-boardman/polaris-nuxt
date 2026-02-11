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
    <UButton @click="signInWithGithub" color="primary" variant="outline" icon="i-simple-icons-github">
      Sign In with Github
    </UButton>
  </div>
</template>
