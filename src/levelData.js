// ─────────────────────────────────────────────
//  GATOR RAMPAGE — Level definitions v2
//  Gunsmoke-style: walk up a campus street,
//  fight fans along the way, boss waits at the
//  stadium entrance gates at the top.
//
//  Map tile key (30 cols × 40 rows):
//   0 = grass (walkable, textured)
//   1 = wall / building / impassable
//   2 = road / path (center lane)
//   3 = sidewalk (flanking path)
//   4 = tree (impassable)
//   5 = bush (impassable)
//   6 = building (impassable)
//   7 = stadium gate (impassable, decorative top)
//   8 = grass alt / end zone color
// ─────────────────────────────────────────────

// ── Map builder helpers ───────────────────────
// Builds the standard "street through campus" 30×40 layout.
// coloring (gate color, building shade) is done via tinting in GameScene.
//
// Layout cross-section (30 cols):
//  0-2:  grass edge
//  3-5:  buildings / trees (impassable)
//  6-7:  sidewalk
//  8-21: road / open area (14 wide – players fight here)
//  22-23:sidewalk
//  24-26:buildings / trees
//  27-29:grass edge
//
// Rows (top=0 is far end / stadium, bottom=39 is player start):
//  0-4:   stadium gate facade
//  5-8:   plaza in front of gate (open, boss fight here)
//  9-38:  campus street (enemies patrol)
//  39:    player start row

function makeStreet(gateRows, extraObstacles) {
    const rows = [];

    // Row 0-1: Stadium gate top
    rows.push([1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,1]);
    rows.push([1,1,1,1,1,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,1,1,1,1,1,1]);

    // Row 2-3: Gate arch
    rows.push([0,0,0,6,6,6,7,7,7,1,1,1,2,2,2,2,2,2,1,1,1,7,7,7,6,6,0,0,0,0]);
    rows.push([0,0,0,6,6,6,7,7,1,1,2,2,2,2,2,2,2,2,2,2,1,1,7,7,6,6,0,0,0,0]);

    // Row 4: Gate entrance open
    rows.push([0,0,0,0,6,6,6,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,6,6,6,0,0,0,0]);

    // Row 5-8: Plaza (open, boss fight)
    for (let r = 0; r < 4; r++) {
        rows.push([0,0,4,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,4,0,0,0,0]);
    }

    // Row 9-38: Campus street
    for (let r = 0; r < 30; r++) {
        const globalRow = 9 + r;
        // Default street slice
        let row = [
            0,0, 6,6, 3,3, 3,3, 2,2,2,2,2,2,2,2,2,2,2,2, 3,3, 3,3, 6,6, 0,0,0,0
        ];

        // Extra obstacles injected by level (replace col positions)
        if (extraObstacles) {
            extraObstacles.forEach(obs => {
                if (obs.row === globalRow) {
                    obs.cols.forEach(c => { if (c < 30) row[c] = obs.tile; });
                }
            });
        }

        // Alternate building/tree along edges
        const phase = r % 8;
        if (phase === 0 || phase === 1) {
            row[2] = 6; row[3] = 6; row[26] = 6; row[27] = 6;
        } else if (phase === 3 || phase === 4) {
            row[2] = 4; row[3] = 5; row[26] = 5; row[27] = 4;
        } else {
            row[2] = 0; row[3] = 3; row[26] = 3; row[27] = 0;
        }

        rows.push(row);
    }

    // Row 39: Player start (all open road)
    rows.push([0,0,0,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,0,0,0,0,0,0]);

    return rows;
}

const LEVEL_DATA = [

    // ══════════════════════════════════════════
    //  LEVEL 1 — Athens, Georgia
    // ══════════════════════════════════════════
    {
        id: 1,
        name: 'ATHENS, GEORGIA',
        subtitle: '"The Dawg Walk"',
        bossName: 'UGA THE BULLDOG',
        bossSprite: 'boss_uga',
        bossIntro: 'You dare march through\nour hedges?  GET EM BOYS!',
        victoryText: 'Chomped Uga good!\nThe Dawg Walk belongs to the Gators!',

        fanColors:    [0xba0c2f, 0x000000],
        minionSprite: 'bulldog',
        bossProjectileColor: 0xba0c2f,

        // Theming hints (used by GameScene to tint tiles)
        gateColor:    0xba0c2f,
        buildingColor:0x8a4a2a,
        seatColor:    0x8a1a1a,

        playerStart: { x: 15, y: 38 },
        bossPos:     { x: 15, y: 6 },

        powerups: [
            { x: 13, y: 26, type: 'atk' },   // orange orb mid-street
            { x: 17, y: 16, type: 'hp'  },   // blue orb upper street
        ],

        enemies: [
            { x:14, y:34, type:'fan' },
            { x:17, y:32, type:'fan' },
            { x:11, y:30, type:'fan' },
            { x:19, y:28, type:'minion' },
            { x:13, y:27, type:'fan' },
            { x:16, y:25, type:'fan' },
            { x:10, y:23, type:'minion' },
            { x:20, y:22, type:'fan' },
            { x:14, y:20, type:'fan' },
            { x:12, y:18, type:'fan' },
            { x:18, y:17, type:'minion' },
            { x:15, y:15, type:'fan' },
            { x:11, y:13, type:'fan' },
            { x:19, y:12, type:'minion' },
            { x:14, y:10, type:'fan' },
        ],

        map: makeStreet([]),
    },

    // ══════════════════════════════════════════
    //  LEVEL 2 — Knoxville, Tennessee
    // ══════════════════════════════════════════
    {
        id: 2,
        name: 'KNOXVILLE, TENNESSEE',
        subtitle: '"Rocky Top Road"',
        bossName: 'SMOKEY THE HOUND',
        bossSprite: 'boss_smokey',
        bossIntro: 'Rocky Top! You\'ll always be...\nthe place where Gators get beat!',
        victoryText: 'Smokey\'s howling days are done!\nGators rule Rocky Top!',

        fanColors:    [0xff8200, 0xffffff],
        minionSprite: 'hound',
        bossProjectileColor: 0xff8200,

        gateColor:    0xff8200,
        buildingColor:0x775533,
        seatColor:    0xcc5500,

        playerStart: { x:15, y:38 },
        bossPos:     { x:15, y:6 },

        powerups: [
            { x: 16, y: 24, type: 'atk' },
            { x: 12, y: 14, type: 'hp'  },
        ],

        enemies: [
            { x:13, y:35, type:'fan' },
            { x:17, y:33, type:'fan' },
            { x:10, y:31, type:'minion' },
            { x:20, y:29, type:'fan' },
            { x:14, y:27, type:'fan' },
            { x:16, y:25, type:'minion' },
            { x:11, y:23, type:'fan' },
            { x:19, y:21, type:'fan' },
            { x:14, y:19, type:'minion' },
            { x:13, y:17, type:'fan' },
            { x:18, y:15, type:'fan' },
            { x:15, y:13, type:'minion' },
            { x:11, y:11, type:'fan' },
            { x:20, y:10, type:'fan' },
            { x:14, y:8,  type:'minion' },
        ],

        map: makeStreet([
            // A few extra trees in the road at specific rows
            { row:20, cols:[9,10], tile:4 },
            { row:20, cols:[20,21], tile:4 },
        ]),
    },

    // ══════════════════════════════════════════
    //  LEVEL 3 — Lexington, Kentucky
    // ══════════════════════════════════════════
    {
        id: 3,
        name: 'LEXINGTON, KENTUCKY',
        subtitle: '"Commonwealth Drive"',
        bossName: 'SCRATCH THE WILDCAT',
        bossSprite: 'boss_scratch',
        bossIntro: 'Wildcats are QUICK!\nYou\'ll never keep up with me!',
        victoryText: 'Scratch has been scratched!\nGators claw through the Bluegrass!',

        fanColors:    [0x0033a0, 0xffffff],
        minionSprite: 'wildcat',
        bossProjectileColor: 0x0033a0,

        gateColor:    0x0033a0,
        buildingColor:0x334488,
        seatColor:    0x002288,

        playerStart: { x:15, y:38 },
        bossPos:     { x:15, y:6 },

        powerups: [
            { x: 14, y: 27, type: 'atk' },
            { x: 18, y: 16, type: 'hp'  },
        ],

        enemies: [
            { x:15, y:35, type:'fan' },
            { x:11, y:33, type:'minion' },
            { x:19, y:31, type:'fan' },
            { x:14, y:29, type:'fan' },
            { x:17, y:27, type:'minion' },
            { x:10, y:25, type:'fan' },
            { x:20, y:23, type:'fan' },
            { x:13, y:21, type:'minion' },
            { x:16, y:19, type:'fan' },
            { x:12, y:17, type:'fan' },
            { x:18, y:15, type:'minion' },
            { x:14, y:13, type:'fan' },
            { x:16, y:11, type:'fan' },
            { x:11, y:9,  type:'minion' },
            { x:19, y:8,  type:'fan' },
        ],

        map: makeStreet([
            { row:22, cols:[9,20], tile:5 },   // bushes mid-road
            { row:15, cols:[9,20], tile:5 },
        ]),
    },

    // ══════════════════════════════════════════
    //  LEVEL 4 — Austin, Texas
    // ══════════════════════════════════════════
    {
        id: 4,
        name: 'AUSTIN, TEXAS',
        subtitle: '"Sixth Street to DKR"',
        bossName: 'BEVO THE LONGHORN',
        bossSprite: 'boss_bevo',
        bossIntro: 'Texas is BACK!\nAnd your gator hide is on my horns!',
        victoryText: 'Bevo\'s been branded!\nGators charge through Austin!',

        fanColors:    [0xbf5700, 0xffffff],
        minionSprite: 'longhorn',
        bossProjectileColor: 0xbf5700,

        gateColor:    0xbf5700,
        buildingColor:0x664400,
        seatColor:    0x994400,

        playerStart: { x:15, y:38 },
        bossPos:     { x:15, y:6 },

        powerups: [
            { x: 11, y: 28, type: 'atk' },
            { x: 19, y: 20, type: 'hp'  },
            { x: 15, y: 12, type: 'atk' },   // second atk orb on later level
        ],

        enemies: [
            { x:12, y:36, type:'fan' },
            { x:18, y:34, type:'fan' },
            { x:14, y:32, type:'minion' },
            { x:16, y:30, type:'fan' },
            { x:11, y:28, type:'fan' },
            { x:20, y:26, type:'minion' },
            { x:14, y:24, type:'fan' },
            { x:17, y:22, type:'fan' },
            { x:13, y:20, type:'minion' },
            { x:16, y:18, type:'fan' },
            { x:11, y:16, type:'fan' },
            { x:19, y:14, type:'minion' },
            { x:15, y:12, type:'fan' },
            { x:12, y:10, type:'fan' },
            { x:18, y:8,  type:'minion' },
        ],

        map: makeStreet([
            { row:25, cols:[9,10,11], tile:5 },
            { row:18, cols:[19,20,21], tile:4 },
        ]),
    },

    // ══════════════════════════════════════════
    //  LEVEL 5 — Tuscaloosa, Alabama
    // ══════════════════════════════════════════
    {
        id: 5,
        name: 'TUSCALOOSA, ALABAMA',
        subtitle: '"Bryant Drive"',
        bossName: 'BIG AL THE ELEPHANT',
        bossSprite: 'boss_bigal',
        bossIntro: 'ROLL TIDE!\nYou will be STOMPED into this turf!',
        victoryText: 'THE TIDE HAS ROLLED OUT!\nGATOR NATION RULES THE SEC!',

        fanColors:    [0x9e1b32, 0xffffff],
        minionSprite: 'elephant',
        bossProjectileColor: 0x9e1b32,

        gateColor:    0x9e1b32,
        buildingColor:0x5a1020,
        seatColor:    0x7a1020,

        playerStart: { x:15, y:38 },
        bossPos:     { x:15, y:6 },

        powerups: [
            { x: 13, y: 30, type: 'atk' },
            { x: 17, y: 22, type: 'hp'  },
            { x: 15, y: 13, type: 'atk' },   // second atk orb on final level
        ],

        enemies: [
            { x:14, y:36, type:'minion' },  // harder level — starts with minion
            { x:16, y:34, type:'fan' },
            { x:11, y:32, type:'fan' },
            { x:19, y:30, type:'minion' },
            { x:15, y:28, type:'fan' },
            { x:13, y:26, type:'minion' },
            { x:17, y:24, type:'fan' },
            { x:10, y:22, type:'fan' },
            { x:20, y:20, type:'minion' },
            { x:14, y:18, type:'fan' },
            { x:16, y:16, type:'minion' },
            { x:12, y:14, type:'fan' },
            { x:18, y:12, type:'fan' },
            { x:15, y:10, type:'minion' },
            { x:13, y:8,  type:'fan' },
        ],

        map: makeStreet([
            { row:28, cols:[9,10], tile:5 },
            { row:28, cols:[20,21], tile:5 },
            { row:19, cols:[9,10], tile:4 },
            { row:19, cols:[20,21], tile:4 },
        ]),
    },
];
