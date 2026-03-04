// ─────────────────────────────────────────────
//  CameraFollower — smooth top-down scroll
// ─────────────────────────────────────────────
const CameraFollower = (function () {
    const LERP      = 0.08;
    const MAP_W     = 30 * 16;   // 480
    const MAP_H     = 40 * 16;   // 640
    const HALF_VIEW_X = 160;
    const HALF_VIEW_Z = 120;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    let camera = null;

    return {
        init(cam) { camera = cam; },

        update(targetX, targetZ) {
            if (!camera) return;

            const cx = clamp(targetX, HALF_VIEW_X,   MAP_W - HALF_VIEW_X);
            const cz = clamp(targetZ, HALF_VIEW_Z,   MAP_H - HALF_VIEW_Z);

            camera.position.x = lerp(camera.position.x, cx, LERP);
            camera.position.z = lerp(camera.position.z, cz, LERP);
        },

        snapTo(targetX, targetZ) {
            if (!camera) return;
            const cx = clamp(targetX, HALF_VIEW_X, MAP_W - HALF_VIEW_X);
            const cz = clamp(targetZ, HALF_VIEW_Z, MAP_H - HALF_VIEW_Z);
            camera.position.x = cx;
            camera.position.z = cz;
        }
    };
})();
