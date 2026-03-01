// ─────────────────────────────────────────────
//  TitleScene — GATOR RAMPAGE title screen
// ─────────────────────────────────────────────
class TitleScene extends Phaser.Scene {

    constructor() { super('TitleScene'); }

    create() {
        const w = C.GAME_W, h = C.GAME_H;

        // Background gradient (dark stadium)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x001133, 0x001133, 0x002266, 0x002266, 1);
        bg.fillRect(0, 0, w, h);

        // Stars / crowd dots
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, w);
            const y = Phaser.Math.Between(0, h * 0.6);
            const c = Phaser.Utils.Array.GetRandom([0xba0c2f, 0xff8200, 0x0033a0, 0xbf5700, 0x9e1b32, 0xffffff]);
            bg.fillStyle(c); bg.fillRect(x, y, 1, 1);
        }

        // Field at bottom
        bg.fillStyle(0x2a5a2a); bg.fillRect(0, h * 0.72, w, h * 0.28);
        bg.fillStyle(0x3a7a3a); bg.fillRect(0, h * 0.75, w, h * 0.05);
        bg.fillStyle(0xffffff, 0.6); bg.fillRect(w*0.1, h*0.77, w*0.8, 1); // yard line

        // ── Title text ────────────────────────
        // Shadow
        this.add.text(w/2 + 2, 42, 'GATOR', {
            fontFamily: 'monospace', fontSize: '26px', color: '#001133',
            stroke: '#001133', strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.text(w/2 + 2, 68, 'RAMPAGE', {
            fontFamily: 'monospace', fontSize: '26px', color: '#001133',
            stroke: '#001133', strokeThickness: 4,
        }).setOrigin(0.5);

        // Main title — orange
        const title1 = this.add.text(w/2, 40, 'GATOR', {
            fontFamily: 'monospace', fontSize: '26px', color: '#f77f00',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        const title2 = this.add.text(w/2, 66, 'RAMPAGE', {
            fontFamily: 'monospace', fontSize: '26px', color: '#0021a5',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(w/2, 92, 'SEC CHAMPIONSHIP BRAWL', {
            fontFamily: 'monospace', fontSize: '6px', color: '#ffffff',
        }).setOrigin(0.5);

        // Albert sprite (big)
        const albert = this.add.image(w/2, h * 0.58, 'albert_down')
            .setScale(3);

        // Enemy preview sprites on sides
        this.add.image(w * 0.18, h * 0.58, 'boss_uga').setScale(1.2).setFlipX(true);
        this.add.image(w * 0.82, h * 0.58, 'boss_bigal').setScale(1.2);

        // ── Instructions ─────────────────────
        this.add.text(w/2, h - 60, 'WASD / ARROWS  Move', {
            fontFamily: 'monospace', fontSize: '6px', color: '#aaaaaa',
        }).setOrigin(0.5);
        this.add.text(w/2, h - 50, 'SPACE / Z        Attack', {
            fontFamily: 'monospace', fontSize: '6px', color: '#aaaaaa',
        }).setOrigin(0.5);

        // Blink "PRESS SPACE"
        const pressStart = this.add.text(w/2, h - 30, 'PRESS SPACE TO START', {
            fontFamily: 'monospace', fontSize: '8px', color: '#f77f00',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: pressStart, alpha: 0, yoyo: true, repeat: -1, duration: 500,
        });

        // Bounce Albert
        this.tweens.add({
            targets: albert, y: h * 0.58 - 4, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut',
        });

        // ── Start ─────────────────────────────
        this.input.keyboard.once('keydown-SPACE', () => this._startGame());
        this.input.once('pointerdown', () => this._startGame());
    }

    _startGame() {
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
            // Stop HUDScene only if it is actually running (safe guard)
            if (this.scene.isActive('HUDScene') || this.scene.isPaused('HUDScene')) {
                this.scene.stop('HUDScene');
            }
            this.scene.start('GameScene', { levelIndex: 0 });
            this.scene.launch('HUDScene');
        });
    }
}
