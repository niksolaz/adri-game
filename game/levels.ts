// Configurazione dei 3 livelli.
// dy = altezza della piattaforma dal fondo dello schermo.
// La casetta finale è sempre vicino alla fine del mondo.

export interface LevelConfig {
  width: number
  platforms: { x: number; dy: number }[]
  enemies: number[]
  houseX: number
}

export const LEVELS: LevelConfig[] = [
  // Livello 1 — introduzione (mondo doppio rispetto a prima)
  {
    width: 6400,
    platforms: [
      { x: 500, dy: 160 }, { x: 800, dy: 240 }, { x: 1200, dy: 180 },
      { x: 1600, dy: 260 }, { x: 2100, dy: 160 }, { x: 2600, dy: 220 },
      { x: 3200, dy: 180 }, { x: 3700, dy: 260 }, { x: 4200, dy: 160 },
      { x: 4800, dy: 220 }, { x: 5400, dy: 180 }
    ],
    enemies: [600, 1000, 1500, 2000, 2500, 3100, 3800, 4500, 5200],
    houseX: 6200
  },
  // Livello 2 — più nemici, più salti
  {
    width: 7200,
    platforms: [
      { x: 400, dy: 180 }, { x: 750, dy: 260 }, { x: 1100, dy: 180 },
      { x: 1500, dy: 280 }, { x: 1900, dy: 180 }, { x: 2400, dy: 240 },
      { x: 2900, dy: 180 }, { x: 3400, dy: 280 }, { x: 3900, dy: 200 },
      { x: 4400, dy: 260 }, { x: 5000, dy: 180 }, { x: 5600, dy: 240 },
      { x: 6200, dy: 180 }
    ],
    enemies: [550, 900, 1300, 1700, 2200, 2700, 3200, 3700, 4300, 4900, 5500, 6100],
    houseX: 7000
  },
  // Livello 3 — il più lungo e affollato
  {
    width: 8000,
    platforms: [
      { x: 400, dy: 180 }, { x: 800, dy: 260 }, { x: 1200, dy: 200 },
      { x: 1600, dy: 280 }, { x: 2000, dy: 180 }, { x: 2500, dy: 260 },
      { x: 3000, dy: 200 }, { x: 3500, dy: 280 }, { x: 4000, dy: 180 },
      { x: 4500, dy: 260 }, { x: 5000, dy: 200 }, { x: 5500, dy: 280 },
      { x: 6100, dy: 200 }, { x: 6700, dy: 260 }, { x: 7300, dy: 180 }
    ],
    enemies: [500, 850, 1250, 1650, 2100, 2550, 3050, 3500, 3950, 4450, 4950, 5450, 6000, 6600, 7200],
    houseX: 7800
  }
]
