import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import GameScene from './scenes/GameScene'
import BossScene from './scenes/BossScene'
import GameOverScene from './scenes/GameOverScene'

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#87ceeb',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1000 },
        debug: false
      }
    },
    scene: [BootScene, GameScene, BossScene, GameOverScene]
  })
}
