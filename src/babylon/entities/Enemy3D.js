// ─────────────────────────────────────────────
//  Enemy3D — SEC fan / mascot minion
// ─────────────────────────────────────────────
const EnemyState3D = { IDLE: 0, CHASE: 1, ATTACK: 2, HURT: 3, DEAD: 4 };

class Enemy3D {
    constructor(scene, worldX, worldZ, config) {
        this.scene    = scene;
        this.x        = worldX;
        this.z        = worldZ;
        this.cfg      = config;

        this.health     = config.health    || C.E_HEALTH;
        this.speed      = config.speed     || C.E_SPEED;
        this.damage     = config.damage    || C.E_DMG;
        this.detect     = config.detect    || C.E_DETECT;
        this.attackR    = config.attackR   || C.E_ATTACK_R;
        this.attackCd   = config.attackCd  || C.E_ATTACK_CD;
        this.knockback  = config.knockback || C.E_KNOCKBACK;
        this.pointValue = config.points    || 100;
        this.ranged     = config.ranged    || false;
        this.throwR     = config.throwR    || 80;

        this.state         = EnemyState3D.IDLE;
        // Ranged enemies start with a wind-up delay before their first shot
        this.attackTimer   = this.ranged ? this.attackCd * 0.6 : 0;
        this.hurtTimer     = 0;
        this.idleTimer     = 0;
        this.idleVx        = 0;
        this.idleVz        = 0;
        this._moveDelay    = 0;
        this._knockX       = 0;
        this._knockZ       = 0;
        this._knockTimer   = 0;
        this._dying        = false;
        this._fadeTimer    = 0;

        // Mesh
        const w = config.type === 'minion' ? 14 : 12;
        const h = config.type === 'minion' ? 18 : 16;
        this.mesh = BABYLON.MeshBuilder.CreateBox('enemy', {
            width: w, height: h, depth: w
        }, scene);
        this.mesh.position.set(worldX, h / 2, worldZ);
        this._halfH = h / 2;

        // Material
        const [pc, sc] = config.fanColors || [0xff0000, 0xffffff];
        this._primaryHex   = pc;
        this._secondaryHex = sc;

        this._baseMat = new BABYLON.StandardMaterial('eMat_' + Math.random(), scene);
        this._baseMat.diffuseColor = _hexToColor3(pc);
        this.mesh.material = this._baseMat;

        this._hurtMat = new BABYLON.StandardMaterial('eHurt_' + Math.random(), scene);
        this._hurtMat.diffuseColor = new BABYLON.Color3(1, 1, 1);

        this._newIdleDir();
    }

    update(dt, player, mapData, projectiles) {
        if (this.state === EnemyState3D.DEAD) return;
        this._mapData = mapData; // store for use in sub-methods

        if (this._dying) {
            this._fadeTimer -= dt;
            this.mesh.material.alpha = Math.max(0, this._fadeTimer / 400);
            if (this._fadeTimer <= 0) this.state = EnemyState3D.DEAD;
            return;
        }

        this._updateTimers(dt);

        // Apply knockback
        if (this._knockTimer > 0) {
            this._knockTimer -= dt;
            const frac = dt / 200;
            const pos = Collision.moveWithCollision(
                this.x, this.z, this._knockX * frac, this._knockZ * frac, 6, mapData
            );
            this.x = pos.x; this.z = pos.z;
        }

        if (!player || player.isDead) { this._idle(dt, mapData); return; }

        const dist = Collision.distance(this.x, this.z, player.x, player.z);

        switch (this.state) {
            case EnemyState3D.IDLE:
                this._idle(dt, mapData);
                if (dist < this.detect) this.state = EnemyState3D.CHASE;
                break;

            case EnemyState3D.CHASE:
                if ((this.ranged && dist < this.throwR) || (!this.ranged && dist < this.attackR)) {
                    this.state = EnemyState3D.ATTACK;
                } else {
                    this._chase(dt, player, mapData);
                }
                if (dist > this.detect * 1.5) this.state = EnemyState3D.IDLE;
                break;

            case EnemyState3D.ATTACK:
                if (this.ranged) {
                    this._rangedAttack(dt, player, dist, projectiles);
                } else {
                    this._meleeAttack(dt, player, dist);
                }
                break;

            case EnemyState3D.HURT:
                if (this.hurtTimer <= 0) {
                    this.state = EnemyState3D.CHASE;
                    this.mesh.material = this._baseMat;
                }
                break;
        }

        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
    }

    _updateTimers(dt) {
        if (this.attackTimer > 0) this.attackTimer -= dt;
        if (this.hurtTimer   > 0) this.hurtTimer   -= dt;
        if (this._moveDelay  > 0) this._moveDelay  -= dt;
    }

    _idle(dt, mapData) {
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) this._newIdleDir();
        const spd = this.speed * 0.3 * (dt / 1000);
        const pos = Collision.moveWithCollision(this.x, this.z, this.idleVx * (dt/1000), this.idleVz * (dt/1000), 6, mapData);
        this.x = pos.x; this.z = pos.z;
    }

    _newIdleDir() {
        this.idleTimer = 1200 + Math.random() * 1600;
        const ang = Math.random() * Math.PI * 2;
        const spd = this.speed * 0.3;
        this.idleVx = Math.cos(ang) * spd;
        this.idleVz = Math.sin(ang) * spd;
    }

    _chase(dt, player, mapData) {
        const ang = Collision.angle(this.x, this.z, player.x, player.z);
        const spd = this.speed * (dt / 1000);
        const pos = Collision.moveWithCollision(
            this.x, this.z,
            Math.cos(ang) * spd, Math.sin(ang) * spd,
            6, mapData
        );
        this.x = pos.x; this.z = pos.z;
    }

    _meleeAttack(dt, player, dist) {
        if (dist > this.attackR * 1.5) { this.state = EnemyState3D.CHASE; return; }
        if (this.attackTimer <= 0) {
            player.takeDamage(this.damage, this.x, this.z);
            this.attackTimer = this.attackCd;
        }
    }

    _rangedAttack(dt, player, dist, projectiles) {
        const BACK = this.throwR * 0.45;
        if (dist > this.detect * 1.5) { this.state = EnemyState3D.IDLE; return; }
        if (dist > this.throwR * 1.5) { this.state = EnemyState3D.CHASE; return; }

        // Strafe away if too close, otherwise hold position
        // _mapData is stored from the update() call for use here
        if (this._moveDelay <= 0 && dist < BACK && this._mapData) {
            const ang = Collision.angle(this.x, this.z, player.x, player.z);
            const spd = this.speed * 0.8 * (dt / 1000);
            const pos = Collision.moveWithCollision(
                this.x, this.z,
                -Math.cos(ang) * spd, -Math.sin(ang) * spd,
                6, this._mapData
            );
            this.x = pos.x;
            this.z = pos.z;
        }

        if (this.attackTimer <= 0) {
            this._fireProjectile(player, projectiles);
            this.attackTimer = this.attackCd;
            this._moveDelay  = 1000;
        }
    }

    _fireProjectile(player, projectiles) {
        if (!projectiles) return;
        const ang = Collision.angle(this.x, this.z, player.x, player.z);
        const spd = 110;
        projectiles.push({
            x: this.x, z: this.z,
            vx: Math.cos(ang) * spd,
            vz: Math.sin(ang) * spd,
            damage: this.damage,
            life: 2500,
            fromBoss: false,
            mesh: this._makeProjectileMesh()
        });
    }

    _makeProjectileMesh() {
        const s = BABYLON.MeshBuilder.CreateSphere('proj', { diameter: 8 }, this.scene);
        s.position.set(this.x, 10, this.z);
        const mat = new BABYLON.StandardMaterial('pMat', this.scene);
        mat.diffuseColor = _hexToColor3(this._primaryHex);
        mat.emissiveColor = _hexToColor3(this._primaryHex);
        s.material = mat;
        return s;
    }

    takeDamage(amount, srcX, srcZ) {
        if (this.state === EnemyState3D.DEAD || this.state === EnemyState3D.HURT || this._dying) return false;

        this.health -= amount;
        this.state   = EnemyState3D.HURT;
        this.hurtTimer = 350;
        this.mesh.material = this._hurtMat;

        // Knockback
        const ang = Collision.angle(srcX, srcZ, this.x, this.z);
        const kb  = this.knockback * (200 / 1000);
        this._knockX = Math.cos(ang) * kb;
        this._knockZ = Math.sin(ang) * kb;
        this._knockTimer = 200;

        if (this.health <= 0) { this._die(); return true; }
        return false;
    }

    _die() {
        this._dying    = true;
        this._fadeTimer = 400;
        this._baseMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
        this.mesh.material = this._baseMat;
        this._baseMat.needAlphaBlending = () => true;
    }

    isAlive() { return this.state !== EnemyState3D.DEAD && !this._dying; }

    dispose() {
        if (this.mesh) this.mesh.dispose();
    }
}

// Helper (shared between entity files)
function _hexToColor3(hex) {
    return new BABYLON.Color3(
        ((hex >> 16) & 0xff) / 255,
        ((hex >> 8)  & 0xff) / 255,
        ( hex        & 0xff) / 255
    );
}
