// ─────────────────────────────────────────────
//  engine.js — Babylon.js bootstrap
//  Last file loaded; kicks off everything.
// ─────────────────────────────────────────────
(function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true });

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

    // ── Lights ────────────────────────────────
    // Ambient fill (so colors are visible)
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.6;
    hemi.diffuse  = new BABYLON.Color3(1, 1, 1);
    hemi.groundColor = new BABYLON.Color3(0.4, 0.4, 0.4);

    // Directional light for depth on walls
    const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(1, -2, -0.5), scene);
    dir.intensity = 0.8;

    // ── Camera ────────────────────────────────
    // Top-down orthographic, Y=500 above the scene.
    // rotation.x = PI/2 → looks straight down.
    // With this rotation, camera's local Y = world +Z.
    // orthoTop=120 means world Z = cameraZ+120 is at the top of screen.
    // (Map row 0 = high Z = top of screen; player start row 39 = low Z = bottom.)
    const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(240, 500, 320), scene);
    camera.rotation.x = Math.PI / 2;
    camera.mode       = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoLeft   = -160;
    camera.orthoRight  =  160;
    camera.orthoTop    =  120;
    camera.orthoBottom = -120;

    // Prevent FreeCamera from consuming keyboard input itself
    camera.inputs.clear();

    // ── Resize handler ────────────────────────
    window.addEventListener('resize', () => engine.resize());

    // ── Expose globals ────────────────────────
    window.BabylonEngine = { engine, scene, camera };

    // ── Init game ────────────────────────────
    CameraFollower.init(camera);
    GameManager.init(scene, camera);

    // ── Render loop ───────────────────────────
    engine.runRenderLoop(function () {
        const dt = engine.getDeltaTime(); // ms
        GameManager.update(dt);
        scene.render();
    });
})();
