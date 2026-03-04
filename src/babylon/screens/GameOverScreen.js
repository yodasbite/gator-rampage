// ─────────────────────────────────────────────
//  GameOverScreen
// ─────────────────────────────────────────────
const GameOverScreen = (function () {
    let advTex = null;

    function show(scene, levelIndex, score, onRestart) {
        if (advTex) advTex.dispose();

        advTex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('GameOverUI', true, scene);

        const bg = new BABYLON.GUI.Rectangle('bg');
        bg.width = '100%'; bg.height = '100%';
        bg.background = '#1a0000'; bg.thickness = 0; bg.alpha = 0.92;
        advTex.addControl(bg);

        const title = new BABYLON.GUI.TextBlock('go', 'GAME OVER');
        title.color = '#ff3333'; title.fontSize = 52; title.fontFamily = 'monospace';
        title.fontWeight = 'bold'; title.top = '-80px';
        advTex.addControl(title);

        const lvlTxt = new BABYLON.GUI.TextBlock('lv', 'Reached Level ' + (levelIndex + 1));
        lvlTxt.color = '#ffaa88'; lvlTxt.fontSize = 22; lvlTxt.fontFamily = 'monospace';
        lvlTxt.top = '-10px';
        advTex.addControl(lvlTxt);

        const scoreTxt = new BABYLON.GUI.TextBlock('sc', 'SCORE: ' + score);
        scoreTxt.color = '#ffffff'; scoreTxt.fontSize = 26; scoreTxt.fontFamily = 'monospace';
        scoreTxt.top = '40px';
        advTex.addControl(scoreTxt);

        const hint = new BABYLON.GUI.TextBlock('hint', 'PRESS SPACE TO TRY AGAIN');
        hint.color = '#aaaaaa'; hint.fontSize = 18; hint.fontFamily = 'monospace';
        hint.top = '110px';
        advTex.addControl(hint);

        const handler = function (e) {
            if (e.code === 'Space') {
                window.removeEventListener('keydown', handler);
                hide();
                onRestart();
            }
        };
        window.addEventListener('keydown', handler);
    }

    function hide() {
        if (advTex) { advTex.dispose(); advTex = null; }
    }

    return { show, hide };
})();
