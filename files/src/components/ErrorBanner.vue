<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <p
    role="alert"
    class="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-danger select-text"
  >
    {{ message }}
  </p>
</template>
