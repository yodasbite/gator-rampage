// ─────────────────────────────────────────────
//  World — builds the 3D tilemap
//
//  Coordinate convention:
//    worldX = col * TILE          (left → right)
//    worldZ = (ROWS-1 - row)*TILE (map row 0 = large Z = top of screen)
//
//  Floor tiles: flat boxes (height=2, y=-1)
//  Wall tiles : tall boxes (height=20, y=10)
// ─────────────────────────────────────────────
const World = (function () {
    const TILE = 16;
    const COLS = 30;
    const ROWS = 40;

    // Convert tile coords to world-space center
    function tileToWorld(col, row) {
        return {
            x: col * TILE + TILE / 2,
            z: (ROWS - 1 - row) * TILE + TILE / 2
        };
    }

    // Hex color → BABYLON.Color3
    function hexToColor3(hex) {
        return new BABYLON.Color3(
            ((hex >> 16) & 0xff) / 255,
            ((hex >> 8)  & 0xff) / 255,
            ( hex        & 0xff) / 255
        );
    }

    function makeMat(name, color3, scene) {
        const m = new BABYLON.StandardMaterial(name, scene);
        m.diffuseColor = color3;
        m.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        return m;
    }

    // Tile index → logical type string
    function tileType(idx) {
        switch (idx) {
            case 0: return 'grass';
            case 1: return 'wall';
            case 2: return 'road';
            case 3: return 'sidewalk';
            case 4: return 'tree';
            case 5: return 'bush';
            case 6: return 'building';
            case 7: return 'gate';
            case 8: return 'grass';
            default: return 'grass';
        }
    }

    function buildMap(levelData, scene) {
        const map   = levelData.map;
        const gateC = hexToColor3(levelData.gateColor);
        const bldgC = hexToColor3(levelData.buildingColor);

        // ── Materials ──────────────────────────────
        const mats = {
            grass:    makeMat('m_grass',    new BABYLON.Color3(0.15, 0.42, 0.10), scene),
            road:     makeMat('m_road',     new BABYLON.Color3(0.32, 0.32, 0.32), scene),
            sidewalk: makeMat('m_sidewalk', new BABYLON.Color3(0.70, 0.66, 0.52), scene),
            wall:     makeMat('m_wall',     gateC,  scene),
            tree:     makeMat('m_tree',     new BABYLON.Color3(0.08, 0.28, 0.05), scene),
            bush:     makeMat('m_bush',     new BABYLON.Color3(0.12, 0.40, 0.07), scene),
            building: makeMat('m_building', bldgC,  scene),
            gate:     makeMat('m_gate',     gateC,  scene),
        };

        // ── Collect boxes per type ─────────────────
        const buckets = {};  // type → BABYLON.Mesh[]

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const idx  = map[row][col];
                const type = tileType(idx);
                const isWall = SOLID_SET.has(idx);

                const { x: cx, z: cz } = tileToWorld(col, row);

                // Wall tiles: taller box.  Floor tiles: thin slab.
                const h = isWall ? 20 : 2;
                const y = isWall ? 10 : -1;

                const box = BABYLON.MeshBuilder.CreateBox('t', {
                    width: TILE, height: h, depth: TILE
                }, scene);
                box.position.set(cx, y, cz);

                if (!buckets[type]) buckets[type] = [];
                buckets[type].push(box);
            }
        }

        // ── Merge each type into one draw call ────
        const mergedMeshes = [];
        for (const [type, boxes] of Object.entries(buckets)) {
            const merged = BABYLON.Mesh.MergeMeshes(boxes, true, true, undefined, false, false);
            if (merged) {
                merged.name = 'map_' + type;
                merged.material = mats[type];
                mergedMeshes.push(merged);
            }
        }

        return {
            mapData: map,
            tileToWorld,
            worldWidth:  COLS * TILE,
            worldHeight: ROWS * TILE,
            dispose() {
                mergedMeshes.forEach(m => { if (m && !m.isDisposed()) m.dispose(); });
                Object.values(mats).forEach(m => { if (m && !m.isDisposed()) m.dispose(); });
            }
        };
    }

    return { buildMap, tileToWorld };
})();
