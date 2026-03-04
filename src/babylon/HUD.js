// ─────────────────────────────────────────────
//  HUD — Babylon GUI overlay
// ─────────────────────────────────────────────
const HUD = (function () {
    let advTex   = null;
    let heartContainers = [];
    let scoreText  = null;
    let livesText  = null;
    let atkText    = null;
    let bossBar    = null;
    let bossBg     = null;
    let bossLabel  = null;
    let levelText  = null;

    function hexCss(hex) {
        return '#' + ('000000' + hex.toString(16)).slice(-6);
    }

    function init(scene, levelData) {
        // Destroy old GUI if restarting
        if (advTex) { advTex.dispose(); advTex = null; }
        heartContainers = [];

        advTex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);

        // ── Hearts (top-left) ────────────────────
        const heartRow = new BABYLON.GUI.StackPanel();
        heartRow.isVertical = false;
        heartRow.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        heartRow.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        heartRow.left   = '8px';
        heartRow.top    = '8px';
        advTex.addControl(heartRow);

        for (let i = 0; i < C.P_HEALTH; i++) {
            const heart = new BABYLON.GUI.Rectangle('h' + i);
            heart.width  = '14px';
            heart.height = '14px';
            heart.color  = '#cc0000';
            heart.background = '#ff3333';
            heart.cornerRadius = 7;
            heart.thickness = 2;
            const pad = new BABYLON.GUI.Rectangle();
            pad.width = '2px';
            pad.height = '14px';
            pad.thickness = 0;
            pad.isPointerBlocker = false;
            heartRow.addControl(heart);
            heartRow.addControl(pad);
            heartContainers.push(heart);
        }

        // ── Lives (top-center) ───────────────────
        livesText = new BABYLON.GUI.TextBlock('lives');
        livesText.text  = '×' + C.P_LIVES;
        livesText.color = '#00ff88';
        livesText.fontSize = 18;
        livesText.fontFamily = 'monospace';
        livesText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        livesText.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        livesText.top = '8px';
        advTex.addControl(livesText);

        // ── Score (top-right) ────────────────────
        scoreText = new BABYLON.GUI.TextBlock('score');
        scoreText.text  = 'SCORE: 0';
        scoreText.color = '#ffffff';
        scoreText.fontSize = 16;
        scoreText.fontFamily = 'monospace';
        scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        scoreText.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        scoreText.top   = '8px';
        scoreText.right = '8px';
        advTex.addControl(scoreText);

        // ── Attack level (top-left, below hearts) ─
        atkText = new BABYLON.GUI.TextBlock('atk');
        atkText.text  = 'ATK ★☆☆';
        atkText.color = '#ffcc00';
        atkText.fontSize = 13;
        atkText.fontFamily = 'monospace';
        atkText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        atkText.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        atkText.left = '8px';
        atkText.top  = '30px';
        advTex.addControl(atkText);

        // ── Level name (top-center below lives) ──
        levelText = new BABYLON.GUI.TextBlock('lvl');
        levelText.text  = levelData.name;
        levelText.color = '#aaffcc';
        levelText.fontSize = 13;
        levelText.fontFamily = 'monospace';
        levelText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        levelText.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        levelText.top = '30px';
        advTex.addControl(levelText);

        // ── Boss bar (bottom, hidden until boss) ─
        bossBg = new BABYLON.GUI.Rectangle('bossBg');
        bossBg.width  = '80%';
        bossBg.height = '20px';
        bossBg.color  = '#ffffff';
        bossBg.background = '#330000';
        bossBg.cornerRadius = 4;
        bossBg.thickness = 2;
        bossBg.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        bossBg.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        bossBg.top = '-36px';
        bossBg.isVisible = false;
        advTex.addControl(bossBg);

        bossBar = new BABYLON.GUI.Rectangle('bossBar');
        bossBar.width  = '100%';
        bossBar.height = '100%';
        bossBar.background = '#cc0000';
        bossBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        bossBar.thickness = 0;
        bossBg.addControl(bossBar);

        bossLabel = new BABYLON.GUI.TextBlock('bossLabel');
        bossLabel.text  = levelData.bossName;
        bossLabel.color = '#ffffff';
        bossLabel.fontSize = 14;
        bossLabel.fontFamily = 'monospace';
        bossLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        bossLabel.verticalAlignment   = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        bossLabel.top = '-58px';
        bossLabel.isVisible = false;
        advTex.addControl(bossLabel);
    }

    function setHealth(hp, maxHp) {
        if (!heartContainers.length) return;
        for (let i = 0; i < heartContainers.length; i++) {
            heartContainers[i].background = i < hp ? '#ff3333' : '#333333';
        }
    }

    function setLives(lives) {
        if (livesText) livesText.text = '×' + lives;
    }

    function setScore(score) {
        if (scoreText) scoreText.text = 'SCORE: ' + score;
    }

    function setAtk(level, max) {
        if (!atkText) return;
        const stars = '★'.repeat(level) + '☆'.repeat(max - level);
        atkText.text = 'ATK ' + stars;
    }

    function showBossBar(bossName) {
        if (bossBg)    { bossBg.isVisible    = true; }
        if (bossLabel) { bossLabel.text = bossName; bossLabel.isVisible = true; }
        if (bossBar)   { bossBar.width = '100%'; }
    }

    function updateBossBar(hp, maxHp) {
        if (!bossBar) return;
        const pct = Math.max(0, hp / maxHp);
        bossBar.width = Math.round(pct * 100) + '%';
        // Phase 2 color
        bossBar.background = pct <= 0.5 ? '#ff6600' : '#cc0000';
    }

    function hideBossBar() {
        if (bossBg)    bossBg.isVisible    = false;
        if (bossLabel) bossLabel.isVisible = false;
    }

    function dispose() {
        if (advTex) { advTex.dispose(); advTex = null; }
        heartContainers = [];
    }

    return { init, setHealth, setLives, setScore, setAtk, showBossBar, updateBossBar, hideBossBar, dispose };
})();
