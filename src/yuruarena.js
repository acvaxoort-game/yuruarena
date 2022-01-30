import Animation from './animation.js'
import * as util from './util.js';
import * as textures from './textures.js';
import MeleeAttackComponent from './components/meleeattack.js';
import World from './world.js';
import WalkingComponent from './components/walking.js';
import SimpleAnimationComponent from './components/simpleanimation.js';
import Entity from './entity.js';
import SlimeBehaviourComponent from './components/slimebehaviour.js';

let canvas = document.getElementById("yuru-canvas");
let ctx = canvas.getContext('2d');
let offscreenWidth = canvas.width / 3;
let offscreenHeight = canvas.height / 3;

ctx.imageSmoothingEnabled = false;

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
}

let layers = {
    "shadows": canvases.shadows.getContext("2d"),
    "foreground": canvases.foreground.getContext("2d"),
}

let forestLower = textures.load("areas/forest_lower");
let forestUpper = textures.load("areas/forest_upper");
let kyokoAnimation = new Animation(textures.loadAnimation("kyoko", 2), 8);
let slimeAnimation = new Animation(textures.loadAnimation("enemies/green_slime", 2), 8);
let slashAnimation = new Animation(textures.loadAnimation("slash", 2), 15);

let directionKeys = [false, false, false, false];
let world = new World();
let kyoko = new Entity();
kyoko.pos = new util.Vec2D(10, 10);
kyoko.friction = 30;
kyoko.team = 1;
new MeleeAttackComponent()
    .setSlashAnimation(util.clone(slashAnimation))
    .attach(kyoko);
new WalkingComponent()
    .setWalkingParameters(60, 5)
    .attach(kyoko);
new SimpleAnimationComponent()
    .setAnimation(util.clone(kyokoAnimation))
    .attach(kyoko);
let slime = new Entity();
slime.pos = new util.Vec2D(10, 10);
slime.mass = 3;
new SimpleAnimationComponent()
    .setAnimation(util.clone(slimeAnimation))
    .setAutoAnimationFlip(false)
    .setAutoAnimationUpdate(false)
    .attach(slime);
new SlimeBehaviourComponent()
    .attach(slime);
world.addEntity(kyoko);
world.addEntity(slime);

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
    world.update(dt);

    ctx.fillStyle = '#333333';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(forestLower, 0, 0, canvas.width, canvas.height);
    layers.shadows.clearRect(0, 0, offscreenWidth, offscreenHeight);
    layers.foreground.clearRect(0, 0, offscreenWidth, offscreenHeight);
    world.draw(layers);
    ctx.drawImage(canvases.shadows, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvases.foreground, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(forestUpper, 0, 0, canvas.width, canvas.height);
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
    if (e.key == "ArrowLeft") {
        directionKeys[0] = true;
    } else if (e.key == "ArrowRight") {
        directionKeys[1] = true;
    } else if (e.key == "ArrowUp") {
        directionKeys[2] = true;
    } else if (e.key == "ArrowDown") {
        directionKeys[3] = true;
    } else if (e.key == " ") {
        kyoko2.destroy();
    }
    // console.log(e.key);
})

document.addEventListener("keyup", e => {
    if (e.key == "ArrowLeft") {
        directionKeys[0] = false;
    } else if (e.key == "ArrowRight") {
        directionKeys[1] = false;
    } else if (e.key == "ArrowUp") {
        directionKeys[2] = false;
    } else if (e.key == "ArrowDown") {
        directionKeys[3] = false;
    }
    // console.log(e.key);
})