// ─────────────────────────────────────────────
//  PreloadScene — generate all textures
// ─────────────────────────────────────────────
class PreloadScene extends Phaser.Scene {

    constructor() { super('PreloadScene'); }

    preload() {
        const w = C.GAME_W, h = C.GAME_H;

        // UF-blue loading bar background
        const bg = this.add.graphics().fillStyle(0x0021a5).fillRect(0, 0, w, h);
        const barBg = this.add.graphics().fillStyle(0x001060).fillRect(w/2-62, h/2-8, 124, 16);
        const fill  = this.add.graphics();

        this.load.on('progress', p => {
            fill.clear();
            fill.fillStyle(0xf77f00);
            fill.fillRect(w/2-60, h/2-6, 120*p, 12);
        });

        this.add.text(w/2, h/2-24, 'GATOR RAMPAGE', {
            fontFamily:'monospace', fontSize:'12px', color:'#f77f00',
        }).setOrigin(0.5);

        this.add.text(w/2, h/2+18, 'LOADING...', {
            fontFamily:'monospace', fontSize:'7px', color:'#aaaaff',
        }).setOrigin(0.5);
    }

    create() {
        this._make = (key, w, h, fn) => {
            const g = this.make.graphics({ x:0, y:0, add:false });
            fn(g);
            g.generateTexture(key, w, h);
            g.destroy();
        };

        this._genPlayer();
        this._genEnemies();
        this._genBosses();
        this._genTiles();
        this._genHUD();
        this._genFX();

        this.scene.start('TitleScene');
    }

    _genPlayer() {
        ['down','up','left','right'].forEach(d => {
            this._make(`albert_${d}`, 16, 16, g => SPRITES[`albert_${d}`](g, 0, 0));
        });
        this._make('albert_down2', 16, 16, g => SPRITES.albert_down2(g, 0, 0));
        // Reuse base frames for walk frame 2 on other directions
        ['up','left','right'].forEach(d => {
            this._make(`albert_${d}2`, 16, 16, g => SPRITES[`albert_${d}`](g, 0, 0));
        });
    }

    _genEnemies() {
        const teams = [
            { suffix:'georgia',   p:0xba0c2f, s:0x000000 },
            { suffix:'tennessee', p:0xff8200, s:0xffffff },
            { suffix:'kentucky',  p:0x0033a0, s:0xffffff },
            { suffix:'texas',     p:0xbf5700, s:0xffffff },
            { suffix:'alabama',   p:0x9e1b32, s:0xffffff },
        ];
        teams.forEach(t => {
            this._make(`fan_${t.suffix}`,  16, 16, g => SPRITES.fan(g, 0, 0, t.p, t.s));
            this._make(`fan_${t.suffix}2`, 16, 16, g => SPRITES.fan2(g, 0, 0, t.p, t.s));
        });

        ['bulldog','hound','wildcat','longhorn','elephant'].forEach(n => {
            this._make(n, 16, 16, g => SPRITES[n](g, 0, 0));
        });
    }

    _genBosses() {
        ['boss_uga','boss_smokey','boss_scratch','boss_bevo','boss_bigal'].forEach(k => {
            this._make(k, 32, 32, g => SPRITES[k](g, 0, 0));
        });
    }

    _genTiles() {
        // Tile index → generator
        const tiles = [
            [0, g => SPRITES.tile_grass(g, 0, 0)],
            [1, g => SPRITES.tile_wall(g, 0, 0)],
            [2, g => SPRITES.tile_road(g, 0, 0)],
            [3, g => SPRITES.tile_sidewalk(g, 0, 0)],
            [4, g => SPRITES.tile_tree(g, 0, 0)],
            [5, g => SPRITES.tile_bush(g, 0, 0)],
            [6, g => SPRITES.tile_building(g, 0, 0)],
            [7, g => SPRITES.tile_stadium_gate(g, 0, 0)],
            [8, g => SPRITES.tile_grass(g, 0, 0)],   // alt grass
            [9, g => SPRITES.tile_road_mid(g, 0, 0)],
        ];
        tiles.forEach(([idx, fn]) => {
            this._make(`tile_${idx}`, 16, 16, fn);
        });
    }

    _genHUD() {
        this._make('heart_full',  8, 7, g => SPRITES.heart_full(g, 0, 0));
        this._make('heart_empty', 8, 7, g => SPRITES.heart_empty(g, 0, 0));
    }

    _genFX() {
        this._make('hit_fx',    8, 8, g => SPRITES.hit_fx(g, 0, 0));
        this._make('attack_fx',16, 8, g => SPRITES.attack_fx(g, 0, 0));
        this._make('projectile', 8, 8, g => SPRITES.projectile(g, 0, 0, 0xff4400));
        this._make('flag',        16, 16, g => SPRITES.flag(g, 0, 0));
        this._make('powerup_atk', 12, 12, g => SPRITES.powerup_atk(g, 0, 0));
        this._make('powerup_hp',  12, 12, g => SPRITES.powerup_hp(g, 0, 0));
    }
}
