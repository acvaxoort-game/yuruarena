import ComponentBase from "./componentbase.js";

export default class SlimeBehaviourComponent extends ComponentBase {
    static get name() { return "slimeBehaviour"; }

    constructor() {
        super();
        this.verticalLaunch = 10;
        this.horizontalLaunch = 2.5;
        this.jumpCooldown = 3;
        this.jumpDelay = this.jumpCooldown;
        this.attackCooldown = 0.5;
        this.attackDelay = this.attackCooldown;
    }

    setVerticalLaunch(value) {
        this.verticalLaunch = value;
        return this;
    }

    setHorizontalLaunch(value) {
        this.horizontalLaunch = value;
        return this;
    }

    setJumpCooldown(value) {
        this.jumpCooldown = value;
        this.jumpDelay = this.jumpCooldown;
        return this;
    }

    setAttackCooldown(value) {
        this.attackCooldown = value;
        this.attackDelay = this.attackCooldown;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        const simpleAnimation = entity.components.simpleAnimation;
        if (this.attackDelay > 0) {
            this.attackDelay -= dt;
        }
        if (this.jumpDelay > 0) {
            this.jumpDelay -= dt;
            if (entity.z == 0) {
                simpleAnimation.animation.setFrame(0);
                entity.applyFriction = true;
            }
        } else {
            let target = null;
            for (let e of entity.world.entities) {
                if (e.team != entity.team && e.targetable) {
                    target = e;
                }
            }
            if (entity.z == 0 && target) {
                entity.applyFriction = false;
                let jumpDuration = 2 * this.verticalLaunch / entity.gravity;
                let jumpDistance = jumpDuration * this.horizontalLaunch;
                let targetVector = target.pos.add(target.vel.mul(jumpDuration * 0.5)).sub(entity.pos);
                let targetDistance = targetVector.norm();
                if (targetDistance > jumpDistance) {
                    this.jumpDelay = this.jumpCooldown;
                    entity.velZ = this.verticalLaunch;
                    entity.vel = targetVector.normalise().mul(this.horizontalLaunch);
                } else {
                    if (jumpDistance > 0) {
                        this.jumpDelay = this.jumpCooldown * (0.33 + 0.67 * targetDistance / jumpDistance);
                        entity.velZ = this.verticalLaunch * targetDistance / jumpDistance;
                        entity.vel = targetVector.normalise().mul(this.horizontalLaunch);
                    }
                }
                simpleAnimation.animation.setFrame(1);
            }
        }
    }

    onCollision(otherEntity) {
        const entity = this.entity;
        if (otherEntity.team != entity.team) {
            if (this.attackDelay <= 0) {
                this.attackDelay = this.attackCooldown;
                console.log("dealt damage");
            }
        }
    }
}