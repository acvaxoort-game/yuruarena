import Animation from './animation.js'
import * as util from './util.js';
import * as textures from './textures.js';
import MeleeAttackComponent from './components/meleeattack.js';
import World from './world.js';
import WalkingComponent from './components/walking.js';
import SimpleAnimationComponent from './components/simpleanimation.js';
import Entity from './entity.js';
import SlimeBehaviourComponent from './components/slimebehaviour.js';
import DamageTakerComponent from './components/damagetaker.js';
import ChasingAIComponent from './components/chasingai.js';

let canvas = document.getElementById("yuru-canvas");
let ctx = canvas.getContext('2d');
const offscreenWidth = 320;
const offscreenHeight = 240;
let multiplier = 3;

ctx.imageSmoothingEnabled = false;

function resizeCanvas(newMultiplier) {
    multiplier = newMultiplier;
    let width = offscreenWidth * newMultiplier;
    let height = offscreenHeight * newMultiplier;
    if (canvas.width != width ||
        canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
    }
    ctx.imageSmoothingEnabled = false;
    document.querySelector("main").style.maxWidth = `${width}px`;
}

document.getElementById("button2x").addEventListener("click", () => { resizeCanvas(2); });
document.getElementById("button3x").addEventListener("click", () => { resizeCanvas(3); });
document.getElementById("button4x").addEventListener("click", () => { resizeCanvas(4); });
document.getElementById("button5x").addEventListener("click", () => { resizeCanvas(5); });
document.getElementById("button6x").addEventListener("click", () => { resizeCanvas(6); });
document.getElementById("button7x").addEventListener("click", () => { resizeCanvas(7); });
document.getElementById("button8x").addEventListener("click", () => { resizeCanvas(8); });

function createOffscreenCanvas() {
    let offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = offscreenWidth;
    offScreenCanvas.height = offscreenHeight;
    let ctx = offScreenCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return offScreenCanvas;
}

let canvases = {
    "shadows": createOffscreenCanvas(),
    "foreground": createOffscreenCanvas(),
    "gui": createOffscreenCanvas(),
}

let layers = {
    "shadows": canvases.shadows.getContext("2d"),
    "foreground": canvases.foreground.getContext("2d"),
    "gui": canvases.gui.getContext("2d"),
}

let forestLower = textures.load("areas/forest_lower");
let forestUpper = textures.load("areas/forest_upper");
let portraitFrame = textures.load("characters/frame");
let portraitKyoko = textures.load("characters/kyokoportrait");
let kyokoAnimation = new Animation(textures.loadAnimation("kyoko", 2), 8);
let kyokoStationaryAnimation = new Animation([textures.load("kyoko0000")], 1);
let kyokoAirborneAnimation = new Animation([textures.load("kyoko0001")], 1);
let slimeAnimation = new Animation(textures.loadAnimation("enemies/green_slime", 2), 8);
let slimeStationaryAnimation = new Animation([textures.load("enemies/green_slime0000")], 8);
let slimeAirborneAnimation = new Animation([textures.load("enemies/green_slime0001")], 8);
let slashAnimation = new Animation(textures.loadAnimation("slash", 2), 15);

let directionKeys = [false, false, false, false];
let world = new World();
let kyoko = new Entity();
kyoko.pos = new util.Vec2D(10, 10);
kyoko.friction = 30;
new MeleeAttackComponent()
    .setSlashAnimation(util.clone(slashAnimation))
    .attach(kyoko);
new WalkingComponent()
    .setWalkingParameters(60, 5)
    .attach(kyoko);
new SimpleAnimationComponent()
    .setAnimation(util.clone(kyokoAnimation))
    .setStationaryAnimation(util.clone(kyokoStationaryAnimation))
    .setAirborneAnimation(util.clone(kyokoAirborneAnimation))
    .attach(kyoko);
new DamageTakerComponent()
    .setHpMax(100)
    .attach(kyoko);
new ChasingAIComponent()
    .attach(kyoko);

function spawnSlime() {
    let slime = new Entity();
    slime.pos = new util.Vec2D(Math.random() * 20, Math.random() * 20);
    new SimpleAnimationComponent()
        .setAnimation(util.clone(slimeAnimation))
        .setStationaryAnimation(util.clone(slimeStationaryAnimation))
        .setAirborneAnimation(util.clone(slimeAirborneAnimation))
        .setAutoAnimationFlip(false)
        .setAutoAnimationUpdate(false)
        .attach(slime);
    new SlimeBehaviourComponent()
        .setJumpCooldown(2)
        .attach(slime);
    new DamageTakerComponent()
        .setHpMax(10)
        .attach(slime);
    world.addEntity(slime, World.enemyCharacters);
    return slime;
}

world.addEntity(kyoko, World.playerCharacters);

function update(dt) {
    let kyokoAcceleration = new util.Vec2D(0, 0);
    if (directionKeys[0]) {
        kyokoAcceleration.x -= 1;
    }
    if (directionKeys[1]) {
        kyokoAcceleration.x += 1;
    }
    if (directionKeys[2]) {
        kyokoAcceleration.y += 1;
    }
    if (directionKeys[3]) {
        kyokoAcceleration.y -= 1;
    }
    kyoko.components.walking.walkInDirection(kyokoAcceleration, dt);
    while (world.entities[World.enemyCharacters].length < 3) {
        spawnSlime();
    }
    world.update(dt);
    layers.shadows.clearRect(0, 0, offscreenWidth, offscreenHeight);
    layers.foreground.clearRect(0, 0, offscreenWidth, offscreenHeight);
    layers.gui.clearRect(0, 0, offscreenWidth, offscreenHeight);

    layers.gui.drawImage(portraitKyoko, 1, offscreenHeight / 2 - 13);
    layers.gui.drawImage(portraitFrame, 0, offscreenHeight / 2 - 14);
    const kyokoDamageTaker = kyoko.components.damageTaker;
    const hpFraction = kyokoDamageTaker.hp / kyokoDamageTaker.hpMax;
    if (hpFraction > 0) {
        const hpBarHeight = 24;
        const hpBarBeginX = 26;
        const hpBarBeginY = offscreenHeight / 2 - 13;
        const hpBarRemainingHeight = Math.ceil(hpBarHeight * hpFraction);
        layers.gui.fillStyle = "black";
        layers.gui.beginPath();
        layers.gui.rect(hpBarBeginX, hpBarBeginY, 3, hpBarHeight);
        layers.gui.fill();
        layers.gui.fillStyle = "#cc0000";
        layers.gui.beginPath();
        layers.gui.rect(hpBarBeginX, hpBarBeginY + hpBarHeight - hpBarRemainingHeight, 3, hpBarRemainingHeight);
        layers.gui.fill();
    }

    ctx.drawImage(forestLower, 0, 0, canvas.width, canvas.height);
    world.draw(layers);
    ctx.drawImage(canvases.shadows, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvases.foreground, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(forestUpper, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvases.gui, 0, 0, canvas.width, canvas.height);
}

let lastTimestamp = Date.now();
function animationFrameCallback() {
    let currentTimestamp = Date.now();
    let dt = (currentTimestamp - lastTimestamp) / 1000;
    lastTimestamp = currentTimestamp;
    if (dt > 0.05) {
        dt = 0.05;
    }
    update(dt);
    window.requestAnimationFrame(animationFrameCallback);
}

window.requestAnimationFrame(animationFrameCallback);

document.addEventListener("keydown", e => {
    /*
    if (e.key == "ArrowLeft") {
        directionKeys[0] = true;
    } else if (e.key == "ArrowRight") {
        directionKeys[1] = true;
    } else if (e.key == "ArrowUp") {
        directionKeys[2] = true;
    } else if (e.key == "ArrowDown") {
        directionKeys[3] = true;
    } else if (e.key == " ") {
        //kyoko2.destroy();
    }
    */
    // console.log(e.key);
})

document.addEventListener("keyup", e => {
    /*
    if (e.key == "ArrowLeft") {
        directionKeys[0] = false;
    } else if (e.key == "ArrowRight") {
        directionKeys[1] = false;
    } else if (e.key == "ArrowUp") {
        directionKeys[2] = false;
    } else if (e.key == "ArrowDown") {
        directionKeys[3] = false;
    }
    */
    // console.log(e.key);
})