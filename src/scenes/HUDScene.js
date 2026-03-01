// ─────────────────────────────────────────────
//  HUDScene — always-on overlay (runs parallel)
// ─────────────────────────────────────────────
class HUDScene extends Phaser.Scene {

    constructor() { super({ key: 'HUDScene', active: false }); }

    create() {
        const w = C.GAME_W, h = C.GAME_H;

        // ── Top bar background ────────────────
        const bar = this.add.graphics();
        bar.fillStyle(0x000000, 0.7);
        bar.fillRect(0, 0, w, 18);

        // Hearts container
        this.hearts = [];
        for (let i = 0; i < C.P_HEALTH; i++) {
            const hrt = this.add.image(8 + i * 12, 9, 'heart_full').setOrigin(0.5);
            this.hearts.push(hrt);
        }

        // Score
        this.scoreTxt = this.add.text(w - 4, 4, 'SCORE  000000', {
            fontFamily: 'monospace', fontSize: '6px', color: '#ffffff',
        }).setOrigin(1, 0);

        // Level name
        this.levelTxt = this.add.text(w/2, 4, '', {
            fontFamily: 'monospace', fontSize: '6px', color: '#f77f00',
        }).setOrigin(0.5, 0);

        // ── Boss health bar (hidden until boss) ──
        this.bossBarBg = this.add.graphics();
        this.bossBarFg = this.add.graphics();
        this.bossTxt   = this.add.text(w/2, h - 18, '', {
            fontFamily: 'monospace', fontSize: '6px', color: '#ff4444',
        }).setOrigin(0.5);
        this._hideBossBar();

        // ── Listen to game events ─────────────
        // Reattach whenever GameScene starts (covers first launch and every level restart)
        this.scene.manager.events.on('start', (sys) => {
            if (sys.settings && sys.settings.key === 'GameScene') {
                this._reattach();
            }
        }, this);
    }

    _reattach() {
        const gs = this.scene.get('GameScene');
        if (!gs || !gs.events) return;
        gs.events.off('player-hurt');
        gs.events.off('score-changed');
        gs.events.off('level-start');
        gs.events.off('boss-hurt');
        gs.events.off('boss-phase2');
        gs.events.off('boss-killed');
        gs.events.off('enemy-killed');

        gs.events.on('player-hurt',   hp       => this._updateHearts(hp));
        gs.events.on('score-changed', s        => this._updateScore(s));
        gs.events.on('level-start',   d        => this._onLevelStart(d));
        gs.events.on('boss-hurt',     (hp,max) => this._updateBossBar(hp, max));
        gs.events.on('boss-phase2',   ()       => this._bossPhase2());
        gs.events.on('boss-killed',   ()       => this._hideBossBar());
        gs.events.on('enemy-killed',  pts      => this._addScore(pts));
    }

    _updateHearts(hp) {
        this.hearts.forEach((h, i) => {
            h.setTexture(i < hp ? 'heart_full' : 'heart_empty');
        });
    }

    _score = 0;
    _updateScore(s) {
        this._score = s;
        this.scoreTxt.setText('SCORE  ' + String(s).padStart(6, '0'));
    }

    _addScore(pts) {
        this._score += pts;
        this._updateScore(this._score);
    }

    _onLevelStart(data) {
        this.levelTxt.setText(data.name || '');
        // Reset hearts to full
        this._updateHearts(C.P_HEALTH);
        this._hideBossBar();
    }

    _updateBossBar(hp, max) {
        const w = C.GAME_W - 40;
        const bw = Math.max(0, Math.floor((hp / max) * w));
        const y  = C.GAME_H - 14;

        this.bossBarBg.clear();
        this.bossBarBg.fillStyle(0x000000, 0.8);
        this.bossBarBg.fillRect(20, y, w, 6);

        this.bossBarFg.clear();
        this.bossBarFg.fillStyle(0xdd2222);
        this.bossBarFg.fillRect(20, y, bw, 6);
    }

    _bossPhase2() {
        this.bossTxt.setColor('#ff8800');
        this.tweens.add({
            targets: this.bossTxt, alpha: 0, yoyo: true, repeat: 3, duration: 200,
        });
    }

    _hideBossBar() {
        this.bossBarBg.clear();
        this.bossBarFg.clear();
        this.bossTxt.setText('');
    }

    showBossName(name) {
        this.bossTxt.setText(name);
        this.bossTxt.setColor('#ff4444');
        this.bossTxt.setAlpha(1);
    }
}
