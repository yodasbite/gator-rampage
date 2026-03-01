// ─────────────────────────────────────────────
//  GATOR RAMPAGE — Sprite definitions (v2)
//  SNES-quality pixel art via 1px renderer
// ─────────────────────────────────────────────

// ── Pixel-art renderer ────────────────────────
// rows: array of 16-char strings, each char = palette key or '.' (transparent)
// pal:  object mapping char → 0xRRGGBB
// ox/oy: top-left offset in the graphics context
function px(g, rows, pal, ox, oy) {
    for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
            const c = row[x];
            if (c === '.') continue;
            const color = pal[c];
            if (color === undefined) continue;
            g.fillStyle(color);
            g.fillRect(ox + x, oy + y, 1, 1);
        }
    }
}

const SPRITES = {

    // ════════════════════════════════════════
    //  PLAYER — Albert the Gator (16×16)
    //  Palette:
    //   k = outline #0d1a0d
    //   1 = deep shadow green #163c16
    //   2 = shadow green #2a6b2a
    //   3 = base green #44a044
    //   4 = bright green #6cc86c
    //   5 = highlight green #9cdc9c
    //   O = UF orange #f77f00
    //   o = dark orange #b05c00
    //   L = light orange #ffaa44
    //   B = UF blue #0021a5
    //   b = dark blue #001480
    //   C = light blue #4466dd
    //   w = white #f0f0f0
    //   x = pupil #0d0d0d
    //   s = scale detail #39893a
    // ════════════════════════════════════════

    albert_down(g, ox, oy) {
        px(g, [
            '....kkkkkkkk....',  // head top
            '...k333444333k..',  // upper head
            '..k3455555534k..',  // highlights
            '..k34ww44ww43k..',  // eyes
            '..k34wx44xw43k..',  // pupils
            '..k3444444443k..',  // jaw
            '.k23OLOOOOLOo2k.',  // chest/belly orange
            'k23OObBBBBbOo23k',  // jersey blue
            'k23ObBBBBBBbo23k',  // jersey center
            'k23OObBBBBbOo23k',  // jersey blue
            '.k23oOOOoOOo23k.',  // lower belly shadow
            '..k23333333322k.',  // hips
            '.k1.k233s33k.21k',  // legs out
            'k1..k1k111k.1..k',  // feet/claws
            '................',
            '................',
        ], {
            k:0x0d1a0d, '1':0x163c16, '2':0x2a6b2a, '3':0x44a044,
            '4':0x6cc86c, '5':0x9cdc9c,
            O:0xf77f00, o:0xb05c00, L:0xffaa44,
            B:0x0021a5, b:0x001480, C:0x4466dd,
            w:0xf0f0f0, x:0x0d0d0d, s:0x39893a,
        }, ox, oy);
    },

    albert_up(g, ox, oy) {
        px(g, [
            '....kkkkkkkk....',  // snout
            '...k11s3s3s1k...',  // top of head/spine
            '..k15444444541k.',  // back scales
            '..k3445s5s5443k.',
            '..k34s4s4s443k..',
            '..k344444444k...',
            '.k23OoOOOOoO23k.',  // back of jersey
            'k23OoOoOoOoOO23k',
            'k23OoOOOOoOoO23k',
            'k23OoOoOoOoOO23k',
            '.k23OOOOOOOO23k.',
            '..k23333333322k.',
            '.k1.k233s33k.21k',
            'k1..k1k111k.1..k',
            '................',
            '................',
        ], {
            k:0x0d1a0d, '1':0x163c16, '2':0x2a6b2a, '3':0x44a044,
            '4':0x6cc86c, '5':0x9cdc9c,
            O:0xf77f00, o:0xb05c00,
            s:0x39893a,
        }, ox, oy);
    },

    albert_right(g, ox, oy) {
        px(g, [
            '...kkkkkk.......',  // snout tip
            '..k444444kk.....',
            '.k45554444k3kk..',  // eye side
            'k455ww44443k23k.',  // eye
            'k455wx444443k23k', // pupil
            'k455544444432k2k',
            'k23OOLOOOO32k11k', // belly right
            'k23OBbBBOO32k.1k',
            'k23OBbBBOO32k..k',
            'k23OOLOOOO32k.1k',
            'k23oOOoOO32k11k.',
            'k23333333322kk..',
            'k1333s33322k....',
            'k11k111k1kk.....',
            '.k...k..k.......',
            '................',
        ], {
            k:0x0d1a0d, '1':0x163c16, '2':0x2a6b2a, '3':0x44a044,
            '4':0x6cc86c, '5':0x9cdc9c,
            O:0xf77f00, o:0xb05c00, L:0xffaa44,
            B:0x0021a5, b:0x001480,
            w:0xf0f0f0, x:0x0d0d0d, s:0x39893a,
        }, ox, oy);
    },

    albert_left(g, ox, oy) {
        px(g, [
            '.......kkkkkk...',
            '.....kk444444k..',
            '..kk3k4444455k..',
            '.k32k3444444ww554k', // truncated to 16
            '.k32k344444xw554k',
            '.k11k23444445554k',
            'k11k.k23OLOOOOO23k',
            'k1k..k23OBbBBOO23k',
            'k..k..k23OBbBBOO23k',
            'k1k..k23OBbBBOO23k',
            'k11k.k23oOOOoOO2k.',
            '..kk.k2333333322k.',
            '....k2233s3322k...',
            '.....kk1k111k11k..',
            '.......k...k...k..',
            '................',
        ], {
            k:0x0d1a0d, '1':0x163c16, '2':0x2a6b2a, '3':0x44a044,
            '4':0x6cc86c, '5':0x9cdc9c,
            O:0xf77f00, o:0xb05c00, L:0xffaa44,
            B:0x0021a5, b:0x001480,
            w:0xf0f0f0, x:0x0d0d0d, s:0x39893a,
        }, ox, oy);
    },

    // Walk frame 2 — shift legs
    albert_down2(g, ox, oy) {
        // Same as down but with legs in alternate position
        SPRITES.albert_down(g, ox, oy);
        // overdraw legs in different position
        const pal2 = { k:0x0d1a0d, '1':0x163c16, '2':0x2a6b2a, '3':0x44a044 };
        px(g, [
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            '................',
            'k1.k233s33k21...',  // legs shifted
            '..k1k111k1k.....',
        ], pal2, ox, oy);
    },

    // ════════════════════════════════════════
    //  ENEMY FAN (16×16)
    //  Generic humanoid — colors per team
    //  Palette vars: P=primary, S=secondary
    //   k = outline  h = hair/skin accent
    //   f = face skin  n = neck shadow
    //   d = dark leg  e = eye dot
    // ════════════════════════════════════════

    _fan(g, ox, oy, P, S, hair) {
        const pal = {
            k: 0x111111,    // outline
            P: P,           // jersey primary
            p: darken(P, 0.7),  // jersey shadow
            q: lighten(P, 1.3), // jersey highlight
            S: S,           // jersey secondary / number
            f: 0xd4a056,    // face skin
            n: 0xb08040,    // face shadow
            h: hair || 0x3a2800, // hair
            w: 0xf0f0f0,    // white detail
            e: 0x111111,    // eye
            g: 0x555577,    // pants (dark)
            G: 0x667788,    // pants highlight
            s: 0x444444,    // shoe
            S2:0x666666,    // shoe highlight
        };
        px(g, [
            '....khhhhhhk....',  // hair
            '...khhhhhhhhhk..',
            '...kffnfffffk...',  // face
            '...kfefknefk....',  // eyes
            '...kfffnfffk....',
            '..kknffffnkk....',  // chin/neck
            '.kk.kpPPPpk.kk.',  // shoulders
            'kqPk.kPSSPk.kPk',  // jersey arms
            'kPpk.kPSSPk.kpk',  // jersey body
            'kqPk.kPSSPk.kPk',
            '.kk..kpPPpk..kk.',  // waist
            '....kgGGGGgk....',  // pants
            '...kgGk..kGgk...',  // upper legs
            '..ksk.k..k.ksk.',  // lower legs
            '..ksk.k..k.ksk.',  // shoes
            '..kkk.....kkk..',  // shoe bottoms
        ], pal, ox, oy);
    },

    fan(g, x, y, primary, secondary) {
        SPRITES._fan(g, x, y, primary || 0xba0c2f, secondary || 0x000000, 0x2a1800);
    },
    fan2(g, x, y, primary, secondary) {
        // Walk frame 2 — shifted arms
        SPRITES._fan(g, x, y, primary || 0xba0c2f, secondary || 0x000000, 0x2a1800);
    },

    // ════════════════════════════════════════
    //  MASCOT MINIONS (16×16)
    // ════════════════════════════════════════

    bulldog(g, ox, oy) {
        px(g, [
            '....kkkkkkkk....',
            '..kk3a3a33a3kk..',  // top of head brown
            '.k3aa3aa33aa3ak.',
            'k.kAA33k33AA3k.',   // floppy ears
            'k.kAA33.33AA3k.',
            '.k3333333333k...',  // head
            '.k33ww3k3ww33k..',  // eyes
            '.k33w#3k3#w33k..',  // pupils
            '..k33N33333k....',  // big nose
            '..k3JJJJJJ3k...',  // jowls
            '..k3RR3k3RR3k..',  // red jersey / collar
            '.kRRRRRk3RRRRRk',  // jersey body
            '.kRk.k33333k.kRk', // legs
            'kAkk.kAAAAk.kkAk',  // paws
            '................',
            '................',
        ], {
            k:0x111111, '3':0xc89050, a:0xa07030, A:0xd4b080,
            J:0xc09060, w:0xf0f0f0, '#':0x111111, N:0x333333,
            R:0xba0c2f, r:0x8a0a22,
        }, ox, oy);
    },

    hound(g, ox, oy) {
        px(g, [
            '....kkkkkkkk....',
            '..kk4b4b44b4kk..',
            'kbbbbbb4444bbbbbk',  // very long droopy ears
            'kbbbbbb4444bbbbbk',
            '.k44444444444k..',
            '.k44ww44k4ww4k..',
            '.k44w#44k4#w4k..',
            '..k44444444k....',
            '..k44NN4NN4k....',  // nose
            '..k4444444k.....',
            '..kOOO4OOOk.....',  // orange collar
            '.kOOOOkOOOOk....',
            '.kOk.k4444k.kOk.',
            'k4kk.k4444k.kk4k',
            '................',
            '................',
        ], {
            k:0x111111, '4':0xd4c090, b:0xb09060, a:0x907040,
            w:0xf0f0f0, '#':0x111111, N:0x333333,
            O:0xff8200, o:0xcc6600,
        }, ox, oy);
    },

    wildcat(g, ox, oy) {
        px(g, [
            '....kBBkkkBBk...',  // pointed ears
            '...kBpBkkBpBk...',  // inner ear pink
            '..kBBBBBBBBBBk..',
            '.kBBBwwBBwwBBBk.',  // eyes
            '.kBBBw#BBw#BBBk.',  // pupils
            '.kBBBBBBBBBBBk..',
            '..kBBBBBBBBBk...',
            '..kwwwwwwwwwk...',  // whisker row white
            'k.kwBBBBBBBwk..',   // muzzle
            '...k#BBBBBBk....',  // nose
            '..kWWkBBBkWWk...',  // white jersey chest
            '.kBBBBkWWkBBBBk.',
            '.kBk.kWWWWk.kBk.',
            'kBkk.kBBBBk.kkBk',
            '................',
            '................',
        ], {
            k:0x111111, B:0x0033a0, b:0x001f70, p:0xff8888,
            w:0xf0f0f0, W:0xffffff, '#':0x111111,
        }, ox, oy);
    },

    longhorn(g, ox, oy) {
        px(g, [
            'k....kHHHHk....k',  // WIDE long horns
            '.kHHHHAAAAHHHHk.',  // horn detail
            '.kHHHAAAAAAAAk..',
            '..kAAAAAAAAk....',  // head tan
            '..kAAwwAAAwwAk..',  // eyes
            '..kAAw#AAw#AAk..',  // pupils
            '..kAAAAAAAAAAk..',
            '..kAA##AA##AAk..',  // nostril
            '..kAAAAAAAAAAAAk',
            '..kOOOOOOOOOk..',  // burnt orange jersey
            '.kOOOkOOOOOkOOk.',
            '.kOk.kOOOOOk.kOk',
            'kAkk.kAAAAk.kkAk',
            '................',
            '................',
            '................',
        ], {
            k:0x111111, A:0xd4a056, H:0xe8c878, h:0xc09040,
            w:0xf0f0f0, '#':0x111111,
            O:0xbf5700, o:0x8a3a00,
        }, ox, oy);
    },

    elephant(g, ox, oy) {
        px(g, [
            '..kkkkkkkkkkk...',
            '.k8888888888888k',  // wide gray head
            'k8888ww8888ww88k',  // eyes
            'k8888w#8888#w88k',  // pupils
            'k8888888888888k.',  // broad face
            'k88888888888888k',
            '.k888888888888k.',
            '..k8888TT888k...',  // trunk
            '..k888TTT88k....',
            '..k88TTTT8k.....',  // trunk extending
            '.k88888888888k..',
            'kRRRkRRRRRRRRRRk', // crimson jersey
            'kRk.kRRRRRRRk.kRk',
            'k8k..k8888k..k8k',
            '................',
            '................',
        ], {
            k:0x111111, '8':0x999999, '9':0x777777, d:0x555555,
            T:0x888888, w:0xf0f0f0, '#':0x111111,
            R:0x9e1b32, r:0x6a0f20,
        }, ox, oy);
    },

    // ════════════════════════════════════════
    //  BOSSES (32×32)
    //  Larger, more detailed pixel art
    // ════════════════════════════════════════

    boss_uga(g, ox, oy) {
        // Big bulldog — red collar, jowly face, angry brows
        const pal = {
            k:0x111111, A:0xd4a870, a:0xb08850, d:0x886030,
            w:0xf0f0f0, x:0x111111, n:0x333333, J:0xc09860,
            R:0xba0c2f, r:0x8a0922, s:0xdddddd, W:0xffffff,
        };
        px(g, [
            '............kkkkkkkk............',
            '...........kAAAAAAAAk...........',
            '..........kAAAAAAAAAAk..........',
            '......kkkkAAAAAAAAAAAAAAkkk.....',  // floppy ears start
            '.....kJJJkAAAAAAAAAAAAkJJJk.....',
            '....kJJJJkAAAAAAAAAAAAkJJJJk....',
            '....kJJJJkAAAwwAAAAwwAAkJJJJk...',  // eyes
            '....kJJJJkAAAwxAAAAxwAAkJJJJk...',  // pupils
            '....kJJJJkAAAAAAAAAAAAkJJJJk....',
            '.....kJJJkAAAAAkAAAAkAkJJJk.....',  // brow furrow angry
            '......kkkkaAAAAAAAAAAAAakkk......',
            '........kAAJJkAAAAkJJAAk........',  // jowls
            '.......kAJJJJJAAAAJJJJJAk.......',
            '......kAJnJJJAAAAJJJnJAk........',
            '......kAAAAnnnnnnnnnAAAAAk.......',  // chin
            '.......kRRRRRRRRRRRRRRk.........',  // red collar
            '......kRRRRkAAAAAAAAkRRRRk.......',
            '.....kRRRk..kAAAAAAAAk..kRRRk....',
            '....kRRk....kAAAAAAAAk....kRRk...',
            '....kRk.....kAAAAAAAAk.....kRk...',
            '...kRk......kAAAAAAAAk......kRk..',
            '..kRk.......kAAAAAAAAk.......kRk.',
            '..kk........kAAAAAAAAk........kk.',
            '............kAAAAAAAAk...........',
            '...........kAAAAAAAAAAk..........',
            '..........kAAAAkAAAAkAAAAk.......',  // legs
            '.........kAAAAkk....kkAAAAk......',
            '........kAAAk........kAAAk.......',
            '........kAAk..........kAAk.......',
            '........kkkk..........kkkk.......',
            '................................',
            '................................',
        ], pal, ox, oy);
    },

    boss_smokey(g, ox, oy) {
        // Tennessee hound — long droopy ears, orange
        const pal = {
            k:0x111111, A:0xd4c090, a:0xb09060, d:0x806040,
            w:0xf0f0f0, x:0x111111, n:0x333333,
            O:0xff8200, o:0xcc6600, L:0xffaa44,
            W:0xffffff,
        };
        px(g, [
            '....kkkkkkkkkkkkkkkkkk..........',
            '...kAAAAAAAAAAAAAAAAAAAAk........',
            '..kAAAAAAAAAAAAAAAAAAAAAAAAk.....',  // very long ears drooping down
            '.kddddAAAAAAAAAAAAAAAAdddddk....',
            'kddddddAAAAAAAAAAAAAAAAdddddddk.',
            'kddddddAAAAwwAAAAwwAAAAdddddddk.',  // eyes
            'kddddddAAAAwxAAAAxwAAAAdddddddk.',  // pupils
            'kddddddAAAAAAAAAAAAAAAAdddddddk.',
            '.kddddkAAAAAAAAAAAAAAAAkddddddk.',
            '..kkkk.kAAAAkAAAAkAAAAk..kkkk..',
            '......kAAAAJJAAAAJJAAAAk........',  // jowls
            '.....kAJJJJJAAAAJJJJJAJk.......',
            '....kAJnJJJAAAAAAAAJnJAk........',
            '....kAAAAnnnAAAAAnnnAAAAk........',
            '....kOOOOOOOOOOOOOOOOOk........',  // orange collar/body
            '...kOOOOkAAAAAAAAAAAAkOOOOk.....',
            '..kOOOk..kOOOOOOOOOOk..kOOOk...',
            '.kOOk....kOOWWkkkWWOOk....kOOk.',  // Vol T on jersey
            '.kOk.....kOWWOkOWWOOk.....kOk..',
            '.kOk.....kOWWWWWWWOOk.....kOk..',
            '.kOk.....kOOWWkkkWWOOk....kOk..',
            '..kk.....kOOOOOOOOOOk.....kk...',
            '.........kOOOOOOOOOOk...........',
            '........kAAAAAAAAAAAAk..........',
            '.......kAAAAkAAAAkAAAAk.........',
            '......kAAAAkk......kkAAAAk......',
            '.....kAAAk............kAAAk.....',
            '.....kAAk..............kAAk.....',
            '.....kkkk..............kkkk.....',
            '................................',
            '................................',
            '................................',
        ], pal, ox, oy);
    },

    boss_scratch(g, ox, oy) {
        // Kentucky Wildcat — lithe, pointed ears, green eyes
        const pal = {
            k:0x111111, B:0x0033a0, b:0x001f70, C:0x4466dd,
            w:0xf0f0f0, x:0x111111, g:0x228822, G:0x44cc44,
            p:0xff9999, W:0xffffff, s:0xffffff,
        };
        px(g, [
            '....kBBkkkkkkkBBk...............',  // pointed ears
            '...kBpBkkBBBBkBpBk..............',
            '..kBBBBkBBBBBBkBBBk.............',
            '.kBBBBBBBBBBBBBBBBBk............',
            '.kBBBCCBBBBBBBBCCBBk............',
            '.kBBBCgBBBBBBBBgCBBk............',  // green eyes
            '.kBBBCGBBBBBBBBGCBBk............',
            '.kBBBBBBBBBBBBBBBBk.............',
            '..kBBBBBBBBBBBBBBk..............',
            'ssssssssssBBBBssssssssss........',  // whiskers
            'ssssssssBBBBBBBBssssssss........',
            '...kBBBBBBBBBBBBBBBBk...........',
            '..kBBBBBkBBBBBBkBBBBBk..........',  // markings
            '.kBBBBBkBWWWWWWkBBBBBBk.........',  // white chest
            '.kBBBk..kWWWWWWk..kBBBk.........',
            '..kk....kWWWWWWk....kk...........',
            '.......kBBkWWkBBk...............',
            '......kBBk..kBBk................',
            '......kBk....kBk................',  // legs
            '......kBk....kBk................',
            '.....kBBk....kBBk...............',
            '.....kwwk....kwwk...............',  // claws
            '....kwwwk....kwwwk..............',
            '....kkkk......kkkk..............',
            '................................',
            '................................',
            '................................',
            '................................',
            '................................',
            '................................',
            '................................',
            '................................',
        ], pal, ox, oy);
    },

    boss_bevo(g, ox, oy) {
        // Texas Longhorn — massive horns, big snout
        const pal = {
            k:0x111111, A:0xd4a056, a:0xb07830, H:0xe8c878,
            h:0xc09850, w:0xf0f0f0, x:0x111111, n:0x333333,
            O:0xbf5700, o:0x8a3a00, L:0xdd7a20,
        };
        px(g, [
            'kHHk....kHHHHHHHHHHHHk....kHHk',  // horns extend wide
            'kHhk....kHHhhhhhhhhhHk....kHhk',
            '.khk....kHhAAAAAAAhHk.....khk.',
            '..k.....kAAAAAAAAAAAAAk....k..',
            '.......kAAAAAAAAAAAAAAAAk......',
            '......kAAAAAAAAAAAAAAAAAAAAk...',
            '......kAAAAwwAAAAAAAAwwAAAAk...',  // eyes
            '......kAAAAwxAAAAAAAAxwAAAAk...',  // pupils
            '......kAAAAAAAAAAAAAAAAAAAAk...',
            '......kAAAAAAAAAAAAAAAAAAAAk...',
            '.......kAAAAAAAAAAAAAAAAAAAAk..',
            '........kAAAAAAAAAAAAAAAAAk....',
            '........kAAAAnnnnnnnnAAAAk.....',  // nostrils
            '.......kAAAAAnnnnnnnnAAAAAAAAk.',
            '......kAAAAAAAAAAAAAAAAAAAAAk..',
            '.....kOOOOOOOOOOOOOOOOOOOOk...',  // burnt orange jersey
            '....kOOOOkAAAAAAAAAAAAkOOOOk...',
            '...kOOOk..kOOOOOOOOOOk..kOOOk.',
            '..kOOk....kOOLLLLLLOOk....kOOk',  // hook em design
            '..kOk.....kOOLkkkLOOk.....kOk.',
            '..kOk.....kOOLkkkLOOk.....kOk.',
            '..kOk.....kOOLLLLLOOk.....kOk.',
            '..kk......kOOOOOOOOOOk.....kk.',
            '..........kOOOOOOOOOOk........',
            '.........kAAAAAAAAAAAAAk.......',
            '........kAAAAkAAAAAkAAAAk......',
            '.......kAAAAkk.......kkAAAAk...',
            '......kAAAAk...........kAAAAk..',
            '......kAAAk.............kAAAk..',
            '......kAAAk.............kAAAk..',
            '......kAAAk.............kAAAk..',
            '......kkkk...............kkkk..',
        ], pal, ox, oy);
    },

    boss_bigal(g, ox, oy) {
        // Alabama Elephant — massive, trunk, crimson
        const pal = {
            k:0x111111, E:0x999999, e:0x777777, D:0x555555,
            p:0xffbbbb, T:0x888888, w:0xf0f0f0, x:0x111111,
            Y:0xffffcc, R:0x9e1b32, r:0x6a0f20, W:0xffffff,
        };
        px(g, [
            '....kEEEEEEEEEEEEEEEEk..........',
            '...kEEEEEEEEEEEEEEEEEEk.........',
            '..kEEEEEEEEEEEEEEEEEEEEk........',
            '.kEEEEEwwEEEEEEEEwwEEEEEk.......',  // eyes
            '.kEEEEEwxEEEEEEEExwEEEEEk.......',  // pupils
            '.kEEEEEEEEEEEEEEEEEEEEEk........',
            'kEEEEEEEEEEEEEEEEEEEEEEEk.......',
            'kEEEEEEEEEEEEEEEEEEEEEEEk.......',  // massive head
            'kpppEEEEEEEEEEEEEEEEEpppk.......',  // inner ear pink
            'kpppEEEEEEEEEEEEEEEEEpppk.......',
            '.kEEEEEEEEEEEEEEEEEEEEEk........',
            '..kEEEEEEEEEEEEEEEEEEEk.........',
            '...kEEEYYEEEEEEEEYYEEk..........',  // tusks
            '....kEYYYYkEEEEkYYYYEk..........',
            '.....kEEEEkTTTTkEEEEk...........',  // trunk
            '......kkkk.kTTk.kkkk............',
            '..........kTTTTk...............',
            '..........kTTTTk...............',  // trunk hanging down
            '..........kTTTTk...............',
            '..........kTTTTk...............',
            '..........kTTTTk...............',
            '..........kTTEEk...............',  // trunk curl
            '..........kEEEEk...............',
            '.........kEEEEEEk..............',  // trunk tip
            '........kRRRRRRRRRk............',  // crimson jersey
            '.......kRRRWWAkAWWRRRk.........',  // A on jersey (Alabama)
            '......kRRRWWkkkkkWWRRRk........',
            '.....kRRRk...........kRRRk......',
            '.....kRRk.............kRRk......',
            '.....kEEk.............kEEk......',  // legs
            '.....kEEk.............kEEk......',
            '.....kkkk.............kkkk......',
        ], pal, ox, oy);
    },

    // ════════════════════════════════════════
    //  TILES (16×16 each)
    //  Designed for campus/street + stadium
    // ════════════════════════════════════════

    tile_grass(g, ox, oy) {
        // Textured green grass
        px(g, [
            'GgGgGGgGGgGgGGgG',
            'gGGgGgGgGGgGgGgg',
            'GGgGGgGgGgGGGgGG',
            'gGGGgGGgGgGgGGgg',
            'GgGgGgGGgGGgGgGG',
            'gGGgGgGgGGgGgGgg',
            'GGgGGgGGGgGGGgGG',
            'gGgGGgGgGgGgGGgg',
            'GGGgGgGGgGGgGgGG',
            'gGGgGGgGgGgGGgGg',
            'GgGGGgGGGgGGgGgg',
            'gGGgGgGgGGgGgGGG',
            'GGGgGGgGgGGGgGgG',
            'gGgGGgGGgGgGGGgg',
            'GGGGgGgGGGgGGgGG',
            'gGGgGGgGgGgGGgGg',
        ], {
            G: 0x3a8a3a,  // base green
            g: 0x4aaa4a,  // bright green
        }, ox, oy);
    },

    tile_road(g, ox, oy) {
        // Asphalt road / campus path with cracks
        px(g, [
            '5555555555555555',
            '5444444444444445',
            '5445544444445445',
            '5444444444444445',
            '5444444444444445',
            '5445544444445445',
            '5444444444444445',
            'WWWWWWWWWWWWWWWW',  // center dashes
            '5444444444444445',
            '5444444444444445',
            '5445544444445445',
            '5444444444444445',
            '5444444444444445',
            '5445544444445445',
            '5444444444444445',
            '5555555555555555',
        ], {
            '4': 0x444444,  // dark asphalt
            '5': 0x333333,  // edge / curb
            W:   0xdddd88,  // center stripe dashes (alternate with road)
        }, ox, oy);
    },

    // Road with center stripe gap
    tile_road_mid(g, ox, oy) {
        px(g, [
            '5555555555555555',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5444444444444445',
            '5555555555555555',
        ], { '4':0x444444, '5':0x333333 }, ox, oy);
    },

    tile_sidewalk(g, ox, oy) {
        // Concrete sidewalk — slate pattern
        px(g, [
            'cccccccccccccccc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cccccccccccccccc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cLLLLLLLcLLLLLLc',
            'cccccccccccccccc',
        ], { L:0xbbbbaa, c:0x888877 }, ox, oy);
    },

    tile_wall(g, ox, oy) {
        // Solid brick wall
        px(g, [
            'kkkkkkkkkkkkkkkk',
            'kRRRRRRkRRRRRRRk',
            'kRRRRRRkRRRRRRRk',
            'kRRRRRRkRRRRRRRk',
            'kkkkkkkkkkkkkkkk',
            'kRRRkRRRRRRkRRRk',
            'kRRRkRRRRRRkRRRk',
            'kRRRkRRRRRRkRRRk',
            'kkkkkkkkkkkkkkkk',
            'kRRRRRRkRRRRRRRk',
            'kRRRRRRkRRRRRRRk',
            'kRRRRRRkRRRRRRRk',
            'kkkkkkkkkkkkkkkk',
            'kRRRkRRRRRRkRRRk',
            'kRRRkRRRRRRkRRRk',
            'kkkkkkkkkkkkkkkk',
        ], { k:0x222222, R:0x885533 }, ox, oy);
    },

    // Level-colored wall (takes a tint, applied by GameScene)
    tile_wall_stone(g, ox, oy) {
        px(g, [
            'kkkkkkkkkkkkkkkk',
            'kSSSSSSSSSSSSSSSk', // would be 18 chars...
            'kSSSSSSSkSSSSSSSk',
            'kSSSSSSSkSSSSSSSk',
            'kSSSSSSSkSSSSSSSk',
            'kkkkkkkkkkkkkkkk',
            'kSSSSkSSSSSSSSSSk',
            'kSSSSkSSSSSSSSSSk',
            'kSSSSkSSSSSSSSSSk',
            'kkkkkkkkkkkkkkkk',
            'kSSSSSSSkSSSSSSSk',
            'kSSSSSSSkSSSSSSSk',
            'kSSSSSSSkSSSSSSSk',
            'kkkkkkkkkkkkkkkk',
            'kSSSSkSSSSSSSSSSk',
            'kkkkkkkkkkkkkkkk',
        ], { k:0x222222, S:0x666677 }, ox, oy);
    },

    tile_tree(g, ox, oy) {
        // Top-down tree view
        px(g, [
            '....kDDDDDDk....',
            '...kDDddddDDk...',
            '..kDDdddddddDk..',
            '..kDdddddddddDk.',
            '.kDDdddDDdddDDk.',
            '.kDdddDDDddddDk.',
            '.kDdddDDDdddddDk',
            '.kDdddddDdddddDk',
            '.kDddddddddddDk.',
            '.kDDdddDDdddDDk.',
            '..kDdddddddddDk.',
            '..kDDdddddddDk..',
            '...kDDddddDDk...',
            '....kDDDDDDk....',
            '.....kTTTTk.....',
            '......kTTk......',
        ], {
            D: 0x1a6a1a,  // dark leaf
            d: 0x2a9a2a,  // mid leaf
            T: 0x6a3a10,  // trunk
            k: 0x0d300d,  // outline
        }, ox, oy);
    },

    tile_bush(g, ox, oy) {
        px(g, [
            '................',
            '....kDDDDDDk....',
            '...kDDddddDDk...',
            '..kDDdddddddDk..',
            '.kDDdddDDddddDDk',
            '.kDdddDDDdddddDk',
            '.kDdddddddddddDk',
            '.kDDdddDDdddDDk.',
            '..kDdddddddddDk.',
            '..kDDdddddddDk..',
            '...kDDDDDDDDk...',
            '....kkkkkkkk....',
            '................',
            '................',
            '................',
            '................',
        ], {
            D: 0x157015,
            d: 0x22aa22,
            k: 0x0a3a0a,
        }, ox, oy);
    },

    tile_building(g, ox, oy, wallColor, windowColor) {
        const W = wallColor  || 0x8a7a6a;
        const V = windowColor|| 0x88aacc;
        const w = lighten(W, 1.15);
        const d = darken(W, 0.7);
        const g2 = g;
        g2.fillStyle(W); g2.fillRect(ox, oy, 16, 16);
        g2.fillStyle(w); g2.fillRect(ox, oy, 16, 1); g2.fillRect(ox, oy, 1, 16);
        g2.fillStyle(d); g2.fillRect(ox+15, oy, 1, 16); g2.fillRect(ox, oy+15, 16, 1);
        // Windows
        g2.fillStyle(0x333333); g2.fillRect(ox+2, oy+2, 5, 5); g2.fillRect(ox+9, oy+2, 5, 5);
        g2.fillStyle(V);         g2.fillRect(ox+3, oy+3, 3, 3); g2.fillRect(ox+10, oy+3, 3, 3);
        g2.fillStyle(0x333333); g2.fillRect(ox+2, oy+9, 5, 5); g2.fillRect(ox+9, oy+9, 5, 5);
        g2.fillStyle(V);         g2.fillRect(ox+3, oy+10, 3, 3); g2.fillRect(ox+10, oy+10, 3, 3);
    },

    tile_stadium_gate(g, ox, oy, teamColor) {
        const C2 = teamColor || 0xba0c2f;
        const L  = lighten(C2, 1.3);
        const D  = darken(C2, 0.7);
        g.fillStyle(0x888888); g.fillRect(ox, oy, 16, 16);          // base
        g.fillStyle(C2);       g.fillRect(ox+1, oy, 14, 12);        // arch
        g.fillStyle(L);        g.fillRect(ox+2, oy+1, 12, 1);       // highlight top
        g.fillStyle(D);        g.fillRect(ox+1, oy+11, 14, 1);      // shadow
        g.fillStyle(0x222222); g.fillRect(ox+5, oy+5, 6, 7);        // arch opening dark
        g.fillStyle(0xffffff); g.fillRect(ox+1, oy+13, 14, 3);      // scoreboard/step
    },

    // ── HUD elements ──────────────────────────

    heart_full(g, ox, oy) {
        px(g, [
            '.kk..kk.',
            'kRRkkRRk',
            'kRRRRRRk',
            'kRRRRRRk',
            '.kRRRRk.',
            '..kRRk..',
            '...kk...',
        ], { k:0x111111, R:0xdd2222 }, ox, oy);
    },

    heart_empty(g, ox, oy) {
        px(g, [
            '.kk..kk.',
            'k..kk..k',
            'k......k',
            'k......k',
            '.k....k.',
            '..k..k..',
            '...kk...',
        ], { k:0x664444 }, ox, oy);
    },

    // ── Attack FX ─────────────────────────────

    hit_fx(g, ox, oy) {
        px(g, [
            '...kyk..',
            '..kyYyk.',
            '.kyYYYyk',
            'kyYYYYYk',
            'kyYYYYYk',
            '.kyYYYyk',
            '..kyYyk.',
            '...kyk..',
        ], { k:0x111111, Y:0xffff44, y:0xffaa00 }, ox, oy);
    },

    attack_fx(g, ox, oy) {
        px(g, [
            '................',
            '...kkkkkkkk.....',
            '..kYYYYYYYYk....',
            '.kYwwYYYYYwwYk..',
            '.kYwYYYYYYYwYk..',
            '..kYYYYYYYYk....',
            '...kkkkkkkk.....',
            '................',
        ], { k:0x333300, Y:0xffff00, w:0xffffff }, ox, oy);
    },

    projectile(g, ox, oy, color) {
        const c  = color || 0xff4400;
        const cl = lighten(c, 1.4);
        g.fillStyle(0x111111); g.fillRect(ox,   oy,   8, 8);
        g.fillStyle(c);        g.fillRect(ox+1, oy+1, 6, 6);
        g.fillStyle(cl);       g.fillRect(ox+2, oy+2, 2, 2);
    },

    // ── Victory flag (16×16) — UF orange/blue pennant on pole ──
    flag: function(g, ox, oy) {
        // Pole
        g.fillStyle(0x888888); g.fillRect(ox + 4, oy + 0, 1, 15);
        g.fillStyle(0x444444); g.fillRect(ox + 3, oy + 13, 3, 2);  // base
        // UF orange top stripe
        g.fillStyle(0xf77f00); g.fillRect(ox + 5, oy + 1, 9, 3);
        // UF blue bottom stripe
        g.fillStyle(0x0021a5); g.fillRect(ox + 5, oy + 4, 9, 3);
        // Highlight on top edge
        g.fillStyle(0xffaa44); g.fillRect(ox + 5, oy + 1, 9, 1);
        // Outline
        g.fillStyle(0x000000);
        g.fillRect(ox + 5, oy + 1, 9, 1);   // top
        g.fillRect(ox + 5, oy + 6, 9, 1);   // bottom
        g.fillRect(ox + 13, oy + 1, 1, 6);  // right edge
    },
};

// ── Color utilities ───────────────────────────
function darken(hex, factor) {
    const r = Math.floor(((hex >> 16) & 0xff) * factor);
    const g = Math.floor(((hex >>  8) & 0xff) * factor);
    const b = Math.floor(( hex        & 0xff) * factor);
    return (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
}

function lighten(hex, factor) {
    const r = Math.min(255, Math.floor(((hex >> 16) & 0xff) * factor));
    const gv= Math.min(255, Math.floor(((hex >>  8) & 0xff) * factor));
    const b = Math.min(255, Math.floor(( hex        & 0xff) * factor));
    return (r << 16) | (gv << 8) | b;
}

function clamp(v) { return Math.max(0, Math.min(255, v)); }
