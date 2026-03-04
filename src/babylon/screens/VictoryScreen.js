// ─────────────────────────────────────────────
//  VictoryScreen
// ─────────────────────────────────────────────
const VictoryScreen = (function () {
    let advTex = null;

    function show(scene, score, onTitle) {
        if (advTex) advTex.dispose();

        advTex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('VictoryUI', true, scene);

        const bg = new BABYLON.GUI.Rectangle('bg');
        bg.width = '100%'; bg.height = '100%';
        bg.background = '#001a0a'; bg.thickness = 0; bg.alpha = 0.92;
        advTex.addControl(bg);

        const title = new BABYLON.GUI.TextBlock('vt', 'SEC CHAMPIONSHIP!');
        title.color = '#f77f00'; title.fontSize = 44; title.fontFamily = 'monospace';
        title.fontWeight = 'bold'; title.top = '-90px';
        advTex.addControl(title);

        const sub = new BABYLON.GUI.TextBlock('vs', 'ALBERT RULES THE SEC!');
        sub.color = '#00ff88'; sub.fontSize = 24; sub.fontFamily = 'monospace';
        sub.top = '-30px';
        advTex.addControl(sub);

        const scoreTxt = new BABYLON.GUI.TextBlock('sc', 'FINAL SCORE: ' + score);
        scoreTxt.color = '#ffffff'; scoreTxt.fontSize = 28; scoreTxt.fontFamily = 'monospace';
        scoreTxt.top = '40px';
        advTex.addControl(scoreTxt);

        const hint = new BABYLON.GUI.TextBlock('hint', 'PRESS SPACE TO RETURN TO TITLE');
        hint.color = '#aaaaaa'; hint.fontSize = 16; hint.fontFamily = 'monospace';
        hint.top = '110px';
        advTex.addControl(hint);

        const handler = function (e) {
            if (e.code === 'Space') {
                window.removeEventListener('keydown', handler);
                hide();
                onTitle();
            }
        };
        window.addEventListener('keydown', handler);
    }

    function hide() {
        if (advTex) { advTex.dispose(); advTex = null; }
    }

    return { show, hide };
})();
