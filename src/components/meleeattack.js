import ComponentBase from "./componentbase.js";
import Entity from "../entity.js";
import TemporaryAnimationComponent from "./temporaryanimation.js";
import AttachToEntityComponent from "./attachtoentitty.js";

export default class MeleeAttackComponent extends ComponentBase {
    static get name() { return "meleeAttack"; }

    constructor() {
        super();
        this.slashAnimation = null;
        this.slashCooldown = 1;
        this.slashDelay = this.slashCooldown;
        this.slashRange = 1;
    }

    setSlashAnimation(anim) {
        this.slashAnimation = anim;
        return this;
    }

    setSlashCooldown(value) {
        this.slashCooldown = value;
        this.slashDelay = this.slashCooldown;
        return this;
    }

    setSlashRange(value) {
        this.slashRange = value;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        if (this.slashDelay > 0) {
            this.slashDelay -= dt;
        } else {
            let target = null;
            for (let e of entity.world.entities) {
                if (e.team != entity.team && e.targetable) {
                    target = e;
                }
            }
            if (target) {
                this.slashDelay = this.slashCooldown;
                const dir = target.pos.sub(entity.pos).normalise();
                const offset = dir.mul(this.slashRange * 0.5);
                const slash = new Entity();
                new TemporaryAnimationComponent()
                    .setAnimation(this.slashAnimation)
                    .setLifespan(0.13)
                    .setRotation(-dir.angle())
                    .setScale(this.slashRange)
                    .setVerticalOffset(-4)
                    .attach(slash);
                new AttachToEntityComponent()
                    .setTarget(entity)
                    .setRelativePosition(offset)
                    .attach(slash);
                slash.team = -1;
                slash.collisionEnabled = false;
                slash.targetable = false;
                entity.world.addEntity(slash);
                const attackRadius = this.slashRange * 0.5;
                const attackMiddle = entity.pos.add(offset);
                for (let e of entity.world.entities) {
                    if (e.team != entity.team && e.targetable && e.z < 2) {
                        if (attackMiddle.sub(e.pos).norm() < attackRadius + e.radius) {
                            console.log("slash hit");
                            let kbDir = e.pos.sub(entity.pos).normalise();
                            e.accelerate(kbDir.mul(15 / e.mass));
                        }
                    }
                }
            }
        }
    }

    onDraw(layers) {
        const entity = this.entity;
        let pixelCoordsShadow = entity.getPixelCoordinatesShadow();
        let shadows = layers.shadows;
        shadows.strokeStyle = "#22222255";
        shadows.beginPath();
        shadows.ellipse(pixelCoordsShadow.x, pixelCoordsShadow.y, this.slashRange * 256 / 20, this.slashRange * 208 / 20, 0, 0, Math.PI * 2);
        shadows.closePath();
        shadows.stroke();
    }
}