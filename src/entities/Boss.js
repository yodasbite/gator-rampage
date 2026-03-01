// ─────────────────────────────────────────────
//  Boss — SEC Mascot Boss
// ─────────────────────────────────────────────

const BossState = { IDLE: 0, CHASE: 1, CHARGE: 2, RANGED: 3, HURT: 4, DEAD: 5 };

class Boss extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, config) {
        super(scene, x, y, config.sprite || 'boss_uga');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(C.Z_ENTITY + 1);
        this.body.setSize(26, 26);
        this.body.setOffset(3, 4);

        this.cfg            = config;
        this.health         = C.B_HEALTH;
        this.maxHealth      = C.B_HEALTH;
        this.speed          = C.B_SPEED;
        this.damage         = C.B_DMG;
        this.knockback      = C.B_KNOCKBACK;
        this.projColor      = config.projColor || 0xff4400;
        this.pointValue     = 2000;

        this.state          = BossState.IDLE;
        this.phase          = 1;        // 1 or 2 (phase 2 at 50% HP)
        this.actionTimer    = 2000;     // ms until next action
        this.hurtTimer      = 0;
        this.chargeTarget   = null;
        this.chargeTimer    = 0;
        this.projectiles    = null;     // set by GameScene

        this.activated      = false;    // true once player is close
    }

    activate(projectileGroup) {
        this.activated  = true;
        this.projectiles= projectileGroup;
        this.state      = BossState.CHASE;
        // Announce
        this.scene.cameras.main.shake(400, 0.015);
    }

    update(time, delta, player) {
        if (!this.activated || this.state === BossState.DEAD) return;
        if (!player || player.isDead) { this.setVelocity(0,0); return; }

        this._updateTimers(delta);

        // Phase 2 check
        if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
            this.phase = 2;
            this.speed *= 1.4;
            this.damage = C.B_DMG + 1;
            this.setTint(0xff8800);
            this.scene.cameras.main.shake(500, 0.02);
            this.scene.events.emit('boss-phase2');
        }

        switch (this.state) {
            case BossState.CHASE:
                this._chase(player, delta);
                break;
            case BossState.CHARGE:
                this._doCharge(player, delta);
                break;
            case BossState.RANGED:
                this.setVelocity(0, 0);
                break;
            case BossState.HURT:
                if (this.hurtTimer <= 0) {
                    this.state = BossState.CHASE;
                    if (this.phase === 1) this.clearTint();
                    else this.setTint(0xff8800);
                }
                break;
        }

        // Contact damage
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist < C.B_ATTACK_R + 6) {
            player.takeDamage(this.damage, this.x, this.y);
        }
    }

    _updateTimers(delta) {
        if (this.hurtTimer  > 0) this.hurtTimer  -= delta;
        if (this.actionTimer > 0) {
            this.actionTimer -= delta;
        } else {
            this._pickAction();
        }
        if (this.chargeTimer > 0) this.chargeTimer -= delta;
    }

    _pickAction() {
        const roll = Phaser.Math.Between(0, 2);
        if (roll === 0) {
            // Charge
            this.state = BossState.CHARGE;
            this.chargeTimer = 600;
            this.actionTimer = this.phase === 2 ? 1800 : 2500;
        } else if (roll === 1 && this.projectiles) {
            // Ranged
            this.state = BossState.RANGED;
            this._shootProjectiles();
            this.actionTimer = this.phase === 2 ? 2000 : 3000;
            this.scene.time.delayedCall(500, () => {
                if (this.active && this.state === BossState.RANGED)
                    this.state = BossState.CHASE;
            });
        } else {
            this.state = BossState.CHASE;
            this.actionTimer = this.phase === 2 ? 1500 : 2200;
        }
    }

    _chase(player, delta) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    _doCharge(player, delta) {
        if (this.chargeTimer > 400) {
            // Wind-up: wobble in place
            this.setVelocity(0, 0);
            this.setTint(this.chargeTimer % 60 < 30 ? 0xffff00 : 0xff8800);
            // Lock target
            this.chargeTarget = { x: player.x, y: player.y };
        } else if (this.chargeTimer > 0) {
            // Charge!
            if (this.chargeTarget) {
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    this.chargeTarget.x, this.chargeTarget.y
                );
                this.setVelocity(
                    Math.cos(angle) * this.speed * 3.5,
                    Math.sin(angle) * this.speed * 3.5
                );
            }
        } else {
            // Done charging
            this.setVelocity(0, 0);
            this.state = BossState.CHASE;
            if (this.phase === 1) this.clearTint();
            else this.setTint(0xff8800);
        }
    }

    _shootProjectiles() {
        if (!this.projectiles) return;
        const angles = this.phase === 2
            ? [0, 45, 90, 135, 180, 225, 270, 315]  // 8-way phase 2
            : [0, 90, 180, 270];                      // 4-way phase 1

        angles.forEach(ang => {
            const proj = this.projectiles.create(this.x, this.y, 'projectile');
            proj.setDepth(C.Z_ENTITY);
            proj.setTint(this.projColor);
            const rad = Phaser.Math.DegToRad(ang);
            proj.setVelocity(Math.cos(rad) * 120, Math.sin(rad) * 120);
            proj.damage = this.damage;
            // Destroy after 3 seconds
            this.scene.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
        });
    }

    takeDamage(amount, sourceX, sourceY) {
        if (this.state === BossState.DEAD || this.state === BossState.HURT) return;

        this.health -= amount;
        this.state   = BossState.HURT;
        this.hurtTimer = 300;
        this.setTint(0xffffff);

        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
        this.setVelocity(
            Math.cos(angle) * this.knockback * 0.4,
            Math.sin(angle) * this.knockback * 0.4
        );

        this.scene.events.emit('boss-hurt', this.health, this.maxHealth);

        if (this.health <= 0) this._die();
    }

    _die() {
        this.state = BossState.DEAD;
        this.setVelocity(0, 0);
        this.scene.cameras.main.shake(600, 0.025);

        const bx = this.x, by = this.y;
        this.scene.tweens.add({
            targets:  this,
            alpha:    0,
            scaleX:   2,
            scaleY:   2,
            duration: 800,
            onComplete: () => {
                this.scene.events.emit('boss-killed', this.pointValue, bx, by);
                this.destroy();
            }
        });
    }

    isAlive() {
        return this.state !== BossState.DEAD;
    }
}
