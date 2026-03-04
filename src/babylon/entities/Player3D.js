// ─────────────────────────────────────────────
//  Player3D — Albert the Gator
//  Coordinate system: X=left/right, Z=up/down on screen (inverted rows)
// ─────────────────────────────────────────────
class Player3D {
    constructor(scene, worldX, worldZ, opts) {
        opts = opts || {};
        this.scene   = scene;
        this.x       = worldX;
        this.z       = worldZ;
        this.health  = opts.health || C.P_HEALTH;
        this.maxHealth  = C.P_HEALTH;
        this.score   = opts.score  || 0;
        this.attackDmg = opts.attackDmg || C.P_ATTACK_DMG;

        this.facing     = 'up';
        this.isAttacking = false;
        this.isHurt     = false;
        this.isDead     = false;
        this.attackTimer = 0;
        this.hurtTimer   = 0;
        this._attackJustFired = false;

        // Visual mesh
        this.mesh = BABYLON.MeshBuilder.CreateBox('player', {
            width: 14, height: 20, depth: 14
        }, scene);
        this.mesh.position.set(worldX, 10, worldZ);

        this._baseMat = new BABYLON.StandardMaterial('playerMat', scene);
        this._baseMat.diffuseColor = new BABYLON.Color3(0.10, 0.50, 0.10);
        this.mesh.material = this._baseMat;

        // Attack flash material (shared)
        this._atkMat = new BABYLON.StandardMaterial('playerAtkMat', scene);
        this._atkMat.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.2);

        this._hurtMat = new BABYLON.StandardMaterial('playerHurtMat', scene);
        this._hurtMat.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.2);
    }

    // dt = ms since last frame
    update(dt, mapData) {
        if (this.isDead) return;

        this._updateTimers(dt);
        this._handleMovement(dt, mapData);
        this._handleAttack(dt);
        this._updateVisuals();
    }

    _updateTimers(dt) {
        if (this.attackTimer > 0) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
        if (this.hurtTimer > 0) {
            this.hurtTimer -= dt;
            if (this.hurtTimer <= 0) this.isHurt = false;
        }
    }

    _handleMovement(dt, mapData) {
        if (this.isAttacking) return; // locked while swinging

        const spd = C.P_SPEED * (dt / 1000);
        let vx = 0, vz = 0;

        if (Input.left())  { vx = -spd; this.facing = 'left'; }
        if (Input.right()) { vx =  spd; this.facing = 'right'; }
        // 'up' on screen = +Z in world (toward boss = toward row 0 = high Z)
        if (Input.up())   { vz =  spd; this.facing = 'up'; }
        if (Input.down()) { vz = -spd; this.facing = 'down'; }

        // Normalize diagonal
        if (vx !== 0 && vz !== 0) { vx *= 0.707; vz *= 0.707; }

        if (vx !== 0 || vz !== 0) {
            const pos = Collision.moveWithCollision(this.x, this.z, vx, vz, 7, mapData);
            this.x = pos.x;
            this.z = pos.z;
        }

        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
    }

    _handleAttack(dt) {
        this._attackJustFired = false;
        if (Input.attackJustPressed() && this.attackTimer <= 0) {
            this.isAttacking   = true;
            this.attackTimer   = C.P_ATTACK_CD;
            this._attackJustFired = true;

            // Quick flash
            this.mesh.material = this._atkMat;
            setTimeout(() => {
                if (this.mesh && !this.isHurt) this.mesh.material = this._baseMat;
            }, 80);
        }
    }

    _updateVisuals() {
        if (this.isHurt) {
            // Flicker alpha
            const flash = Math.floor(this.hurtTimer / 80) % 2 === 0;
            this.mesh.material = flash ? this._hurtMat : this._baseMat;
        } else if (!this.isAttacking) {
            this.mesh.material = this._baseMat;
        }
    }

    // Returns {x,z} of attack hit-point
    getAttackPos() {
        const R = C.P_ATTACK_RANGE; // 18
        switch (this.facing) {
            case 'up':    return { x: this.x,     z: this.z + R };
            case 'down':  return { x: this.x,     z: this.z - R };
            case 'left':  return { x: this.x - R, z: this.z     };
            case 'right': return { x: this.x + R, z: this.z     };
        }
        return { x: this.x, z: this.z };
    }

    attackJustFired() { return this._attackJustFired; }

    takeDamage(amount, srcX, srcZ) {
        if (this.isHurt || this.isDead) return;

        this.health -= amount;
        this.isHurt  = true;
        this.hurtTimer = C.P_IFRAME_MS;

        // Knockback
        const ang = Collision.angle(srcX, srcZ, this.x, this.z);
        const kb = C.P_KNOCKBACK * (1 / 1000) * 200; // 200ms of knockback distance
        this._knockX = Math.cos(ang) * kb;
        this._knockZ = Math.sin(ang) * kb;
        this._knockTimer = 200;

        if (this.health <= 0) this._die();
    }

    // Call each frame to apply knockback
    applyKnockback(dt, mapData) {
        if (!this._knockTimer || this._knockTimer <= 0) return;
        this._knockTimer -= dt;
        const frac = dt / 200;
        const pos = Collision.moveWithCollision(
            this.x, this.z,
            this._knockX * frac, this._knockZ * frac,
            7, mapData
        );
        this.x = pos.x; this.z = pos.z;
        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
    }

    addScore(pts) {
        this.score += pts;
    }

    _die() {
        this.isDead = true;
        this._baseMat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        this.mesh.material = this._baseMat;
    }

    dispose() {
        if (this.mesh) this.mesh.dispose();
    }
}
