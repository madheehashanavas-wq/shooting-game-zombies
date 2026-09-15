import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

/* =========================================
   ZOMBIE ASSAULT
   FIRST PLAYABLE VERSION
   ========================================= */

// -------------------------
// GAME VARIABLES
// -------------------------

let scene;
let camera;
let renderer;

let player;
let clock;

let keys = {};

let gameStarted = false;

let health = 100;

let currentWeapon = 2;

let canShoot = true;

let zombies = [];

let buildings = [];

let floorNumber = 1;


// -------------------------
// WEAPONS
// -------------------------

const weapons = {

    1: {
        name: "SMG",
        ammo: 40,
        maxAmmo: 40,
        damage: 15,
        fireRate: 100,
        range: 60,
        zoom: 1.0
    },

    2: {
        name: "ASSAULT RIFLE",
        ammo: 30,
        maxAmmo: 30,
        damage: 25,
        fireRate: 180,
        range: 100,
        zoom: 1.0
    },

    3: {
        name: "SHOTGUN",
        ammo: 8,
        maxAmmo: 8,
        damage: 60,
        fireRate: 700,
        range: 35,
        zoom: 1.0
    },

    4: {
        name: "SNIPER",
        ammo: 5,
        maxAmmo: 5,
        damage: 100,
        fireRate: 1000,
        range: 250,
        zoom: 2.0
    }

};


// -------------------------
// START GAME
// -------------------------

document
    .getElementById("start-button")
    .addEventListener("click", startGame);


function startGame() {

    gameStarted = true;

    document.getElementById("start-screen").style.display = "none";

    initGame();

}


// -------------------------
// INITIALIZE GAME
// -------------------------

function initGame() {

    clock = new THREE.Clock();

    // Scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x66727a);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(0, 2, 8);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    document
        .getElementById("game")
        .appendChild(renderer.domElement);


    // Lighting
    const sunlight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    sunlight.position.set(
        20,
        40,
        20
    );

    scene.add(sunlight);


    const ambient = new THREE.AmbientLight(
        0xffffff,
        0.6
    );

    scene.add(ambient);


    // Ground
    createGround();


    // Buildings
    createBuildings();


    // Player
    createPlayer();


    // Zombies
    createZombies();


    // Events
    setupControls();


    // Start loop
    animate();

}


// -------------------------
// GROUND
// -------------------------

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(300, 300);

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x3b3b3b
        });

    const ground =
        new THREE.Mesh(
            geometry,
            material
        );

    ground.rotation.x = -Math.PI / 2;

    scene.add(ground);

}


// -------------------------
// BUILDINGS
// -------------------------

function createBuildings() {

    createBuilding(-25, -20);
    createBuilding(25, -20);
    createBuilding(-25, 25);
    createBuilding(25, 25);

}


function createBuilding(x, z) {

    const building =
        new THREE.Group();


    // Three floors
    for (let floor = 0; floor < 3; floor++) {

        const geometry =
            new THREE.BoxGeometry(
                25,
                7,
                20
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x777777
            });

        const level =
            new THREE.Mesh(
                geometry,
                material
            );

        level.position.set(
            0,
            3.5 + floor * 7,
            0
        );

        building.add(level);


        // Floor line
        const floorGeometry =
            new THREE.BoxGeometry(
                25.5,
                0.3,
                20.5
            );

        const floorMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x444444
            });

        const floorMesh =
            new THREE.Mesh(
                floorGeometry,
                floorMaterial
            );

        floorMesh.position.set(
            0,
            7 + floor * 7,
            0
        );

        building.add(floorMesh);

    }


    building.position.set(
        x,
        0,
        z
    );

    scene.add(building);

    buildings.push(building);

}


// -------------------------
// PLAYER
// -------------------------

function createPlayer() {

    player = new THREE.Object3D();

    player.position.set(
        0,
        2,
        10
    );

    scene.add(player);

    player.add(camera);

}


// -------------------------
// ZOMBIES
// -------------------------

function createZombies() {

    const positions = [

        [-8, 1, -25],
        [8, 1, -30],
        [-15, 1, 5],
        [15, 1, 5],
        [-35, 1, 0],
        [35, 1, 0],
        [0, 1, -45],
        [0, 1, 45]

    ];


    positions.forEach(position => {

        createZombie(
            position[0],
            position[1],
            position[2]
        );

    });

}


function createZombie(x, y, z) {

    const zombie =
        new THREE.Group();


    // Body
    const bodyGeometry =
        new THREE.BoxGeometry(
            1.2,
            2,
            0.7
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4f7d42
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y = 1;

    zombie.add(body);


    // Head
    const headGeometry =
        new THREE.SphereGeometry(
            0.55,
            12,
            12
        );

    const headMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x6fa05a
        });

    const head =
        new THREE.Mesh(
            headGeometry,
            headMaterial
        );

    head.position.y = 2.4;

    zombie.add(head);


    zombie.position.set(
        x,
        y,
        z
    );


    zombie.userData.health = 100;

    scene.add(zombie);

    zombies.push(zombie);

}


// -------------------------
// CONTROLS
// -------------------------

function setupControls() {

    document.addEventListener(
        "keydown",
        event => {

            keys[event.key.toLowerCase()] = true;


            // Weapon switching
            if (
                event.key >= "1" &&
                event.key <= "4"
            ) {

                switchWeapon(
                    Number(event.key)
                );

            }


            // Reload
            if (
                event.key.toLowerCase() === "r"
            ) {

                reload();

            }

        }
    );


    document.addEventListener(
        "keyup",
        event => {

            keys[event.key.toLowerCase()] = false;

        }
    );


    document.addEventListener(
        "mousedown",
        event => {

            if (
                event.button === 0 &&
                gameStarted
            ) {

                shoot();

            }

        }
    );


    window.addEventListener(
        "resize",
        resizeGame
    );

}


// -------------------------
// MOVEMENT
// -------------------------

function updatePlayer(delta) {

    if (!player) return;


    const speed = 10;


    if (keys["w"]) {

        player.translateZ(
            -speed * delta
        );

    }

    if (keys["s"]) {

        player.translateZ(
            speed * delta
        );

    }

    if (keys["a"]) {

        player.translateX(
            -speed * delta
        );

    }

    if (keys["d"]) {

        player.translateX(
            speed * delta
        );

    }

}


// -------------------------
// SHOOTING
// -------------------------

function shoot() {

    if (!canShoot) return;


    const weapon =
        weapons[currentWeapon];


    if (weapon.ammo <= 0) {

        reload();

        return;

    }


    weapon.ammo--;


    updateWeaponUI();


    canShoot = false;


    setTimeout(
        () => {

            canShoot = true;

        },
        weapon.fireRate
    );


    // Ray from camera
    const raycaster =
        new THREE.Raycaster();


    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const zombieMeshes = [];


    zombies.forEach(zombie => {

        zombie.children.forEach(
            child => {

                zombieMeshes.push(child);

            }
        );

    });


    const hits =
        raycaster.intersectObjects(
            zombieMeshes
        );


    if (hits.length > 0) {

        const hit =
            hits[0].object;


        const zombie =
            hit.parent;


        zombie.userData.health -=
            weapon.damage;


        if (
            zombie.userData.health <= 0
        ) {

            killZombie(zombie);

        }

    }

}


// -------------------------
// KILL ZOMBIE
// -------------------------

function killZombie(zombie) {

    scene.remove(zombie);

    zombies =
        zombies.filter(
            z => z !== zombie
        );

}


// -------------------------
// RELOAD
// -------------------------

function reload() {

    const weapon =
        weapons[currentWeapon];


    weapon.ammo =
        weapon.maxAmmo;


    updateWeaponUI();

}


// -------------------------
// CHANGE WEAPON
// -------------------------

function switchWeapon(number) {

    if (!weapons[number]) return;


    currentWeapon = number;


    updateWeaponUI();


    // Sniper zoom
    if (currentWeapon === 4) {

        camera.fov = 40;

    } else {

        camera.fov = 75;

    }


    camera.updateProjectionMatrix();

}


// -------------------------
// UPDATE WEAPON UI
// -------------------------

function updateWeaponUI() {

    const weapon =
        weapons[currentWeapon];


    document.getElementById(
        "weapon-name"
    ).textContent =
        weapon.name;


    document.getElementById(
        "ammo"
    ).textContent =
        weapon.ammo + " / " +
        weapon.maxAmmo;

}


// -------------------------
// ZOMBIE AI
// -------------------------

function updateZombies(delta) {

    if (!player) return;


    zombies.forEach(zombie => {

        const distance =
            zombie.position.distanceTo(
                player.position
            );


        if (distance < 80) {

            zombie.lookAt(
                player.position.x,
                zombie.position.y,
                player.position.z
            );


            if (distance > 2.5) {

                zombie.translateZ(
                    2 * delta
                );

            } else {

                damagePlayer(
                    10 * delta
                );

            }

        }

    });

}


// -------------------------
// PLAYER DAMAGE
// -------------------------

function damagePlayer(amount) {

    health -= amount;


    if (health < 0) {

        health = 0;

    }


    updateHealth();


    if (health <= 0) {

        gameOver();

    }

}


// -------------------------
// HEALTH UI
// -------------------------

function updateHealth() {

    const fill =
        document.getElementById(
            "health-fill"
        );

    const number =
        document.getElementById(
            "health-number"
        );


    fill.style.width =
        health + "%";


    number.textContent =
        Math.round(health);


    if (health <= 25) {

        fill.style.background =
            "#d21f1f";

    }

}


// -------------------------
// GAME OVER
// -------------------------

function gameOver() {

    gameStarted = false;


    const screen =
        document.getElementById(
            "start-screen"
        );


    screen.style.display = "flex";


    screen.querySelector("h1")
        .textContent =
        "GAME OVER";


    screen.querySelector("p")
        .textContent =
        "The zombies got you.";


    document.getElementById(
        "start-button"
    ).textContent =
        "PLAY AGAIN";

}


// -------------------------
// RESIZE
// -------------------------

function resizeGame() {

    if (!camera || !renderer)
        return;


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

}


// -------------------------
// MAIN GAME LOOP
// -------------------------

function animate() {

    if (!gameStarted) return;


    requestAnimationFrame(
        animate
    );


    const delta =
        clock.getDelta();


    updatePlayer(delta);

    updateZombies(delta);


    renderer.render(
        scene,
        camera
    );

}


// -------------------------
// INITIAL UI
// -------------------------

updateWeaponUI();
