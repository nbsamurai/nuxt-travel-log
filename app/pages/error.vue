<script setup lang="ts">
const route = useRoute();
const error = route.query.error || "An unknown error occured";
</script>

<template>
  <div class="card bg-base-300 container mt-4 min-h-72 text-center mx-auto flex flex-col justify-center items-center gap=4">
    <div role="alert" class="alert alert-error min-w-1/2 text-center">
      <span>Oh no! {{ error }}
      </span>
    </div>
    <NuxtLink class="btn btn-primary mt-4" to="/">
      Home
      <Icon name="tabler:arrow-left" size="32" />
    </NuxtLink>
  </div>
</template>
