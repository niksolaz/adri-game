import Phaser from 'phaser'
import { resetGame } from '../state'

// Carica gli sprite pixel-art da public/assets/sprites/
// e genera via codice le texture semplici (terreno, cuore, stella).
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload(): void {
    this.load.image('adriana', '/assets/sprites/adriana.png')
    this.load.image('enemy-angry', '/assets/sprites/kid-angry.png')
    this.load.image('enemy-good', '/assets/sprites/kid-good.png')
    this.load.image('house', '/assets/sprites/house.png')
    this.load.image('poop', '/assets/sprites/poop.png')
    this.load.image('boss-poop', '/assets/sprites/boss-poop.png')
  }

  create(): void {
    resetGame() // il Boot gira una sola volta: partita nuova, livello 1
    this.makeGround('ground', 64)
    this.makeHeart('heart', 20, '#ff4081')
    this.makeStar('star', 24, '#ffc107')

    this.scene.start('Game')
  }

  // Terreno: terra marrone con striscia d'erba in cima
  private makeGround(key: string, size: number): void {
    const g = this.add.graphics()
    g.fillStyle(0x7a5230, 1) // terra
    g.fillRect(0, 0, size, size)
    g.fillStyle(0x5da838, 1) // erba
    g.fillRect(0, 0, size, 14)
    g.fillStyle(0x7ec850, 1) // ciuffi d'erba chiari
    for (let x = 0; x < size; x += 16) {
      g.fillRect(x + 4, 0, 8, 6)
    }
    g.generateTexture(key, size, size)
    g.destroy()
  }

  private makeHeart(key: string, size: number, color: string): void {
    const g = this.add.graphics()
    const c = Phaser.Display.Color.HexStringToColor(color).color
    g.fillStyle(c, 1)
    const s = size / 4
    g.fillCircle(s * 1.2, s * 1.2, s * 1.2)
    g.fillCircle(s * 2.8, s * 1.2, s * 1.2)
    g.fillTriangle(0, s * 1.6, size, s * 1.6, size / 2, size)
    g.generateTexture(key, size, size)
    g.destroy()
  }

  private makeStar(key: string, size: number, color: string): void {
    const g = this.add.graphics()
    const c = Phaser.Display.Color.HexStringToColor(color).color
    g.fillStyle(c, 1)
    const cx = size / 2
    const points: Phaser.Math.Vector2[] = []
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? cx : cx * 0.45
      const a = (Math.PI / 5) * i - Math.PI / 2
      points.push(new Phaser.Math.Vector2(cx + r * Math.cos(a), cx + r * Math.sin(a)))
    }
    g.fillPoints(points, true)
    g.generateTexture(key, size, size)
    g.destroy()
  }
}
