// ─────────────────────────────────────────────
//  Input — keyboard state tracker (no Phaser)
// ─────────────────────────────────────────────
const Input = (function () {
    const keys     = {};
    const prevKeys = {};

    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    return {
        left:   () => !!(keys['KeyA'] || keys['ArrowLeft']),
        right:  () => !!(keys['KeyD'] || keys['ArrowRight']),
        up:     () => !!(keys['KeyW'] || keys['ArrowUp']),
        down:   () => !!(keys['KeyS'] || keys['ArrowDown']),
        attack: () => !!(keys['Space'] || keys['KeyZ']),

        attackJustPressed() {
            return (!prevKeys['Space'] && !!keys['Space']) ||
                   (!prevKeys['KeyZ']  && !!keys['KeyZ']);
        },
        spaceJustPressed() {
            return !prevKeys['Space'] && !!keys['Space'];
        },
        anyJustPressed() {
            return Object.keys(keys).some(k => keys[k] && !prevKeys[k]);
        },

        // Call at end of each game tick to snapshot key state
        tick() {
            for (const k in keys) prevKeys[k] = keys[k];
        }
    };
})();
