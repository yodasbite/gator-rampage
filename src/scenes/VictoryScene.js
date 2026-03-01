// ─────────────────────────────────────────────
//  VictoryScene — all 5 levels cleared!
// ─────────────────────────────────────────────
class VictoryScene extends Phaser.Scene {

    constructor() { super('VictoryScene'); }

    init(data) { this.finalScore = data.score || 0; }

    create() {
        Music.stop();
        const w = C.GAME_W, h = C.GAME_H;

        // Celebratory background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x001133, 0x001133, 0x002244, 0x002244, 1);
        bg.fillRect(0, 0, w, h);

        // Fireworks — timed sparks
        this._launchFireworks();

        // UF colors banner
        bg.fillStyle(0x0021a5, 0.9); bg.fillRect(0, h*0.1, w, h*0.12);
        bg.fillStyle(0xf77f00, 0.9); bg.fillRect(0, h*0.22, w, h*0.04);

        // Main text
        this.add.text(w/2, h * 0.14, 'GATOR NATION', {
            fontFamily: 'monospace', fontSize: '16px', color: '#f77f00',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5);

        this.add.text(w/2, h * 0.3, 'SEC CHAMPIONSHIP!', {
            fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5);

        // Albert victorious
        const albert = this.add.image(w/2, h * 0.52, 'albert_down').setScale(4);
        this.tweens.add({
            targets: albert, angle: [-10, 10], yoyo: true, repeat: -1, duration: 300, ease: 'Sine.easeInOut',
        });

        this.add.text(w/2, h * 0.70, 'ALL 5 RIVALS DEFEATED!', {
            fontFamily: 'monospace', fontSize: '7px', color: '#ffff00',
        }).setOrigin(0.5);

        this.add.text(w/2, h * 0.78, `FINAL SCORE: ${String(this.finalScore).padStart(6,'0')}`, {
            fontFamily: 'monospace', fontSize: '8px', color: '#f77f00',
        }).setOrigin(0.5);

        // Rival list crossed out
        const rivals = ['✓ UGA BULLDOG — BEATEN', '✓ SMOKEY HOUND — BEATEN',
                        '✓ SCRATCH WILDCAT — BEATEN', '✓ BEVO LONGHORN — BEATEN',
                        '✓ BIG AL ELEPHANT — BEATEN'];
        rivals.forEach((r, i) => {
            this.add.text(8, h * 0.3 + i * 9, r, {
                fontFamily: 'monospace', fontSize: '5px', color: '#88ff88',
            });
        });

        const playAgain = this.add.text(w/2, h * 0.9, 'PRESS SPACE TO PLAY AGAIN', {
            fontFamily: 'monospace', fontSize: '6px', color: '#ffffff',
        }).setOrigin(0.5);
        this.tweens.add({ targets: playAgain, alpha: 0, yoyo: true, repeat: -1, duration: 500 });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('TitleScene');
        });
        this.input.once('pointerdown', () => this.scene.start('TitleScene'));
    }

    _launchFireworks() {
        const colors = [0xf77f00, 0x0021a5, 0xffffff, 0xffff00, 0xff4444];
        const shoot = () => {
            const x = Phaser.Math.Between(20, C.GAME_W - 20);
            const y = Phaser.Math.Between(10, C.GAME_H * 0.65);
            const c = Phaser.Utils.Array.GetRandom(colors);
            for (let i = 0; i < 8; i++) {
                const spark = this.add.graphics()
                    .fillStyle(c).fillRect(x, y, 2, 2).setDepth(C.Z_FX);
                const ang = (i / 8) * Math.PI * 2;
                const spd = Phaser.Math.Between(20, 50);
                this.tweens.add({
                    targets: spark,
                    x: x + Math.cos(ang) * spd,
                    y: y + Math.sin(ang) * spd,
                    alpha: 0, duration: 500 + Phaser.Math.Between(0, 300),
                    onComplete: () => spark.destroy(),
                });
            }
        };

        // Fire bursts continuously
        this.time.addEvent({ delay: 400, callback: shoot, repeat: -1 });
        // Initial burst
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 150, shoot);
        }
    }
}
