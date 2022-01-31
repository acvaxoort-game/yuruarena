import ComponentBase from "./componentbase.js";
import Entity from "../entity.js";
import TemporaryAnimationComponent from "./temporaryanimation.js";
import AttachToEntityComponent from "./attachtoentitty.js";
import World from "../world.js";

export default class MeleeAttackComponent extends ComponentBase {
    get componentName() { return "meleeAttack"; }

    constructor() {
        super();
        this.attack = 5;
        this.slashAnimation = null;
        this.slashCooldown = 1;
        this.slashDelay = this.slashCooldown;
        this.slashRange = 1;
        this.knockback = 2;
    }

    setAttack(attack) {
        this.attack = attack;
        return this;
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
            let target = entity.getClosestEnemyInRange(this.slashRange);
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
                slash.collisionEnabled = false;
                slash.targetable = false;
                entity.world.addEntity(slash, World.getProjectileTeam(entity.team));
                const attackRadius = this.slashRange * 0.5;
                const attackMiddle = entity.pos.add(offset);
                for (let e of entity.getEnemies()) {
                    if (e.components.damageTaker && e.z < 1) {
                        if (attackMiddle.sub(e.pos).norm() < attackRadius + e.radius) {
                            e.knockBackFrom(this.knockback, entity.pos);
                            e.components.damageTaker.damage(this.attack);
                        }
                    }
                }
            }
        }
    }

    /*
    onDraw(layers) {
        const entity = this.entity;
        let pixelCoordsShadow = entity.getPixelCoordinatesShadow();
        let shadows = layers.shadows;
        shadows.strokeStyle = "#22222255";
        shadows.beginPath();
        shadows.ellipse(pixelCoordsShadow.x, pixelCoordsShadow.y, this.slashRange * 256 / 20, this.slashRange * 208 / 20, 0, 0, Math.PI * 2);
        shadows.closePath();
        shadows.stroke();
    }*/
}