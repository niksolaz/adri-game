import Phaser from 'phaser'
import { gameState, loseStar, isGameOver, nextLevel, MAX_STARS } from '../state'
import { LEVELS, type LevelConfig } from '../levels'

const ENEMY_SPEED = 60
const PLAYER_SPEED = 220
const JUMP_VELOCITY = -560
const HEART_SPEED = 400
const POOP_INTERVAL = 1000 // un lancio di cacca al secondo
const POOP_RANGE = 700     // distanza entro cui i nemici lanciano

export default class GameScene extends Phaser.Scene {
  private level!: LevelConfig
  private player!: Phaser.Physics.Arcade.Sprite
  private enemies!: Phaser.Physics.Arcade.Group
  private hearts!: Phaser.Physics.Arcade.Group
  private poops!: Phaser.Physics.Arcade.Group
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private house!: Phaser.Physics.Arcade.Image
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private starIcons: Phaser.GameObjects.Image[] = []
  private convertedText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private totalEnemies = 0
  private levelConverted = 0
  private invulnerableUntil = 0
  private levelDone = false
  private touch = { left: false, right: false }

  constructor() {
    super('Game')
  }

  create(): void {
    this.level = LEVELS[gameState.level - 1]!
    this.starIcons = []
    this.levelConverted = 0
    this.levelDone = false
    this.invulnerableUntil = 0
    this.touch = { left: false, right: false }

    const h = this.scale.height
    const W = this.level.width
    this.physics.world.setBounds(0, 0, W, h)

    // Terreno e piattaforme
    this.platforms = this.physics.add.staticGroup()
    for (let x = 0; x < W; x += 64) {
      this.platforms.create(x + 32, h - 32, 'ground').refreshBody()
    }
    this.level.platforms.forEach(p =>
      this.platforms.create(p.x, h - p.dy, 'ground').refreshBody()
    )

    // Casetta di fine livello
    this.house = this.physics.add.staticImage(this.level.houseX, h - 64 - 42, 'house')

    // Adriana
    this.player = this.physics.add.sprite(100, h - 150, 'adriana')
    this.player.setCollideWorldBounds(true)
    this.player.body!.setSize(40, 60).setOffset(4, 4)
    this.physics.add.collider(this.player, this.platforms)

    // Nemici (bambini arrabbiati)
    this.enemies = this.physics.add.group()
    this.totalEnemies = this.level.enemies.length
    this.level.enemies.forEach(x => {
      const e = this.enemies.create(x, h - 130, 'enemy-angry') as Phaser.Physics.Arcade.Sprite
      e.setCollideWorldBounds(true)
      e.body!.setSize(40, 56).setOffset(4, 4)
      e.setVelocityX(Phaser.Math.RND.pick([ENEMY_SPEED, -ENEMY_SPEED]))
      e.setData('angry', true)
    })
    this.physics.add.collider(this.enemies, this.platforms)

    // Cuoricini: convertono gli arrabbiati, si fermano sui buoni (ostacoli)
    this.hearts = this.physics.add.group({ allowGravity: false })
    this.physics.add.overlap(this.hearts, this.enemies, (heart, enemy) => {
      this.convertEnemy(heart as Phaser.Physics.Arcade.Sprite, enemy as Phaser.Physics.Arcade.Sprite)
    })

    // I bambini buoni sono solidi: Adriana li supera solo saltando
    this.physics.add.collider(
      this.player,
      this.enemies,
      undefined,
      (_p, enemy) => !(enemy as Phaser.Physics.Arcade.Sprite).getData('angry')
    )

    // Cacca dei nemici arrabbiati
    this.poops = this.physics.add.group()
    this.physics.add.overlap(this.player, this.poops, (_p, poop) => {
      poop.destroy()
      this.hitPlayer()
    })
    this.physics.add.collider(this.poops, this.platforms, poop => {
      // Splat: piccola animazione e via
      const p = poop as Phaser.Physics.Arcade.Sprite
      p.disableBody(true, false)
      this.tweens.add({ targets: p, alpha: 0, scaleY: 0.4, duration: 400, onComplete: () => p.destroy() })
    })
    this.time.addEvent({ delay: POOP_INTERVAL, loop: true, callback: () => this.enemiesThrowPoop() })

    // Adriana toccata da un nemico arrabbiato
    this.physics.add.overlap(this.player, this.enemies, (_p, enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite
      if (e.getData('angry')) this.hitPlayer()
    })

    // Adriana entra nella casetta
    this.physics.add.overlap(this.player, this.house, () => this.enterHouse())

    // Camera
    this.cameras.main.setBounds(0, 0, W, h)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // Input tastiera (sviluppo browser)
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.input.keyboard!.on('keydown-SPACE', () => this.throwHeart())

    // Input touch (mobile)
    this.input.addPointer(2)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handleTouch(p, true))
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.handleTouch(p, false))

    this.createHUD()
  }

  update(): void {
    if (this.levelDone) return

    const left = this.cursors.left.isDown || this.touch.left
    const right = this.cursors.right.isDown || this.touch.right
    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED)
      this.player.setFlipX(true)
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }
    if (this.cursors.up.isDown && this.player.body!.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY)
    }

    // Nemici: inverti direzione ai bordi
    this.enemies.children.iterate(obj => {
      const e = obj as Phaser.Physics.Arcade.Sprite
      if (!e.getData('angry')) return true
      if (e.body!.blocked.left) e.setVelocityX(ENEMY_SPEED)
      else if (e.body!.blocked.right) e.setVelocityX(-ENEMY_SPEED)
      return true
    })

    // Pulizia proiettili fuori mondo
    this.hearts.children.iterate(obj => {
      const heart = obj as Phaser.Physics.Arcade.Sprite
      if (heart.x < 0 || heart.x > this.level.width) heart.destroy()
      return true
    })
    this.poops.children.iterate(obj => {
      const poop = obj as Phaser.Physics.Arcade.Sprite
      if (poop.y > this.scale.height + 50) poop.destroy()
      return true
    })
  }

  // --- Cacca ---

  private enemiesThrowPoop(): void {
    if (this.levelDone) return
    this.enemies.children.iterate(obj => {
      const e = obj as Phaser.Physics.Arcade.Sprite
      if (!e.getData('angry')) return true
      const dist = Math.abs(e.x - this.player.x)
      if (dist > POOP_RANGE) return true

      const poop = this.poops.create(e.x, e.y - 30, 'poop') as Phaser.Physics.Arcade.Sprite
      // Tiro a parabola verso Adriana
      const dir = Math.sign(this.player.x - e.x) || 1
      poop.setVelocity(dir * Phaser.Math.Between(150, 250), -350)
      poop.setAngularVelocity(dir * 300)
      return true
    })
  }

  // --- Touch ---

  private handleTouch(p: Phaser.Input.Pointer, down: boolean): void {
    const w = this.scale.width
    const h = this.scale.height
    if (p.y < h * 0.5 && down) {
      if (this.player.body!.blocked.down) this.player.setVelocityY(JUMP_VELOCITY)
      this.throwHeart()
      return
    }
    if (p.x < w * 0.5) this.touch.left = down
    else this.touch.right = down
  }

  private throwHeart(): void {
    if (this.levelDone) return
    const heart = this.hearts.create(this.player.x, this.player.y - 10, 'heart') as Phaser.Physics.Arcade.Sprite
    heart.setVelocityX(this.player.flipX ? -HEART_SPEED : HEART_SPEED)
  }

  // --- Conversione ---

  private convertEnemy(heart: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite): void {
    if (!enemy.getData('angry')) {
      // Bambino già buono = ostacolo: il cuoricino si ferma e svanisce
      heart.setVelocity(0, 0)
      this.tweens.add({ targets: heart, alpha: 0, scale: 1.6, duration: 200, onComplete: () => heart.destroy() })
      return
    }
    heart.destroy()
    enemy.setData('angry', false)
    enemy.setTexture('enemy-good')
    enemy.setVelocity(0, 0)
    // Da buono diventa un ostacolo fermo e solido.
    // Niente gravità: un corpo immovable non viene separato dal terreno e affonderebbe.
    enemy.setImmovable(true)
    enemy.setPushable(false)
    ;(enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    gameState.converted++
    this.levelConverted++
    this.updateHUD()
    this.tweens.add({ targets: enemy, y: enemy.y - 20, duration: 200, yoyo: true })
  }

  // --- Danno ---

  private hitPlayer(): void {
    if (this.levelDone) return
    if (this.time.now < this.invulnerableUntil) return
    this.invulnerableUntil = this.time.now + 1500

    loseStar()
    this.updateHUD()
    this.player.setVelocityY(-300)
    this.tweens.add({ targets: this.player, alpha: 0.3, duration: 120, yoyo: true, repeat: 5 })

    if (isGameOver()) {
      this.scene.start('GameOver', { win: false })
    }
  }

  // --- Fine livello: casetta + fuochi d'artificio ---

  private enterHouse(): void {
    if (this.levelDone) return
    this.levelDone = true

    // Adriana entra nella casetta
    this.player.setVelocity(0, 0)
    this.tweens.add({ targets: this.player, alpha: 0, scale: 0.5, x: this.house.x, duration: 500 })

    this.launchFireworks()

    this.time.delayedCall(3000, () => {
      if (nextLevel()) {
        this.scene.restart()
      } else {
        // Dopo il 3° livello: il Boss finale!
        gameState.level++
        this.scene.start('Boss')
      }
    })
  }

  private launchFireworks(): void {
    const h = this.scale.height
    const colors = [0xff4081, 0xffc107, 0x4caf50, 0x40c4ff, 0xea80fc]

    // Una raffica di esplosioni sopra la casetta
    for (let i = 0; i < 7; i++) {
      this.time.delayedCall(i * 350, () => {
        const x = this.house.x + Phaser.Math.Between(-150, 150)
        const y = Phaser.Math.Between(h * 0.15, h * 0.45)
        const emitter = this.add.particles(x, y, Math.random() < 0.5 ? 'star' : 'heart', {
          speed: { min: 100, max: 260 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          lifespan: 900,
          gravityY: 200,
          quantity: 24,
          tint: Phaser.Math.RND.pick(colors),
          emitting: false
        })
        emitter.explode(24)
        this.time.delayedCall(1200, () => emitter.destroy())
      })
    }

    const msg = gameState.level < LEVELS.length ? `Livello ${gameState.level} completato!` : 'Ultimo livello completato!'
    this.add.text(this.scale.width / 2, h * 0.6, msg, {
      fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#e91e63', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20)
  }

  // --- HUD ---

  private createHUD(): void {
    for (let i = 0; i < MAX_STARS; i++) {
      const icon = this.add.image(30 + i * 34, 30, 'star').setScrollFactor(0).setDepth(10)
      this.starIcons.push(icon)
    }
    this.levelText = this.add
      .text(this.scale.width / 2, 20, '', { fontSize: '20px', color: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(10)
    this.convertedText = this.add
      .text(this.scale.width - 20, 20, '', { fontSize: '20px', color: '#fff', fontStyle: 'bold' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10)
    this.updateHUD()
  }

  private updateHUD(): void {
    this.starIcons.forEach((icon, i) => icon.setAlpha(i < gameState.stars ? 1 : 0.25))
    this.levelText.setText(`Livello ${gameState.level}`)
    this.convertedText.setText(`💗 ${this.levelConverted}/${this.totalEnemies}`)
  }
}
