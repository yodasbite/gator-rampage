// ─────────────────────────────────────────────
//  GameManager — state machine
//  States: TITLE | PLAYING | LEVEL_CLEAR | GAMEOVER | VICTORY
// ─────────────────────────────────────────────
const GameManager = (function () {
    const State = { TITLE: 0, PLAYING: 1, LEVEL_CLEAR: 2, GAMEOVER: 3, VICTORY: 4 };

    let state      = State.TITLE;
    let scene      = null;
    let camera     = null;

    // Persistent between levels
    let levelIndex = 0;
    let lives      = C.P_LIVES;
    let score      = 0;
    let playerHp   = C.P_HEALTH;
    let attackDmg  = C.P_ATTACK_DMG;

    // Per-level objects
    let world      = null;
    let player     = null;
    let enemies    = [];
    let boss       = null;
    let projectiles = [];   // { x, z, vx, vz, damage, life, fromBoss, mesh }
    let bossActivated = false;
    let bossArenaZ    = 0;  // Z threshold to trigger boss (row 8 → high Z)
    let levelClearTimer = 0;
    let introShown  = false;
    let introTimer  = 0;
    let introText   = null;

    // ── Helpers ───────────────────────────────
    function tileToWorld(col, row) {
        return {
            x: col * C.TILE + C.TILE / 2,
            z: (40 - 1 - row) * C.TILE + C.TILE / 2
        };
    }

    function clearLevel() {
        enemies.forEach(e => e.dispose());
        enemies = [];
        if (boss) { boss.dispose(); boss = null; }
        projectiles.forEach(p => { if (p.mesh) p.mesh.dispose(); });
        projectiles = [];
        if (player) { player.dispose(); player = null; }
        if (world)  { world.dispose();  world = null; }
        HUD.dispose();
        bossActivated = false;
        introShown    = false;
        if (introText) { introText.dispose(); introText = null; }
    }

    function spawnIntroText(scene, text) {
        if (introText) introText.dispose();
        const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('intro', true, scene);
        const tb = new BABYLON.GUI.TextBlock('it', text);
        tb.color      = '#ffffff';
        tb.fontSize   = 20;
        tb.fontFamily = 'monospace';
        tb.textWrapping = true;
        tb.resizeToFit  = false;
        tb.width        = '60%';
        tb.top          = '-40px';
        tb.shadowColor  = '#000000';
        tb.shadowBlur   = 4;
        gui.addControl(tb);
        introText = gui;
        setTimeout(() => { if (introText === gui) { gui.dispose(); introText = null; } }, 3000);
    }

    function buildProjectileMesh(x, z, color3) {
        const s = BABYLON.MeshBuilder.CreateSphere('bproj', { diameter: 10 }, scene);
        s.position.set(x, 10, z);
        const mat = new BABYLON.StandardMaterial('bpMat', scene);
        mat.diffuseColor  = color3;
        mat.emissiveColor = color3;
        s.material = mat;
        return s;
    }

    // ── Public API ────────────────────────────
    function init(sc, cam) {
        scene  = sc;
        camera = cam;
        state  = State.TITLE;
        TitleScreen.show(scene, () => startLevel(0));
    }

    function startLevel(idx) {
        clearLevel();
        Input.tick(); // consume any keys that triggered this transition (e.g. Space on title)
        levelIndex = idx;
        const ld = LEVEL_DATA[idx];

        // Build world
        world = World.buildMap(ld, scene);

        // Boss activation row: player enters rows 5-8 (plaza) → in world Z that's high Z
        // Row 8 (boss threshold) → worldZ = (39-8)*16 + 8 = 504
        bossArenaZ = tileToWorld(0, 9).z; // Z above which player is in boss arena

        // Player
        const ps = tileToWorld(ld.playerStart.x, ld.playerStart.y);
        player = new Player3D(scene, ps.x, ps.z, {
            health:    playerHp,
            score:     score,
            attackDmg: attackDmg
        });

        // Snap camera to player start
        CameraFollower.snapTo(ps.x, ps.z);

        // Enemies
        ld.enemies.forEach(ed => {
            const wp = tileToWorld(ed.x, ed.y);
            const isRanged = ed.type === 'ranged';
            const ecfg = {
                type:      ed.type,
                fanColors: ld.fanColors,
                ranged:    isRanged,
                health:    ed.type === 'minion' ? 5 : C.E_HEALTH,
                speed:     ed.type === 'minion' ? C.E_SPEED * 1.3 : C.E_SPEED,
                damage:    ed.type === 'minion' ? 2 : C.E_DMG,
                points:    ed.type === 'minion' ? 200 : (isRanged ? 150 : 100),
                attackCd:  isRanged ? 2800 : C.E_ATTACK_CD,
            };
            enemies.push(new Enemy3D(scene, wp.x, wp.z, ecfg));
        });

        // Boss (dormant until player reaches plaza)
        const bp = tileToWorld(ld.bossPos.x, ld.bossPos.y);
        boss = new Boss3D(scene, bp.x, bp.z, ld);
        boss.damage = C.B_DMG;

        // HUD
        HUD.init(scene, ld);
        HUD.setHealth(player.health, C.P_HEALTH);
        HUD.setLives(lives);
        HUD.setScore(score);
        HUD.setAtk(attackDmg, C.P_ATTACK_MAX);

        state = State.PLAYING;
    }

    function update(dt) {
        // Cap dt to prevent huge jumps
        dt = Math.min(dt, 100);

        switch (state) {
            case State.TITLE:
                TitleScreen.update(dt);
                break;

            case State.PLAYING:
                _updatePlaying(dt);
                break;

            case State.LEVEL_CLEAR:
                levelClearTimer -= dt;
                if (levelClearTimer <= 0) {
                    if (levelIndex + 1 < LEVEL_DATA.length) {
                        startLevel(levelIndex + 1);
                    } else {
                        state = State.VICTORY;
                        VictoryScreen.show(scene, player ? player.score : score, () => {
                            score = 0; lives = C.P_LIVES; playerHp = C.P_HEALTH;
                            attackDmg = C.P_ATTACK_DMG;
                            clearLevel();
                            TitleScreen.show(scene, () => startLevel(0));
                            state = State.TITLE;
                        });
                    }
                }
                break;

            case State.GAMEOVER:
            case State.VICTORY:
                break; // handled by screen callbacks
        }

        Input.tick(); // snapshot at END so justPressed works correctly next frame
    }

    function _updatePlaying(dt) {
        if (!player || !world) return;
        const mapData = world.mapData;

        // ── Player ──────────────────────────────
        player.update(dt, mapData);
        player.applyKnockback(dt, mapData);

        // ── Boss activation ──────────────────────
        if (!bossActivated && boss && player.z >= bossArenaZ) {
            bossActivated = true;
            boss.activate();
            HUD.showBossBar(LEVEL_DATA[levelIndex].bossName);
            if (!introShown) {
                introShown = true;
                spawnIntroText(scene, LEVEL_DATA[levelIndex].bossIntro);
            }
        }

        // ── Player attack ────────────────────────
        if (player.attackJustFired()) {
            const atk = player.getAttackPos();

            enemies.forEach(e => {
                if (!e.isAlive()) return;
                if (Collision.overlaps(atk.x, atk.z, C.P_ATTACK_RANGE, e.x, e.z, 8)) {
                    const killed = e.takeDamage(player.attackDmg, player.x, player.z);
                    if (killed) {
                        score += e.pointValue;
                        player.addScore(e.pointValue);
                        HUD.setScore(score);
                    }
                }
            });

            if (boss && boss.isAlive()) {
                if (Collision.overlaps(atk.x, atk.z, C.P_ATTACK_RANGE, boss.x, boss.z, 14)) {
                    boss.takeDamage(player.attackDmg, player.x, player.z);
                    HUD.updateBossBar(boss.health, boss.maxHealth);
                }
            }
        }

        // ── Enemies ─────────────────────────────
        enemies.forEach(e => {
            if (!e.isAlive()) return;
            e.update(dt, player, mapData, projectiles);
        });

        // Clean up dead enemies
        enemies = enemies.filter(e => {
            if (e.state === EnemyState3D.DEAD) { e.dispose(); return false; }
            return true;
        });

        // ── Boss ─────────────────────────────────
        if (boss && bossActivated && state === State.PLAYING) {
            boss.update(dt, player, mapData, projectiles, (pts, bx, bz) => {
                score += pts;
                player.addScore(pts);
                HUD.hideBossBar();
                HUD.setScore(score);
                playerHp = player.health;
                levelClearTimer = 800;
                state = State.LEVEL_CLEAR;
            });

            // Spawn projectiles from boss.pendingShot
            if (boss.pendingShot) {
                const ps = boss.pendingShot;
                ps.angles.forEach(ang => {
                    const rad = ang * Math.PI / 180;
                    const spd = 120;
                    const mesh = buildProjectileMesh(ps.x, ps.z, _hexToColor3(ps.color));
                    projectiles.push({
                        x: ps.x, z: ps.z,
                        vx: Math.cos(rad) * spd,
                        vz: Math.sin(rad) * spd,
                        damage: ps.damage,
                        life: 3000,
                        fromBoss: true,
                        mesh
                    });
                });
                boss.pendingShot = null;
            }
        }

        // ── Projectiles ──────────────────────────
        const alive = [];
        projectiles.forEach(p => {
            p.life -= dt;
            p.x += p.vx * (dt / 1000);
            p.z += p.vz * (dt / 1000);

            if (p.mesh) p.mesh.position.set(p.x, 10, p.z);

            // Hit player
            if (Collision.overlaps(p.x, p.z, 5, player.x, player.z, 7)) {
                player.takeDamage(p.damage, p.x, p.z);
                HUD.setHealth(player.health, C.P_HEALTH);
                if (p.mesh) p.mesh.dispose();
                return; // remove projectile
            }

            // Hit wall
            if (Collision.isSolid(p.x, p.z, mapData)) {
                if (p.mesh) p.mesh.dispose();
                return;
            }

            if (p.life <= 0) {
                if (p.mesh) p.mesh.dispose();
                return;
            }

            alive.push(p);
        });
        projectiles = alive;

        // ── HUD update ───────────────────────────
        HUD.setHealth(player.health, C.P_HEALTH);

        // ── Camera follow ────────────────────────
        CameraFollower.update(player.x, player.z);

        // ── Player death ─────────────────────────
        if (player.isDead && !player._respawning) {
            player._respawning = true;  // prevent re-trigger during timeout
            lives--;
            score = player.score;
            playerHp = C.P_HEALTH;
            attackDmg = C.P_ATTACK_DMG; // lose power-ups on death
            HUD.setLives(lives);

            if (lives > 0) {
                setTimeout(() => {
                    clearLevel();
                    startLevel(levelIndex);
                }, 1200);
            } else {
                setTimeout(() => {
                    clearLevel();
                    HUD.dispose();
                    state = State.GAMEOVER;
                    GameOverScreen.show(scene, levelIndex, score, () => {
                        lives = C.P_LIVES; score = 0; playerHp = C.P_HEALTH;
                        attackDmg = C.P_ATTACK_DMG;
                        startLevel(0);
                    });
                }, 1200);
            }

        }
    }

    return { init, startLevel, update };
})();
