# Mobile Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert desktop layout to mobile-first portrait mode with drag-and-drop tower placement.

**Architecture:** Add CSS media queries for portrait mobile, refactor input handling to support touch drag-and-drop, add bottom sheet for tower info.

**Tech Stack:** Vanilla CSS (media queries), Touch Events API, existing Three.js setup

---

### Task 1: Add Mobile CSS Media Query Foundation

**Files:**
- Modify: `index.html:8-445` (style section)

**Step 1: Add media query skeleton at end of style section**

Add before closing `</style>` tag (line 445):

```css
/* ===== MOBILE PORTRAIT ===== */
@media (max-width: 768px) and (orientation: portrait) {
    /* Compact HUD */
    #top-hud {
        top: 10px;
        gap: 8px;
        width: 95%;
        justify-content: space-between;
    }

    .hud-item {
        padding: 6px 12px;
        border: none;
        background: transparent;
    }

    .hud-label {
        font-size: 7px;
        letter-spacing: 1px;
        margin-bottom: 2px;
    }

    .hud-value {
        font-size: 18px;
    }

    /* Tower Panel */
    #tower-panel {
        bottom: 0;
        padding: 10px;
        padding-bottom: calc(10px + env(safe-area-inset-bottom));
        background: rgba(0, 0, 0, 0.9);
        border-top: 1px solid rgba(0, 255, 255, 0.3);
        width: 100%;
        justify-content: space-around;
        gap: 8px;
    }

    .tower-btn {
        width: 70px;
        height: 80px;
        touch-action: none;
    }

    .tower-icon {
        font-size: 24px;
    }

    .tower-name {
        font-size: 8px;
    }

    .tower-cost {
        font-size: 10px;
    }

    .tower-key {
        display: none;
    }

    /* Wave Button */
    #wave-btn {
        right: auto;
        left: 50%;
        transform: translateX(-50%);
        bottom: calc(100px + env(safe-area-inset-bottom));
        width: 90%;
        max-width: 300px;
        padding: 12px 20px;
        font-size: 11px;
    }

    /* Hide desktop instructions */
    #instructions {
        display: none;
    }

    /* Cell Info as Bottom Sheet */
    #cell-info {
        position: fixed;
        top: auto;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        border-radius: 16px 16px 0 0;
        padding: 20px;
        padding-bottom: calc(20px + env(safe-area-inset-bottom));
        transform: translateY(100%);
        transition: transform 0.3s ease;
        z-index: 150;
    }

    #cell-info.show {
        display: block;
        transform: translateY(0);
    }

    .action-buttons {
        flex-direction: row;
        gap: 12px;
    }

    .action-btn {
        padding: 14px;
        font-size: 11px;
    }

    /* Game Overlay */
    #overlay-title {
        font-size: 32px;
        letter-spacing: 6px;
    }

    #overlay-subtitle {
        font-size: 12px;
    }

    #restart-btn {
        padding: 14px 40px;
        font-size: 12px;
    }

    /* Loading */
    #loading-title {
        font-size: 24px;
    }

    #loading-bar {
        width: 250px;
    }
}
```

**Step 2: Verify by opening in browser with mobile viewport**

Run: Open https://estelle-hub.mooo.com/neon-grid-defense/ in browser, toggle device toolbar (F12 → mobile view)
Expected: Compact layout visible

**Step 3: Commit**

```bash
git add index.html
git commit -m "style: add mobile portrait media queries for compact layout"
```

---

### Task 2: Add Drag Ghost Element HTML

**Files:**
- Modify: `index.html:448-528` (body section)

**Step 1: Add drag ghost element after ui-overlay**

Add after line 528 (before loading div):

```html
<!-- Drag Ghost for Mobile -->
<div id="drag-ghost">
    <div class="ghost-icon"></div>
    <div class="ghost-name"></div>
</div>
```

**Step 2: Add drag ghost styles in mobile media query**

Add to the mobile media query section:

```css
/* Drag Ghost */
#drag-ghost {
    position: fixed;
    pointer-events: none;
    z-index: 300;
    display: none;
    flex-direction: column;
    align-items: center;
    opacity: 0.8;
    transform: translate(-50%, -50%);
}

#drag-ghost.active {
    display: flex;
}

.ghost-icon {
    font-size: 40px;
    text-shadow: 0 0 20px currentColor;
}

.ghost-name {
    font-size: 10px;
    letter-spacing: 2px;
    margin-top: 4px;
}
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add drag ghost element for mobile tower placement"
```

---

### Task 3: Add Touch State Variables

**Files:**
- Modify: `game.js:151-182` (gameState section)

**Step 1: Add touch state to gameState object**

Add after line 181 (after `chromaticAberration: 0,`):

```javascript
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

    // Device detection
    isMobile: false,
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: add touch state variables for mobile drag-and-drop"
```

---

### Task 4: Add Mobile Detection

**Files:**
- Modify: `game.js:1766-1797` (init function)

**Step 1: Add mobile detection at start of init function**

Add after line 1767 (inside init function, at start):

```javascript
    // Detect mobile device
    gameState.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768 && window.innerHeight > window.innerWidth);
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: add mobile device detection"
```

---

### Task 5: Add Touch Event Handlers

**Files:**
- Modify: `game.js:1437-1524` (initInput function)

**Step 1: Add touch event handlers after keyboard handlers**

Add after line 1486 (after tower button click handlers):

```javascript
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: register touch event handlers for mobile"
```

---

### Task 6: Implement Tower Touch Start Handler

**Files:**
- Modify: `game.js` (add after initInput function, around line 1524)

**Step 1: Add handleTowerTouchStart function**

```javascript
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: implement tower touch start handler"
```

---

### Task 7: Implement Drag Start and Move Functions

**Files:**
- Modify: `game.js` (add after handleTowerTouchStart)

**Step 1: Add startDrag and handleTowerTouchMove functions**

```javascript
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: implement drag start and move functions"
```

---

### Task 8: Implement Drag Hover Update

**Files:**
- Modify: `game.js` (add after handleTowerTouchMove)

**Step 1: Add updateDragHover function**

```javascript
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: implement drag hover update for grid preview"
```

---

### Task 9: Implement Touch End Handler (Drop Logic)

**Files:**
- Modify: `game.js` (add after updateDragHover)

**Step 1: Add handleTowerTouchEnd function**

```javascript
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: implement touch end handler with tower placement"
```

---

### Task 10: Implement Canvas Touch Handlers (Tap to Select Tower)

**Files:**
- Modify: `game.js` (add after handleTowerTouchEnd)

**Step 1: Add canvas touch handlers**

```javascript
function handleCanvasTouchStart(e) {
    // Don't interfere with drag operations
    if (gameState.touch.isDragging) return;

    const touch = e.touches[0];
    gameState.touch.startX = touch.clientX;
    gameState.touch.startY = touch.clientY;
}

function handleCanvasTouchMove(e) {
    // Allow scrolling/panning if not dragging tower
    if (gameState.touch.isDragging) {
        e.preventDefault();
    }
}

function handleCanvasTouchEnd(e) {
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
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "feat: implement canvas touch handlers for tower selection"
```

---

### Task 11: Add Bottom Sheet Close on Outside Tap

**Files:**
- Modify: `game.js` (update handleCanvasTouchEnd)

**Step 1: Modify handleCanvasTouchEnd to close bottom sheet**

Add at the beginning of handleCanvasTouchEnd, after the isDragging check:

```javascript
    // Close tower info bottom sheet if tapping outside
    if (gameState.selectedPlacedTower) {
        const cellInfo = document.getElementById('cell-info');
        if (!cellInfo.contains(e.target)) {
            // Will be handled below, but if no tower tapped, sheet will close
        }
    }
```

**Step 2: Commit**

```bash
git add game.js
git commit -m "fix: close bottom sheet when tapping outside"
```

---

### Task 12: Add Sheet Drag Handle for Bottom Sheet

**Files:**
- Modify: `index.html`

**Step 1: Add drag handle element to cell-info**

Modify line 503-504:

```html
<div id="cell-info">
    <div class="sheet-handle"></div>
    <div class="info-title" id="info-tower-name">PULSE TOWER</div>
```

**Step 2: Add handle styles to mobile media query**

```css
.sheet-handle {
    width: 40px;
    height: 4px;
    background: rgba(0, 255, 255, 0.4);
    border-radius: 2px;
    margin: 0 auto 15px;
}
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add drag handle to mobile bottom sheet"
```

---

### Task 13: Final Testing and Cleanup

**Step 1: Test on mobile viewport**

Run: Open browser dev tools, enable device mode, test:
- HUD is compact
- Tower panel is at bottom
- Drag from tower button to grid
- Tap existing tower shows bottom sheet
- Tap outside closes sheet
- Wave button works

**Step 2: Test on actual mobile device**

Run: Open https://estelle-hub.mooo.com/neon-grid-defense/ on phone
Expected: All interactions work smoothly

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete mobile portrait layout with drag-and-drop

- Compact HUD for portrait mode
- Bottom fixed tower panel
- Drag-and-drop tower placement with ghost element
- Touch-friendly bottom sheet for tower info
- Safe area inset support for notched devices"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | CSS media queries for mobile |
| 2 | Drag ghost HTML element |
| 3 | Touch state variables |
| 4 | Mobile detection |
| 5 | Touch event registration |
| 6 | Touch start handler |
| 7 | Drag start and move |
| 8 | Drag hover preview |
| 9 | Touch end (drop) handler |
| 10 | Canvas touch handlers |
| 11 | Bottom sheet close behavior |
| 12 | Sheet drag handle |
| 13 | Final testing |
