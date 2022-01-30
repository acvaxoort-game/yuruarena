import ComponentBase from "./componentbase.js";

export default class SimpleAnimationComponent extends ComponentBase {
    static get name() { return "simpleAnimation"; }

    constructor() {
        super();
        this.animation = null;
        this.stationaryAnimation = null;
        this.airborneAnimation = null;
        this.currentMode = 0; // 0 - default, 1 - stationary, 2 - airborne
        this.flippedAnimation = false;
        this.autoAnimationFlip = true;
        this.autoAnimationUpdate = true;
        this.stopAnimationWhenStationary = true;
    }

    setAnimation(animation) {
        this.animation = animation;
        return this;
    }

    setStationaryAnimation(animation) {
        this.stationaryAnimation = animation;
        return this;
    }

    setAirborneAnimation(animation) {
        this.airborneAnimation = animation;
        return this;
    }

    setAutoAnimationFlip(isAutoAnimationFlip) {
        this.autoAnimationFlip = isAutoAnimationFlip;
        return this;
    }

    setAutoAnimationUpdate(isAutoAnimationUpdate) {
        this.autoAnimationUpdate = isAutoAnimationUpdate;
        return this;
    }

    setFlippedAnimation(isFlippedAnimation) {
        this.flippedAnimation = isFlippedAnimation;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        if (this.autoAnimationFlip) {
            const angle = entity.vel.angle();
            const velNorm = entity.vel.norm();
            if (velNorm > 0) {
                this.flippedAnimation = false;
                if (angle < -Math.PI * 0.5 || angle > Math.PI * 0.5) {
                    this.flippedAnimation = true;
                }
            }
        }
        const airborne = entity.z > 0;
        const stationary = entity.vel.x == 0 && entity.vel.y == 0;
        if (airborne && this.airborneAnimation) {
            if (this.currentMode != 2) {
                this.airborneAnimation.setFrame(0);
            }
            this.currentMode = 2;
            if (this.autoAnimationUpdate) {
                this.airborneAnimation.update(dt);
            }
        } else if (stationary && this.stationaryAnimation) {
            if (this.currentMode != 1) {
                this.stationaryAnimation.setFrame(0);
            }
            this.currentMode = 1;
            if (this.autoAnimationUpdate) {
                this.stationaryAnimation.update(dt);
            }
        } else {
            if (this.currentMode != 0) {
                this.animation.setFrame(0);
            }
            this.currentMode = 0;
            if (this.autoAnimationUpdate) {
                this.animation.update(dt);
            }
        }
    }

    onDraw(layers) {
        const entity = this.entity;
        let pixelCoords = entity.getPixelCoordinates();
        let pixelCoordsShadow = entity.getPixelCoordinatesShadow();
        let shadows = layers.shadows;
        let fg = layers.foreground;
        shadows.fillStyle = "#22222255";
        shadows.beginPath();
        shadows.ellipse(pixelCoordsShadow.x, pixelCoordsShadow.y, 4, 2, 0, 0, Math.PI * 2);
        shadows.closePath();
        shadows.fill();
        let currentAnimation;
        if (this.currentMode == 2) {
            currentAnimation = this.airborneAnimation;
        } else if (this.currentMode == 1) {
            currentAnimation = this.stationaryAnimation;
        } else {
            currentAnimation = this.animation;
        }
        let imageSize = currentAnimation.getSize();
        let drawPos = pixelCoords.add(imageSize.mul(-0.5));
        let scale = currentAnimation.scale;
        drawPos.x = Math.round(drawPos.x / scale) * scale;
        drawPos.y = Math.round(drawPos.y / scale) * scale;
        drawPos.y -= 7;
        if (this.flippedAnimation) {
            fg.save();
            fg.scale(-1, 1);
            fg.drawImage(currentAnimation.getCurrent(), -drawPos.x, drawPos.y, -imageSize.x, imageSize.y);
            fg.restore();
        } else {
            fg.drawImage(currentAnimation.getCurrent(), drawPos.x, drawPos.y, imageSize.x, imageSize.y);
        }
    }
}