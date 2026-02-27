<template>
  <UApp>
    <div class="min-h-screen bg-default text-white flex flex-col pt-32 p-6 justify-start items-center">
      <h1 class="text-4xl font-bold mb-4">Nuxt v4 Template (Thin Skeleton)</h1>
      <p class="text-muted mb-8 max-w-lg text-center">
        This app inherits from the narduk-nuxt-layer. It contains no core UI components, linters, or plugins natively to prevent merge conflicts when pulling updates.
      </p>
      
      <!-- Test a globally registered Nuxt UI component -->
      <UButton to="https://github.com/loganrenz/narduk-nuxt-layer" target="_blank" icon="i-lucide-github" color="primary">
        View Layer Nuxt Setup
      </UButton>
    </div>
  </UApp>
</template>
