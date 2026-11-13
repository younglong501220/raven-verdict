import Phaser from 'phaser';
import { soundFx } from '../audio/soundFx';
import { i18nData, SupportedLang } from '../i18n/translations';

export interface FinalStats {
  enemiesDefeated: number;
  timeSurvivedSeconds: number;
}

export type OutcomeType = 'victory' | 'defeat' | null;

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerProjectiles!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private boss: (Phaser.Physics.Arcade.Sprite & { hp: number; maxHp: number; isBoss: boolean; speed: number; actionTimer: number; isAttacking: boolean }) | null = null;
  private bossText: Phaser.GameObjects.Text | null = null;
  private cursors!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  private playerData = {
    maxHp: 4,
    hp: 4,
    stamina: 100,
    maxStamina: 100,
    astralEnergy: 4,
    maxAstralEnergy: 4,
    speed: 210,
    isRolling: false,
    invulnerable: false,
    rollCooldown: false,
    canAttack: true,
    isCharging: false,
    chargeStartTime: 0,
    damageMultiplier: 1.0
  };

  // Virtual inputs for touch devices
  private virtualVx = 0;
  private virtualVy = 0;
  private aimTarget: { x: number; y: number } | null = null;

  private currentLang: SupportedLang = 'en';
  private onOutcomeCallback?: (outcome: OutcomeType, stats: FinalStats) => void;

  private enemiesDefeatedCount = 0;
  private startTime = 0;
  private isGameOver = false;
  private bossVulnerableUntil = 0;
  private postRollCounterWindowUntil = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  public setCallbacks(onOutcome: (outcome: OutcomeType, stats: FinalStats) => void) {
    this.onOutcomeCallback = onOutcome;
  }

  public setLanguage(lang: SupportedLang) {
    this.currentLang = lang;
    if (this.bossText && this.bossText.active) {
      const bossName = i18nData[lang]?.bossName || "Monolith Sentinel";
      this.bossText.setText(bossName);
    }
  }

  public setVirtualMovement(vx: number, vy: number) {
    this.virtualVx = vx;
    this.virtualVy = vy;
  }

  public setVirtualAim(worldX: number, worldY: number) {
    this.aimTarget = { x: worldX, y: worldY };
  }

  public triggerVirtualRoll() {
    if (this.isGameOver || !this.player || !this.player.active || this.playerData.hp <= 0) return;
    if (this.playerData.stamina >= 25 && !this.playerData.rollCooldown && !this.playerData.isRolling) {
      this.executeRoll(this.virtualVx, this.virtualVy, this.player.rotation);
    }
  }

  public triggerVirtualAttackStart() {
    if (this.isGameOver || !this.player || !this.player.active || this.playerData.hp <= 0) return;
    this.startMeleeCharge();
  }

  public triggerVirtualAttackRelease() {
    if (this.isGameOver || !this.player || !this.player.active || this.playerData.hp <= 0) return;
    this.releaseMeleeAttack();
  }

  public triggerVirtualDagger() {
    if (this.isGameOver || !this.player || !this.player.active || this.playerData.hp <= 0) return;
    this.castAstralDagger();
  }

  public restartGameScene() {
    this.isGameOver = false;
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.scene.restart();
  }

  preload() {
    this.generatePixelAssets();
  }

  private generatePixelAssets() {
    // 1. Arbiter (Raven Knight)
    if (!this.textures.exists('arbiter')) {
      const crowGfx = this.make.graphics({ x: 0, y: 0 });
      crowGfx.fillStyle(0x131720, 1);
      crowGfx.fillCircle(16, 16, 13);
      crowGfx.fillStyle(0x2d3748, 1);
      crowGfx.fillCircle(16, 16, 8);
      crowGfx.fillStyle(0xe67e22, 1);
      crowGfx.fillTriangle(16, 10, 29, 16, 16, 22);
      crowGfx.fillStyle(0x00e5ff, 1);
      crowGfx.fillCircle(18, 14, 2);
      crowGfx.fillCircle(18, 18, 2);
      crowGfx.generateTexture('arbiter', 32, 32);
    }

    // 2. Roll Ghost Trail
    if (!this.textures.exists('arbiter_ghost')) {
      const ghostGfx = this.make.graphics({ x: 0, y: 0 });
      ghostGfx.fillStyle(0x00e5ff, 0.45);
      ghostGfx.fillCircle(16, 16, 12);
      ghostGfx.generateTexture('arbiter_ghost', 32, 32);
    }

    // 3. Normal Melee Slash
    if (!this.textures.exists('slash')) {
      const slashGfx = this.make.graphics({ x: 0, y: 0 });
      slashGfx.lineStyle(4, 0xffffff, 0.95);
      slashGfx.beginPath();
      slashGfx.arc(24, 24, 20, Phaser.Math.DegToRad(-50), Phaser.Math.DegToRad(50), false);
      slashGfx.strokePath();
      slashGfx.lineStyle(2, 0x00e5ff, 0.8);
      slashGfx.beginPath();
      slashGfx.arc(24, 24, 24, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
      slashGfx.strokePath();
      slashGfx.generateTexture('slash', 48, 48);
    }

    // 4. Charged Heavy Slash (Crimson Cleave)
    if (!this.textures.exists('charge_slash')) {
      const chargeSlashGfx = this.make.graphics({ x: 0, y: 0 });
      chargeSlashGfx.lineStyle(6, 0xff3838, 1);
      chargeSlashGfx.beginPath();
      chargeSlashGfx.arc(36, 36, 32, Phaser.Math.DegToRad(-75), Phaser.Math.DegToRad(75), false);
      chargeSlashGfx.strokePath();
      chargeSlashGfx.lineStyle(3, 0xffd32a, 0.9);
      chargeSlashGfx.beginPath();
      chargeSlashGfx.arc(36, 36, 36, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false);
      chargeSlashGfx.strokePath();
      chargeSlashGfx.generateTexture('charge_slash', 72, 72);
    }

    // 5. Astral Dagger
    if (!this.textures.exists('astral_dagger')) {
      const daggerGfx = this.make.graphics({ x: 0, y: 0 });
      daggerGfx.fillStyle(0x00e5ff, 1);
      daggerGfx.beginPath();
      daggerGfx.moveTo(14, 8);
      daggerGfx.lineTo(6, 4);
      daggerGfx.lineTo(2, 8);
      daggerGfx.lineTo(6, 12);
      daggerGfx.closePath();
      daggerGfx.fillPath();
      daggerGfx.fillStyle(0xffffff, 1);
      daggerGfx.fillCircle(7, 8, 2);
      daggerGfx.generateTexture('astral_dagger', 16, 16);
    }

    // 6. Enemy Bullet
    if (!this.textures.exists('enemy_bullet')) {
      const bulletGfx = this.make.graphics({ x: 0, y: 0 });
      bulletGfx.fillStyle(0xff5722, 1);
      bulletGfx.fillCircle(8, 8, 6);
      bulletGfx.fillStyle(0xffeb3b, 1);
      bulletGfx.fillCircle(8, 8, 3);
      bulletGfx.generateTexture('enemy_bullet', 16, 16);
    }

    // 7. Minion Construct
    if (!this.textures.exists('construct')) {
      const mobGfx = this.make.graphics({ x: 0, y: 0 });
      mobGfx.fillStyle(0x374151, 1);
      mobGfx.fillRect(4, 4, 24, 24);
      mobGfx.lineStyle(2, 0x6b7280, 1);
      mobGfx.strokeRect(4, 4, 24, 24);
      mobGfx.fillStyle(0xef4444, 1);
      mobGfx.fillRect(9, 9, 5, 5);
      mobGfx.fillRect(18, 9, 5, 5);
      mobGfx.generateTexture('construct', 32, 32);
    }

    // 8. Boss: Monolith Sentinel
    if (!this.textures.exists('sentinel_boss')) {
      const bossGfx = this.make.graphics({ x: 0, y: 0 });
      bossGfx.fillStyle(0x1f2937, 1);
      bossGfx.fillRect(8, 8, 64, 64);
      bossGfx.lineStyle(4, 0x4b5563, 1);
      bossGfx.strokeRect(8, 8, 64, 64);
      bossGfx.fillStyle(0x10b981, 1);
      bossGfx.fillRect(36, 18, 8, 44);
      bossGfx.fillRect(22, 36, 36, 8);
      bossGfx.fillStyle(0x059669, 1);
      bossGfx.fillRect(14, 14, 6, 6);
      bossGfx.fillRect(60, 14, 6, 6);
      bossGfx.fillRect(14, 60, 6, 6);
      bossGfx.fillRect(60, 60, 6, 6);
      bossGfx.generateTexture('sentinel_boss', 80, 80);
    }

    // 9. Ancient Pillar
    if (!this.textures.exists('pillar')) {
      const pillarGfx = this.make.graphics({ x: 0, y: 0 });
      pillarGfx.fillStyle(0x374151, 1);
      pillarGfx.fillRect(0, 0, 48, 64);
      pillarGfx.fillStyle(0x111827, 1);
      pillarGfx.fillRect(4, 4, 40, 56);
      pillarGfx.lineStyle(2, 0x4b5563, 1);
      pillarGfx.strokeRect(4, 4, 40, 56);
      pillarGfx.lineStyle(2, 0x00e5ff, 0.4);
      pillarGfx.lineBetween(24, 12, 24, 52);
      pillarGfx.lineBetween(14, 32, 34, 32);
      pillarGfx.generateTexture('pillar', 48, 64);
    }

    // 10. Soul Ember Particle (pre-baked texture)
    if (!this.textures.exists('soul_ember')) {
      const emberGfx = this.make.graphics({ x: 0, y: 0 });
      emberGfx.fillStyle(0xffffff, 1);
      emberGfx.fillCircle(4, 4, 3.5);
      emberGfx.generateTexture('soul_ember', 8, 8);
    }

    // 11. Shockwave Ring (pre-baked texture)
    if (!this.textures.exists('shockwave_ring')) {
      const ringGfx = this.make.graphics({ x: 0, y: 0 });
      ringGfx.lineStyle(2, 0xffffff, 1);
      ringGfx.strokeCircle(16, 16, 14);
      ringGfx.generateTexture('shockwave_ring', 32, 32);
    }
  }

  create() {
    this.isGameOver = false;
    this.enemiesDefeatedCount = 0;
    this.startTime = this.time.now;

    const worldWidth = 1600;
    const worldHeight = 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.drawIsometricFloor(worldWidth, worldHeight);

    this.obstacles = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();

    this.createArenaLayout();

    // Spawn Player Arbiter
    this.player = this.physics.add.sprite(300, 600, 'arbiter');
    this.player.setCollideWorldBounds(true);
    this.player.setCircle(12, 4, 4);
    this.player.setDrag(1200, 1200);

    this.playerData = {
      maxHp: 4,
      hp: 4,
      stamina: 100,
      maxStamina: 100,
      astralEnergy: 4,
      maxAstralEnergy: 4,
      speed: 210,
      isRolling: false,
      invulnerable: false,
      rollCooldown: false,
      canAttack: true,
      isCharging: false,
      chargeStartTime: 0,
      damageMultiplier: 1.0
    };

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Spawn Enemies
    this.spawnConstructs();
    this.spawnSentinelBoss(1200, 600);

    // Physics Collisions
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.enemies, this.obstacles);

    if (this.boss) {
      this.physics.add.collider(this.boss, this.obstacles, () => {
        if (this.boss && this.boss.active && this.boss.isAttacking) {
          this.boss.setVelocity(0, 0);
        }
      });
    }

    this.physics.add.overlap(this.playerProjectiles, this.enemies, this.onProjectileHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.playerProjectiles, this.obstacles, ((proj: Phaser.GameObjects.GameObject) => {
      if (proj && proj.active) proj.destroy();
    }) as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    this.physics.add.overlap(this.enemyProjectiles, this.player, this.onEnemyHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.enemyProjectiles, this.obstacles, ((proj: Phaser.GameObjects.GameObject) => {
      if (proj && proj.active) proj.destroy();
    }) as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    this.physics.add.overlap(this.player, this.enemies, this.onContactPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    // Keyboard controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
      }) as typeof this.cursors;
    }

    // Pointer controls
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (pointer.leftButtonDown()) {
        this.startMeleeCharge();
      } else if (pointer.rightButtonDown()) {
        this.castAstralDagger();
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (pointer.button === 0 && this.playerData.isCharging) {
        this.releaseMeleeAttack();
      }
    });

    this.updateBarsUI();
  }

  private drawIsometricFloor(w: number, h: number) {
    const floorGfx = this.add.graphics();
    const tileSize = 64;
    for (let x = 0; x < w; x += tileSize) {
      for (let y = 0; y < h; y += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        floorGfx.fillStyle(isEven ? 0x11161d : 0x0c0f14, 1);
        floorGfx.fillRect(x, y, tileSize, tileSize);
        floorGfx.lineStyle(1, 0x1c2430, 0.4);
        floorGfx.strokeRect(x, y, tileSize, tileSize);
      }
    }
    floorGfx.lineStyle(6, 0x3b82f6, 0.25);
    floorGfx.strokeRect(4, 4, w - 8, h - 8);
  }

  private createArenaLayout() {
    const pillarCoords = [
      [500, 350], [500, 850], [900, 350], [900, 850],
      [700, 200], [700, 1000], [1350, 400], [1350, 800]
    ];
    pillarCoords.forEach(([x, y]) => {
      const pillar = this.obstacles.create(x, y, 'pillar') as Phaser.Physics.Arcade.Sprite;
      pillar.setImmovable(true);
      (pillar.body as Phaser.Physics.Arcade.StaticBody).setSize(40, 40).setOffset(4, 20);
    });
  }

  private spawnConstructs() {
    const coords = [[650, 450], [650, 750], [400, 400], [950, 600]];
    coords.forEach(([x, y]) => {
      const mob = this.enemies.create(x, y, 'construct') as Phaser.Physics.Arcade.Sprite & { hp: number; isBoss: boolean; speed: number };
      mob.hp = 3;
      mob.isBoss = false;
      mob.speed = 110;
      mob.setCollideWorldBounds(true);
    });
  }

  private spawnSentinelBoss(x: number, y: number) {
    this.boss = this.enemies.create(x, y, 'sentinel_boss') as typeof this.boss;
    if (!this.boss) return;

    this.boss.hp = 30;
    this.boss.maxHp = 30;
    this.boss.isBoss = true;
    this.boss.speed = 85;
    this.boss.setCollideWorldBounds(true);
    this.boss.setMass(100);
    this.boss.actionTimer = 0;
    this.boss.isAttacking = false;

    const bossName = i18nData[this.currentLang]?.bossName || "Monolith Sentinel";
    this.bossText = this.add.text(x, y - 55, bossName, {
      fontSize: '12px',
      fontFamily: 'monospace, sans-serif',
      color: '#10b981',
      backgroundColor: 'rgba(10, 15, 20, 0.75)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);
  }

  update(_time: number, delta: number) {
    if (this.isGameOver || !this.player || !this.player.active || this.playerData.hp <= 0) return;

    this.handlePlayerMovement();
    this.handleStaminaRegen();
    this.handleEnemiesAI(delta);

    // Auto-release charge if mouse button was released outside the canvas
    if (this.playerData.isCharging && this.input.activePointer && !this.input.activePointer.isDown) {
      this.releaseMeleeAttack();
    }

    if (this.boss && this.boss.active && this.bossText && this.bossText.active) {
      this.bossText.setPosition(this.boss.x, this.boss.y - 55);
    }
  }

  private handlePlayerMovement() {
    if (this.playerData.isRolling || !this.player || !this.player.active) return;

    let vx = this.virtualVx;
    let vy = this.virtualVy;

    if (this.cursors) {
      if (this.cursors.left.isDown) vx -= 1;
      if (this.cursors.right.isDown) vx += 1;
      if (this.cursors.up.isDown) vy -= 1;
      if (this.cursors.down.isDown) vy += 1;
    }

    let targetAngle = this.player.rotation;
    if (this.aimTarget) {
      targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.aimTarget.x, this.aimTarget.y);
    } else if (this.input.activePointer) {
      targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
    }
    this.player.rotation = Number.isFinite(targetAngle) ? targetAngle : 0;

    if (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      if (this.playerData.stamina >= 25 && !this.playerData.rollCooldown) {
        this.executeRoll(vx, vy, this.player.rotation);
        return;
      }
    }

    if (vx !== 0 || vy !== 0) {
      const speed = this.playerData.isCharging ? this.playerData.speed * 0.5 : this.playerData.speed;
      const dir = new Phaser.Math.Vector2(vx, vy).normalize().scale(speed);
      this.player.setVelocity(dir.x, dir.y);
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  private executeRoll(vx: number, vy: number, targetAngle: number) {
    if (!this.player || !this.player.active) return;
    this.playerData.isRolling = true;
    this.playerData.invulnerable = true;
    this.playerData.stamina -= 25;
    soundFx.playDodge();
    this.updateBarsUI();

    let rollVector: Phaser.Math.Vector2;
    if (vx !== 0 || vy !== 0) {
      rollVector = new Phaser.Math.Vector2(vx, vy).normalize();
    } else {
      const safeAngle = Number.isFinite(targetAngle) ? targetAngle : 0;
      rollVector = new Phaser.Math.Vector2(Math.cos(safeAngle), Math.sin(safeAngle));
    }

    const rollSpeed = 500;
    this.player.setVelocity(rollVector.x * rollSpeed, rollVector.y * rollSpeed);

    // If player rolls while Boss is attacking within proximity, trigger Boss Stagger
    if (this.boss && this.boss.active && this.boss.isAttacking) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
      if (dist < 260) {
        this.triggerBossStagger();
      }
    }

    const ghostTimer = this.time.addEvent({
      delay: 45,
      repeat: 4,
      callback: () => {
        if (!this.player || !this.player.active) return;
        const ghost = this.add.sprite(this.player.x, this.player.y, 'arbiter_ghost');
        ghost.rotation = this.player.rotation;
        this.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 180,
          onComplete: () => ghost.destroy()
        });
      }
    });

    this.time.delayedCall(220, () => {
      this.playerData.invulnerable = false;
    });

    this.time.delayedCall(260, () => {
      this.playerData.isRolling = false;
      if (this.player && this.player.active) {
        this.player.setVelocity(0, 0);
      }
      if (ghostTimer) {
        ghostTimer.remove(false);
      }
      // Activate 500ms post-roll counter damage window
      this.postRollCounterWindowUntil = this.time.now + 500;
    });
  }

  private startMeleeCharge() {
    if (!this.playerData.canAttack || this.playerData.isRolling) return;
    this.playerData.isCharging = true;
    this.playerData.chargeStartTime = this.time.now;
    this.toggleChargeUI(true);
  }

  private releaseMeleeAttack() {
    if (!this.playerData.isCharging) return;
    this.playerData.isCharging = false;
    this.toggleChargeUI(false);
    const chargeDuration = this.time.now - this.playerData.chargeStartTime;
    const isCharged = chargeDuration > 450;
    this.executeMeleeSwing(isCharged);
  }

  private executeMeleeSwing(isCharged: boolean) {
    if (!this.player || !this.player.active) return;
    this.playerData.canAttack = false;
    const angle = Number.isFinite(this.player.rotation) ? this.player.rotation : 0;
    const reach = isCharged ? 52 : 36;
    const damage = isCharged ? 3 : 1;
    const slashTexture = isCharged ? 'charge_slash' : 'slash';

    if (isCharged) {
      soundFx.playHeavySlash();
      this.cameras.main.shake(120, 0.012);
    } else {
      soundFx.playSlash();
    }

    const hx = this.player.x + Math.cos(angle) * reach;
    const hy = this.player.y + Math.sin(angle) * reach;

    const slash = this.add.sprite(hx, hy, slashTexture);
    slash.rotation = angle;
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.25,
      duration: 140,
      onComplete: () => slash.destroy()
    });

    const stepVec = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(isCharged ? 160 : 90);
    this.player.setVelocity(stepVec.x, stepVec.y);

    const targetList = [...this.enemies.getChildren()];
    targetList.forEach((rawEnemy) => {
      const enemy = rawEnemy as Phaser.Physics.Arcade.Sprite & { hp: number; isBoss?: boolean };
      if (!enemy || !enemy.active) return;

      const dist = Phaser.Math.Distance.Between(hx, hy, enemy.x, enemy.y);
      const hitRadius = isCharged ? 55 : 36;
      if (dist < hitRadius) {
        this.damageEnemy(enemy, damage, angle);
        if (this.playerData.astralEnergy < this.playerData.maxAstralEnergy) {
          this.playerData.astralEnergy++;
          this.updateBarsUI();
        }
      }
    });

    this.time.delayedCall(isCharged ? 320 : 200, () => {
      this.playerData.canAttack = true;
    });
  }

  private castAstralDagger() {
    if (this.playerData.astralEnergy <= 0 || this.playerData.isRolling || !this.player || !this.player.active) return;
    this.playerData.astralEnergy--;
    soundFx.playAstralDagger();
    this.updateBarsUI();

    const angle = Number.isFinite(this.player.rotation) ? this.player.rotation : 0;
    const dagger = this.playerProjectiles.create(this.player.x, this.player.y, 'astral_dagger') as Phaser.Physics.Arcade.Sprite & { damage: number };
    dagger.damage = 2;
    dagger.rotation = angle;
    const speed = 480;
    dagger.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.time.delayedCall(1200, () => {
      if (dagger && dagger.active) dagger.destroy();
    });
  }

  private handleStaminaRegen() {
    if (this.playerData.stamina < this.playerData.maxStamina) {
      const prev = Math.floor(this.playerData.stamina);
      this.playerData.stamina = Math.min(this.playerData.maxStamina, this.playerData.stamina + 0.6);
      const curr = Math.floor(this.playerData.stamina);
      if (prev !== curr || this.playerData.stamina >= this.playerData.maxStamina) {
        this.updateBarsUI();
      }
    }
  }

  private handleEnemiesAI(delta: number) {
    if (!this.player || !this.player.active) return;

    const enemyList = [...this.enemies.getChildren()];
    enemyList.forEach((rawEnemy) => {
      const enemy = rawEnemy as Phaser.Physics.Arcade.Sprite & { hp: number; isBoss?: boolean; speed: number; actionTimer?: number; isAttacking?: boolean };
      if (!enemy || !enemy.active) return;

      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

      if (enemy.isBoss && this.boss && this.boss === enemy) {
        this.updateBossBehavior(this.boss, delta);
      } else {
        if (distToPlayer < 400) {
          const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
          if (Number.isFinite(angle)) {
            enemy.setVelocity(Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
          }
        } else {
          enemy.setVelocity(0, 0);
        }
      }
    });
  }

  private updateBossBehavior(boss: NonNullable<typeof this.boss>, delta: number) {
    if (!boss || !boss.active || !this.player || !this.player.active) return;
    boss.actionTimer = (boss.actionTimer || 0) + delta;

    const cooldown = boss.hp < 15 ? 2600 : 3500;

    if (boss.actionTimer > cooldown) {
      boss.actionTimer = 0;
      const rand = Math.random();
      if (rand < 0.5) {
        this.bossChargeAttack(boss);
      } else {
        this.bossBarrageAttack(boss);
      }
    }

    if (!boss.isAttacking) {
      const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
      if (Number.isFinite(angle)) {
        boss.setVelocity(Math.cos(angle) * boss.speed, Math.sin(angle) * boss.speed);
      }
    }
  }

  private bossChargeAttack(boss: NonNullable<typeof this.boss>) {
    boss.isAttacking = true;
    boss.setVelocity(0, 0);
    boss.setTint(0xff3333);
    soundFx.playBossRoar();

    this.time.delayedCall(700, () => {
      if (!boss || !boss.active || !this.player || !this.player.active) return;
      const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
      if (Number.isFinite(angle)) {
        boss.setVelocity(Math.cos(angle) * 440, Math.sin(angle) * 440);
      }

      this.time.delayedCall(650, () => {
        if (!boss || !boss.active) return;
        boss.clearTint();
        boss.setVelocity(0, 0);
        boss.isAttacking = false;
      });
    });
  }

  private bossBarrageAttack(boss: NonNullable<typeof this.boss>) {
    boss.isAttacking = true;
    boss.setVelocity(0, 0);
    soundFx.playBossBarrage();

    const isEnraged = boss.hp < 15;
    const bulletsCount = isEnraged ? 16 : 12;
    const angleStep = (Math.PI * 2) / bulletsCount;

    for (let i = 0; i < bulletsCount; i++) {
      const angle = i * angleStep;
      const proj = this.enemyProjectiles.create(boss.x, boss.y, 'enemy_bullet') as Phaser.Physics.Arcade.Sprite;
      const speed = isEnraged ? 210 : 180;
      proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      this.time.delayedCall(2400, () => {
        if (proj && proj.active) proj.destroy();
      });
    }

    this.time.delayedCall(500, () => {
      if (boss && boss.active) {
        boss.isAttacking = false;
      }
    });
  }

  private triggerBossStagger() {
    if (!this.boss || !this.boss.active || this.isGameOver) return;
    if (this.time.now <= this.bossVulnerableUntil) return;

    this.bossVulnerableUntil = this.time.now + 500;
    soundFx.playStagger();
    this.boss.setTint(0xffd700);

    const staggerLabel = i18nData[this.currentLang]?.bossStaggered || "STAGGERED!";
    this.showFloatingText(this.boss.x, this.boss.y - 70, staggerLabel, '#ffd700', '13px');

    this.time.delayedCall(500, () => {
      if (this.boss && this.boss.active && this.time.now >= this.bossVulnerableUntil) {
        this.boss.clearTint();
      }
    });
  }

  private showFloatingText(x: number, y: number, text: string, color: string, fontSize: string = '12px') {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const txt = this.add.text(x, y, text, {
      fontSize: fontSize,
      fontFamily: 'serif, monospace',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 28,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        txt.destroy();
      }
    });
  }

  private damageEnemy(enemy: Phaser.Physics.Arcade.Sprite & { hp: number; isBoss?: boolean }, baseDamage: number, hitAngle: number) {
    if (!enemy || !enemy.active) return;

    // Check if attack occurs within 500ms post-roll window or boss vulnerability window
    const isPostRoll = this.time.now <= this.postRollCounterWindowUntil;
    const isBossVulnerable = enemy.isBoss && this.time.now <= this.bossVulnerableUntil;
    const isCounter = isPostRoll || isBossVulnerable;

    // Set damageMultiplier property and apply to damage calculation
    const damageMultiplier = isCounter ? 1.5 : 1.0;
    this.playerData.damageMultiplier = damageMultiplier;
    const finalDamage = baseDamage * this.playerData.damageMultiplier;

    if (damageMultiplier > 1.0) {
      soundFx.playCounterHit();
      this.cameras.main.shake(140, 0.015);

      const counterLabel = i18nData[this.currentLang]?.counterHit || "COUNTER STRIKE 1.5x!";
      this.showFloatingText(enemy.x, enemy.y - 85, `${counterLabel} -${finalDamage.toFixed(1)}`, '#fbbf24', '15px');

      if (enemy.isBoss) {
        this.bossVulnerableUntil = 0;
        enemy.clearTint();
      }
    } else {
      soundFx.playEnemyHit();
      this.cameras.main.shake(80, 0.008);
      this.showFloatingText(enemy.x, enemy.y - 65, `-${finalDamage}`, '#ffffff', '12px');
    }

    enemy.hp -= finalDamage;

    const safeAngle = Number.isFinite(hitAngle) ? hitAngle : 0;
    if (!enemy.isBoss) {
      enemy.setVelocity(Math.cos(safeAngle) * 260, Math.sin(safeAngle) * 260);
    } else if (damageMultiplier > 1.0) {
      enemy.setVelocity(Math.cos(safeAngle) * 130, Math.sin(safeAngle) * 130);
    }

    enemy.setTint(damageMultiplier > 1.0 ? 0xffea00 : 0xffffff);
    this.time.delayedCall(80, () => {
      if (enemy && enemy.active) enemy.clearTint();
    });

    this.updateBarsUI();

    if (enemy.hp <= 0) {
      this.enemiesDefeatedCount++;
      const ex = enemy.x;
      const ey = enemy.y;
      const isBoss = !!enemy.isBoss;

      if (isBoss && this.bossText && this.bossText.active) {
        this.bossText.destroy();
      }
      enemy.destroy();
      this.createDeathFX(ex, ey, isBoss);

      if (isBoss) {
        this.isGameOver = true;
        soundFx.playVictory();
        this.finishGame('victory');
      }
    }
  }

  /**
   * Soul embers dispersion particle effect:
   * Uses circular particles from pre-baked texture, diffusing via random vectors
   * and easing both alpha and scale for an ethereal soul dissolution death animation.
   */
  public createDeathFX(x: number, y: number, isBossOrCount: boolean | number = false) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const isBoss = typeof isBossOrCount === 'boolean' ? isBossOrCount : isBossOrCount > 10;

    // 1. Expanding Ethereal Shockwave Ring Sprite
    const ring = this.add.sprite(x, y, 'shockwave_ring');
    ring.setTint(isBoss ? 0xf59e0b : 0x00e5ff);
    ring.setScale(0.35);
    ring.setAlpha(0.95);
    this.tweens.add({
      targets: ring,
      scale: isBoss ? 3.2 : 1.7,
      alpha: 0,
      duration: isBoss ? 480 : 320,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ring.destroy();
      }
    });

    // 2. Soul Embers Particle System (Circular particles with random vectors & easing alpha + scale)
    const emberColors = [0x00e5ff, 0x38bdf8, 0xfde047, 0xffffff, 0xa78bfa, 0x34d399];
    const particleCount = isBoss ? 20 : 10;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.sprite(x, y, 'soul_ember');
      const color = emberColors[i % emberColors.length];
      particle.setTint(color);
      particle.setScale(isBoss ? 1.25 : 0.85);

      // Random vector dispersion
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = isBoss ? Phaser.Math.FloatBetween(60, 170) : Phaser.Math.FloatBetween(35, 110);
      const dispersionVector = new Phaser.Math.Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Buoyant soul lift (floating upward drift against gravity)
      const upwardDrift = Phaser.Math.FloatBetween(25, 55);
      dispersionVector.y -= upwardDrift;

      const duration = isBoss ? Phaser.Math.Between(450, 750) : Phaser.Math.Between(320, 560);

      // Tween position, easing both alpha and scale for ethereal dissolution
      this.tweens.add({
        targets: particle,
        x: x + dispersionVector.x,
        y: y + dispersionVector.y,
        scale: 0.1,
        alpha: 0,
        duration: duration,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  public enemyDeathFX(x: number, y: number, isBoss: boolean) {
    this.createDeathFX(x, y, isBoss);
  }

  private onProjectileHitEnemy(
    rawProj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    rawEnemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const proj = rawProj as Phaser.Physics.Arcade.Sprite & { damage?: number };
    const enemy = rawEnemy as Phaser.Physics.Arcade.Sprite & { hp: number; isBoss?: boolean };

    if (!proj || !proj.active || !enemy || !enemy.active) return;
    const damage = proj.damage || 2;
    const px = proj.x;
    const py = proj.y;
    proj.destroy();

    const angle = Phaser.Math.Angle.Between(px, py, enemy.x, enemy.y);
    const safeAngle = Number.isFinite(angle) ? angle : 0;
    this.damageEnemy(enemy, damage, safeAngle);
  }

  private onContactPlayer(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    rawEnemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const enemy = rawEnemy as Phaser.Physics.Arcade.Sprite & { isBoss?: boolean; isAttacking?: boolean };
    if (this.playerData.invulnerable) {
      if (enemy && enemy.isBoss && enemy.isAttacking) {
        this.triggerBossStagger();
      }
      return;
    }
    this.hurtPlayer();
  }

  private onEnemyHitPlayer(
    rawProj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const proj = rawProj as Phaser.Physics.Arcade.Sprite;
    if (proj && proj.active) {
      if (this.playerData.invulnerable) {
        this.triggerBossStagger();
        proj.destroy();
        return;
      }
      proj.destroy();
    }
    this.hurtPlayer();
  }

  private hurtPlayer() {
    if (this.playerData.invulnerable || this.playerData.hp <= 0 || this.isGameOver || !this.player || !this.player.active) return;

    this.playerData.hp -= 1;
    this.playerData.invulnerable = true;
    soundFx.playPlayerHurt();
    this.updateBarsUI();

    this.cameras.main.shake(160, 0.015);
    this.player.setTint(0xff0000);

    this.time.delayedCall(800, () => {
      this.playerData.invulnerable = false;
      if (this.player && this.player.active) {
        this.player.clearTint();
      }
    });

    if (this.playerData.hp <= 0) {
      this.isGameOver = true;
      soundFx.playDefeat();
      this.finishGame('defeat');
    }
  }

  private finishGame(outcome: OutcomeType) {
    const timeSurvived = Math.floor((this.time.now - this.startTime) / 1000);
    this.onOutcomeCallback?.(outcome, {
      enemiesDefeated: this.enemiesDefeatedCount,
      timeSurvivedSeconds: timeSurvived
    });
  }

  // Ultra-fast direct DOM update for bars (0ms latency, zero React re-render)
  public updateBarsUI() {
    const hpText = document.getElementById('hp-text');
    const hpFill = document.getElementById('hp-fill');
    if (hpText) hpText.innerText = `${Math.max(0, this.playerData.hp)} / ${this.playerData.maxHp}`;
    if (hpFill) hpFill.style.width = `${Math.max(0, (this.playerData.hp / this.playerData.maxHp) * 100)}%`;

    const staminaText = document.getElementById('stamina-text');
    const staminaFill = document.getElementById('stamina-fill');
    if (staminaText) staminaText.innerText = `${Math.floor(this.playerData.stamina)}%`;
    if (staminaFill) staminaFill.style.width = `${(this.playerData.stamina / this.playerData.maxStamina) * 100}%`;

    const astralText = document.getElementById('astral-text');
    if (astralText) astralText.innerText = `${this.playerData.astralEnergy} / ${this.playerData.maxAstralEnergy}`;
    
    for (let i = 0; i < this.playerData.maxAstralEnergy; i++) {
      const slot = document.getElementById(`astral-slot-${i}`);
      if (slot) {
        if (i < this.playerData.astralEnergy) {
          slot.className = "flex-1 h-2 rounded-xs border bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#00e5ff] transition-all duration-150";
        } else {
          slot.className = "flex-1 h-2 rounded-xs border bg-[#18212e] border-[#293648] transition-all duration-150";
        }
      }
    }

    // Boss bar
    const bossFill = document.getElementById('boss-hp-fill');
    const bossText = document.getElementById('boss-hp-text');
    const bossBox = document.getElementById('boss-hud-container');
    if (this.boss && this.boss.active && this.boss.hp > 0) {
      if (bossBox) bossBox.style.display = 'flex';
      const pct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
      if (bossFill) bossFill.style.width = `${pct}%`;
      if (bossText) bossText.innerText = `${Math.max(0, this.boss.hp)} / ${this.boss.maxHp}`;
    } else {
      if (bossBox) bossBox.style.display = 'none';
    }
  }

  private toggleChargeUI(isCharging: boolean) {
    const banner = document.getElementById('charge-banner');
    if (banner) {
      banner.style.display = isCharging ? 'flex' : 'none';
    }
  }
}
