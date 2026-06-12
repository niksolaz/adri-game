<template>
  <div class="menu">
    <h1>Adriana<br>e i Cuoricini 💗</h1>
    <p>Lancia cuoricini ai bambini arrabbiati e rendili buoni!</p>
    <NuxtLink to="/game" class="play-btn">▶ GIOCA</NuxtLink>
    <div class="stars">⭐ ⭐ ⭐</div>
  </div>
</template>

<style scoped>
.menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(180deg, #87ceeb 0%, #b8e0f0 60%, #7ec850 60%, #5da838 100%);
  text-align: center;
  padding: 1rem;
}
h1 {
  color: #e91e63;
  font-size: clamp(2rem, 8vw, 3.5rem);
  margin: 0;
  text-shadow: 3px 3px 0 #fff;
}
p {
  color: #333;
  font-size: 1.1rem;
  max-width: 28rem;
  margin: 0;
}
.play-btn {
  background: #e91e63;
  color: #fff;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.9rem 3rem;
  border-radius: 999px;
  box-shadow: 0 4px 0 #ad1457;
  transition: transform 0.1s;
}
.play-btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #ad1457;
}
.stars { font-size: 1.6rem; }
</style>
