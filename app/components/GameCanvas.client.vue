<template>
  <div ref="container" class="game-container" />
</template>

<script setup lang="ts">
// Componente .client: Phaser gira solo nel browser (Nuxt è SSR-aware)
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type Phaser from 'phaser'

const container = ref<HTMLDivElement | null>(null)
let game: Phaser.Game | null = null

onMounted(async () => {
  const { createGame } = await import('~~/game/config')
  if (container.value) {
    game = createGame(container.value)
  }
})

onBeforeUnmount(() => {
  game?.destroy(true)
  game = null
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
}
</style>
