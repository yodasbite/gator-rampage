// ─────────────────────────────────────────────
//  GameOverScene
// ─────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {

    constructor() { super('GameOverScene'); }

    init(data) {
        this.finalScore = data.score || 0;
        this.level      = data.level || 1;
    }

    create() {
        const w = C.GAME_W, h = C.GAME_H;

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x110000);
        bg.fillRect(0, 0, w, h);

        // Fallen Albert
        const albert = this.add.image(w/2, h * 0.4, 'albert_down')
            .setScale(2).setTint(0xff2222).setAngle(90);

        // Game Over text
        this.add.text(w/2, h * 0.18, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '20px', color: '#ff2222',
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.add.text(w/2, h * 0.56, `Defeated on Level ${this.level}`, {
            fontFamily: 'monospace', fontSize: '7px', color: '#aaaaaa',
        }).setOrigin(0.5);

        this.add.text(w/2, h * 0.64, `SCORE: ${String(this.finalScore).padStart(6,'0')}`, {
            fontFamily: 'monospace', fontSize: '9px', color: '#f77f00',
        }).setOrigin(0.5);

        // Taunt from rival
        const taunts = [
            '"Get out of our house!" — UGA',
            '"Rocky Top sends its regards!" — Vol Nation',
            '"Blue team says GO CATS!" — UK',
            '"Hook \'em, Gator!" — Longhorn Nation',
            '"ROLL TIDE and goodbye!" — Bama',
        ];
        const taunt = taunts[Math.min(this.level - 1, taunts.length - 1)];
        this.add.text(w/2, h * 0.74, taunt, {
            fontFamily: 'monospace', fontSize: '6px', color: '#888888', align: 'center',
        }).setOrigin(0.5);

        // Press space
        const retry = this.add.text(w/2, h * 0.88, 'PRESS SPACE TO TRY AGAIN', {
            fontFamily: 'monospace', fontSize: '7px', color: '#ffffff',
        }).setOrigin(0.5);

        this.tweens.add({ targets: retry, alpha: 0, yoyo: true, repeat: -1, duration: 500 });

        // Input
        this.input.keyboard.once('keydown-SPACE', () => this._restart());
        this.input.once('pointerdown', () => this._restart());
    }

    _restart() {
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
            this.scene.start('TitleScene');
        });
    }
}
