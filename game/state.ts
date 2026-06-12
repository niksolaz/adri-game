// Stato di gioco condiviso tra le scene.
// Niente persistenza: se perdi, si ricomincia tutto da capo (livello 1, 3 stelline).

export const MAX_STARS = 3
export const TOTAL_LEVELS = 3

export interface GameState {
  stars: number
  converted: number // bambini resi buoni (totale partita)
  level: number     // livello corrente (1..TOTAL_LEVELS)
}

export const gameState: GameState = {
  stars: MAX_STARS,
  converted: 0,
  level: 1
}

// Nuova partita: tutto da capo
export function resetGame(): void {
  gameState.stars = MAX_STARS
  gameState.converted = 0
  gameState.level = 1
}

// Livello completato: si avanza, stelline e conversioni si conservano
export function nextLevel(): boolean {
  if (gameState.level >= TOTAL_LEVELS) return false
  gameState.level++
  return true
}

export function loseStar(): number {
  gameState.stars = Math.max(0, gameState.stars - 1)
  return gameState.stars
}

export function isGameOver(): boolean {
  return gameState.stars <= 0
}
