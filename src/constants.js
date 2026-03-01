// ─────────────────────────────────────────────
//  GATOR RAMPAGE — Constants
// ─────────────────────────────────────────────

const C = {
    // Display (SNES-style 320×240 @ 3× zoom)
    GAME_W:   320,
    GAME_H:   240,
    ZOOM:     3,

    // World
    TILE:     16,
    MAP_COLS: 40,
    MAP_ROWS: 30,

    // Player
    P_SPEED:        90,
    P_HEALTH:       6,       // 6 hearts
    P_LIVES:        3,       // starting lives
    P_ATTACK_DMG:   1,
    P_ATTACK_RANGE: 18,      // px ahead of player
    P_ATTACK_CD:    420,     // ms cooldown
    P_IFRAME_MS:    1000,    // invincibility after hit
    P_KNOCKBACK:    130,

    // Enemy defaults
    E_SPEED:    40,
    E_HEALTH:   3,
    E_DMG:      1,
    E_DETECT:   90,          // detection radius
    E_ATTACK_R: 14,
    E_ATTACK_CD:800,
    E_KNOCKBACK:100,

    // Boss
    B_SPEED:    55,
    B_HEALTH:   24,
    B_DMG:      2,
    B_DETECT:   200,
    B_ATTACK_R: 20,
    B_ATTACK_CD:1000,
    B_KNOCKBACK:180,

    // Tile indices (in tileset image)
    T_FLOOR:  0,
    T_WALL:   1,
    T_FIELD:  2,
    T_ENDZONE:3,
    T_SEATS:  4,
    T_TRACK:  5,
    T_DIRT:   6,
    T_WATER:  7,
    T_ROAD:   8,
    T_STRIPE: 9,

    // Z-depths
    Z_FLOOR:  0,
    Z_ENTITY: 10,
    Z_FX:     20,
    Z_HUD:    30,

    // Colors (hex)
    UF_BLUE:   0x0021a5,
    UF_ORANGE: 0xf77f00,
    UGA_RED:   0xba0c2f,
    UGA_BLACK: 0x000000,
    TENN_ORG:  0xff8200,
    TENN_WHT:  0xffffff,
    UK_BLUE:   0x0033a0,
    UK_WHT:    0xffffff,
    TEX_ORG:   0xbf5700,
    TEX_WHT:   0xffffff,
    BAMA_CRM:  0x9e1b32,
    BAMA_WHT:  0xffffff,
};
