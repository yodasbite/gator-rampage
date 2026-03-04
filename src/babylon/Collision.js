// ─────────────────────────────────────────────
//  Collision — custom AABB tile + entity overlap
//  Coordinate system:
//    World X = map column × TILE  (left → right)
//    World Z = (ROWS-1 - row) × TILE  (map row 0 = high Z = top of screen)
// ─────────────────────────────────────────────
const SOLID_SET = new Set([1, 4, 5, 6, 7]);

const Collision = {
    TILE: 16,
    COLS: 30,
    ROWS: 40,

    // Convert world X to tile column
    worldXToCol(wx) {
        return Math.floor(wx / this.TILE);
    },

    // Convert world Z to tile row (inverted: row 0 = high Z)
    worldZToRow(wz) {
        return (this.ROWS - 1) - Math.floor(wz / this.TILE);
    },

    getTile(wx, wz, mapData) {
        const col = this.worldXToCol(wx);
        const row = this.worldZToRow(wz);
        if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) return 1;
        return mapData[row][col];
    },

    isSolid(wx, wz, mapData) {
        return SOLID_SET.has(this.getTile(wx, wz, mapData));
    },

    // Slide-along-walls AABB collision.
    // pos = {x, z}, delta = {dx, dz}, radius = half-width
    // Returns new {x, z}
    moveWithCollision(x, z, dx, dz, radius, mapData) {
        const r = radius - 1; // slight shrink avoids corner catch

        // ── X axis ───────────────────────────────
        const nx = x + dx;
        if (dx !== 0) {
            const leadX = nx + Math.sign(dx) * r;
            const solidX = this.isSolid(leadX, z - r, mapData) ||
                           this.isSolid(leadX, z + r, mapData);
            if (!solidX) x = nx;
        }

        // ── Z axis ───────────────────────────────
        const nz = z + dz;
        if (dz !== 0) {
            const leadZ = nz + Math.sign(dz) * r;
            const solidZ = this.isSolid(x - r, leadZ, mapData) ||
                           this.isSolid(x + r, leadZ, mapData);
            if (!solidZ) z = nz;
        }

        // ── World boundary clamp ──────────────────
        x = Math.max(r + 1, Math.min(this.COLS * this.TILE - r - 1, x));
        z = Math.max(r + 1, Math.min(this.ROWS * this.TILE - r - 1, z));

        return { x, z };
    },

    // 2D circle overlap (in XZ plane)
    overlaps(ax, az, ar, bx, bz, br) {
        const dx = ax - bx, dz = az - bz;
        const minD = ar + br;
        return (dx * dx + dz * dz) < minD * minD;
    },

    distance(ax, az, bx, bz) {
        const dx = ax - bx, dz = az - bz;
        return Math.sqrt(dx * dx + dz * dz);
    },

    // angle (radians) from a to b in XZ plane
    angle(ax, az, bx, bz) {
        return Math.atan2(bz - az, bx - ax);
    }
};
