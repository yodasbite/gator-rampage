// ─────────────────────────────────────────────
//  Player — Albert the Gator
// ─────────────────────────────────────────────
class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'albert_down');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(C.Z_ENTITY);
        this.body.setSize(12, 12);
        this.body.setOffset(2, 2);
        this.setCollideWorldBounds(true);

        // State
        this.health      = C.P_HEALTH;
        this.maxHealth   = C.P_HEALTH;
        this.score       = 0;
        this.facing      = 'down';
        this.isAttacking = false;
        this.isHurt      = false;
        this.isDead      = false;
        this.attackTimer = 0;
        this.hurtTimer   = 0;

        // Attack hitbox (invisible sensor)
        this.attackBox = scene.add.rectangle(x, y, C.P_ATTACK_RANGE, C.P_ATTACK_RANGE);
        scene.physics.add.existing(this.attackBox, false);
        this.attackBox.body.setAllowGravity(false);
        this.attackBox.active = false;
        this.attackBox.setVisible(false);

        // Input
        this.keys = scene.input.keyboard.addKeys({
            up:     Phaser.Input.Keyboard.KeyCodes.W,
            down:   Phaser.Input.Keyboard.KeyCodes.S,
            left:   Phaser.Input.Keyboard.KeyCodes.A,
            right:  Phaser.Input.Keyboard.KeyCodes.D,
            upArr:  Phaser.Input.Keyboard.KeyCodes.UP,
            downArr:Phaser.Input.Keyboard.KeyCodes.DOWN,
            leftArr:Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightArr:Phaser.Input.Keyboard.KeyCodes.RIGHT,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
            attackZ:Phaser.Input.Keyboard.KeyCodes.Z,
        });

        // Walk animation frame toggle
        this.walkFrame   = 0;
        this.walkTimer   = 0;
        this.WALK_RATE   = 180; // ms per frame toggle
    }

    update(time, delta) {
        if (this.isDead) return;

        this._updateTimers(delta);
        this._handleMovement(delta);
        this._handleAttack(time);
        this._updateSprite();
        this._updateAttackBox();
    }

    _updateTimers(delta) {
        if (this.attackTimer > 0) this.attackTimer -= delta;
        if (this.hurtTimer > 0)   this.hurtTimer   -= delta;

        if (this.attackTimer <= 0 && this.isAttacking) {
            this.isAttacking = false;
            this.attackBox.active = false;
        }

        if (this.hurtTimer <= 0 && this.isHurt) {
            this.isHurt = false;
            this.clearTint();
        }
    }

    _handleMovement(delta) {
        if (this.isAttacking) {
            // Slow but still movable while attacking
            this.setVelocity(0, 0);
            return;
        }

        const k = this.keys;
        let vx = 0, vy = 0;
        const spd = C.P_SPEED;

        if (k.left.isDown  || k.leftArr.isDown)  { vx = -spd; this.facing = 'left'; }
        if (k.right.isDown || k.rightArr.isDown)  { vx =  spd; this.facing = 'right'; }
        if (k.up.isDown    || k.upArr.isDown)     { vy = -spd; this.facing = 'up'; }
        if (k.down.isDown  || k.downArr.isDown)   { vy =  spd; this.facing = 'down'; }

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.setVelocity(vx, vy);

        // Walk frame toggle
        if (vx !== 0 || vy !== 0) {
            this.walkTimer += delta;
            if (this.walkTimer >= this.WALK_RATE) {
                this.walkTimer = 0;
                this.walkFrame = this.walkFrame === 0 ? 1 : 0;
            }
        } else {
            this.walkFrame = 0;
        }
    }

    _handleAttack(time) {
        const k = this.keys;
        if ((Phaser.Input.Keyboard.JustDown(k.attack) ||
             Phaser.Input.Keyboard.JustDown(k.attackZ)) &&
            this.attackTimer <= 0) {
            this.isAttacking  = true;
            this.attackTimer  = C.P_ATTACK_CD;
            this.attackBox.active = true;

            // Flash yellow
            this.setTint(0xffff00);
            this.scene.time.delayedCall(80, () => {
                if (!this.isDead) this.clearTint();
                if (!this.isHurt) this.clearTint();
            });

            // Camera shake
            this.scene.cameras.main.shake(60, 0.004);

            // Spawn hit fx
            const [hx, hy] = this._attackOffset();
            const fx = this.scene.add.image(this.x + hx, this.y + hy, 'hit_fx');
            fx.setDepth(C.Z_FX);
            this.scene.time.delayedCall(120, () => fx.destroy());
        }
    }

    _attackOffset() {
        const r = C.P_ATTACK_RANGE;
        switch (this.facing) {
            case 'up':    return [0, -r];
            case 'down':  return [0,  r];
            case 'left':  return [-r, 0];
            case 'right': return [ r, 0];
        }
        return [0, r];
    }

    _updateAttackBox() {
        const [ox, oy] = this._attackOffset();
        this.attackBox.x = this.x + ox;
        this.attackBox.y = this.y + oy;
    }

    _updateSprite() {
        const suffix = this.walkFrame === 1 && !this.isAttacking ? '2' : '';
        const key = `albert_${this.facing}${suffix}`;
        // Only update if key exists (fallback to base)
        if (this.scene.textures.exists(key)) {
            this.setTexture(key);
        } else {
            this.setTexture(`albert_${this.facing}`);
        }

        // Hurt flash
        if (this.isHurt) {
            this.setAlpha(Math.floor(this.hurtTimer / 80) % 2 === 0 ? 0.3 : 1);
        } else {
            this.setAlpha(1);
        }
    }

    takeDamage(amount, sourceX, sourceY) {
        if (this.isHurt || this.isDead) return;

        this.health -= amount;
        this.isHurt  = true;
        this.hurtTimer = C.P_IFRAME_MS;
        this.setTint(0xff4444);

        // Knockback away from source
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
        this.scene.physics.velocityFromAngle(
            Phaser.Math.RadToDeg(angle), C.P_KNOCKBACK,
            this.body.velocity
        );

        // Restore velocity after knockback
        this.scene.time.delayedCall(200, () => {
            if (!this.isDead) this.setVelocity(0, 0);
        });

        // Emit so HUD can update
        this.scene.events.emit('player-hurt', this.health);

        if (this.health <= 0) this._die();
    }

    _die() {
        this.isDead = true;
        this.setVelocity(0, 0);
        this.setTint(0xff0000);
        this.scene.cameras.main.shake(300, 0.02);
        this.scene.time.delayedCall(800, () => {
            this.scene.events.emit('player-dead');
        });
    }

    addScore(pts) {
        this.score += pts;
        this.scene.events.emit('score-changed', this.score);
    }
}
