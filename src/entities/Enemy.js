// ─────────────────────────────────────────────
//  Enemy — SEC Fan or mascot minion
// ─────────────────────────────────────────────

const EnemyState = { IDLE: 0, CHASE: 1, ATTACK: 2, HURT: 3, DEAD: 4 };

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, config) {
        super(scene, x, y, config.sprite || 'fan');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(C.Z_ENTITY);
        this.body.setSize(12, 12);
        this.body.setOffset(2, 2);

        this.cfg        = config;
        this.health     = config.health   || C.E_HEALTH;
        this.speed      = config.speed    || C.E_SPEED;
        this.damage     = config.damage   || C.E_DMG;
        this.detect     = config.detect   || C.E_DETECT;
        this.attackR    = config.attackR  || C.E_ATTACK_R;
        this.attackCd   = config.attackCd || C.E_ATTACK_CD;
        this.knockback  = config.knockback|| C.E_KNOCKBACK;
        this.pointValue = config.points   || 100;

        this.state      = EnemyState.IDLE;
        this.attackTimer= 0;
        this.hurtTimer  = 0;
        this.idleTimer  = 0;
        this.idleVx     = 0;
        this.idleVy     = 0;

        this._newIdleDir();
    }

    update(time, delta, player) {
        if (this.state === EnemyState.DEAD) return;
        if (!player || player.isDead) { this._idle(delta); return; }

        this._updateTimers(delta);

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        switch (this.state) {
            case EnemyState.IDLE:
                this._idle(delta);
                if (dist < this.detect) this.state = EnemyState.CHASE;
                break;

            case EnemyState.CHASE:
                this._chase(player);
                if (dist < this.attackR) this.state = EnemyState.ATTACK;
                if (dist > this.detect * 1.5) this.state = EnemyState.IDLE;
                break;

            case EnemyState.ATTACK:
                this.setVelocity(0, 0);
                if (this.attackTimer <= 0) {
                    this._doAttack(player);
                    this.attackTimer = this.attackCd;
                }
                if (dist > this.attackR * 1.5) this.state = EnemyState.CHASE;
                break;

            case EnemyState.HURT:
                // Freeze during hurt
                if (this.hurtTimer <= 0) {
                    this.state = EnemyState.CHASE;
                    this.clearTint();
                }
                break;
        }
    }

    _updateTimers(delta) {
        if (this.attackTimer > 0) this.attackTimer -= delta;
        if (this.hurtTimer  > 0) this.hurtTimer   -= delta;
    }

    _idle(delta) {
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) this._newIdleDir();
        this.setVelocity(this.idleVx, this.idleVy);
    }

    _newIdleDir() {
        this.idleTimer = Phaser.Math.Between(1200, 2800);
        const ang = Phaser.Math.Between(0, 360);
        const spd = this.speed * 0.3;
        this.idleVx = Math.cos(Phaser.Math.DegToRad(ang)) * spd;
        this.idleVy = Math.sin(Phaser.Math.DegToRad(ang)) * spd;
    }

    _chase(player) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    _doAttack(player) {
        player.takeDamage(this.damage, this.x, this.y);

        // Lunge toward player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
        this.scene.time.delayedCall(150, () => {
            if (this.active) this.setVelocity(0, 0);
        });
    }

    takeDamage(amount, sourceX, sourceY) {
        if (this.state === EnemyState.DEAD || this.state === EnemyState.HURT) return false;

        this.health -= amount;
        this.state   = EnemyState.HURT;
        this.hurtTimer = 350;
        this.setTint(0xffffff);

        // Knockback
        const angle = Phaser.Math.Angle.Between(sourceX, sourceY, this.x, this.y);
        this.setVelocity(
            Math.cos(angle) * this.knockback,
            Math.sin(angle) * this.knockback
        );
        this.scene.time.delayedCall(200, () => {
            if (this.active && this.state === EnemyState.HURT) this.setVelocity(0, 0);
        });

        if (this.health <= 0) {
            this._die();
            return true; // killed
        }
        return false;
    }

    _die() {
        this.state = EnemyState.DEAD;
        this.setVelocity(0, 0);
        this.setTint(0xff0000);

        this.scene.tweens.add({
            targets: this,
            alpha:   0,
            angle:   180,
            duration:400,
            onComplete: () => {
                this.scene.events.emit('enemy-killed', this.pointValue);
                this.destroy();
            }
        });
    }

    isAlive() {
        return this.state !== EnemyState.DEAD;
    }
}
