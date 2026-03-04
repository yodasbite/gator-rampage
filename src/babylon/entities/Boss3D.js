// ─────────────────────────────────────────────
//  Boss3D — SEC mascot boss
// ─────────────────────────────────────────────
const BossState3D = { IDLE: 0, CHASE: 1, CHARGE: 2, RANGED: 3, HURT: 4, DEAD: 5 };

class Boss3D {
    constructor(scene, worldX, worldZ, config) {
        this.scene      = scene;
        this.x          = worldX;
        this.z          = worldZ;
        this.cfg        = config;

        this.health     = C.B_HEALTH;
        this.maxHealth  = C.B_HEALTH;
        this.speed      = C.B_SPEED;
        this.damage     = C.B_DMG;
        this.knockback  = C.B_KNOCKBACK;
        this.projColor  = config.bossProjectileColor || 0xff4400;
        this.pointValue = 2000;

        this.state       = BossState3D.IDLE;
        this.phase       = 1;
        this.actionTimer = 2000;
        this.hurtTimer   = 0;
        this.chargeTimer = 0;
        this.chargeTargX = 0;
        this.chargeTargZ = 0;
        this.activated   = false;

        this._knockX     = 0;
        this._knockZ     = 0;
        this._knockTimer = 0;
        this._dying      = false;
        this._fadeTimer  = 0;

        // Mesh — bigger than enemies
        this.mesh = BABYLON.MeshBuilder.CreateBox('boss', {
            width: 28, height: 32, depth: 28
        }, scene);
        this.mesh.position.set(worldX, 16, worldZ);

        const pc = config.fanColors ? config.fanColors[0] : 0xff4400;
        this._primaryHex = pc;

        this._baseMat = new BABYLON.StandardMaterial('bossMat', scene);
        this._baseMat.diffuseColor = _hexToColor3(pc);
        this.mesh.material = this._baseMat;

        this._hurtMat = new BABYLON.StandardMaterial('bossHurtMat', scene);
        this._hurtMat.diffuseColor = new BABYLON.Color3(1, 1, 1);

        this._phase2Mat = new BABYLON.StandardMaterial('bossP2Mat', scene);
        this._phase2Mat.diffuseColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    }

    activate() {
        this.activated = true;
        this.state     = BossState3D.CHASE;
    }

    update(dt, player, mapData, projectiles, onDeath) {
        if (!this.activated || this.state === BossState3D.DEAD) return;

        if (this._dying) {
            this._fadeTimer -= dt;
            if (this._fadeTimer <= 0) {
                this.state = BossState3D.DEAD;
                if (onDeath) onDeath(this.pointValue, this.x, this.z);
            } else {
                const t = 1 - this._fadeTimer / 800;
                const s = 1 + t * 2;
                this.mesh.scaling.set(s, s, s);
                this.mesh.material.alpha = 1 - t;
            }
            return;
        }

        if (!player || player.isDead) return;

        this._updateTimers(dt);

        // Phase 2 transition
        if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
            this.phase = 2;
            this.speed *= 1.4;
            this.damage = C.B_DMG + 1;
            this.mesh.material = this._phase2Mat;
        }

        // Apply knockback
        if (this._knockTimer > 0) {
            this._knockTimer -= dt;
            const frac = dt / 200;
            const pos = Collision.moveWithCollision(
                this.x, this.z, this._knockX * frac, this._knockZ * frac, 14, mapData
            );
            this.x = pos.x; this.z = pos.z;
        }

        switch (this.state) {
            case BossState3D.CHASE:
                this._chase(dt, player, mapData);
                break;
            case BossState3D.CHARGE:
                this._doCharge(dt, player, mapData);
                break;
            case BossState3D.RANGED:
                // Standing still, projectiles already fired
                break;
            case BossState3D.HURT:
                if (this.hurtTimer <= 0) {
                    this.state = BossState3D.CHASE;
                    this.mesh.material = this.phase === 2 ? this._phase2Mat : this._baseMat;
                }
                break;
        }

        // Contact damage
        const dist = Collision.distance(this.x, this.z, player.x, player.z);
        if (dist < C.B_ATTACK_R + 14) {
            player.takeDamage(this.damage, this.x, this.z);
        }

        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
    }

    _updateTimers(dt) {
        if (this.hurtTimer  > 0) this.hurtTimer  -= dt;
        if (this.chargeTimer > 0) this.chargeTimer -= dt;

        if (this.state !== BossState3D.HURT && this.state !== BossState3D.CHARGE) {
            this.actionTimer -= dt;
            if (this.actionTimer <= 0) this._pickAction();
        }
    }

    _pickAction() {
        const roll = Math.floor(Math.random() * 3);
        if (roll === 0) {
            this.state = BossState3D.CHARGE;
            this.chargeTimer = 600;
            this.actionTimer = this.phase === 2 ? 1800 : 2500;
        } else if (roll === 1) {
            this.state = BossState3D.RANGED;
            this._shootProjectiles();
            this.actionTimer = this.phase === 2 ? 2000 : 3000;
            setTimeout(() => {
                if (this.state === BossState3D.RANGED) this.state = BossState3D.CHASE;
            }, 500);
        } else {
            this.state = BossState3D.CHASE;
            this.actionTimer = this.phase === 2 ? 1500 : 2200;
        }
    }

    _chase(dt, player, mapData) {
        const ang = Collision.angle(this.x, this.z, player.x, player.z);
        const spd = this.speed * (dt / 1000);
        const pos = Collision.moveWithCollision(
            this.x, this.z,
            Math.cos(ang) * spd, Math.sin(ang) * spd,
            14, mapData
        );
        this.x = pos.x; this.z = pos.z;
    }

    _doCharge(dt, player, mapData) {
        if (this.chargeTimer > 400) {
            // Wind-up — flash yellow
            const flash = (this.chargeTimer % 60) < 30;
            this.mesh.material = flash ? this._hurtMat : this._baseMat;
            this.chargeTargX = player.x;
            this.chargeTargZ = player.z;
        } else if (this.chargeTimer > 0) {
            // Charge!
            const ang = Collision.angle(this.x, this.z, this.chargeTargX, this.chargeTargZ);
            const spd = this.speed * 3.5 * (dt / 1000);
            const pos = Collision.moveWithCollision(
                this.x, this.z,
                Math.cos(ang) * spd, Math.sin(ang) * spd,
                14, mapData
            );
            this.x = pos.x; this.z = pos.z;
        } else {
            this.state = BossState3D.CHASE;
            this.mesh.material = this.phase === 2 ? this._phase2Mat : this._baseMat;
        }
    }

    _shootProjectiles(projectiles) {
        // Called without projectiles arg — GameManager passes them via separate call
        // This just triggers the shoot. GameManager reads boss.pendingShot
        const angles = this.phase === 2
            ? [0, 45, 90, 135, 180, 225, 270, 315]
            : [0, 90, 180, 270];

        this.pendingShot = {
            angles,
            x: this.x,
            z: this.z,
            color: this.projColor,
            damage: this.damage
        };
    }

    takeDamage(amount, srcX, srcZ) {
        if (this.state === BossState3D.DEAD || this.state === BossState3D.HURT || this._dying) return;

        this.health -= amount;
        this.state   = BossState3D.HURT;
        this.hurtTimer = 300;
        this.mesh.material = this._hurtMat;

        const ang = Collision.angle(srcX, srcZ, this.x, this.z);
        const kb  = this.knockback * 0.4 * (200 / 1000);
        this._knockX = Math.cos(ang) * kb;
        this._knockZ = Math.sin(ang) * kb;
        this._knockTimer = 200;

        if (this.health <= 0) this._die();
    }

    _die() {
        this._dying     = true;
        this._fadeTimer = 800;
        this._phase2Mat.needAlphaBlending = () => true;
        this._baseMat.needAlphaBlending   = () => true;
    }

    isAlive() { return this.state !== BossState3D.DEAD && !this._dying; }

    dispose() {
        if (this.mesh) this.mesh.dispose();
    }
}
