// ─────────────────────────────────────────────
//  GameScene — core gameplay (all 5 levels)
//  Gunsmoke-style: walk up the campus street,
//  boss waits at the stadium gate at the top.
// ─────────────────────────────────────────────
class GameScene extends Phaser.Scene {

    constructor() { super('GameScene'); }

    init(data) {
        this.levelIndex  = data.levelIndex || 0;
        this.playerScore = data.score      || 0;
        this.playerHP    = data.hp         != null ? data.hp : C.P_HEALTH;
        this.playerLives = data.lives      != null ? data.lives : C.P_LIVES;
    }

    create() {
        this.levelData     = LEVEL_DATA[this.levelIndex];
        this.levelComplete = false;
        this.bossActivated = false;

        this._buildMap();
        this._spawnPlayer();
        this._spawnEnemies();
        this._spawnBoss();
        this._setupCamera();
        this._setupCollisions();
        this._createHUD();

        this.events.on('player-dead',  () => this._onPlayerDead());
        this.events.on('enemy-killed', pts => this.player.addScore(pts));
        this.events.on('boss-killed',  (pts) => {
            this.player.addScore(pts);
            this._onBossKilled();
        });
        this.events.on('player-hurt',   hp       => this._hudUpdateHearts(hp));
        this.events.on('score-changed', s        => this._hudUpdateScore(s));
        this.events.on('boss-hurt',     (hp,max) => this._hudUpdateBossBar(hp, max));
        this.events.on('boss-phase2',   ()       => this._hudBossPhase2());

        this._showLevelIntro();
    }

    // ── Map ───────────────────────────────────
    _buildMap() {
        const ld  = this.levelData;
        const map = ld.map;
        const T   = C.TILE;
        const ROWS = map.length;
        const COLS = map[0].length;

        this.mapWidth  = COLS * T;
        this.mapHeight = ROWS * T;

        this.walls = this.physics.add.staticGroup();
        const SOLID = new Set([1, 4, 5, 6, 7]);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const tileIdx = map[row][col];
                const wx = col * T + T / 2;
                const wy = row * T + T / 2;

                const key = `tile_${tileIdx}`;
                const img = this.add.image(wx, wy, key).setDepth(C.Z_FLOOR);

                if (tileIdx === 7 && ld.gateColor)     img.setTint(ld.gateColor);
                if (tileIdx === 6 && ld.buildingColor) img.setTint(ld.buildingColor);

                if (SOLID.has(tileIdx)) {
                    this.physics.add.existing(img, true);
                    this.walls.add(img);
                }
            }
        }
    }

    // ── Player ────────────────────────────────
    _spawnPlayer() {
        const ps = this.levelData.playerStart;
        const T  = C.TILE;
        this.player = new Player(this, ps.x * T + T/2, ps.y * T + T/2);
        this.player.health = this.playerHP;
        this.player.score  = this.playerScore;
    }

    // ── Enemies ───────────────────────────────
    _spawnEnemies() {
        const ld   = this.levelData;
        const T    = C.TILE;
        const team = this._teamName();
        this.enemies = this.physics.add.group();

        ld.enemies.forEach(e => {
            const sprite = e.type === 'fan' ? `fan_${team}` : ld.minionSprite;
            const cfg = e.type === 'fan'
                ? { sprite, health:C.E_HEALTH,   speed:C.E_SPEED,    damage:1, points:100 }
                : { sprite, health:C.E_HEALTH+1, speed:C.E_SPEED+12, damage:1, points:200 };
            const enemy = new Enemy(this, e.x * T + T/2, e.y * T + T/2, cfg);
            this.enemies.add(enemy);
        });
    }

    _teamName() {
        return ['georgia','tennessee','kentucky','texas','alabama'][this.levelIndex] || 'georgia';
    }

    // ── Boss ──────────────────────────────────
    _spawnBoss() {
        const ld = this.levelData;
        const T  = C.TILE;
        const bp = ld.bossPos;

        this.projectiles = this.physics.add.group();
        this.boss = new Boss(this, bp.x * T + T/2, bp.y * T + T/2, {
            sprite:    ld.bossSprite,
            projColor: ld.bossProjectileColor,
        });
    }

    // ── Camera ────────────────────────────────
    _setupCamera() {
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.fadeIn(500);
    }

    // ── Collisions ────────────────────────────
    _setupCollisions() {
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.boss,    this.walls);
        this.physics.add.collider(this.enemies, this.enemies);

        this.physics.add.overlap(
            this.player.attackBox, this.enemies,
            (box, enemy) => {
                if (!this.player.isAttacking || !enemy.active) return;
                const killed = enemy.takeDamage(C.P_ATTACK_DMG, this.player.x, this.player.y);
                if (killed) this._scorePopup(enemy.x, enemy.y, enemy.pointValue);
            }
        );

        this.physics.add.overlap(
            this.player.attackBox, this.boss,
            (box, boss) => {
                if (!this.player.isAttacking || !boss.active || !boss.activated) return;
                boss.takeDamage(C.P_ATTACK_DMG, this.player.x, this.player.y);
            }
        );

        this.physics.add.overlap(
            this.player, this.projectiles,
            (player, proj) => {
                player.takeDamage(proj.damage || C.B_DMG, proj.x, proj.y);
                proj.destroy();
            }
        );

        this.physics.add.collider(this.projectiles, this.walls, (proj) => proj.destroy());
    }

    // ── Update ────────────────────────────────
    update(time, delta) {
        if (this.levelComplete) return;

        this.player.update(time, delta);

        this.enemies.getChildren().forEach(e => {
            if (e.active) e.update(time, delta, this.player);
        });

        if (this.boss && this.boss.active) {
            this.boss.update(time, delta, this.player);
        }

        if (!this.bossActivated && this.boss && this.boss.active && !this.player.isDead) {
            const plazaY = 9 * C.TILE;
            if (this.player.y < plazaY) {
                this.bossActivated = true;
                this._showBossIntro();
            }
        }
    }

    // ── HUD (screen-fixed, scroll factor 0) ───
    _createHUD() {
        const w = C.GAME_W, h = C.GAME_H;
        const d = C.Z_HUD;

        // Top bar background
        this.add.graphics()
            .fillStyle(0x000000, 0.7).fillRect(0, 0, w, 18)
            .setScrollFactor(0).setDepth(d);

        // Hearts
        this._hudHearts = [];
        for (let i = 0; i < C.P_HEALTH; i++) {
            const hrt = this.add.image(8 + i * 12, 9, 'heart_full')
                .setOrigin(0.5).setScrollFactor(0).setDepth(d);
            this._hudHearts.push(hrt);
        }
        this._hudUpdateHearts(this.playerHP);

        // Score
        this._hudScoreTxt = this.add.text(w - 4, 4, '', {
            fontFamily:'monospace', fontSize:'6px', color:'#ffffff',
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(d);
        this._hudUpdateScore(this.playerScore);

        // Lives — small Albert icons right of hearts
        this._hudLifeIcons = [];
        for (let i = 0; i < C.P_LIVES; i++) {
            const icon = this.add.image(84 + i * 10, 9, 'albert_down')
                .setOrigin(0.5).setScale(0.5)
                .setScrollFactor(0).setDepth(d);
            this._hudLifeIcons.push(icon);
        }
        this._hudUpdateLives(this.playerLives);

        // Level name
        this.add.text(w/2, 4, this.levelData.name, {
            fontFamily:'monospace', fontSize:'6px', color:'#f77f00',
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d);

        // Boss bar (hidden until boss fight)
        this._hudBossBarBg = this.add.graphics().setScrollFactor(0).setDepth(d);
        this._hudBossBarFg = this.add.graphics().setScrollFactor(0).setDepth(d);
        this._hudBossTxt   = this.add.text(w/2, h - 18, '', {
            fontFamily:'monospace', fontSize:'6px', color:'#ff4444',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(d);
    }

    _hudUpdateHearts(hp) {
        this._hudHearts.forEach((h, i) => {
            h.setTexture(i < hp ? 'heart_full' : 'heart_empty');
        });
    }

    _hudUpdateScore(s) {
        this._hudScoreTxt.setText('SCORE  ' + String(s).padStart(6, '0'));
    }

    _hudUpdateLives(lives) {
        this._hudLifeIcons.forEach((icon, i) => icon.setVisible(i < lives));
    }

    _hudUpdateBossBar(hp, max) {
        const bw = Math.max(0, Math.floor((hp / max) * (C.GAME_W - 40)));
        const y  = C.GAME_H - 14;
        this._hudBossBarBg.clear().fillStyle(0x000000, 0.8).fillRect(20, y, C.GAME_W - 40, 6);
        this._hudBossBarFg.clear().fillStyle(0xdd2222).fillRect(20, y, bw, 6);
    }

    _hudHideBossBar() {
        this._hudBossBarBg.clear();
        this._hudBossBarFg.clear();
        this._hudBossTxt.setText('');
    }

    _hudShowBossName(name) {
        this._hudBossTxt.setText(name).setColor('#ff4444').setAlpha(1);
    }

    _hudBossPhase2() {
        this._hudBossTxt.setColor('#ff8800');
        this.tweens.add({ targets: this._hudBossTxt, alpha: 0, yoyo: true, repeat: 3, duration: 200 });
    }

    // ── Intro / UI ────────────────────────────
    _showLevelIntro() {
        const ld = this.levelData;
        const [W, H] = [C.GAME_W, C.GAME_H];

        const ov = this.add.graphics()
            .fillStyle(0x000000, 0.75).fillRect(0, 0, W, H)
            .setScrollFactor(0).setDepth(50);

        const t1 = this.add.text(W/2, H/2 - 24, `LEVEL ${this.levelIndex + 1}`, {
            fontFamily:'monospace', fontSize:'18px', color:'#f77f00',
            stroke:'#000000', strokeThickness:2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        const t2 = this.add.text(W/2, H/2 - 4, ld.name, {
            fontFamily:'monospace', fontSize:'8px', color:'#ffffff',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        const t3 = this.add.text(W/2, H/2 + 10, ld.subtitle, {
            fontFamily:'monospace', fontSize:'7px', color:'#aaaaaa',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        const t4 = this.add.text(W/2, H/2 + 26,
            'March to the stadium!  Beat the boss at the gate!', {
            fontFamily:'monospace', fontSize:'5px', color:'#88ff88',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        this.time.delayedCall(2800, () => {
            [ov,t1,t2,t3,t4].forEach(o => {
                this.tweens.add({ targets:o, alpha:0, duration:400, onComplete:()=>o.destroy() });
            });
        });
    }

    _showBossIntro() {
        const ld = this.levelData;
        const [W, H] = [C.GAME_W, C.GAME_H];

        const ov = this.add.graphics()
            .fillStyle(0x000000, 0.78).fillRect(0, 0, W, H)
            .setScrollFactor(0).setDepth(50);

        const img = this.add.image(W/2, H/2 - 24, ld.bossSprite)
            .setScrollFactor(0).setDepth(51).setScale(1.4);
        this.tweens.add({ targets:img, scaleX:1.6, scaleY:1.6, yoyo:true, repeat:-1, duration:400 });

        const name = this.add.text(W/2, H/2 + 16, ld.bossName, {
            fontFamily:'monospace', fontSize:'10px', color:'#ff4444',
            stroke:'#000000', strokeThickness:2,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        const quote = this.add.text(W/2, H/2 + 30, ld.bossIntro, {
            fontFamily:'monospace', fontSize:'6px', color:'#ffcc88', align:'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        this._hudShowBossName(ld.bossName);

        this.time.delayedCall(2800, () => {
            [ov,img,name,quote].forEach(o => {
                this.tweens.add({ targets:o, alpha:0, duration:500, onComplete:()=>o.destroy() });
            });
            this.boss.activate(this.projectiles);
        });
    }

    // ── Score popup ───────────────────────────
    _scorePopup(x, y, pts) {
        const txt = this.add.text(x, y - 8, `+${pts}`, {
            fontFamily:'monospace', fontSize:'6px', color:'#ffff44',
        }).setDepth(C.Z_FX);
        this.tweens.add({
            targets:txt, y:y-22, alpha:0, duration:700,
            onComplete:()=>txt.destroy(),
        });
    }

    // ── Boss killed ───────────────────────────
    _onBossKilled() {
        this.levelComplete = true;
        this._hudHideBossBar();

        const [W, H] = [C.GAME_W, C.GAME_H];
        const ld = this.levelData;

        this.time.delayedCall(800, () => {
            const ov = this.add.graphics()
                .fillStyle(0x000000, 0.78).fillRect(0, 0, W, H)
                .setScrollFactor(0).setDepth(50);

            this.add.text(W/2, H/2 - 22, 'LEVEL CLEAR!', {
                fontFamily:'monospace', fontSize:'16px', color:'#f77f00',
                stroke:'#000000', strokeThickness:2,
            }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

            this.add.text(W/2, H/2 + 2, ld.victoryText, {
                fontFamily:'monospace', fontSize:'6px', color:'#ffffff', align:'center',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

            this.add.text(W/2, H/2 + 22,
                `SCORE: ${String(this.player.score).padStart(6,'0')}`, {
                fontFamily:'monospace', fontSize:'8px', color:'#ffff44',
            }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

            this.time.delayedCall(3200, () => this._advanceLevel());
        });
    }

    _advanceLevel() {
        const next = this.levelIndex + 1;
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            if (next >= LEVEL_DATA.length) {
                this.scene.start('VictoryScene', { score: this.player.score });
            } else {
                this.scene.restart({
                    levelIndex: next,
                    score:      this.player.score,
                    hp:         this.player.health,
                });
            }
        });
    }

    _onPlayerDead() {
        this.playerLives--;
        this._hudUpdateLives(this.playerLives);

        this.cameras.main.fade(700, 0, 0, 0);
        this.time.delayedCall(700, () => {
            if (this.playerLives > 0) {
                // Restart current level — full HP, same score, one fewer life
                this.scene.restart({
                    levelIndex: this.levelIndex,
                    score:      this.player.score,
                    hp:         C.P_HEALTH,
                    lives:      this.playerLives,
                });
            } else {
                this.scene.start('GameOverScene', {
                    score: this.player.score,
                    level: this.levelIndex + 1,
                });
            }
        });
    }
}
