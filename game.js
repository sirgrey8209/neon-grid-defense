/**
 * NEON GRID DEFENSE
 * A geometry-wars styled tower defense game
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

const CONFIG = {
    // Grid
    GRID_WIDTH: 15,
    GRID_HEIGHT: 10,
    CELL_SIZE: 1,

    // Game
    INITIAL_GOLD: 100,
    INITIAL_HEALTH: 20,
    TOTAL_WAVES: 15,

    // Colors (Neon Theme)
    COLORS: {
        CYAN: 0x00ffff,
        MAGENTA: 0xff00ff,
        YELLOW: 0xffff00,
        GREEN: 0x00ff88,
        RED: 0xff0066,
        WHITE: 0xffffff,
        GRID: 0x00ffff,
        PATH: 0xff00ff,
    },

    // Tower Definitions
    TOWERS: {
        pulse: {
            name: 'PULSE',
            cost: 50,
            damage: 10,
            range: 2.5,
            fireRate: 0.5, // seconds between shots
            color: 0x00ffff,
            projectileSpeed: 15,
            special: null,
        },
        beam: {
            name: 'BEAM',
            cost: 100,
            damage: 50,
            range: 5,
            fireRate: 1.5,
            color: 0xff00ff,
            projectileSpeed: 30,
            special: 'pierce', // pierces through enemies
        },
        nova: {
            name: 'NOVA',
            cost: 150,
            damage: 25,
            range: 3,
            fireRate: 1.0,
            color: 0xffff00,
            projectileSpeed: 0, // instant
            special: 'splash', // area damage
            splashRadius: 1.5,
        },
        freeze: {
            name: 'FREEZE',
            cost: 75,
            damage: 5,
            range: 3,
            fireRate: 0.8,
            color: 0x00ff88,
            projectileSpeed: 12,
            special: 'slow',
            slowAmount: 0.5, // 50% slow
            slowDuration: 2, // seconds
        },
    },

    // Enemy Definitions
    ENEMIES: {
        drone: {
            name: 'DRONE',
            health: 30,
            speed: 2.0,
            reward: 10,
            damage: 1,
            color: 0xff0066,
            scale: 0.3,
        },
        tank: {
            name: 'TANK',
            health: 150,
            speed: 0.8,
            reward: 25,
            damage: 2,
            color: 0xff3300,
            scale: 0.5,
        },
        speeder: {
            name: 'SPEEDER',
            health: 20,
            speed: 4.0,
            reward: 15,
            damage: 1,
            color: 0xff00ff,
            scale: 0.25,
        },
        boss: {
            name: 'BOSS',
            health: 500,
            speed: 0.6,
            reward: 100,
            damage: 5,
            color: 0xffffff,
            scale: 0.8,
        },
    },

    // Wave Definitions
    WAVES: [
        // Wave 1-3: Tutorial
        { enemies: [{ type: 'drone', count: 5, interval: 1.0 }] },
        { enemies: [{ type: 'drone', count: 8, interval: 0.8 }] },
        { enemies: [{ type: 'drone', count: 10, interval: 0.7 }] },
        // Wave 4-5: Introduce Speeder
        { enemies: [{ type: 'drone', count: 8, interval: 0.8 }, { type: 'speeder', count: 3, interval: 1.2 }] },
        { enemies: [{ type: 'speeder', count: 6, interval: 0.8 }, { type: 'drone', count: 5, interval: 1.0 }] },
        // Wave 6: First Boss
        { enemies: [{ type: 'drone', count: 10, interval: 0.5 }, { type: 'boss', count: 1, interval: 5 }] },
        // Wave 7-9: Introduce Tank
        { enemies: [{ type: 'tank', count: 3, interval: 2.0 }, { type: 'drone', count: 10, interval: 0.6 }] },
        { enemies: [{ type: 'tank', count: 5, interval: 1.5 }, { type: 'speeder', count: 5, interval: 1.0 }] },
        { enemies: [{ type: 'tank', count: 4, interval: 1.5 }, { type: 'drone', count: 12, interval: 0.5 }, { type: 'speeder', count: 4, interval: 1.2 }] },
        // Wave 10: Mid Boss
        { enemies: [{ type: 'boss', count: 2, interval: 3.0 }, { type: 'tank', count: 3, interval: 2.0 }] },
        // Wave 11-14: Hard
        { enemies: [{ type: 'speeder', count: 15, interval: 0.4 }, { type: 'tank', count: 5, interval: 1.5 }] },
        { enemies: [{ type: 'tank', count: 8, interval: 1.0 }, { type: 'drone', count: 20, interval: 0.3 }] },
        { enemies: [{ type: 'speeder', count: 10, interval: 0.5 }, { type: 'tank', count: 6, interval: 1.2 }, { type: 'boss', count: 1, interval: 8 }] },
        { enemies: [{ type: 'drone', count: 30, interval: 0.2 }, { type: 'tank', count: 8, interval: 1.0 }] },
        // Wave 15: Final Boss
        { enemies: [{ type: 'boss', count: 3, interval: 2.0 }, { type: 'tank', count: 10, interval: 0.8 }, { type: 'speeder', count: 15, interval: 0.5 }] },
    ],
};

// ============================================================================
// GAME STATE
// ============================================================================

const gameState = {
    gold: CONFIG.INITIAL_GOLD,
    health: CONFIG.INITIAL_HEALTH,
    currentWave: 0,
    isWaveActive: false,
    isPaused: false,
    isGameOver: false,
    selectedTower: null,
    selectedPlacedTower: null,

    // Entity arrays
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],

    // Grid state (0 = empty, 1 = tower, 2 = path, 3 = spawn, 4 = exit)
    grid: [],
    path: [],

    // Spawn/Exit positions
    spawnPoint: { x: 0, y: 5 },
    exitPoint: { x: 14, y: 5 },

    // Wave spawning
    waveSpawnQueue: [],
    spawnTimer: 0,

    // Screen effects
    screenShake: 0,
    chromaticAberration: 0,

    // Mobile touch state
    touch: {
        isDragging: false,
        dragTowerType: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        holdTimer: null,
    },

    // Camera control state
    camera: {
        baseY: 18,
        baseZ: 22,
        currentY: 18,
        currentZ: 22,
        targetY: 18,
        targetZ: 22,
        panX: 7,
        panTargetX: 7,
        lastPinchDist: 0,
        lastPanX: 0,
        lastPanY: 0,
        isPinching: false,
        isPanning: false,
    },

    // Device detection
    isMobile: false,
};

// ============================================================================
// THREE.JS SETUP
// ============================================================================

let scene, camera, renderer, composer;
let bloomPass;
let gridGroup, towerGroup, enemyGroup, projectileGroup, particleGroup, pathGroup;
let raycaster, mouse;
let hoverIndicator, rangeIndicator;
let clock;

function initThree() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);

    // Camera - Isometric-ish view (zoomed out more for mobile)
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

    // Set initial camera position based on device
    const isMobileView = window.innerWidth <= 768 || window.innerHeight > window.innerWidth;
    const initialY = isMobileView ? 22 : 15;
    const initialZ = isMobileView ? 26 : 18;
    camera.position.set(7, initialY, initialZ);
    camera.lookAt(7, 0, 5);

    // Update gameState camera values
    gameState.camera.baseY = initialY;
    gameState.camera.baseZ = initialZ;
    gameState.camera.currentY = initialY;
    gameState.camera.currentZ = initialZ;
    gameState.camera.targetY = initialY;
    gameState.camera.targetZ = initialZ;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('game-container').insertBefore(
        renderer.domElement,
        document.getElementById('ui-overlay')
    );

    // Post Processing
    composer = new THREE.EffectComposer(renderer);

    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,   // strength
        0.4,   // radius
        0.85   // threshold
    );
    composer.addPass(bloomPass);

    // Groups for organization
    gridGroup = new THREE.Group();
    pathGroup = new THREE.Group();
    towerGroup = new THREE.Group();
    enemyGroup = new THREE.Group();
    projectileGroup = new THREE.Group();
    particleGroup = new THREE.Group();

    scene.add(gridGroup);
    scene.add(pathGroup);
    scene.add(towerGroup);
    scene.add(enemyGroup);
    scene.add(projectileGroup);
    scene.add(particleGroup);

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Clock for delta time
    clock = new THREE.Clock();

    // Create hover indicator
    createHoverIndicator();
    createRangeIndicator();
}

function createHoverIndicator() {
    const geometry = new THREE.PlaneGeometry(CONFIG.CELL_SIZE * 0.95, CONFIG.CELL_SIZE * 0.95);
    const material = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.CYAN,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
    });
    hoverIndicator = new THREE.Mesh(geometry, material);
    hoverIndicator.rotation.x = -Math.PI / 2;
    hoverIndicator.position.y = 0.01;
    hoverIndicator.visible = false;
    scene.add(hoverIndicator);
}

function createRangeIndicator() {
    const geometry = new THREE.RingGeometry(0.5, 0.55, 64);
    const material = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.CYAN,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
    });
    rangeIndicator = new THREE.Mesh(geometry, material);
    rangeIndicator.rotation.x = -Math.PI / 2;
    rangeIndicator.position.y = 0.02;
    rangeIndicator.visible = false;
    scene.add(rangeIndicator);
}

// ============================================================================
// GRID CREATION
// ============================================================================

function createGrid() {
    // Initialize grid state
    for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
        gameState.grid[x] = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            gameState.grid[x][y] = 0;
        }
    }

    // Mark spawn and exit
    gameState.grid[gameState.spawnPoint.x][gameState.spawnPoint.y] = 3;
    gameState.grid[gameState.exitPoint.x][gameState.exitPoint.y] = 4;

    // Create grid lines
    const gridMaterial = new THREE.LineBasicMaterial({
        color: CONFIG.COLORS.GRID,
        transparent: true,
        opacity: 0.15,
    });

    // Vertical lines
    for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
        const points = [
            new THREE.Vector3(x, 0, 0),
            new THREE.Vector3(x, 0, CONFIG.GRID_HEIGHT),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        gridGroup.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
        const points = [
            new THREE.Vector3(0, 0, y),
            new THREE.Vector3(CONFIG.GRID_WIDTH, 0, y),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, gridMaterial);
        gridGroup.add(line);
    }

    // Create spawn point marker
    createMarker(gameState.spawnPoint.x, gameState.spawnPoint.y, CONFIG.COLORS.GREEN, 'SPAWN');

    // Create exit point marker
    createMarker(gameState.exitPoint.x, gameState.exitPoint.y, CONFIG.COLORS.RED, 'EXIT');

    // Ground plane for raycasting
    const groundGeometry = new THREE.PlaneGeometry(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
    const groundMaterial = new THREE.MeshBasicMaterial({
        visible: false,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(CONFIG.GRID_WIDTH / 2, 0, CONFIG.GRID_HEIGHT / 2);
    ground.name = 'ground';
    scene.add(ground);

    // Calculate initial path
    calculatePath();
}

function createMarker(x, y, color, label) {
    // Outer ring
    const ringGeometry = new THREE.RingGeometry(0.35, 0.45, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x + 0.5, 0.01, y + 0.5);
    gridGroup.add(ring);

    // Inner pulsing circle
    const circleGeometry = new THREE.CircleGeometry(0.2, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(x + 0.5, 0.02, y + 0.5);
    circle.userData.pulse = true;
    circle.userData.baseScale = 1;
    gridGroup.add(circle);
}

// ============================================================================
// A* PATHFINDING
// ============================================================================

function calculatePath() {
    const path = aStar(
        gameState.spawnPoint,
        gameState.exitPoint,
        gameState.grid
    );

    gameState.path = path;

    // Clear old path visualization
    while (pathGroup.children.length > 0) {
        pathGroup.remove(pathGroup.children[0]);
    }

    if (path.length > 0) {
        visualizePath(path);
    }

    return path.length > 0;
}

function aStar(start, end, grid) {
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();

    const gScore = new Map();
    const fScore = new Map();

    const key = (p) => `${p.x},${p.y}`;

    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, end));
    openSet.push(start);

    while (openSet.length > 0) {
        // Get node with lowest fScore
        openSet.sort((a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity));
        const current = openSet.shift();

        if (current.x === end.x && current.y === end.y) {
            // Reconstruct path
            const path = [current];
            let curr = current;
            while (cameFrom.has(key(curr))) {
                curr = cameFrom.get(key(curr));
                path.unshift(curr);
            }
            return path;
        }

        closedSet.add(key(current));

        // Check neighbors (4-directional)
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
        ];

        for (const neighbor of neighbors) {
            // Check bounds
            if (neighbor.x < 0 || neighbor.x >= CONFIG.GRID_WIDTH ||
                neighbor.y < 0 || neighbor.y >= CONFIG.GRID_HEIGHT) {
                continue;
            }

            // Check if blocked (tower)
            if (grid[neighbor.x][neighbor.y] === 1) {
                continue;
            }

            if (closedSet.has(key(neighbor))) {
                continue;
            }

            const tentativeG = (gScore.get(key(current)) || Infinity) + 1;

            if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                openSet.push(neighbor);
            } else if (tentativeG >= (gScore.get(key(neighbor)) || Infinity)) {
                continue;
            }

            cameFrom.set(key(neighbor), current);
            gScore.set(key(neighbor), tentativeG);
            fScore.set(key(neighbor), tentativeG + heuristic(neighbor, end));
        }
    }

    return []; // No path found
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function visualizePath(path) {
    if (path.length < 2) return;

    const points = path.map(p => new THREE.Vector3(p.x + 0.5, 0.05, p.y + 0.5));

    // Create glowing path line
    const material = new THREE.LineBasicMaterial({
        color: CONFIG.COLORS.PATH,
        transparent: true,
        opacity: 0.6,
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    pathGroup.add(line);

    // Add dots at each waypoint
    path.forEach((p, i) => {
        if (i === 0 || i === path.length - 1) return;

        const dotGeometry = new THREE.CircleGeometry(0.08, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.PATH,
            transparent: true,
            opacity: 0.5,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.rotation.x = -Math.PI / 2;
        dot.position.set(p.x + 0.5, 0.03, p.y + 0.5);
        pathGroup.add(dot);
    });
}

// ============================================================================
// TOWER SYSTEM
// ============================================================================

function createTowerMesh(type) {
    const config = CONFIG.TOWERS[type];
    let geometry;

    switch (type) {
        case 'pulse':
            // Pyramid
            geometry = new THREE.ConeGeometry(0.3, 0.6, 4);
            break;
        case 'beam':
            // Diamond (octahedron)
            geometry = new THREE.OctahedronGeometry(0.35);
            break;
        case 'nova':
            // Sphere
            geometry = new THREE.IcosahedronGeometry(0.3, 0);
            break;
        case 'freeze':
            // Double pyramid
            geometry = new THREE.OctahedronGeometry(0.3);
            break;
        default:
            geometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
    }

    const material = new THREE.MeshBasicMaterial({
        color: config.color,
        wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Add inner glow mesh
    const innerMaterial = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.2,
    });
    const innerMesh = new THREE.Mesh(geometry.clone(), innerMaterial);
    innerMesh.scale.set(0.7, 0.7, 0.7);
    mesh.add(innerMesh);

    return mesh;
}

function placeTower(gridX, gridY, type) {
    const config = CONFIG.TOWERS[type];

    // Check if can afford
    if (gameState.gold < config.cost) {
        showMessage('NOT ENOUGH GOLD', CONFIG.COLORS.RED);
        return false;
    }

    // Check if cell is empty
    if (gameState.grid[gridX][gridY] !== 0) {
        showMessage('CELL BLOCKED', CONFIG.COLORS.RED);
        return false;
    }

    // Temporarily mark as tower to check path
    gameState.grid[gridX][gridY] = 1;

    // Check if path still exists
    const pathExists = calculatePath();

    if (!pathExists) {
        // Revert
        gameState.grid[gridX][gridY] = 0;
        calculatePath();
        showMessage('PATH BLOCKED', CONFIG.COLORS.RED);
        return false;
    }

    // Create tower
    const mesh = createTowerMesh(type);
    mesh.position.set(gridX + 0.5, 0.3, gridY + 0.5);
    towerGroup.add(mesh);

    const tower = {
        mesh,
        type,
        gridX,
        gridY,
        level: 1,
        damage: config.damage,
        range: config.range,
        fireRate: config.fireRate,
        fireCooldown: 0,
        kills: 0,
        target: null,
    };

    gameState.towers.push(tower);

    // Deduct gold
    gameState.gold -= config.cost;
    updateUI();

    // Effect
    createPlacementEffect(gridX + 0.5, gridY + 0.5, config.color);

    return true;
}

function upgradeTower(tower) {
    if (tower.level >= 3) {
        showMessage('MAX LEVEL', CONFIG.COLORS.YELLOW);
        return false;
    }

    const config = CONFIG.TOWERS[tower.type];
    const upgradeCost = Math.floor(config.cost * 0.75);

    if (gameState.gold < upgradeCost) {
        showMessage('NOT ENOUGH GOLD', CONFIG.COLORS.RED);
        return false;
    }

    gameState.gold -= upgradeCost;
    tower.level++;
    tower.damage = Math.floor(config.damage * (1 + (tower.level - 1) * 0.5));
    tower.range = config.range + (tower.level - 1) * 0.5;

    // Visual upgrade effect
    tower.mesh.scale.set(1 + (tower.level - 1) * 0.15, 1 + (tower.level - 1) * 0.15, 1 + (tower.level - 1) * 0.15);
    createPlacementEffect(tower.gridX + 0.5, tower.gridY + 0.5, CONFIG.COLORS.GREEN);

    updateUI();
    return true;
}

function sellTower(tower) {
    const config = CONFIG.TOWERS[tower.type];
    const sellValue = Math.floor(config.cost * 0.5 * tower.level);

    // Remove from grid
    gameState.grid[tower.gridX][tower.gridY] = 0;

    // Remove mesh
    towerGroup.remove(tower.mesh);

    // Remove from array
    const index = gameState.towers.indexOf(tower);
    if (index > -1) {
        gameState.towers.splice(index, 1);
    }

    // Refund gold
    gameState.gold += sellValue;

    // Recalculate path
    calculatePath();

    // Effect
    createPlacementEffect(tower.gridX + 0.5, tower.gridY + 0.5, CONFIG.COLORS.RED);

    // Clear selection
    gameState.selectedPlacedTower = null;
    document.getElementById('cell-info').classList.remove('show');

    updateUI();
    showMessage(`SOLD +${sellValue}G`, CONFIG.COLORS.YELLOW);
}

// ============================================================================
// ENEMY SYSTEM
// ============================================================================

function createEnemyMesh(type) {
    const config = CONFIG.ENEMIES[type];
    let geometry;

    switch (type) {
        case 'drone':
            geometry = new THREE.TetrahedronGeometry(0.3);
            break;
        case 'tank':
            geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            break;
        case 'speeder':
            geometry = new THREE.ConeGeometry(0.2, 0.5, 3);
            break;
        case 'boss':
            // Complex geometry for boss
            geometry = new THREE.IcosahedronGeometry(0.5, 1);
            break;
        default:
            geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    }

    const material = new THREE.MeshBasicMaterial({
        color: config.color,
        wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(config.scale, config.scale, config.scale);

    // HP bar background
    const hpBgGeometry = new THREE.PlaneGeometry(0.6, 0.08);
    const hpBgMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.8,
    });
    const hpBg = new THREE.Mesh(hpBgGeometry, hpBgMaterial);
    hpBg.position.y = 0.5;
    hpBg.rotation.x = -Math.PI / 4;
    mesh.add(hpBg);

    // HP bar fill
    const hpFillGeometry = new THREE.PlaneGeometry(0.58, 0.06);
    const hpFillMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.GREEN,
    });
    const hpFill = new THREE.Mesh(hpFillGeometry, hpFillMaterial);
    hpFill.position.y = 0.5;
    hpFill.position.z = 0.01;
    hpFill.rotation.x = -Math.PI / 4;
    mesh.add(hpFill);
    mesh.userData.hpBar = hpFill;

    return mesh;
}

function spawnEnemy(type) {
    const config = CONFIG.ENEMIES[type];

    const mesh = createEnemyMesh(type);
    const startPos = gameState.path[0];
    mesh.position.set(startPos.x + 0.5, 0.3, startPos.y + 0.5);
    enemyGroup.add(mesh);

    const enemy = {
        mesh,
        type,
        health: config.health,
        maxHealth: config.health,
        speed: config.speed,
        reward: config.reward,
        damage: config.damage,
        pathIndex: 0,
        slowTimer: 0,
        slowAmount: 1,
    };

    gameState.enemies.push(enemy);

    return enemy;
}

function updateEnemies(delta) {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];

        // Update slow effect
        if (enemy.slowTimer > 0) {
            enemy.slowTimer -= delta;
            if (enemy.slowTimer <= 0) {
                enemy.slowAmount = 1;
            }
        }

        // Move along path
        if (enemy.pathIndex < gameState.path.length - 1) {
            const currentTarget = gameState.path[enemy.pathIndex + 1];
            const targetPos = new THREE.Vector3(currentTarget.x + 0.5, 0.3, currentTarget.y + 0.5);

            const direction = targetPos.clone().sub(enemy.mesh.position);
            const distance = direction.length();

            const moveSpeed = enemy.speed * enemy.slowAmount * delta;

            if (distance <= moveSpeed) {
                enemy.mesh.position.copy(targetPos);
                enemy.pathIndex++;
            } else {
                direction.normalize();
                enemy.mesh.position.add(direction.multiplyScalar(moveSpeed));
            }

            // Rotate enemy to face direction
            if (direction.length() > 0.01) {
                enemy.mesh.rotation.y = Math.atan2(direction.x, direction.z);
            }
        }

        // Check if reached end
        if (enemy.pathIndex >= gameState.path.length - 1) {
            // Damage player
            gameState.health -= enemy.damage;

            // Screen shake
            gameState.screenShake = 0.3;

            // Remove enemy
            enemyGroup.remove(enemy.mesh);
            gameState.enemies.splice(i, 1);

            updateUI();

            // Check game over
            if (gameState.health <= 0) {
                gameOver(false);
            }

            continue;
        }

        // Update HP bar
        const hpPercent = enemy.health / enemy.maxHealth;
        enemy.mesh.userData.hpBar.scale.x = Math.max(0.01, hpPercent);
        enemy.mesh.userData.hpBar.position.x = -0.29 * (1 - hpPercent);

        // Update HP bar color
        if (hpPercent > 0.5) {
            enemy.mesh.userData.hpBar.material.color.setHex(CONFIG.COLORS.GREEN);
        } else if (hpPercent > 0.25) {
            enemy.mesh.userData.hpBar.material.color.setHex(CONFIG.COLORS.YELLOW);
        } else {
            enemy.mesh.userData.hpBar.material.color.setHex(CONFIG.COLORS.RED);
        }

        // Animate (rotate)
        enemy.mesh.rotation.x += delta * 2;
    }

    // Update enemy count display
    document.getElementById('enemy-count-value').textContent = gameState.enemies.length;
}

function damageEnemy(enemy, damage, tower) {
    enemy.health -= damage;

    // Hit effect
    createHitEffect(enemy.mesh.position.clone());

    if (enemy.health <= 0) {
        // Kill enemy
        gameState.gold += enemy.reward;

        if (tower) {
            tower.kills++;
        }

        // Death effect
        createDeathEffect(enemy.mesh.position.clone(), CONFIG.ENEMIES[enemy.type].color);

        // Screen shake for boss
        if (enemy.type === 'boss') {
            gameState.screenShake = 0.5;
            gameState.chromaticAberration = 1;
        }

        // Remove
        enemyGroup.remove(enemy.mesh);
        const index = gameState.enemies.indexOf(enemy);
        if (index > -1) {
            gameState.enemies.splice(index, 1);
        }

        updateUI();
    }
}

// ============================================================================
// TOWER COMBAT
// ============================================================================

function updateTowers(delta) {
    for (const tower of gameState.towers) {
        // Cooldown
        if (tower.fireCooldown > 0) {
            tower.fireCooldown -= delta;
            continue;
        }

        // Find target
        let target = findTarget(tower);

        if (target) {
            // Fire!
            fireProjectile(tower, target);
            tower.fireCooldown = tower.fireRate;

            // Rotate tower towards target
            const dx = target.mesh.position.x - tower.mesh.position.x;
            const dz = target.mesh.position.z - tower.mesh.position.z;
            tower.mesh.rotation.y = Math.atan2(dx, dz);
        }

        // Animate tower
        tower.mesh.rotation.y += delta * 0.5;
        tower.mesh.children[0].rotation.y -= delta * 2;
    }
}

function findTarget(tower) {
    let closest = null;
    let closestDist = tower.range;

    for (const enemy of gameState.enemies) {
        const dx = enemy.mesh.position.x - tower.mesh.position.x;
        const dz = enemy.mesh.position.z - tower.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= tower.range) {
            // Prioritize enemies further along the path
            if (!closest || enemy.pathIndex > closest.pathIndex) {
                closest = enemy;
                closestDist = dist;
            }
        }
    }

    return closest;
}

function fireProjectile(tower, target) {
    const config = CONFIG.TOWERS[tower.type];

    // Handle special tower types
    if (tower.type === 'nova') {
        // Instant splash damage
        createNovaEffect(tower.mesh.position.clone(), tower.range, config.color);

        // Damage all enemies in range
        for (const enemy of gameState.enemies) {
            const dx = enemy.mesh.position.x - tower.mesh.position.x;
            const dz = enemy.mesh.position.z - tower.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist <= tower.range) {
                damageEnemy(enemy, tower.damage, tower);
            }
        }
        return;
    }

    // Create projectile
    const geometry = new THREE.SphereGeometry(0.08, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: config.color,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(tower.mesh.position);
    mesh.position.y = 0.4;
    projectileGroup.add(mesh);

    const projectile = {
        mesh,
        tower,
        target,
        speed: config.projectileSpeed,
        damage: tower.damage,
        special: config.special,
        pierceCount: 0,
    };

    gameState.projectiles.push(projectile);
}

function updateProjectiles(delta) {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const proj = gameState.projectiles[i];

        // Check if target still exists
        if (!proj.target || !gameState.enemies.includes(proj.target)) {
            // Remove projectile
            projectileGroup.remove(proj.mesh);
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Move towards target
        const direction = proj.target.mesh.position.clone().sub(proj.mesh.position);
        direction.y = 0;
        const distance = direction.length();

        const moveAmount = proj.speed * delta;

        if (distance <= moveAmount + 0.2) {
            // Hit!
            handleProjectileHit(proj);

            // Pierce handling
            if (proj.special === 'pierce' && proj.pierceCount < 3) {
                proj.pierceCount++;
                // Find new target
                let newTarget = null;
                let minDist = Infinity;
                for (const enemy of gameState.enemies) {
                    if (enemy !== proj.target) {
                        const d = proj.mesh.position.distanceTo(enemy.mesh.position);
                        if (d < minDist && d < 3) {
                            minDist = d;
                            newTarget = enemy;
                        }
                    }
                }
                if (newTarget) {
                    proj.target = newTarget;
                    continue;
                }
            }

            // Remove projectile
            projectileGroup.remove(proj.mesh);
            gameState.projectiles.splice(i, 1);
        } else {
            direction.normalize();
            proj.mesh.position.add(direction.multiplyScalar(moveAmount));
        }

        // Trail effect
        if (Math.random() > 0.7) {
            createTrailParticle(proj.mesh.position.clone(), CONFIG.TOWERS[proj.tower.type].color);
        }
    }
}

function handleProjectileHit(proj) {
    const config = CONFIG.TOWERS[proj.tower.type];

    // Apply damage
    damageEnemy(proj.target, proj.damage, proj.tower);

    // Special effects
    if (proj.special === 'slow') {
        proj.target.slowTimer = config.slowDuration;
        proj.target.slowAmount = config.slowAmount;
        createSlowEffect(proj.target.mesh.position.clone());
    }

    if (proj.special === 'splash') {
        // Damage nearby enemies
        for (const enemy of gameState.enemies) {
            if (enemy !== proj.target) {
                const dist = proj.mesh.position.distanceTo(enemy.mesh.position);
                if (dist < config.splashRadius) {
                    damageEnemy(enemy, proj.damage * 0.5, proj.tower);
                }
            }
        }
        createExplosionEffect(proj.mesh.position.clone(), config.color);
    }
}

// ============================================================================
// WAVE SYSTEM
// ============================================================================

function startWave() {
    if (gameState.isWaveActive || gameState.isGameOver) return;

    gameState.currentWave++;
    gameState.isWaveActive = true;

    document.getElementById('wave-btn').disabled = true;
    document.getElementById('enemy-count').classList.add('show');

    // Build spawn queue
    const waveConfig = CONFIG.WAVES[gameState.currentWave - 1];
    gameState.waveSpawnQueue = [];

    for (const enemyGroup of waveConfig.enemies) {
        for (let i = 0; i < enemyGroup.count; i++) {
            gameState.waveSpawnQueue.push({
                type: enemyGroup.type,
                delay: enemyGroup.interval,
            });
        }
    }

    gameState.spawnTimer = 0;

    // Wave start effect
    gameState.chromaticAberration = 0.5;
    showMessage(`WAVE ${gameState.currentWave}`, CONFIG.COLORS.MAGENTA);

    updateUI();
}

function updateWaveSpawning(delta) {
    if (!gameState.isWaveActive || gameState.waveSpawnQueue.length === 0) return;

    gameState.spawnTimer += delta;

    if (gameState.spawnTimer >= gameState.waveSpawnQueue[0].delay) {
        const toSpawn = gameState.waveSpawnQueue.shift();
        spawnEnemy(toSpawn.type);
        gameState.spawnTimer = 0;
    }
}

function checkWaveComplete() {
    if (!gameState.isWaveActive) return;

    if (gameState.waveSpawnQueue.length === 0 && gameState.enemies.length === 0) {
        gameState.isWaveActive = false;
        document.getElementById('wave-btn').disabled = false;
        document.getElementById('enemy-count').classList.remove('show');

        // Bonus gold
        const bonus = 20 + gameState.currentWave * 5;
        gameState.gold += bonus;
        showMessage(`WAVE COMPLETE +${bonus}G`, CONFIG.COLORS.GREEN);

        // Check victory
        if (gameState.currentWave >= CONFIG.TOTAL_WAVES) {
            gameOver(true);
        }

        updateUI();
    }
}

// ============================================================================
// PARTICLE & EFFECTS SYSTEM
// ============================================================================

function createPlacementEffect(x, z, color) {
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        createParticle(
            new THREE.Vector3(x, 0.2, z),
            new THREE.Vector3(Math.cos(angle) * 2, 3, Math.sin(angle) * 2),
            color,
            0.5
        );
    }
}

function createHitEffect(position) {
    for (let i = 0; i < 5; i++) {
        createParticle(
            position.clone(),
            new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ),
            CONFIG.COLORS.WHITE,
            0.3
        );
    }
}

function createDeathEffect(position, color) {
    // More particles for death
    for (let i = 0; i < 20; i++) {
        createParticle(
            position.clone(),
            new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5,
                (Math.random() - 0.5) * 5
            ),
            color,
            0.8
        );
    }

    // Ring effect
    const ringGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    ring.userData.expandRing = true;
    ring.userData.life = 0.5;
    particleGroup.add(ring);
    gameState.particles.push({ mesh: ring, life: 0.5, type: 'ring' });
}

function createNovaEffect(position, range, color) {
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.position.y = 0.1;
    ring.rotation.x = -Math.PI / 2;
    ring.userData.maxScale = range * 2;
    particleGroup.add(ring);
    gameState.particles.push({ mesh: ring, life: 0.3, type: 'nova', maxScale: range * 2 });
}

function createExplosionEffect(position, color) {
    for (let i = 0; i < 15; i++) {
        createParticle(
            position.clone(),
            new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3,
                (Math.random() - 0.5) * 4
            ),
            color,
            0.6
        );
    }
}

function createSlowEffect(position) {
    const ringGeometry = new THREE.RingGeometry(0.3, 0.4, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.GREEN,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.position.y = 0.1;
    ring.rotation.x = -Math.PI / 2;
    particleGroup.add(ring);
    gameState.particles.push({ mesh: ring, life: 0.5, type: 'slow' });
}

function createTrailParticle(position, color) {
    createParticle(position, new THREE.Vector3(0, 0.5, 0), color, 0.2, 0.05);
}

function createParticle(position, velocity, color, life, size = 0.1) {
    const geometry = new THREE.SphereGeometry(size, 6, 6);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    particleGroup.add(mesh);

    gameState.particles.push({
        mesh,
        velocity,
        life,
        maxLife: life,
        type: 'particle',
    });
}

function updateParticles(delta) {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        particle.life -= delta;

        if (particle.life <= 0) {
            particleGroup.remove(particle.mesh);
            gameState.particles.splice(i, 1);
            continue;
        }

        const lifeRatio = particle.life / particle.maxLife;

        if (particle.type === 'particle') {
            // Move particle
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(delta));
            particle.velocity.y -= delta * 5; // gravity
            particle.mesh.material.opacity = lifeRatio;
            particle.mesh.scale.setScalar(lifeRatio);
        } else if (particle.type === 'ring') {
            // Expand ring
            const scale = 1 + (1 - lifeRatio) * 3;
            particle.mesh.scale.set(scale, scale, 1);
            particle.mesh.material.opacity = lifeRatio;
        } else if (particle.type === 'nova') {
            // Expand nova ring
            const scale = (1 - lifeRatio) * particle.maxScale;
            particle.mesh.scale.set(scale, scale, 1);
            particle.mesh.material.opacity = lifeRatio;
        } else if (particle.type === 'slow') {
            particle.mesh.material.opacity = lifeRatio * 0.8;
            particle.mesh.position.y += delta;
        }
    }
}

// ============================================================================
// SCREEN EFFECTS
// ============================================================================

function updateScreenEffects(delta) {
    // Smooth camera zoom/pan interpolation
    const lerpSpeed = 5 * delta;
    gameState.camera.currentY += (gameState.camera.targetY - gameState.camera.currentY) * lerpSpeed;
    gameState.camera.currentZ += (gameState.camera.targetZ - gameState.camera.currentZ) * lerpSpeed;
    gameState.camera.panX += (gameState.camera.panTargetX - gameState.camera.panX) * lerpSpeed;

    // Screen shake
    if (gameState.screenShake > 0) {
        gameState.screenShake -= delta * 2;
        const shakeAmount = gameState.screenShake * 0.3;
        camera.position.x = gameState.camera.panX + (Math.random() - 0.5) * shakeAmount;
        camera.position.y = gameState.camera.currentY + (Math.random() - 0.5) * shakeAmount;
        camera.position.z = gameState.camera.currentZ;
    } else {
        camera.position.x = gameState.camera.panX;
        camera.position.y = gameState.camera.currentY;
        camera.position.z = gameState.camera.currentZ;
    }
    camera.lookAt(gameState.camera.panX, 0, 5);

    // Chromatic aberration fade
    if (gameState.chromaticAberration > 0) {
        gameState.chromaticAberration -= delta;
        bloomPass.strength = 1.5 + gameState.chromaticAberration * 0.5;
    } else {
        bloomPass.strength = 1.5;
    }
}

// ============================================================================
// UI SYSTEM
// ============================================================================

function updateUI() {
    document.getElementById('health-value').textContent = gameState.health;
    document.getElementById('gold-value').textContent = gameState.gold;
    document.getElementById('wave-value').textContent = `${gameState.currentWave}/${CONFIG.TOTAL_WAVES}`;

    // Update tower button states
    document.querySelectorAll('.tower-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        if (gameState.gold < cost) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

function showTowerInfo(tower) {
    const config = CONFIG.TOWERS[tower.type];
    document.getElementById('info-tower-name').textContent = `${config.name} LV.${tower.level}`;
    document.getElementById('info-damage').textContent = tower.damage;
    document.getElementById('info-range').textContent = tower.range.toFixed(1);
    document.getElementById('info-level').textContent = tower.level;
    document.getElementById('info-kills').textContent = tower.kills;

    // Update upgrade button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (tower.level >= 3) {
        upgradeBtn.textContent = 'MAX';
        upgradeBtn.disabled = true;
    } else {
        const upgradeCost = Math.floor(config.cost * 0.75);
        upgradeBtn.textContent = `UPGRADE (${upgradeCost}G)`;
        upgradeBtn.disabled = gameState.gold < upgradeCost;
    }

    // Sell value
    const sellValue = Math.floor(config.cost * 0.5 * tower.level);
    document.getElementById('sell-btn').textContent = `SELL (${sellValue}G)`;

    document.getElementById('cell-info').classList.add('show');

    // Show range indicator
    rangeIndicator.visible = true;
    rangeIndicator.position.set(tower.gridX + 0.5, 0.02, tower.gridY + 0.5);
    rangeIndicator.scale.set(tower.range * 2, tower.range * 2, 1);
}

function hideTowerInfo() {
    document.getElementById('cell-info').classList.remove('show');
    rangeIndicator.visible = false;
    gameState.selectedPlacedTower = null;
}

let messageTimeout;
function showMessage(text, color) {
    // Create floating message
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Orbitron', monospace;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 5px;
        color: #${color.toString(16).padStart(6, '0')};
        text-shadow: 0 0 20px currentColor;
        pointer-events: none;
        z-index: 500;
        animation: messagePopup 1.5s ease-out forwards;
    `;
    msgDiv.textContent = text;
    document.body.appendChild(msgDiv);

    // Add animation keyframes if not exists
    if (!document.getElementById('message-keyframes')) {
        const style = document.createElement('style');
        style.id = 'message-keyframes';
        style.textContent = `
            @keyframes messagePopup {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                30% { transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; }
                100% { opacity: 0; transform: translate(-50%, -70%); }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => msgDiv.remove(), 1500);
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

function initInput() {
    // Mouse move
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Mouse click
    window.addEventListener('click', (e) => {
        // Ignore clicks on UI
        if (e.target.closest('#ui-overlay') && !e.target.closest('#game-overlay')) return;

        handleClick();
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1':
                selectTower('pulse');
                break;
            case '2':
                selectTower('beam');
                break;
            case '3':
                selectTower('nova');
                break;
            case '4':
                selectTower('freeze');
                break;
            case 'Escape':
                cancelSelection();
                break;
            case ' ':
                if (!gameState.isWaveActive && !gameState.isGameOver) {
                    startWave();
                }
                e.preventDefault();
                break;
        }
    });

    // Tower buttons
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.dataset.tower;
            selectTower(type);
        });
    });

    // Mobile touch handlers for tower buttons
    if (gameState.isMobile) {
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('touchstart', handleTowerTouchStart, { passive: false });
            btn.addEventListener('touchmove', handleTowerTouchMove, { passive: false });
            btn.addEventListener('touchend', handleTowerTouchEnd, { passive: false });
            btn.addEventListener('touchcancel', handleTowerTouchEnd, { passive: false });
        });

        // Touch on game area
        renderer.domElement.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
        renderer.domElement.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
        renderer.domElement.addEventListener('touchend', handleCanvasTouchEnd, { passive: false });
    }

    // Wave button
    document.getElementById('wave-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        startWave();
    });

    // Upgrade button
    document.getElementById('upgrade-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.selectedPlacedTower) {
            upgradeTower(gameState.selectedPlacedTower);
            showTowerInfo(gameState.selectedPlacedTower);
        }
    });

    // Sell button
    document.getElementById('sell-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.selectedPlacedTower) {
            sellTower(gameState.selectedPlacedTower);
        }
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        restartGame();
    });

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ============================================================================
// MOBILE TOUCH HANDLERS
// ============================================================================

function handleTowerTouchStart(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const type = btn.dataset.tower;
    const config = CONFIG.TOWERS[type];

    if (gameState.gold < config.cost) {
        showMessage('NOT ENOUGH GOLD', CONFIG.COLORS.RED);
        return;
    }

    const touch = e.touches[0];
    gameState.touch.startX = touch.clientX;
    gameState.touch.startY = touch.clientY;
    gameState.touch.dragTowerType = type;

    // Start hold timer for drag initiation
    gameState.touch.holdTimer = setTimeout(() => {
        startDrag(type, touch.clientX, touch.clientY);
    }, 200);
}

function startDrag(type, x, y) {
    const config = CONFIG.TOWERS[type];
    gameState.touch.isDragging = true;

    // Setup ghost element
    const ghost = document.getElementById('drag-ghost');
    const ghostIcon = ghost.querySelector('.ghost-icon');
    const ghostName = ghost.querySelector('.ghost-name');

    ghostIcon.textContent = getTowerIcon(type);
    ghostIcon.style.color = `#${config.color.toString(16).padStart(6, '0')}`;
    ghostName.textContent = config.name;
    ghostName.style.color = `#${config.color.toString(16).padStart(6, '0')}`;

    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    ghost.classList.add('active');

    // Dim the source button
    document.querySelector(`[data-tower="${type}"]`).style.opacity = '0.4';

    // Haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function getTowerIcon(type) {
    switch(type) {
        case 'pulse': return '△';
        case 'beam': return '◇';
        case 'nova': return '○';
        case 'freeze': return '◎';
        default: return '□';
    }
}

function handleTowerTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];

    // Clear hold timer if moved too much before drag started
    if (!gameState.touch.isDragging) {
        const dx = touch.clientX - gameState.touch.startX;
        const dy = touch.clientY - gameState.touch.startY;
        if (Math.sqrt(dx*dx + dy*dy) > 10) {
            clearTimeout(gameState.touch.holdTimer);
            // Start drag immediately on significant movement
            startDrag(gameState.touch.dragTowerType, touch.clientX, touch.clientY);
        }
        return;
    }

    // Update ghost position
    const ghost = document.getElementById('drag-ghost');
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.top = `${touch.clientY}px`;

    // Update hover indicator on grid
    gameState.touch.currentX = touch.clientX;
    gameState.touch.currentY = touch.clientY;
    updateDragHover(touch.clientX, touch.clientY);
}

function updateDragHover(clientX, clientY) {
    // Convert screen coordinates to normalized device coordinates
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const ground = scene.getObjectByName('ground');
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x);
        const gridY = Math.floor(point.z);

        // Check bounds
        if (gridX < 0 || gridX >= CONFIG.GRID_WIDTH || gridY < 0 || gridY >= CONFIG.GRID_HEIGHT) {
            hoverIndicator.visible = false;
            rangeIndicator.visible = false;
            return;
        }

        hoverIndicator.visible = true;
        hoverIndicator.position.set(gridX + 0.5, 0.01, gridY + 0.5);

        const type = gameState.touch.dragTowerType;
        const config = CONFIG.TOWERS[type];

        // Check if can place
        if (gameState.grid[gridX][gridY] !== 0) {
            hoverIndicator.material.color.setHex(CONFIG.COLORS.RED);
            hoverIndicator.material.opacity = 0.4;
        } else {
            hoverIndicator.material.color.setHex(config.color);
            hoverIndicator.material.opacity = 0.3;
        }

        // Show range preview
        rangeIndicator.visible = true;
        rangeIndicator.position.set(gridX + 0.5, 0.02, gridY + 0.5);
        rangeIndicator.scale.set(config.range * 2, config.range * 2, 1);
        rangeIndicator.material.color.setHex(config.color);
    } else {
        hoverIndicator.visible = false;
        rangeIndicator.visible = false;
    }
}

function handleTowerTouchEnd(e) {
    e.preventDefault();

    // Clear hold timer
    clearTimeout(gameState.touch.holdTimer);

    if (!gameState.touch.isDragging) {
        // Was just a tap, select tower instead
        const type = gameState.touch.dragTowerType;
        if (type) {
            selectTower(type);
        }
        gameState.touch.dragTowerType = null;
        return;
    }

    // End drag
    const ghost = document.getElementById('drag-ghost');
    ghost.classList.remove('active');

    // Restore button opacity
    const type = gameState.touch.dragTowerType;
    document.querySelector(`[data-tower="${type}"]`).style.opacity = '1';

    // Try to place tower at current position
    const clientX = gameState.touch.currentX || gameState.touch.startX;
    const clientY = gameState.touch.currentY || gameState.touch.startY;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const ground = scene.getObjectByName('ground');
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x);
        const gridY = Math.floor(point.z);

        // Check bounds
        if (gridX >= 0 && gridX < CONFIG.GRID_WIDTH && gridY >= 0 && gridY < CONFIG.GRID_HEIGHT) {
            placeTower(gridX, gridY, type);
        }
    }

    // Reset touch state
    gameState.touch.isDragging = false;
    gameState.touch.dragTowerType = null;
    hoverIndicator.visible = false;
    rangeIndicator.visible = false;
}

function handleCanvasTouchStart(e) {
    // Don't interfere with drag operations
    if (gameState.touch.isDragging) return;

    // Two-finger gesture detection
    if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        gameState.camera.lastPinchDist = dist;
        gameState.camera.lastPanX = (touch1.clientX + touch2.clientX) / 2;
        gameState.camera.lastPanY = (touch1.clientY + touch2.clientY) / 2;
        gameState.camera.isPinching = true;
        return;
    }

    const touch = e.touches[0];
    gameState.touch.startX = touch.clientX;
    gameState.touch.startY = touch.clientY;
}

function handleCanvasTouchMove(e) {
    // Allow scrolling/panning if not dragging tower
    if (gameState.touch.isDragging) {
        e.preventDefault();
        return;
    }

    // Two-finger pinch zoom and pan
    if (e.touches.length === 2 && gameState.camera.isPinching) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Pinch zoom
        const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const deltaDist = dist - gameState.camera.lastPinchDist;
        gameState.camera.lastPinchDist = dist;

        // Zoom: adjust Y and Z together
        const zoomSpeed = 0.05;
        gameState.camera.targetY = Math.max(10, Math.min(30, gameState.camera.targetY - deltaDist * zoomSpeed));
        gameState.camera.targetZ = Math.max(12, Math.min(35, gameState.camera.targetZ - deltaDist * zoomSpeed));

        // Two-finger pan
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        const panDeltaX = centerX - gameState.camera.lastPanX;
        gameState.camera.lastPanX = centerX;
        gameState.camera.lastPanY = centerY;

        // Pan camera target
        const panSpeed = 0.02;
        gameState.camera.panTargetX = Math.max(2, Math.min(12, gameState.camera.panTargetX - panDeltaX * panSpeed));
    }
}

function handleCanvasTouchEnd(e) {
    // Reset pinching state
    if (gameState.camera.isPinching) {
        gameState.camera.isPinching = false;
        if (e.touches.length === 0) return;
    }

    if (gameState.touch.isDragging) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - gameState.touch.startX;
    const dy = touch.clientY - gameState.touch.startY;

    // Only process as tap if minimal movement
    if (Math.sqrt(dx*dx + dy*dy) > 20) return;

    e.preventDefault();

    // Convert to mouse coordinates for raycasting
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const ground = scene.getObjectByName('ground');
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x);
        const gridY = Math.floor(point.z);

        if (gridX < 0 || gridX >= CONFIG.GRID_WIDTH || gridY < 0 || gridY >= CONFIG.GRID_HEIGHT) {
            return;
        }

        if (gameState.selectedTower) {
            // Place selected tower (fallback for tap-to-place)
            if (placeTower(gridX, gridY, gameState.selectedTower)) {
                const config = CONFIG.TOWERS[gameState.selectedTower];
                if (gameState.gold < config.cost) {
                    cancelSelection();
                }
            }
        } else {
            // Check if tapped on existing tower
            const clickedTower = gameState.towers.find(t => t.gridX === gridX && t.gridY === gridY);
            if (clickedTower) {
                gameState.selectedPlacedTower = clickedTower;
                showTowerInfo(clickedTower);
            } else {
                hideTowerInfo();
            }
        }
    }
}

function selectTower(type) {
    const config = CONFIG.TOWERS[type];

    if (gameState.gold < config.cost) {
        showMessage('NOT ENOUGH GOLD', CONFIG.COLORS.RED);
        return;
    }

    // Deselect previous
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));

    // Select new
    gameState.selectedTower = type;
    document.querySelector(`[data-tower="${type}"]`).classList.add('selected');

    // Hide tower info if shown
    hideTowerInfo();

    // Update hover indicator color
    hoverIndicator.material.color.setHex(config.color);
}

function cancelSelection() {
    gameState.selectedTower = null;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    hoverIndicator.visible = false;
    hideTowerInfo();
}

function handleClick() {
    raycaster.setFromCamera(mouse, camera);
    const ground = scene.getObjectByName('ground');
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x);
        const gridY = Math.floor(point.z);

        // Check bounds
        if (gridX < 0 || gridX >= CONFIG.GRID_WIDTH || gridY < 0 || gridY >= CONFIG.GRID_HEIGHT) {
            return;
        }

        if (gameState.selectedTower) {
            // Place tower
            if (placeTower(gridX, gridY, gameState.selectedTower)) {
                // Keep selection if still can afford
                const config = CONFIG.TOWERS[gameState.selectedTower];
                if (gameState.gold < config.cost) {
                    cancelSelection();
                }
            }
        } else {
            // Check if clicked on existing tower
            const clickedTower = gameState.towers.find(t => t.gridX === gridX && t.gridY === gridY);
            if (clickedTower) {
                gameState.selectedPlacedTower = clickedTower;
                showTowerInfo(clickedTower);
            } else {
                hideTowerInfo();
            }
        }
    }
}

function updateHover() {
    if (!gameState.selectedTower) {
        hoverIndicator.visible = false;
        return;
    }

    raycaster.setFromCamera(mouse, camera);
    const ground = scene.getObjectByName('ground');
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x);
        const gridY = Math.floor(point.z);

        // Check bounds
        if (gridX < 0 || gridX >= CONFIG.GRID_WIDTH || gridY < 0 || gridY >= CONFIG.GRID_HEIGHT) {
            hoverIndicator.visible = false;
            return;
        }

        hoverIndicator.visible = true;
        hoverIndicator.position.set(gridX + 0.5, 0.01, gridY + 0.5);

        // Check if can place
        if (gameState.grid[gridX][gridY] !== 0) {
            hoverIndicator.material.color.setHex(CONFIG.COLORS.RED);
            hoverIndicator.material.opacity = 0.4;
        } else {
            hoverIndicator.material.color.setHex(CONFIG.TOWERS[gameState.selectedTower].color);
            hoverIndicator.material.opacity = 0.3;
        }

        // Show range preview
        const config = CONFIG.TOWERS[gameState.selectedTower];
        rangeIndicator.visible = true;
        rangeIndicator.position.set(gridX + 0.5, 0.02, gridY + 0.5);
        rangeIndicator.scale.set(config.range * 2, config.range * 2, 1);
        rangeIndicator.material.color.setHex(config.color);
    } else {
        hoverIndicator.visible = false;
        if (!gameState.selectedPlacedTower) {
            rangeIndicator.visible = false;
        }
    }
}

// ============================================================================
// GAME OVER
// ============================================================================

function gameOver(victory) {
    gameState.isGameOver = true;
    gameState.isWaveActive = false;

    const overlay = document.getElementById('game-overlay');
    const title = document.getElementById('overlay-title');
    const subtitle = document.getElementById('overlay-subtitle');

    if (victory) {
        title.textContent = 'VICTORY';
        title.className = 'victory';
        subtitle.textContent = `ALL ${CONFIG.TOTAL_WAVES} WAVES CLEARED`;
    } else {
        title.textContent = 'DEFEAT';
        title.className = 'defeat';
        subtitle.textContent = `REACHED WAVE ${gameState.currentWave}`;
    }

    overlay.classList.add('show');

    // Big effect
    gameState.screenShake = 1;
    gameState.chromaticAberration = 2;
}

function restartGame() {
    // Reset state
    gameState.gold = CONFIG.INITIAL_GOLD;
    gameState.health = CONFIG.INITIAL_HEALTH;
    gameState.currentWave = 0;
    gameState.isWaveActive = false;
    gameState.isGameOver = false;
    gameState.selectedTower = null;
    gameState.selectedPlacedTower = null;

    // Clear entities
    while (gameState.towers.length > 0) {
        const tower = gameState.towers.pop();
        towerGroup.remove(tower.mesh);
    }

    while (gameState.enemies.length > 0) {
        const enemy = gameState.enemies.pop();
        enemyGroup.remove(enemy.mesh);
    }

    while (gameState.projectiles.length > 0) {
        const proj = gameState.projectiles.pop();
        projectileGroup.remove(proj.mesh);
    }

    while (gameState.particles.length > 0) {
        const particle = gameState.particles.pop();
        particleGroup.remove(particle.mesh);
    }

    gameState.waveSpawnQueue = [];

    // Reset grid
    for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            if (x === gameState.spawnPoint.x && y === gameState.spawnPoint.y) {
                gameState.grid[x][y] = 3;
            } else if (x === gameState.exitPoint.x && y === gameState.exitPoint.y) {
                gameState.grid[x][y] = 4;
            } else {
                gameState.grid[x][y] = 0;
            }
        }
    }

    // Recalculate path
    calculatePath();

    // Hide overlay
    document.getElementById('game-overlay').classList.remove('show');
    document.getElementById('wave-btn').disabled = false;
    document.getElementById('enemy-count').classList.remove('show');

    // Reset selection UI
    cancelSelection();

    updateUI();
}

// ============================================================================
// MAIN GAME LOOP
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1); // Cap delta to prevent issues

    if (!gameState.isPaused && !gameState.isGameOver) {
        // Update game systems
        updateWaveSpawning(delta);
        updateEnemies(delta);
        updateTowers(delta);
        updateProjectiles(delta);
        checkWaveComplete();
    }

    // Always update visuals
    updateParticles(delta);
    updateScreenEffects(delta);
    updateHover();

    // Animate grid markers
    gridGroup.children.forEach(child => {
        if (child.userData.pulse) {
            child.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
        }
    });

    // Render
    composer.render();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    // Detect mobile device
    gameState.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768 && window.innerHeight > window.innerWidth);

    // Update loading progress
    const loadingProgress = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');

    loadingProgress.style.width = '20%';
    loadingText.textContent = 'INITIALIZING RENDERER...';

    setTimeout(() => {
        initThree();
        loadingProgress.style.width = '50%';
        loadingText.textContent = 'GENERATING GRID...';

        setTimeout(() => {
            createGrid();
            loadingProgress.style.width = '80%';
            loadingText.textContent = 'CALIBRATING SYSTEMS...';

            setTimeout(() => {
                initInput();
                updateUI();
                loadingProgress.style.width = '100%';
                loadingText.textContent = 'DEFENSE MATRIX READY';

                setTimeout(() => {
                    document.getElementById('loading').classList.add('hidden');
                    animate();
                }, 500);
            }, 300);
        }, 300);
    }, 300);
}

// Start the game when page loads
window.addEventListener('load', init);
