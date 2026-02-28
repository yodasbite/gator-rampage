// ─────────────────────────────────────────────
//  GATOR RAMPAGE — Phaser 3 entry point
// ─────────────────────────────────────────────

const config = {
    type: Phaser.AUTO,
    width:  C.GAME_W,
    height: C.GAME_H,
    zoom:   C.ZOOM,
    backgroundColor: '#000000',
    pixelArt: true,              // nearest-neighbor = authentic SNES look
    antialias: false,
    roundPixels: true,

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // top-down: no gravity
            debug: false,        // set true to see hitboxes
        },
    },

    scene: [
        PreloadScene,
        TitleScene,
        HUDScene,
        GameScene,
        GameOverScene,
        VictoryScene,
    ],

    parent: document.body,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);
