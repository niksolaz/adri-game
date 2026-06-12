import Phaser from 'phaser'
import { gameState, resetGame } from '../state'

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver')
  }

  create(data: { win: boolean }): void {
    const { width, height } = this.scale
    const cx = width / 2

    this.add.rectangle(cx, height / 2, width, height, 0x1a1a2e, 0.85)

    const title = data.win ? 'Vittoria! 🎉' : 'Game Over'
    const subtitle = data.win
      ? `Hai sconfitto la Cacca Gigante! 💩 Bambini resi buoni: ${gameState.converted} 💗`
      : `Adriana ha finito le stelline al livello ${gameState.level}...`

    this.add.text(cx, height * 0.35, title, {
      fontSize: '48px', color: data.win ? '#4caf50' : '#e91e63', fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(cx, height * 0.48, subtitle, {
      fontSize: '22px', color: '#ffffff'
    }).setOrigin(0.5)

    const btn = this.add.text(cx, height * 0.65, data.win ? '▶ GIOCA ANCORA' : '▶ RICOMINCIA', {
      fontSize: '28px', color: '#ffffff', backgroundColor: '#e91e63',
      padding: { x: 24, y: 12 }, fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // Si ricomincia tutto da capo: livello 1, 3 stelline
    btn.on('pointerdown', () => {
      resetGame()
      this.scene.start('Game')
    })
  }
}
