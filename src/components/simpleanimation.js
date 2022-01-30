import ComponentBase from "./componentbase.js";

export default class SimpleAnimationComponent extends ComponentBase {
    static get name() { return "simpleAnimation"; }

    constructor() {
        super();
        this.animation = null;
        this.flippedAnimation = false;
        this.autoAnimationFlip = true;
        this.autoAnimationUpdate = true;
    }

    setAnimation(animation) {
        this.animation = animation;
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
        console.log(this);
        if (this.autoAnimationUpdate) {
            this.animation.update(dt);
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
        let imageSize = this.animation.getSize();
        let drawPos = pixelCoords.add(imageSize.mul(-0.5));
        let scale = this.animation.scale;
        drawPos.x = Math.round(drawPos.x / scale) * scale;
        drawPos.y = Math.round(drawPos.y / scale) * scale;
        drawPos.y -= 7;
        if (this.flippedAnimation) {
            fg.save();
            fg.scale(-1, 1);
            fg.drawImage(this.animation.getCurrent(), -drawPos.x, drawPos.y, -imageSize.x, imageSize.y);
            fg.restore();
        } else {
            fg.drawImage(this.animation.getCurrent(), drawPos.x, drawPos.y, imageSize.x, imageSize.y);
        }
    }
}