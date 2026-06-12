import Phaser from 'phaser'
import { gameState, loseStar, isGameOver, MAX_STARS } from '../state'

const ARENA_WIDTH = 1800
const PLAYER_SPEED = 220
const JUMP_VELOCITY = -560
const HEART_SPEED = 400
const BOSS_HP = 100          // servono 100 cuoricini per abbatterlo
const BOSS_JUMP_INTERVAL = 2200
const BOSS_POOP_INTERVAL = 1500

export default class BossScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private boss!: Phaser.Physics.Arcade.Sprite
  private hearts!: Phaser.Physics.Arcade.Group
  private poops!: Phaser.Physics.Arcade.Group
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private starIcons: Phaser.GameObjects.Image[] = []
  private hpBar!: Phaser.GameObjects.Graphics
  private bossHp = BOSS_HP
  private invulnerableUntil = 0
  private bossDefeated = false
  private touch = { left: false, right: false }

  constructor() {
    super('Boss')
  }

  create(): void {
    this.bossHp = BOSS_HP
    this.bossDefeated = false
    this.invulnerableUntil = 0
    this.starIcons = []
    this.touch = { left: false, right: false }

    const h = this.scale.height
    this.physics.world.setBounds(0, 0, ARENA_WIDTH, h)

    // Arena: solo terreno, nessuna piattaforma — scontro diretto
    this.platforms = this.physics.add.staticGroup()
    for (let x = 0; x < ARENA_WIDTH; x += 64) {
      this.platforms.create(x + 32, h - 32, 'ground').refreshBody()
    }

    // Adriana
    this.player = this.physics.add.sprite(100, h - 150, 'adriana')
    this.player.setCollideWorldBounds(true)
    this.player.body!.setSize(40, 60).setOffset(4, 4)
    this.physics.add.collider(this.player, this.platforms)

    // Boss Cacca Gigante
    this.boss = this.physics.add.sprite(ARENA_WIDTH - 300, h - 200, 'boss-poop')
    this.boss.setCollideWorldBounds(true)
    this.boss.body!.setSize(140, 115).setOffset(10, 10)
    this.physics.add.collider(this.boss, this.platforms)

    // Salto del boss verso Adriana
    this.time.addEvent({
      delay: BOSS_JUMP_INTERVAL,
      loop: true,
      callback: () => this.bossJump()
    })

    // Raffica di cacche
    this.poops = this.physics.add.group()
    this.time.addEvent({
      delay: BOSS_POOP_INTERVAL,
      loop: true,
      callback: () => this.bossThrowPoops()
    })
    this.physics.add.overlap(this.player, this.poops, (_p, poop) => {
      poop.destroy()
      this.hitPlayer()
    })
    this.physics.add.collider(this.poops, this.platforms, poop => {
      const p = poop as Phaser.Physics.Arcade.Sprite
      p.disableBody(true, false)
      this.tweens.add({ targets: p, alpha: 0, scaleY: 0.4, duration: 400, onComplete: () => p.destroy() })
    })

    // Cuoricini che feriscono il boss
    this.hearts = this.physics.add.group({ allowGravity: false })
    this.physics.add.overlap(this.hearts, this.boss, heart => {
      heart.destroy()
      this.damageBoss()
    })

    // Contatto col boss = danno
    this.physics.add.overlap(this.player, this.boss, () => this.hitPlayer())

    // Camera
    this.cameras.main.setBounds(0, 0, ARENA_WIDTH, h)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // Input tastiera
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.input.keyboard!.on('keydown-SPACE', () => this.throwHeart())

    // Input touch
    this.input.addPointer(2)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handleTouch(p, true))
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.handleTouch(p, false))

    this.createHUD()

    // Annuncio
    this.add.text(this.scale.width / 2, h * 0.2, 'BOSS: LA CACCA GIGANTE! 💩', {
      fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#6d4426', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setAlpha(0.95)
      .setName('announce')
    this.time.delayedCall(2500, () => this.children.getByName('announce')?.destroy())
  }

  update(): void {
    if (this.bossDefeated) return

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

    this.hearts.children.iterate(obj => {
      const heart = obj as Phaser.Physics.Arcade.Sprite
      if (heart.x < 0 || heart.x > ARENA_WIDTH) heart.destroy()
      return true
    })
    this.poops.children.iterate(obj => {
      const poop = obj as Phaser.Physics.Arcade.Sprite
      if (poop.y > this.scale.height + 50) poop.destroy()
      return true
    })
  }

  // --- Boss ---

  private bossJump(): void {
    if (this.bossDefeated || !this.boss.body!.blocked.down) return
    const dir = Math.sign(this.player.x - this.boss.x) || -1
    this.boss.setVelocity(dir * 220, -620)
  }

  private bossThrowPoops(): void {
    if (this.bossDefeated) return
    const count = Phaser.Math.Between(4, 6)
    for (let i = 0; i < count; i++) {
      const poop = this.poops.create(this.boss.x, this.boss.y - 60, 'poop') as Phaser.Physics.Arcade.Sprite
      const dir = Math.sign(this.player.x - this.boss.x) || -1
      poop.setVelocity(
        dir * Phaser.Math.Between(80, 380),
        Phaser.Math.Between(-550, -300)
      )
      poop.setAngularVelocity(dir * 360)
    }
  }

  private damageBoss(): void {
    if (this.bossDefeated) return
    this.bossHp--
    this.updateHpBar()

    // Lampeggio rosa quando colpito
    this.boss.setTintFill(0xff80ab)
    this.time.delayedCall(80, () => this.boss.clearTint())

    if (this.bossHp <= 0) this.defeatBoss()
  }

  private defeatBoss(): void {
    this.bossDefeated = true
    this.boss.disableBody(true, false)
    this.poops.clear(true, true)

    // Il boss esplode in cuoricini!
    const burst = this.add.particles(this.boss.x, this.boss.y, 'heart', {
      speed: { min: 150, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.4, end: 0 },
      lifespan: 1200,
      gravityY: 300,
      emitting: false
    })
    burst.explode(60)
    this.tweens.add({ targets: this.boss, alpha: 0, scale: 0.2, angle: 360, duration: 800 })

    // Fuochi d'artificio finali
    const h = this.scale.height
    const colors = [0xff4081, 0xffc107, 0x4caf50, 0x40c4ff, 0xea80fc]
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(300 + i * 300, () => {
        const x = this.cameras.main.scrollX + Phaser.Math.Between(100, this.scale.width - 100)
        const y = Phaser.Math.Between(h * 0.1, h * 0.5)
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

    this.time.delayedCall(3800, () => this.scene.start('GameOver', { win: true }))
  }

  // --- Adriana ---

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
    if (this.bossDefeated) return
    const heart = this.hearts.create(this.player.x, this.player.y - 10, 'heart') as Phaser.Physics.Arcade.Sprite
    heart.setVelocityX(this.player.flipX ? -HEART_SPEED : HEART_SPEED)
  }

  private hitPlayer(): void {
    if (this.bossDefeated) return
    if (this.time.now < this.invulnerableUntil) return
    this.invulnerableUntil = this.time.now + 1500

    loseStar()
    this.updateHUD()
    this.player.setVelocityY(-300)
    this.player.setVelocityX(this.player.x < this.boss.x ? -250 : 250)
    this.tweens.add({ targets: this.player, alpha: 0.3, duration: 120, yoyo: true, repeat: 5 })

    if (isGameOver()) {
      this.scene.start('GameOver', { win: false })
    }
  }

  // --- HUD ---

  private createHUD(): void {
    for (let i = 0; i < MAX_STARS; i++) {
      const icon = this.add.image(30 + i * 34, 30, 'star').setScrollFactor(0).setDepth(10)
      this.starIcons.push(icon)
    }
    this.add.text(this.scale.width / 2, 16, 'BOSS 💩', {
      fontSize: '16px', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10)

    this.hpBar = this.add.graphics().setScrollFactor(0).setDepth(10)
    this.updateHUD()
    this.updateHpBar()
  }

  private updateHUD(): void {
    this.starIcons.forEach((icon, i) => icon.setAlpha(i < gameState.stars ? 1 : 0.25))
  }

  private updateHpBar(): void {
    const w = 300
    const x = this.scale.width / 2 - w / 2
    this.hpBar.clear()
    this.hpBar.fillStyle(0x000000, 0.5)
    this.hpBar.fillRoundedRect(x - 2, 38, w + 4, 18, 6)
    this.hpBar.fillStyle(0x6d4426, 1)
    this.hpBar.fillRoundedRect(x, 40, Math.max(4, (this.bossHp / BOSS_HP) * w), 14, 5)
  }
}
