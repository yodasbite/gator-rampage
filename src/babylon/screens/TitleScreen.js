// ─────────────────────────────────────────────
//  TitleScreen — fullscreen GUI overlay
// ─────────────────────────────────────────────
const TitleScreen = (function () {
    let advTex   = null;
    let blinkTimer = 0;
    let blinkText  = null;
    let visible    = false;

    function show(scene, onStart) {
        if (advTex) advTex.dispose();
        visible = true;

        advTex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('TitleUI', true, scene);

        // Dark-green background panel
        const bg = new BABYLON.GUI.Rectangle('bg');
        bg.width  = '100%';
        bg.height = '100%';
        bg.background = '#0a1a0a';
        bg.thickness  = 0;
        bg.alpha = 0.92;
        advTex.addControl(bg);

        // Title
        const title = new BABYLON.GUI.TextBlock('title', 'GATOR RAMPAGE');
        title.color      = '#f77f00';
        title.fontSize   = 48;
        title.fontFamily = 'monospace';
        title.fontWeight = 'bold';
        title.top        = '-80px';
        advTex.addControl(title);

        // Subtitle
        const sub = new BABYLON.GUI.TextBlock('sub', 'SEC CHAMPIONSHIP BRAWL');
        sub.color      = '#aaffaa';
        sub.fontSize   = 20;
        sub.fontFamily = 'monospace';
        sub.top        = '-20px';
        advTex.addControl(sub);

        // Blink text
        blinkText = new BABYLON.GUI.TextBlock('blink', 'PRESS SPACE TO START');
        blinkText.color      = '#ffffff';
        blinkText.fontSize   = 22;
        blinkText.fontFamily = 'monospace';
        blinkText.top        = '60px';
        advTex.addControl(blinkText);

        // Controls hint
        const ctrl = new BABYLON.GUI.TextBlock('ctrl', 'WASD / ARROWS: Move   SPACE / Z: Attack');
        ctrl.color      = '#888888';
        ctrl.fontSize   = 14;
        ctrl.fontFamily = 'monospace';
        ctrl.top        = '120px';
        advTex.addControl(ctrl);

        blinkTimer = 0;

        // Listen for space
        const handler = function (e) {
            if (e.code === 'Space' || e.code === 'Enter') {
                window.removeEventListener('keydown', handler);
                hide();
                onStart();
            }
        };
        window.addEventListener('keydown', handler);
    }

    function update(dt) {
        if (!blinkText || !visible) return;
        blinkTimer += dt;
        blinkText.isVisible = Math.floor(blinkTimer / 500) % 2 === 0;
    }

    function hide() {
        visible = false;
        if (advTex) { advTex.dispose(); advTex = null; }
    }

    return { show, update, hide };
})();
