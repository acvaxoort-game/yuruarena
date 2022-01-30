import ComponentBase from "./componentbase.js";

export default class TemporaryAnimationComponent extends ComponentBase {
    static get name() { return "temporaryAnimation"; }

    constructor() {
        super();
        this.animation = null;
        this.lifespan = 0.5;
        this.rotation = 0;
        this.scale = 1;
        this.verticalOffset = 0;
        this.flip = false;
    }

    setAnimation(animation) {
        this.animation = animation;
        return this;
    }

    setLifespan(value) {
        this.lifespan = value;
        return this;
    }

    setRotation(value) {
        this.rotation = value;
        if (this.rotation < -Math.PI * 0.5 || this.rotation > Math.PI * 0.5) {
            this.flip = true;
        }
        return this;
    }

    setScale(value) {
        this.scale = value;
        return this;
    }

    setVerticalOffset(value) {
        this.verticalOffset = value;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        this.animation.update(dt);
        this.lifespan -= dt;
        if (this.lifespan <= 0) {
            entity.destroy();
        }
    }

    onDraw(layers) {
        const entity = this.entity;
        let pixelCoords = entity.getPixelCoordinates();
        let fg = layers.foreground;
        let imageSize = this.animation.getSize();
        fg.save();
        fg.translate(pixelCoords.x, pixelCoords.y + this.verticalOffset);
        fg.rotate(this.rotation);
        fg.scale(this.scale, this.scale * 208 / 256);
        if (this.flip) {
            fg.scale(1, -1);
        }
        fg.drawImage(this.animation.getCurrent(), -imageSize.x * 0.5, -imageSize.y * 0.5);
        fg.restore();
    }
}